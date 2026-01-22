'use server';

import { revalidatePath } from 'next/cache';
import { db, eq, sql, and } from '@workspace/database/client';
import {
  organizationTable,
  membershipTable,
  orderTable,
  playerTable,
  companyTeamTable,
  invitationTable,
  organizationJoinRequestTable,
} from '@workspace/database/schema';
import { ForbiddenError } from '@workspace/common/errors';
import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';

export interface OrganizationDeleteStatus {
  canDelete: boolean;
  reason?: string;
  orderCount: number;
  playerCount: number;
  teamCount: number;
}

export interface ManageOrganizationResult {
  success: boolean;
  message: string;
}

/**
 * Checks if an organization can be safely deleted
 * Organizations can only be deleted if they have no orders, players, or teams
 */
export async function checkOrganizationDeleteStatus(
  organizationId: string
): Promise<OrganizationDeleteStatus> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Only super admins can manage organizations');
  }

  try {
    // Check for orders
    const [{ count: orderCount }] = await db
      .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(orderTable)
      .where(eq(orderTable.organizationId, organizationId));

    // Check for players
    const [{ count: playerCount }] = await db
      .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(playerTable)
      .where(eq(playerTable.organizationId, organizationId));

    // Check for teams
    const [{ count: teamCount }] = await db
      .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(companyTeamTable)
      .where(eq(companyTeamTable.organizationId, organizationId));

    const canDelete = orderCount === 0 && playerCount === 0 && teamCount === 0;
    let reason: string | undefined;

    if (!canDelete) {
      const reasons: string[] = [];
      if (orderCount > 0) reasons.push(`${orderCount} order(s)`);
      if (playerCount > 0) reasons.push(`${playerCount} player(s)`);
      if (teamCount > 0) reasons.push(`${teamCount} team(s)`);
      reason = `Organization has ${reasons.join(', ')}. Use merge instead of delete.`;
    }

    return {
      canDelete,
      reason,
      orderCount,
      playerCount,
      teamCount,
    };
  } catch (error) {
    console.error('Failed to check organization delete status:', error);
    throw error;
  }
}

/**
 * Deletes an organization if it has no orders, players, or teams
 */
export async function deleteOrganization(
  organizationId: string
): Promise<ManageOrganizationResult> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Only super admins can delete organizations');
  }

  try {
    // Check if deletion is allowed
    const status = await checkOrganizationDeleteStatus(organizationId);
    if (!status.canDelete) {
      return {
        success: false,
        message: status.reason || 'Organization cannot be deleted.',
      };
    }

    // Get organization name for the response
    const org = await db.query.organizationTable.findFirst({
      where: eq(organizationTable.id, organizationId),
    });

    if (!org) {
      return {
        success: false,
        message: 'Organization not found.',
      };
    }

    // Delete the organization (cascades to memberships, invitations, etc.)
    await db.delete(organizationTable).where(eq(organizationTable.id, organizationId));

    revalidatePath('/admin/organizations');

    return {
      success: true,
      message: `Organization "${org.name}" has been deleted.`,
    };
  } catch (error) {
    console.error('Failed to delete organization:', error);
    return {
      success: false,
      message: 'Failed to delete organization. Please try again.',
    };
  }
}

/**
 * Merges one organization into another
 * Moves all data (orders, players, teams, memberships) to the target organization
 */
