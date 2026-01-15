import 'server-only';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { db, eq, and, sql, inArray } from '@workspace/database/client';
import {
  companyTeamTable,
  teamRosterTable,
  playerTable,
  eventYearTable,
  PlayerStatus
} from '@workspace/database/schema';

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  gender: string;
  isCaptain: boolean;
  assignedAt: Date;
}

export interface CompanyTeamDetails {
  id: string;
  teamNumber: number;
  name: string | null;
  isPaid: boolean;
  memberCount: number;
  maxMembers: number;
  members: TeamMember[];
  availablePlayerCount: number;
  eventYear: {
    id: string;
    year: number;
    name: string;
  };
}

/**
 * Get a specific company team by ID with full roster details
 */
export async function getCompanyTeamById(teamId: string): Promise<CompanyTeamDetails | null> {
  const ctx = await getAuthOrganizationContext();

  // Get the team with event year details
  const teamResult = await db
    .select({
      teamId: companyTeamTable.id,
      teamNumber: companyTeamTable.teamNumber,
      teamName: companyTeamTable.name,
      isPaid: companyTeamTable.isPaid,
      eventYearId: eventYearTable.id,
      eventYearName: eventYearTable.name,
      eventYear: eventYearTable.year,
    })
    .from(companyTeamTable)
    .innerJoin(eventYearTable, eq(companyTeamTable.eventYearId, eventYearTable.id))
    .where(
      and(
        eq(companyTeamTable.id, teamId),
        eq(companyTeamTable.organizationId, ctx.organization.id)
      )
    )
    .limit(1);

  if (teamResult.length === 0) {
    return null;
  }

  const team = teamResult[0];

  // Get team roster with player details
  const teamRoster = await db
    .select({
      playerId: playerTable.id,
      firstName: playerTable.firstName,
      lastName: playerTable.lastName,
      email: playerTable.email,
      phone: playerTable.phone,
      gender: playerTable.gender,
      isCaptain: teamRosterTable.isCaptain,
      assignedAt: teamRosterTable.assignedAt,
    })
    .from(teamRosterTable)
    .innerJoin(playerTable, eq(teamRosterTable.playerId, playerTable.id))
    .where(eq(teamRosterTable.companyTeamId, teamId));

  // Get available players count (players not assigned to any team for this event year, excluding inactive)
  const availablePlayersResult = await db
    .select({
      count: sql<number>`COUNT(*)`
    })
    .from(playerTable)
    .where(
      and(
        eq(playerTable.organizationId, ctx.organization.id),
        eq(playerTable.eventYearId, team.eventYearId),
        sql`${playerTable.status} != ${PlayerStatus.INACTIVE}`, // Exclude inactive players
        // Player not assigned to any team
        sql`NOT EXISTS (
          SELECT 1 FROM ${teamRosterTable} tr
          WHERE tr."playerId" = ${playerTable.id}
        )`
      )
    );

  const availablePlayerCount = Number(availablePlayersResult[0]?.count || 0);

  // Build team members array
  const members: TeamMember[] = teamRoster.map(roster => ({
    id: roster.playerId,
    firstName: roster.firstName,
    lastName: roster.lastName,
    email: roster.email,
    phone: roster.phone,
    gender: roster.gender,
    isCaptain: roster.isCaptain,
    assignedAt: roster.assignedAt,
  }));

  return {
    id: team.teamId,
    teamNumber: team.teamNumber,
    name: team.teamName,
    isPaid: team.isPaid,
    memberCount: members.length,
    maxMembers: 20, // Maximum suggested team size (can exceed if needed)
    members,
    availablePlayerCount,
    eventYear: {
      id: team.eventYearId,
      year: team.eventYear,
      name: team.eventYearName,
    },
  };
}