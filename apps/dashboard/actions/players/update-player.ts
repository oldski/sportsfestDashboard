'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getAuthContext } from '@workspace/auth/context';
import { db, eq, and } from '@workspace/database/client';
import {
  playerTable,
  membershipTable,
  TShirtSize,
  Role
} from '@workspace/database/schema';

const updatePlayerSchema = z.object({
  playerId: z.string().uuid('Invalid player ID'),
  organizationId: z.string().uuid('Invalid organization ID'),
  phone: z.string().max(32, 'Phone number too long').nullable().optional(),
  tshirtSize: z.nativeEnum(TShirtSize, { errorMap: () => ({ message: 'Invalid t-shirt size' }) })
});

export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;

export type UpdatePlayerResult = {
  success: boolean;
  error?: string;
};

export async function updatePlayer(
  input: UpdatePlayerInput
): Promise<UpdatePlayerResult> {
  try {
    const { session } = await getAuthContext();

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized: Please sign in' };
    }

    const validatedData = updatePlayerSchema.parse(input);

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
        organizationId: playerTable.organizationId
      })
      .from(playerTable)
      .where(eq(playerTable.id, validatedData.playerId));

    if (!existingPlayer) {
      return { success: false, error: 'Player not found' };
    }

    if (existingPlayer.organizationId !== validatedData.organizationId) {
      return { success: false, error: 'Player does not belong to this organization' };
    }

    // Update the player
    await db
      .update(playerTable)
      .set({
        phone: validatedData.phone,
        tshirtSize: validatedData.tshirtSize,
        updatedAt: new Date()
      })
      .where(eq(playerTable.id, validatedData.playerId));

    // Revalidate the players page
    revalidatePath('/organizations/[slug]/players', 'page');

    return { success: true };
  } catch (error) {
    console.error('Error updating player:', error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation error' };
    }

    return { success: false, error: 'Failed to update player' };
  }
}
