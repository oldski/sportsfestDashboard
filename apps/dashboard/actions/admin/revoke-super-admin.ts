'use server';

import { z } from 'zod';

import { ForbiddenError, PreConditionError } from '@workspace/common/errors';
import { db, eq } from '@workspace/database/client';
import { superAdminActionTable, userTable } from '@workspace/database/schema';

import { authActionClient } from '~/actions/safe-action';

const revokeSuperAdminSchema = z.object({
  targetUserId: z.string().uuid('Invalid user ID'),
  reason: z.string().optional()
});

export const revokeSuperAdmin = authActionClient
  .metadata({ actionName: 'revokeSuperAdmin' })
  .inputSchema(revokeSuperAdminSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Check if current user is super admin
    if (!ctx.user.isSportsFestAdmin) {
      throw new ForbiddenError('Unauthorized: Only super admins can revoke super admin access');
    }

    // Prevent users from revoking their own access
    if (ctx.user.id === parsedInput.targetUserId) {
      throw new PreConditionError('Cannot revoke your own super admin access');
    }

    // Update user to revoke super admin access
    await db
      .update(userTable)
      .set({ isSportsFestAdmin: false })
      .where(eq(userTable.id, parsedInput.targetUserId));

    // Log the action
    await db.insert(superAdminActionTable).values({
      performedBy: ctx.user.id,
      targetUserId: parsedInput.targetUserId,
      action: 'revoked',
      reason: parsedInput.reason || null
    });

    return { success: true };
  });