import 'server-only';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { db, eq, and, sql, inArray } from '@workspace/database/client';
import {
  eventRosterTable,
  companyTeamTable,
  playerTable,
  playerEventInterestTable,
  eventYearTable,
  EventType
} from '@workspace/database/schema';

export interface EventRosterPlayer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  gender: string;
  isStarter: boolean;
  squadLeader: boolean;
  assignedAt: Date;
  eventInterestRating?: number;
}

export interface EventRosterData {
  eventType: EventType;
  players: EventRosterPlayer[];
  availableSlots: {
    total: number;
    filled: number;
    genderBreakdown: {
      male: { required: number; filled: number };
      female: { required: number; filled: number };
      any: { required: number; filled: number };
    };
  };
}

export interface EventRostersResult {
  teamId: string;
  teamName: string;
  teamNumber: number;
  eventRosters: EventRosterData[];
  eventYear: {
    id: string;
    year: number;
    name: string;
  };
}

/**
 * Get event roster requirements based on event type
 */
function getEventRequirements(eventType: EventType) {
  switch (eventType) {
    case EventType.BEACH_VOLLEYBALL:
      return {
        total: 12, // 6 starters + 6 subs
        male: 6, // 3 starters + 3 subs
        female: 6, // 3 starters + 3 subs
        any: 0
      };
    case EventType.BEACH_DODGEBALL:
      return {
        total: 10, // 6 starters + 4 subs
        male: 5, // 3 starters + 2 subs
        female: 5, // 3 starters + 2 subs
        any: 0
      };
    case EventType.BOTE_BEACH_CHALLENGE:
      return {
        total: 11, // 7 starters + 4 subs
        male: 7, // 4 starters + 3 subs (includes specialized roles)
        female: 4, // 3 starters + 1 sub
        any: 0
      };
    case EventType.TUG_OF_WAR:
      return {
        total: 9, // 5 starters + 4 subs
        male: 5, // 3 starters + 2 subs
        female: 4, // 2 starters + 2 subs
        any: 0
      };
    case EventType.CORN_TOSS:
      return {
        total: 4, // 2 squads of 2 players each
        male: 0,
        female: 0,
        any: 4 // No gender restrictions
      };
    default:
      return {
        total: 0,
        male: 0,
        female: 0,
        any: 0
      };
  }
}

/**
 * Get event rosters for a specific team
 */
export async function getEventRosters(teamId: string): Promise<EventRostersResult | null> {
  const ctx = await getAuthOrganizationContext();

  // Get team details
  const teamResult = await db
    .select({
      id: companyTeamTable.id,
      teamNumber: companyTeamTable.teamNumber,
      name: companyTeamTable.name,
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

  // Get all event rosters for this team
  const eventRosters = await db
    .select({
      eventType: eventRosterTable.eventType,
      playerId: playerTable.id,
      firstName: playerTable.firstName,
      lastName: playerTable.lastName,
      email: playerTable.email,
      phone: playerTable.phone,
      gender: playerTable.gender,
      isStarter: eventRosterTable.isStarter,
      squadLeader: eventRosterTable.squadLeader,
      assignedAt: eventRosterTable.assignedAt,
    })
    .from(eventRosterTable)
    .innerJoin(playerTable, eq(eventRosterTable.playerId, playerTable.id))
    .where(eq(eventRosterTable.companyTeamId, teamId))
    .orderBy(eventRosterTable.eventType, eventRosterTable.isStarter);

  // Get event interests for all players in rosters
  const playerIds = eventRosters.map(roster => roster.playerId);
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

  // Create interest lookup
  const interestLookup = eventInterests.reduce((acc, interest) => {
    const key = `${interest.playerId}-${interest.eventType}`;
    acc[key] = interest.interestRating;
    return acc;
  }, {} as Record<string, number>);

  // Group rosters by event type
  const rostersByEvent = eventRosters.reduce((acc, roster) => {
    if (!acc[roster.eventType]) {
      acc[roster.eventType] = [];
    }

    const interestKey = `${roster.playerId}-${roster.eventType}`;
    acc[roster.eventType].push({
      id: roster.playerId,
      firstName: roster.firstName,
      lastName: roster.lastName,
      email: roster.email,
      phone: roster.phone,
      gender: roster.gender,
      isStarter: roster.isStarter,
      squadLeader: roster.squadLeader,
      assignedAt: roster.assignedAt,
      eventInterestRating: interestLookup[interestKey],
    });
    return acc;
  }, {} as Record<EventType, EventRosterPlayer[]>);

  // Build event roster data for all event types
  const eventRosterData: EventRosterData[] = Object.values(EventType).map(eventType => {
    const players = rostersByEvent[eventType] || [];
    const requirements = getEventRequirements(eventType);

    // Calculate gender breakdown
    const maleCount = players.filter(p => p.gender === 'male').length;
    const femaleCount = players.filter(p => p.gender === 'female').length;

    return {
      eventType,
      players,
      availableSlots: {
        total: requirements.total,
        filled: players.length,
        genderBreakdown: {
          male: {
            required: requirements.male,
            filled: maleCount
          },
          female: {
            required: requirements.female,
            filled: femaleCount
          },
          any: {
            required: requirements.any,
            filled: requirements.any > 0 ? players.length : 0
          }
        }
      }
    };
  });

  return {
    teamId: team.id,
    teamName: team.name || `Team ${team.teamNumber}`,
    teamNumber: team.teamNumber,
    eventRosters: eventRosterData,
    eventYear: {
      id: team.eventYearId,
      year: team.eventYear,
      name: team.eventYearName,
    },
  };
}
