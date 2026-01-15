'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getAuthContext } from '@workspace/auth/context';
import { db, eq, and } from '@workspace/database/client';
import {
  playerTable,
  membershipTable,
  PlayerStatus,
  Role
} from '@workspace/database/schema';

const deletePlayerSchema = z.object({
  playerId: z.string().uuid('Invalid player ID'),
  organizationId: z.string().uuid('Invalid organization ID')
});

export type DeletePlayerInput = z.infer<typeof deletePlayerSchema>;

export type DeletePlayerResult = {
  success: boolean;
  error?: string;
};

export async function deletePlayer(
  input: DeletePlayerInput
): Promise<DeletePlayerResult> {
  try {
    const { session } = await getAuthContext();

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized: Please sign in' };
    }

    const validatedData = deletePlayerSchema.parse(input);

    // Check if user has permission to manage players in this organization
    const [membership] = await db
      .select({
        role: membershipTable.role
      })
      .from(membershipTable)
      .where(
        and(
          eq(membershipTable.userId, session.user.id),
          eq(membershipTable.organizationId, validatedData.organizationId)
        )
      );

    // Allow admins or super admins
    const isSuperAdmin = session.user.isSportsFestAdmin === true;
    const hasOrgPermission = membership && membership.role === Role.ADMIN;

    if (!isSuperAdmin && !hasOrgPermission) {
      return { success: false, error: 'Unauthorized: You do not have permission to manage players in this organization' };
    }

    // Get the existing player to verify it belongs to this organization
    const [existingPlayer] = await db
      .select({
        id: playerTable.id,
        organizationId: playerTable.organizationId,
        status: playerTable.status
      })
      .from(playerTable)
      .where(eq(playerTable.id, validatedData.playerId));

    if (!existingPlayer) {
      return { success: false, error: 'Player not found' };
    }

    if (existingPlayer.organizationId !== validatedData.organizationId) {
      return { success: false, error: 'Player does not belong to this organization' };
    }

    if (existingPlayer.status === PlayerStatus.INACTIVE) {
      return { success: false, error: 'Player is already inactive' };
    }

    // Soft delete - set status to inactive
    await db
      .update(playerTable)
      .set({
        status: PlayerStatus.INACTIVE,
        updatedAt: new Date()
      })
      .where(eq(playerTable.id, validatedData.playerId));

    // Revalidate the players page
    revalidatePath('/organizations/[slug]/players', 'page');

    return { success: true };
  } catch (error) {
    console.error('Error deleting player:', error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation error' };
    }

    return { success: false, error: 'Failed to delete player' };
  }
}
