'use server';

import { revalidatePath } from 'next/cache';
import { resolveTransferWarning as resolveTransferWarningData, resolveAllTransferWarningsForPlayer as resolveAllTransferWarningsForPlayerData } from '~/data/teams/get-transfer-warnings';
import { EventType } from '@workspace/database/schema';

export interface TransferWarningActionResult {
  success: boolean;
  error?: string;
  resolved?: number;
}

export async function resolveTransferWarning(
  playerId: string,
  eventType: EventType,
  oldTeamId: string
): Promise<TransferWarningActionResult> {
  const result = await resolveTransferWarningData(playerId, eventType, oldTeamId);
  
  if (result.success) {
    // Revalidate relevant paths
    revalidatePath('/organizations/[slug]/teams', 'page');
    revalidatePath('/organizations/[slug]/teams/[teamId]', 'page');
    revalidatePath('/organizations/[slug]/teams/[teamId]/events', 'page');
  }
  
  return result;
}

export async function resolveAllTransferWarningsForPlayer(
  playerId: string
): Promise<TransferWarningActionResult> {
  const result = await resolveAllTransferWarningsForPlayerData(playerId);
  
  if (result.success) {
    // Revalidate relevant paths
    revalidatePath('/organizations/[slug]/teams', 'page');
    revalidatePath('/organizations/[slug]/teams/[teamId]', 'page');  
    revalidatePath('/organizations/[slug]/teams/[teamId]/events', 'page');
  }
  
  return {
    success: result.success,
    error: result.error,
    resolved: result.resolved
  };
}