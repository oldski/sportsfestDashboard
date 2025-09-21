import 'server-only';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { db, eq, and, sql, inArray } from '@workspace/database/client';
import { 
  companyTeamTable,
  teamRosterTable,
  playerTable,
  eventYearTable
} from '@workspace/database/schema';
import { syncCompanyTeams } from './sync-company-teams';

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  isCaptain: boolean;
  assignedAt: Date;
}

export interface CompanyTeam {
  id: string;
  teamNumber: number;
  name: string | null;
  isPaid: boolean;
  memberCount: number;
  maxMembers: number;
  members: TeamMember[];
  eventYear: {
    id: string;
    year: number;
    name: string;
  };
}

export interface CompanyTeamsResult {
  teams: CompanyTeam[];
  totalTeamsPurchased: number;
  availablePlayerCount: number;
  eventYear: {
    id: string;
    year: number;
    name: string;
  } | null;
}

/**
 * Get company teams for the active event year with their rosters
 */
export async function getCompanyTeams(): Promise<CompanyTeamsResult> {
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
      teams: [],
      totalTeamsPurchased: 0,
      availablePlayerCount: 0,
      eventYear: null
    };
  }

  // Sync company teams from paid orders (creates missing team records)
  await syncCompanyTeams();

  // Get company teams for the active event year
  const companyTeams = await db
    .select({
      id: companyTeamTable.id,
      teamNumber: companyTeamTable.teamNumber,
      name: companyTeamTable.name,
      isPaid: companyTeamTable.isPaid,
      createdAt: companyTeamTable.createdAt,
    })
    .from(companyTeamTable)
    .where(
      and(
        eq(companyTeamTable.organizationId, ctx.organization.id),
        eq(companyTeamTable.eventYearId, activeEventYear.id)
      )
    )
    .orderBy(companyTeamTable.teamNumber);

  // Get team rosters with player details
  const teamIds = companyTeams.map(team => team.id);
  const teamRosters = teamIds.length > 0 ? await db
    .select({
      teamId: teamRosterTable.companyTeamId,
      playerId: playerTable.id,
      firstName: playerTable.firstName,
      lastName: playerTable.lastName,
      email: playerTable.email,
      gender: playerTable.gender,
      isCaptain: teamRosterTable.isCaptain,
      assignedAt: teamRosterTable.assignedAt,
    })
    .from(teamRosterTable)
    .innerJoin(playerTable, eq(teamRosterTable.playerId, playerTable.id))
    .where(inArray(teamRosterTable.companyTeamId, teamIds))
    : [];

  // Group rosters by team
  const rostersByTeam = teamRosters.reduce((acc, roster) => {
    if (!acc[roster.teamId]) {
      acc[roster.teamId] = [];
    }
    acc[roster.teamId].push({
      id: roster.playerId,
      firstName: roster.firstName,
      lastName: roster.lastName,
      email: roster.email,
      gender: roster.gender,
      isCaptain: roster.isCaptain,
      assignedAt: roster.assignedAt,
    });
    return acc;
  }, {} as Record<string, TeamMember[]>);

  // Get available players count (players not assigned to any team for this event year)
  const availablePlayersResult = await db
    .select({
      count: sql<number>`COUNT(*)`
    })
    .from(playerTable)
    .where(
      and(
        eq(playerTable.organizationId, ctx.organization.id),
        eq(playerTable.eventYearId, activeEventYear.id),
        // Player not assigned to any team
        sql`NOT EXISTS (
          SELECT 1 FROM ${teamRosterTable} tr 
          WHERE tr."playerId" = ${playerTable.id}
        )`
      )
    );

  const availablePlayerCount = Number(availablePlayersResult[0]?.count || 0);

  // Build company teams with their rosters
  const teams: CompanyTeam[] = companyTeams.map(team => ({
    id: team.id,
    teamNumber: team.teamNumber,
    name: team.name,
    isPaid: team.isPaid,
    memberCount: rostersByTeam[team.id]?.length || 0,
    maxMembers: 20, // Maximum suggested team size (can exceed if needed)
    members: rostersByTeam[team.id] || [],
    eventYear: activeEventYear,
  }));

  return {
    teams,
    totalTeamsPurchased: companyTeams.length,
    availablePlayerCount,
    eventYear: activeEventYear,
  };
}