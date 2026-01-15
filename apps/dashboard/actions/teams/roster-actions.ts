'use server';

import { revalidatePath } from 'next/cache';
import { getAuthOrganizationContext } from '@workspace/auth/context';
import { db, eq, and, sql, ne } from '@workspace/database/client';
import { teamRosterTable, companyTeamTable, playerTable, eventYearTable, eventRosterTable, PlayerStatus } from '@workspace/database/schema';
import { resolveAllTransferWarningsForPlayer } from '~/actions/teams/transfer-warning-actions';

export interface RosterActionResult {
  success: boolean;
  error?: string;
  eventRostersRemoved?: number;
}

export interface AutoGenerateRosterResult {
  success: boolean;
  error?: string;
  playersAssigned?: number;
  teamsCreated?: number;
}

/**
 * Add a player to a team roster
 */
export async function addPlayerToTeam(playerId: string, teamId: string): Promise<RosterActionResult> {
  try {
    const ctx = await getAuthOrganizationContext();

    // Verify the team belongs to the organization
    const team = await db
      .select({ id: companyTeamTable.id })
      .from(companyTeamTable)
      .where(
        and(
          eq(companyTeamTable.id, teamId),
          eq(companyTeamTable.organizationId, ctx.organization.id)
        )
      )
      .limit(1);

    if (team.length === 0) {
      return { success: false, error: 'Team not found or access denied' };
    }

    // Verify the player belongs to the organization and is not already on a team
    const player = await db
      .select({ id: playerTable.id, status: playerTable.status })
      .from(playerTable)
      .where(
        and(
          eq(playerTable.id, playerId),
          eq(playerTable.organizationId, ctx.organization.id)
        )
      )
      .limit(1);

    if (player.length === 0) {
      return { success: false, error: 'Player not found or access denied' };
    }

    // Prevent adding inactive players to team roster
    if (player[0].status === PlayerStatus.INACTIVE) {
      return { success: false, error: 'Cannot add inactive player to team roster' };
    }

    // Check if player is already on a team (one-player-per-team constraint)
    const existingAssignment = await db
      .select({ id: teamRosterTable.id })
      .from(teamRosterTable)
      .innerJoin(companyTeamTable, eq(teamRosterTable.companyTeamId, companyTeamTable.id))
      .innerJoin(playerTable, eq(teamRosterTable.playerId, playerTable.id))
      .where(
        and(
          eq(teamRosterTable.playerId, playerId),
          eq(companyTeamTable.organizationId, ctx.organization.id),
          eq(playerTable.organizationId, ctx.organization.id)
        )
      )
      .limit(1);

    if (existingAssignment.length > 0) {
      return { success: false, error: 'Player is already assigned to a team' };
    }

    // Add player to team roster
    await db.insert(teamRosterTable).values({
      companyTeamId: teamId,
      playerId: playerId,
      isCaptain: false, // Default to non-captain
    });

    revalidatePath('/organizations/[slug]/teams', 'page');
    return { success: true };
  } catch (error) {
    console.error('Error adding player to team:', error);
    return { success: false, error: 'Failed to add player to team' };
  }
}

/**
 * Remove a player from a team roster
 */
export async function removePlayerFromTeam(playerId: string, teamId: string): Promise<RosterActionResult> {
  try {
    const ctx = await getAuthOrganizationContext();

    // Verify the team belongs to the organization
    const team = await db
      .select({ id: companyTeamTable.id })
      .from(companyTeamTable)
      .where(
        and(
          eq(companyTeamTable.id, teamId),
          eq(companyTeamTable.organizationId, ctx.organization.id)
        )
      )
      .limit(1);

    if (team.length === 0) {
      return { success: false, error: 'Team not found or access denied' };
    }

    // Remove player from team roster
    await db
      .delete(teamRosterTable)
      .where(
        and(
          eq(teamRosterTable.playerId, playerId),
          eq(teamRosterTable.companyTeamId, teamId)
        )
      );

    // Also remove player from all event rosters for this team
    const eventRosterResult = await db
      .delete(eventRosterTable)
      .where(
        and(
          eq(eventRosterTable.playerId, playerId),
          eq(eventRosterTable.companyTeamId, teamId)
        )
      );

    revalidatePath('/organizations/[slug]/teams', 'page');
    return {
      success: true,
      eventRostersRemoved: eventRosterResult.rowCount || 0
    };
  } catch (error) {
    console.error('Error removing player from team:', error);
    return { success: false, error: 'Failed to remove player from team' };
  }
}

