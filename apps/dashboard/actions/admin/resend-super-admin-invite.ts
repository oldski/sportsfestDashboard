'use server';

import { addHours } from 'date-fns';
import { z } from 'zod';

import { PASSWORD_RESET_EXPIRY_HOURS } from '@workspace/auth/constants';
import { APP_NAME } from '@workspace/common/app';
import { ForbiddenError, NotFoundError } from '@workspace/common/errors';
import { db, eq } from '@workspace/database/client';
import {
  resetPasswordRequestTable,
  superAdminActionTable,
  userTable
} from '@workspace/database/schema';
import { sendPasswordResetEmail } from '@workspace/email/send-password-reset-email';
import { routes } from '@workspace/routes';

import { authActionClient } from '~/actions/safe-action';
import { isSuperAdmin } from '~/lib/admin-utils';

const resendSuperAdminInviteSchema = z.object({
  targetUserId: z.string().uuid('Invalid user ID')
});

export type ResendSuperAdminInviteSchema = z.infer<typeof resendSuperAdminInviteSchema>;

export const resendSuperAdminInvite = authActionClient
  .metadata({ actionName: 'resendSuperAdminInvite' })
  .inputSchema(resendSuperAdminInviteSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Check if current user is super admin
    if (!isSuperAdmin(ctx.session.user)) {
      throw new ForbiddenError('Unauthorized: Only super admins can resend invites');
    }

    // Get target user
    const [targetUser] = await db
      .select({
        id: userTable.id,
        email: userTable.email,
        name: userTable.name,
        isSportsFestAdmin: userTable.isSportsFestAdmin
      })
      .from(userTable)
      .where(eq(userTable.id, parsedInput.targetUserId))
      .limit(1);

    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    if (!targetUser.email) {
      throw new NotFoundError('User has no email address');
    }

    // Create password reset request
    const expires = addHours(new Date(), PASSWORD_RESET_EXPIRY_HOURS);
    const [passwordRequest] = await db
      .insert(resetPasswordRequestTable)
      .values({
        email: targetUser.email,
        expires
      })
      .returning({ id: resetPasswordRequestTable.id });

    // Send password reset email
    await sendPasswordResetEmail({
      recipient: targetUser.email,
      appName: APP_NAME,
      name: targetUser.name,
      resetPasswordLink: `${routes.dashboard.auth.resetPassword.Request}/${passwordRequest.id}`
    });

    // Log the action
    await db.insert(superAdminActionTable).values({
      performedBy: ctx.session.user.id,
      targetUserId: targetUser.id,
      action: 'invite_resent',
      reason: `Sign-in link resent to ${targetUser.name} (${targetUser.email})`
    });

    return {
      success: true,
      email: targetUser.email
    };
  });