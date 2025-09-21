import 'server-only';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { db, eq, and, sql, inArray } from '@workspace/database/client';
import { 
  playerTable,
  teamRosterTable,
  companyTeamTable,
  eventYearTable,
  playerEventInterestTable
} from '@workspace/database/schema';

export interface PlayerForRoster {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dateOfBirth: Date;
  eventInterest?: Array<{
    eventType: string;
    interestRating: number;
  }>;
  currentTeam?: {
    id: string;
    teamNumber: number;
    name: string | null;
    isCaptain: boolean;
  } | null;
}

export interface PlayersForRosterResult {
  availablePlayers: PlayerForRoster[];
  currentTeamMembers: PlayerForRoster[];
  playersOnOtherTeams: PlayerForRoster[];
  eventYear: {
    id: string;
    year: number;
    name: string;
  } | null;
}

/**
 * Get all players organized by their current team assignments for roster management
 */
export async function getPlayersForRosterManagement(currentTeamId: string): Promise<PlayersForRosterResult> {
  const ctx = await getAuthOrganizationContext();

  // Get the active event year
  const activeEventYearResult = await db
    .select({
      id: eventYearTable.id,
      year: eventYearTable.year,
      name: eventYearTable.name,
    })
    .from(eventYearTable)
    .where(and(
      eq(eventYearTable.isActive, true),
      eq(eventYearTable.isDeleted, false)
    ))
    .limit(1);

  const activeEventYear = activeEventYearResult[0] || null;

  if (!activeEventYear) {
    return {
      availablePlayers: [],
      currentTeamMembers: [],
      playersOnOtherTeams: [],
      eventYear: null
    };
  }

  // Get all players with their current team assignments
  const playersWithTeams = await db
    .select({
      playerId: playerTable.id,
      firstName: playerTable.firstName,
      lastName: playerTable.lastName,
      email: playerTable.email,
      gender: playerTable.gender,
      dateOfBirth: playerTable.dateOfBirth,
      // Team assignment info (null if not assigned)
      teamId: companyTeamTable.id,
      teamNumber: companyTeamTable.teamNumber,
      teamName: companyTeamTable.name,
      isCaptain: teamRosterTable.isCaptain,
    })
    .from(playerTable)
    .leftJoin(teamRosterTable, eq(playerTable.id, teamRosterTable.playerId))
    .leftJoin(companyTeamTable, and(
      eq(teamRosterTable.companyTeamId, companyTeamTable.id),
      eq(companyTeamTable.eventYearId, activeEventYear.id)
    ))
    .where(
      and(
        eq(playerTable.organizationId, ctx.organization.id),
        eq(playerTable.eventYearId, activeEventYear.id)
      )
    )
    .orderBy(playerTable.firstName, playerTable.lastName);

  // Get event interests for all players
  const playerIds = playersWithTeams.map(p => p.playerId);
  let eventInterests: any[] = [];
  
  if (playerIds.length > 0) {
    eventInterests = await db
      .select({
        playerId: playerEventInterestTable.playerId,
        eventType: playerEventInterestTable.eventType,
        interestRating: playerEventInterestTable.interestRating,
      })
      .from(playerEventInterestTable)
      .where(inArray(playerEventInterestTable.playerId, playerIds));
  }

  // Group interests by player
  const interestsByPlayer = eventInterests.reduce((acc, interest) => {
    if (!acc[interest.playerId]) {
      acc[interest.playerId] = [];
    }
    acc[interest.playerId].push({
      eventType: interest.eventType,
      interestRating: interest.interestRating,
    });
    return acc;
  }, {} as Record<string, Array<{ eventType: string; interestRating: number }>>);

  // Categorize players
  const availablePlayers: PlayerForRoster[] = [];
  const currentTeamMembers: PlayerForRoster[] = [];
  const playersOnOtherTeams: PlayerForRoster[] = [];

  playersWithTeams.forEach(player => {
    const playerData: PlayerForRoster = {
      id: player.playerId,
      firstName: player.firstName,
      lastName: player.lastName,
      email: player.email,
      gender: player.gender,
      dateOfBirth: player.dateOfBirth,
      eventInterest: interestsByPlayer[player.playerId] || [],
      currentTeam: player.teamId ? {
        id: player.teamId,
        teamNumber: player.teamNumber!,
        name: player.teamName,
        isCaptain: player.isCaptain || false,
      } : null,
    };

    if (!player.teamId) {
      // Player not assigned to any team
      availablePlayers.push(playerData);
    } else if (player.teamId === currentTeamId) {
      // Player assigned to current team
      currentTeamMembers.push(playerData);
    } else {
      // Player assigned to different team
      playersOnOtherTeams.push(playerData);
    }
  });

  return {
    availablePlayers,
    currentTeamMembers,
    playersOnOtherTeams,
    eventYear: activeEventYear,
  };
}