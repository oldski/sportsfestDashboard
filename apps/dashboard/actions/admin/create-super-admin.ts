'use server';

import { addHours } from 'date-fns';
import { returnValidationErrors } from 'next-safe-action';
import { z } from 'zod';

import { PASSWORD_RESET_EXPIRY_HOURS } from '@workspace/auth/constants';
import { APP_NAME } from '@workspace/common/app';
import { ForbiddenError } from '@workspace/common/errors';
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

const createSuperAdminSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required.',
      invalid_type_error: 'Email must be a string.'
    })
    .email('Email is invalid.')
    .trim()
    .toLowerCase(),
  name: z
    .string({
      required_error: 'Name is required.',
      invalid_type_error: 'Name must be a string.'
    })
    .trim()
    .min(1, 'Name is required.')
    .max(64, 'Maximum 64 characters allowed.'),
  sendWelcomeEmail: z.boolean().default(true)
});

export type CreateSuperAdminSchema = z.infer<typeof createSuperAdminSchema>;

export const createSuperAdmin = authActionClient
  .metadata({ actionName: 'createSuperAdmin' })
  .inputSchema(createSuperAdminSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Check if current user is super admin
    if (!isSuperAdmin(ctx.session.user)) {
      throw new ForbiddenError('Unauthorized: Only super admins can create super admin accounts');
    }

    const normalizedEmail = parsedInput.email.toLowerCase();

    // Check if email already exists
    const [existingUser] = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.email, normalizedEmail))
      .limit(1);

    if (existingUser) {
      return returnValidationErrors(createSuperAdminSchema, {
        email: {
          _errors: ['Email address is already taken.']
        }
      });
    }

    // Create new user with super admin privileges
    const [newUser] = await db
      .insert(userTable)
      .values({
        name: parsedInput.name,
        email: normalizedEmail,
        password: null, // No password yet - will be set via reset link
        locale: 'en-US',
        completedOnboarding: true, // Bypass onboarding
        isSportsFestAdmin: true, // Grant super admin access
        emailVerified: new Date() // Mark as verified
      })
      .returning({ id: userTable.id, name: userTable.name, email: userTable.email });

    // Log the action
    await db.insert(superAdminActionTable).values({
      performedBy: ctx.session.user.id,
      targetUserId: newUser.id,
      action: 'user_created',
      reason: `Super admin account created for ${parsedInput.name} (${normalizedEmail})`
    });

    // Send password setup email
    if (parsedInput.sendWelcomeEmail) {
      try {
        const expires = addHours(new Date(), PASSWORD_RESET_EXPIRY_HOURS);
        const [passwordRequest] = await db
          .insert(resetPasswordRequestTable)
          .values({
            email: normalizedEmail,
            expires
          })
          .returning({ id: resetPasswordRequestTable.id });

        await sendPasswordResetEmail({
          recipient: normalizedEmail,
          appName: APP_NAME,
          name: parsedInput.name,
          resetPasswordLink: `${routes.dashboard.auth.resetPassword.Request}/${passwordRequest.id}`
        });
      } catch (e) {
        console.error('Failed to send welcome email:', e);
        // Don't fail the entire operation if email fails
      }
    }

    return {
      success: true,
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name
    };
  });