/**
 * Transfer a player from their current team to a new team
 */
export async function transferPlayerToTeam(playerId: string, newTeamId: string): Promise<RosterActionResult> {
  try {
    const ctx = await getAuthOrganizationContext();

    // Verify the new team belongs to the organization
    const newTeam = await db
      .select({ id: companyTeamTable.id })
      .from(companyTeamTable)
      .where(
        and(
          eq(companyTeamTable.id, newTeamId),
          eq(companyTeamTable.organizationId, ctx.organization.id)
        )
      )
      .limit(1);

    if (newTeam.length === 0) {
      return { success: false, error: 'Team not found or access denied' };
    }

    // Verify the player is not inactive
    const player = await db
      .select({ id: playerTable.id, status: playerTable.status })
      .from(playerTable)
      .where(
        and(
          eq(playerTable.id, playerId),
          eq(playerTable.organizationId, ctx.organization.id)
        )
      )
      .limit(1);

    if (player.length === 0) {
      return { success: false, error: 'Player not found or access denied' };
    }

    if (player[0].status === PlayerStatus.INACTIVE) {
      return { success: false, error: 'Cannot transfer inactive player' };
    }

    // Find current team assignment
    const currentAssignment = await db
      .select({
        rosterItemId: teamRosterTable.id,
        teamId: companyTeamTable.id
      })
      .from(teamRosterTable)
      .innerJoin(companyTeamTable, eq(teamRosterTable.companyTeamId, companyTeamTable.id))
      .where(
        and(
          eq(teamRosterTable.playerId, playerId),
          eq(companyTeamTable.organizationId, ctx.organization.id)
        )
      )
      .limit(1);

    if (currentAssignment.length === 0) {
      return { success: false, error: 'Player is not currently assigned to any team' };
    }

    // Remove from current team and add to new team (atomic operation)
    await db.transaction(async (tx) => {
      // Remove from current team
      await tx
        .delete(teamRosterTable)
        .where(eq(teamRosterTable.id, currentAssignment[0].rosterItemId));

      // Add to new team
      await tx.insert(teamRosterTable).values({
        companyTeamId: newTeamId,
        playerId: playerId,
        isCaptain: false, // Reset captain status on transfer
      });
    });

    // Clean up any event roster assignments from the old team
    const cleanupResult = await resolveAllTransferWarningsForPlayer(playerId);

    revalidatePath('/organizations/[slug]/teams', 'page');
    return {
      success: true,
      eventRostersRemoved: cleanupResult.resolved || 0
    };
  } catch (error) {
    console.error('Error transferring player:', error);
    return { success: false, error: 'Failed to transfer player' };
  }
}

/**
 * Toggle captain status for a player on their team
 */
export async function togglePlayerCaptain(playerId: string, teamId: string, isCaptain: boolean): Promise<RosterActionResult> {
  try {
    const ctx = await getAuthOrganizationContext();

    // Verify the team belongs to the organization
    const team = await db
      .select({ id: companyTeamTable.id })
      .from(companyTeamTable)
      .where(
        and(
          eq(companyTeamTable.id, teamId),
          eq(companyTeamTable.organizationId, ctx.organization.id)
        )
      )
      .limit(1);

    if (team.length === 0) {
      return { success: false, error: 'Team not found or access denied' };
    }

    // Update captain status
    await db
      .update(teamRosterTable)
      .set({ isCaptain })
      .where(
        and(
          eq(teamRosterTable.playerId, playerId),
          eq(teamRosterTable.companyTeamId, teamId)
        )
      );

    revalidatePath('/organizations/[slug]/teams', 'page');
    return { success: true };
  } catch (error) {
    console.error('Error toggling captain status:', error);
    return { success: false, error: 'Failed to update captain status' };
  }
}

/**
 * Auto-generate team rosters by distributing available players across teams
 */