export async function mergeOrganizations(
  sourceOrganizationId: string,
  targetOrganizationId: string
): Promise<ManageOrganizationResult> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Only super admins can merge organizations');
  }

  if (sourceOrganizationId === targetOrganizationId) {
    return {
      success: false,
      message: 'Cannot merge an organization with itself.',
    };
  }

  try {
    // Get both organizations
    const [sourceOrg, targetOrg] = await Promise.all([
      db.query.organizationTable.findFirst({
        where: eq(organizationTable.id, sourceOrganizationId),
      }),
      db.query.organizationTable.findFirst({
        where: eq(organizationTable.id, targetOrganizationId),
      }),
    ]);

    if (!sourceOrg) {
      return {
        success: false,
        message: 'Source organization not found.',
      };
    }

    if (!targetOrg) {
      return {
        success: false,
        message: 'Target organization not found.',
      };
    }

    await db.transaction(async (tx) => {
      // Move orders
      await tx
        .update(orderTable)
        .set({ organizationId: targetOrganizationId })
        .where(eq(orderTable.organizationId, sourceOrganizationId));

      // Move players
      await tx
        .update(playerTable)
        .set({ organizationId: targetOrganizationId })
        .where(eq(playerTable.organizationId, sourceOrganizationId));

      // Move teams
      await tx
        .update(companyTeamTable)
        .set({ organizationId: targetOrganizationId })
        .where(eq(companyTeamTable.organizationId, sourceOrganizationId));

      // Move memberships (skip duplicates - same user in both orgs)
      // First, get existing target memberships
      const targetMemberships = await tx
        .select({ userId: membershipTable.userId })
        .from(membershipTable)
        .where(eq(membershipTable.organizationId, targetOrganizationId));

      const existingUserIds = new Set(targetMemberships.map((m) => m.userId));

      // Get source memberships to move
      const sourceMemberships = await tx
        .select()
        .from(membershipTable)
        .where(eq(membershipTable.organizationId, sourceOrganizationId));

      // Insert non-duplicate memberships
      for (const membership of sourceMemberships) {
        if (!existingUserIds.has(membership.userId)) {
          await tx.insert(membershipTable).values({
            organizationId: targetOrganizationId,
            userId: membership.userId,
            role: membership.role,
            isOwner: false, // Don't transfer owner status
          });
        }
      }

      // Delete source memberships
      await tx
        .delete(membershipTable)
        .where(eq(membershipTable.organizationId, sourceOrganizationId));

      // Move pending invitations (skip duplicates)
      const targetInvitations = await tx
        .select({ email: invitationTable.email })
        .from(invitationTable)
        .where(eq(invitationTable.organizationId, targetOrganizationId));

      const existingEmails = new Set(targetInvitations.map((i) => i.email));

      const sourceInvitations = await tx
        .select()
        .from(invitationTable)
        .where(eq(invitationTable.organizationId, sourceOrganizationId));

      for (const invitation of sourceInvitations) {
        if (!existingEmails.has(invitation.email)) {
          await tx.insert(invitationTable).values({
            organizationId: targetOrganizationId,
            email: invitation.email,
            role: invitation.role,
            status: invitation.status,
            token: invitation.token,
          });
        }
      }

      // Delete source invitations
      await tx
        .delete(invitationTable)
        .where(eq(invitationTable.organizationId, sourceOrganizationId));

      // Move join requests
      await tx
        .update(organizationJoinRequestTable)
        .set({ organizationId: targetOrganizationId })
        .where(eq(organizationJoinRequestTable.organizationId, sourceOrganizationId));

      // Delete the source organization
      await tx
        .delete(organizationTable)
        .where(eq(organizationTable.id, sourceOrganizationId));
    });

    revalidatePath('/admin/organizations');

    return {
      success: true,
      message: `"${sourceOrg.name}" has been merged into "${targetOrg.name}".`,
    };
  } catch (error) {
    console.error('Failed to merge organizations:', error);
    return {
      success: false,
      message: 'Failed to merge organizations. Please try again.',
    };
  }
}

/**
 * Gets a list of all organizations for merge dropdown
 */
export async function getOrganizationsForMerge() {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Only super admins can manage organizations');
  }

  try {
    const organizations = await db
      .select({
        id: organizationTable.id,
        name: organizationTable.name,
        slug: organizationTable.slug,
      })
      .from(organizationTable)
      .orderBy(organizationTable.name);

    return organizations;
  } catch (error) {
    console.error('Failed to get organizations for merge:', error);
    return [];
  }
}
