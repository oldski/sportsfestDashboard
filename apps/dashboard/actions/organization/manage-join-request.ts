'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { db, eq, and } from '@workspace/database/client';
import {
  organizationJoinRequestTable,
  organizationTable,
  membershipTable,
  userTable,
  JoinRequestStatus,
  Role
} from '@workspace/database/schema';
import { getAuthContext } from '@workspace/auth/context';
import { sendJoinRequestApprovedEmail } from '@workspace/email/send-join-request-approved-email';
import { sendJoinRequestRejectedEmail } from '@workspace/email/send-join-request-rejected-email';
import { routes, baseUrl, getPathname } from '@workspace/routes';
import { ForbiddenError } from '@workspace/common/errors';
import { APP_NAME } from '@workspace/common/app';

import { Caching, OrganizationCacheKey } from '~/data/caching';

export interface ManageJoinRequestResult {
  success: boolean;
  message: string;
}

/**
 * Checks if the current user is an admin of the specified organization
 */
async function verifyOrgAdmin(organizationId: string, userId: string): Promise<boolean> {
  const membership = await db.query.membershipTable.findFirst({
    where: and(
      eq(membershipTable.organizationId, organizationId),
      eq(membershipTable.userId, userId),
      eq(membershipTable.role, Role.ADMIN)
    ),
  });
  return !!membership;
}

/**
 * Gets pending join requests for an organization (for admins)
 */
export async function getOrganizationJoinRequests(organizationId: string) {
  const { session } = await getAuthContext();

  // Verify user is an admin of this organization
  const isAdmin = await verifyOrgAdmin(organizationId, session.user.id);
  if (!isAdmin) {
    throw new ForbiddenError('Only organization admins can view join requests');
  }

  try {
    const requests = await db
      .select({
        id: organizationJoinRequestTable.id,
        userId: organizationJoinRequestTable.userId,
        userName: userTable.name,
        userEmail: userTable.email,
        userImage: userTable.image,
        message: organizationJoinRequestTable.message,
        status: organizationJoinRequestTable.status,
        createdAt: organizationJoinRequestTable.createdAt,
      })
      .from(organizationJoinRequestTable)
      .innerJoin(userTable, eq(userTable.id, organizationJoinRequestTable.userId))
      .where(
        and(
          eq(organizationJoinRequestTable.organizationId, organizationId),
          eq(organizationJoinRequestTable.status, JoinRequestStatus.PENDING)
        )
      )
      .orderBy(organizationJoinRequestTable.createdAt);

    return requests;
  } catch (error) {
    console.error('Failed to get join requests:', error);
    return [];
  }
}

/**
 * Approves a join request and adds the user as a member
 */
export async function approveJoinRequest(
  requestId: string
): Promise<ManageJoinRequestResult> {
  const { session } = await getAuthContext();

  try {
    // Get the request with organization details
    const request = await db.query.organizationJoinRequestTable.findFirst({
      where: and(
        eq(organizationJoinRequestTable.id, requestId),
        eq(organizationJoinRequestTable.status, JoinRequestStatus.PENDING)
      ),
      with: {
        organization: true,
        user: true,
      },
    });

    if (!request) {
      return {
        success: false,
        message: 'Request not found or already processed.',
      };
    }

    // Verify current user is an admin
    const isAdmin = await verifyOrgAdmin(request.organizationId, session.user.id);
    if (!isAdmin) {
      return {
        success: false,
        message: 'Only organization admins can approve requests.',
      };
    }

    // Start transaction: update request status and create membership
    await db.transaction(async (tx) => {
      // Update request status
      await tx
        .update(organizationJoinRequestTable)
        .set({
          status: JoinRequestStatus.APPROVED,
          respondedBy: session.user.id,
          respondedAt: new Date(),
        })
        .where(eq(organizationJoinRequestTable.id, requestId));

      // Create membership
      await tx.insert(membershipTable).values({
        organizationId: request.organizationId,
        userId: request.userId,
        role: Role.MEMBER,
        isOwner: false,
      });
    });

    // Send notification email to the user
    if (request.user?.email) {
      const dashboardLink = `${baseUrl.Dashboard}${getPathname(routes.dashboard.organizations.slug.Index, baseUrl.Dashboard).replace('[slug]', request.organization.slug)}`;

      try {
        await sendJoinRequestApprovedEmail({
          recipient: request.user.email,
          appName: APP_NAME,
          organizationName: request.organization.name,
          dashboardLink,
        });
      } catch (emailError) {
        console.error('Failed to send approval notification email:', emailError);
      }
    }

    revalidateTag(
      Caching.createOrganizationTag(OrganizationCacheKey.JoinRequests, request.organizationId)
    );
    revalidateTag(
      Caching.createOrganizationTag(OrganizationCacheKey.Members, request.organizationId)
    );
    revalidatePath(`/organizations/${request.organization.slug}/settings/organization/members`);

    return {
      success: true,
      message: `${request.user?.name || 'User'} has been added to the organization.`,
    };
  } catch (error) {
    console.error('Failed to approve join request:', error);
    return {
      success: false,
      message: 'Failed to approve request. Please try again.',
    };
  }
}

/**
 * Rejects a join request
 */
export async function rejectJoinRequest(
  requestId: string,
  reason?: string
): Promise<ManageJoinRequestResult> {
  const { session } = await getAuthContext();

  try {
    // Get the request with organization details
    const request = await db.query.organizationJoinRequestTable.findFirst({
      where: and(
        eq(organizationJoinRequestTable.id, requestId),
        eq(organizationJoinRequestTable.status, JoinRequestStatus.PENDING)
      ),
      with: {
        organization: true,
        user: true,
      },
    });

    if (!request) {
      return {
        success: false,
        message: 'Request not found or already processed.',
      };
    }

    // Verify current user is an admin
    const isAdmin = await verifyOrgAdmin(request.organizationId, session.user.id);
    if (!isAdmin) {
      return {
        success: false,
        message: 'Only organization admins can reject requests.',
      };
    }

    // Update request status
    await db
      .update(organizationJoinRequestTable)
      .set({
        status: JoinRequestStatus.REJECTED,
        respondedBy: session.user.id,
        respondedAt: new Date(),
        rejectionReason: reason || null,
      })
      .where(eq(organizationJoinRequestTable.id, requestId));

    // Send notification email to the user
    if (request.user?.email) {
      try {
        await sendJoinRequestRejectedEmail({
          recipient: request.user.email,
          appName: APP_NAME,
          organizationName: request.organization.name,
          reason: reason || undefined,
        });
      } catch (emailError) {
        console.error('Failed to send rejection notification email:', emailError);
      }
    }

    revalidateTag(
      Caching.createOrganizationTag(OrganizationCacheKey.JoinRequests, request.organizationId)
    );
    revalidatePath(`/organizations/${request.organization.slug}/settings/organization/members`);

    return {
      success: true,
      message: 'Request has been rejected.',
    };
  } catch (error) {
    console.error('Failed to reject join request:', error);
    return {
      success: false,
      message: 'Failed to reject request. Please try again.',
    };
  }
}
