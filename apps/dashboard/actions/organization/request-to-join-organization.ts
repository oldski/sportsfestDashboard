'use server';

import { revalidatePath } from 'next/cache';
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
import { sendJoinRequestEmail } from '@workspace/email/send-join-request-email';
import { routes, baseUrl, getPathname } from '@workspace/routes';
import { APP_NAME } from '@workspace/common/app';

export interface RequestToJoinResult {
  success: boolean;
  message: string;
  requestId?: string;
}

/**
 * Creates a request to join an existing organization
 * Sends notification email to org admins
 */
export async function requestToJoinOrganization(
  organizationId: string,
  message?: string
): Promise<RequestToJoinResult> {
  const { session } = await getAuthContext();
  const userId = session.user.id;

  try {
    // Check if user already has a membership in this organization
    const existingMembership = await db.query.membershipTable.findFirst({
      where: and(
        eq(membershipTable.organizationId, organizationId),
        eq(membershipTable.userId, userId)
      ),
    });

    if (existingMembership) {
      return {
        success: false,
        message: 'You are already a member of this organization.',
      };
    }

    // Check if there's already a pending request
    const existingRequest = await db.query.organizationJoinRequestTable.findFirst({
      where: and(
        eq(organizationJoinRequestTable.organizationId, organizationId),
        eq(organizationJoinRequestTable.userId, userId),
        eq(organizationJoinRequestTable.status, JoinRequestStatus.PENDING)
      ),
    });

    if (existingRequest) {
      return {
        success: false,
        message: 'You already have a pending request to join this organization.',
      };
    }

    // Get organization details
    const organization = await db.query.organizationTable.findFirst({
      where: eq(organizationTable.id, organizationId),
    });

    if (!organization) {
      return {
        success: false,
        message: 'Organization not found.',
      };
    }

    // Create the join request
    const [request] = await db
      .insert(organizationJoinRequestTable)
      .values({
        organizationId,
        userId,
        message: message || null,
        status: JoinRequestStatus.PENDING,
      })
      .returning();

    // Find org admins to notify
    const admins = await db
      .select({
        id: userTable.id,
        email: userTable.email,
        name: userTable.name,
      })
      .from(membershipTable)
      .innerJoin(userTable, eq(userTable.id, membershipTable.userId))
      .where(
        and(
          eq(membershipTable.organizationId, organizationId),
          eq(membershipTable.role, Role.ADMIN)
        )
      );

    // Send notification emails to admins
    // Build full URL with actual slug substitution
    const reviewLink = `${baseUrl.Dashboard}${getPathname(routes.dashboard.organizations.slug.settings.organization.Members, baseUrl.Dashboard).replace('[slug]', organization.slug)}`;

    for (const admin of admins) {
      if (admin.email) {
        try {
          await sendJoinRequestEmail({
            recipient: admin.email,
            appName: APP_NAME,
            requesterName: session.user.name || 'A user',
            requesterEmail: session.user.email || '',
            organizationName: organization.name,
            message: message || undefined,
            reviewLink,
          });
        } catch (emailError) {
          console.error('Failed to send join request notification email:', emailError);
          // Continue even if email fails
        }
      }
    }

    revalidatePath('/onboarding');

    return {
      success: true,
      message: `Your request to join ${organization.name} has been submitted. You'll be notified when an admin responds.`,
      requestId: request.id,
    };
  } catch (error) {
    console.error('Failed to create join request:', error);
    return {
      success: false,
      message: 'Failed to submit join request. Please try again.',
    };
  }
}

/**
 * Gets the user's pending join requests
 */
export async function getUserPendingJoinRequests() {
  const { session } = await getAuthContext();
  const userId = session.user.id;

  try {
    const requests = await db
      .select({
        id: organizationJoinRequestTable.id,
        organizationId: organizationJoinRequestTable.organizationId,
        organizationName: organizationTable.name,
        organizationSlug: organizationTable.slug,
        organizationLogo: organizationTable.logo,
        status: organizationJoinRequestTable.status,
        createdAt: organizationJoinRequestTable.createdAt,
      })
      .from(organizationJoinRequestTable)
      .innerJoin(
        organizationTable,
        eq(organizationTable.id, organizationJoinRequestTable.organizationId)
      )
      .where(
        and(
          eq(organizationJoinRequestTable.userId, userId),
          eq(organizationJoinRequestTable.status, JoinRequestStatus.PENDING)
        )
      );

    return requests;
  } catch (error) {
    console.error('Failed to get pending join requests:', error);
    return [];
  }
}

/**
 * Cancels a pending join request
 */
export async function cancelJoinRequest(requestId: string): Promise<RequestToJoinResult> {
  const { session } = await getAuthContext();
  const userId = session.user.id;

  try {
    const request = await db.query.organizationJoinRequestTable.findFirst({
      where: and(
        eq(organizationJoinRequestTable.id, requestId),
        eq(organizationJoinRequestTable.userId, userId),
        eq(organizationJoinRequestTable.status, JoinRequestStatus.PENDING)
      ),
    });

    if (!request) {
      return {
        success: false,
        message: 'Request not found or already processed.',
      };
    }

    await db
      .delete(organizationJoinRequestTable)
      .where(eq(organizationJoinRequestTable.id, requestId));

    revalidatePath('/onboarding');

    return {
      success: true,
      message: 'Join request cancelled.',
    };
  } catch (error) {
    console.error('Failed to cancel join request:', error);
    return {
      success: false,
      message: 'Failed to cancel request. Please try again.',
    };
  }
}