export async function autoGenerateRosters(): Promise<AutoGenerateRosterResult> {
  try {
    const ctx = await getAuthOrganizationContext();

    // Get active event year
    const activeEventYear = await db
      .select({ id: eventYearTable.id })
      .from(eventYearTable)
      .where(and(
        eq(eventYearTable.isActive, true),
        eq(eventYearTable.isDeleted, false)
      ))
      .limit(1);

    if (activeEventYear.length === 0) {
      return { success: false, error: 'No active event year found' };
    }

    // Get all available players (not assigned to any team, excluding inactive)
    const availablePlayers = await db
      .select({
        id: playerTable.id,
        firstName: playerTable.firstName,
        lastName: playerTable.lastName,
        gender: playerTable.gender,
      })
      .from(playerTable)
      .leftJoin(teamRosterTable, eq(playerTable.id, teamRosterTable.playerId))
      .where(
        and(
          eq(playerTable.organizationId, ctx.organization.id),
          eq(playerTable.eventYearId, activeEventYear[0].id),
          ne(playerTable.status, PlayerStatus.INACTIVE), // Exclude inactive players
          sql`${teamRosterTable.playerId} IS NULL` // Not assigned to any team
        )
      )
      .orderBy(playerTable.firstName, playerTable.lastName);

    if (availablePlayers.length === 0) {
      return { success: false, error: 'No available players to assign' };
    }

    // Get all company teams for this organization and event year
    const companyTeams = await db
      .select({
        id: companyTeamTable.id,
        teamNumber: companyTeamTable.teamNumber,
        memberCount: sql<number>`(
          SELECT COUNT(*) 
          FROM ${teamRosterTable} 
          WHERE ${teamRosterTable.companyTeamId} = ${companyTeamTable.id}
        )`
      })
      .from(companyTeamTable)
      .where(
        and(
          eq(companyTeamTable.organizationId, ctx.organization.id),
          eq(companyTeamTable.eventYearId, activeEventYear[0].id)
        )
      )
      .orderBy(companyTeamTable.teamNumber);

    if (companyTeams.length === 0) {
      return { success: false, error: 'No teams found to assign players to' };
    }

    // Separate players by gender for balanced distribution
    const malePlayers = availablePlayers.filter(p => p.gender === 'male');
    const femalePlayers = availablePlayers.filter(p => p.gender === 'female');

    // Calculate target distribution
    const malePlayersPerTeam = Math.floor(malePlayers.length / companyTeams.length);
    const femalePlayersPerTeam = Math.floor(femalePlayers.length / companyTeams.length);
    const extraMalePlayers = malePlayers.length % companyTeams.length;
    const extraFemalePlayers = femalePlayers.length % companyTeams.length;

    const rosterAssignments: Array<{ companyTeamId: string; playerId: string; isCaptain: boolean }> = [];

    // Distribute players across teams
    let malePlayerIndex = 0;
    let femalePlayerIndex = 0;

    for (let i = 0; i < companyTeams.length; i++) {
      const team = companyTeams[i];
      
      // Assign male players
      const maleCountForTeam = malePlayersPerTeam + (i < extraMalePlayers ? 1 : 0);
      for (let j = 0; j < maleCountForTeam && malePlayerIndex < malePlayers.length; j++) {
        rosterAssignments.push({
          companyTeamId: team.id,
          playerId: malePlayers[malePlayerIndex].id,
          isCaptain: j === 0 && Number(team.memberCount) === 0 // Make first assigned player captain if team is empty
        });
        malePlayerIndex++;
      }

      // Assign female players
      const femaleCountForTeam = femalePlayersPerTeam + (i < extraFemalePlayers ? 1 : 0);
      for (let j = 0; j < femaleCountForTeam && femalePlayerIndex < femalePlayers.length; j++) {
        rosterAssignments.push({
          companyTeamId: team.id,
          playerId: femalePlayers[femalePlayerIndex].id,
          isCaptain: j === 0 && Number(team.memberCount) === 0 && maleCountForTeam === 0 // Captain if team empty and no males assigned
        });
        femalePlayerIndex++;
      }
    }

    // Insert all roster assignments in a transaction
    if (rosterAssignments.length > 0) {
      await db.transaction(async (tx) => {
        await tx.insert(teamRosterTable).values(rosterAssignments);
      });
    }

    revalidatePath('/organizations/[slug]/teams', 'page');
    
    return { 
      success: true, 
      playersAssigned: rosterAssignments.length,
      teamsCreated: companyTeams.length
    };

  } catch (error) {
    console.error('Error auto-generating rosters:', error);
    return { success: false, error: 'Failed to auto-generate rosters' };
  }
}