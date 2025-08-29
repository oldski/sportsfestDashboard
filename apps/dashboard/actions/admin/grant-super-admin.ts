'use server';

import { z } from 'zod';

import { ForbiddenError } from '@workspace/common/errors';
import { db, eq } from '@workspace/database/client';
import { superAdminActionTable, userTable } from '@workspace/database/schema';

import { authActionClient } from '~/actions/safe-action';

const grantSuperAdminSchema = z.object({
  targetUserId: z.string().uuid('Invalid user ID'),
  reason: z.string().optional()
});

export const grantSuperAdmin = authActionClient
  .metadata({ actionName: 'grantSuperAdmin' })
  .inputSchema(grantSuperAdminSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Check if current user is super admin
    if (!ctx.session.user.isSportsFestAdmin) {
      throw new ForbiddenError('Unauthorized: Only super admins can grant super admin access');
    }

    // Update user to grant super admin access
    await db
      .update(userTable)
      .set({ isSportsFestAdmin: true })
      .where(eq(userTable.id, parsedInput.targetUserId));

    // Log the action
    await db.insert(superAdminActionTable).values({
      performedBy: ctx.session.user.id,
      targetUserId: parsedInput.targetUserId,
      action: 'granted',
      reason: parsedInput.reason || null
    });

    return { success: true };
  });