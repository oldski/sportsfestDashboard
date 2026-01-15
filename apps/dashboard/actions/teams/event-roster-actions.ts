'use server';

import { revalidatePath } from 'next/cache';
import { getAuthOrganizationContext } from '@workspace/auth/context';
import { db, eq, and, sql, ne } from '@workspace/database/client';
import {
  eventRosterTable,
  companyTeamTable,
  playerTable,
  teamRosterTable,
  playerEventInterestTable,
  eventYearTable,
  EventType,
  PlayerStatus
} from '@workspace/database/schema';

export interface EventRosterActionResult {
  success: boolean;
  error?: string;
}

export interface AutoGenerateEventRosterResult {
  success: boolean;
  error?: string;
  playersAssigned?: number;
  eventType?: EventType;
}

/**
 * Add a player to an event roster
 */
export async function addPlayerToEventRoster(
  playerId: string,
  teamId: string,
  eventType: EventType,
  isStarter: boolean = true
): Promise<EventRosterActionResult> {
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

    // Verify the player belongs to the organization and is on the team roster
    const player = await db
      .select({
        id: playerTable.id,
        gender: playerTable.gender,
        status: playerTable.status
      })
      .from(playerTable)
      .innerJoin(teamRosterTable, eq(playerTable.id, teamRosterTable.playerId))
      .where(
        and(
          eq(playerTable.id, playerId),
          eq(playerTable.organizationId, ctx.organization.id),
          eq(teamRosterTable.companyTeamId, teamId)
        )
      )
      .limit(1);

    if (player.length === 0) {
      return { success: false, error: 'Player not found on team roster' };
    }

    // Prevent adding inactive players to event roster
    if (player[0].status === PlayerStatus.INACTIVE) {
      return { success: false, error: 'Cannot add inactive player to event roster' };
    }

    // Check if player is already in this event roster
    const existingAssignment = await db
      .select({ id: eventRosterTable.id })
      .from(eventRosterTable)
      .where(
        and(
          eq(eventRosterTable.playerId, playerId),
          eq(eventRosterTable.companyTeamId, teamId),
          eq(eventRosterTable.eventType, eventType)
        )
      )
      .limit(1);

    if (existingAssignment.length > 0) {
      return { success: false, error: 'Player is already assigned to this event' };
    }

    // Validate gender requirements and slot availability
    const validationResult = await validateEventRosterSlot(teamId, eventType, player[0].gender, isStarter);
    if (!validationResult.valid) {
      return { success: false, error: validationResult.error };
    }

    // Add player to event roster
    await db.insert(eventRosterTable).values({
      companyTeamId: teamId,
      playerId: playerId,
      eventType: eventType,
      isStarter: isStarter,
      squadLeader: false, // Default to non-leader
    });

    revalidatePath('/organizations/[slug]/teams/[teamId]/events', 'page');
    return { success: true };
  } catch (error) {
    console.error('Error adding player to event roster:', error);
    return { success: false, error: 'Failed to add player to event roster' };
  }
}

/**
 * Remove a player from an event roster
 */
export async function removePlayerFromEventRoster(
  playerId: string,
  teamId: string,
  eventType: EventType
): Promise<EventRosterActionResult> {
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

    // Remove player from event roster
    await db
      .delete(eventRosterTable)
      .where(
        and(
          eq(eventRosterTable.playerId, playerId),
          eq(eventRosterTable.companyTeamId, teamId),
          eq(eventRosterTable.eventType, eventType)
        )
      );

    revalidatePath('/organizations/[slug]/teams/[teamId]/events', 'page');
    return { success: true };
  } catch (error) {
    console.error('Error removing player from event roster:', error);
    return { success: false, error: 'Failed to remove player from event roster' };
  }
}

/**
 * Toggle squad leader status for a player in an event
 */
export async function toggleEventSquadLeader(
  playerId: string,
  teamId: string,
  eventType: EventType,
  isSquadLeader: boolean
): Promise<EventRosterActionResult> {
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

    await db.transaction(async (tx) => {
      if (isSquadLeader) {
        // First, remove squad leader status from any other players in this event
        await tx
          .update(eventRosterTable)
          .set({ squadLeader: false })
          .where(
            and(
              eq(eventRosterTable.companyTeamId, teamId),
              eq(eventRosterTable.eventType, eventType),
              eq(eventRosterTable.squadLeader, true)
            )
          );
      }

      // Update the specified player's squad leader status
      await tx
        .update(eventRosterTable)
        .set({ squadLeader: isSquadLeader })
        .where(
          and(
            eq(eventRosterTable.playerId, playerId),
            eq(eventRosterTable.companyTeamId, teamId),
            eq(eventRosterTable.eventType, eventType)
          )
        );
    });

    revalidatePath('/organizations/[slug]/teams/[teamId]/events', 'page');
    return { success: true };
  } catch (error) {
    console.error('Error toggling squad leader status:', error);
    return { success: false, error: 'Failed to update squad leader status' };
  }
}

/**
 * Toggle starter/substitute status for a player in an event
 */
export async function toggleEventStarterStatus(
  playerId: string,
  teamId: string,
  eventType: EventType,
  isStarter: boolean
): Promise<EventRosterActionResult> {
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

    // Get player's gender for validation
    const player = await db
      .select({ gender: playerTable.gender })
      .from(playerTable)
      .where(eq(playerTable.id, playerId))
      .limit(1);

    if (player.length === 0) {
      return { success: false, error: 'Player not found' };
    }

    // Validate the change won't violate slot requirements (exclude current player from count)
    const validationResult = await validateEventRosterSlotForToggle(teamId, eventType, player[0].gender, isStarter, playerId);
    if (!validationResult.valid && isStarter) {
      return { success: false, error: validationResult.error };
    }

    // Update starter status
    await db
      .update(eventRosterTable)
      .set({ isStarter: isStarter })
      .where(
        and(
          eq(eventRosterTable.playerId, playerId),
          eq(eventRosterTable.companyTeamId, teamId),
          eq(eventRosterTable.eventType, eventType)
        )
      );

    revalidatePath('/organizations/[slug]/teams/[teamId]/events', 'page');
    return { success: true };
  } catch (error) {
    console.error('Error toggling starter status:', error);
    return { success: false, error: 'Failed to update starter status' };
  }
}

/**
 * Clear entire event roster
 */
export async function clearEventRoster(
  teamId: string,
  eventType: EventType
): Promise<EventRosterActionResult> {
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

    // Remove all players from event roster
    await db
      .delete(eventRosterTable)
      .where(
        and(
          eq(eventRosterTable.companyTeamId, teamId),
          eq(eventRosterTable.eventType, eventType)
        )
      );

    revalidatePath('/organizations/[slug]/teams/[teamId]/events', 'page');
    return { success: true };
  } catch (error) {
    console.error('Error clearing event roster:', error);
    return { success: false, error: 'Failed to clear event roster' };
  }
}

/**
 * Auto-generate event roster based on player interest ratings
 */
export async function autoGenerateEventRoster(
  teamId: string,
  eventType: EventType
): Promise<AutoGenerateEventRosterResult> {
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

    // Get all team members not already assigned to this event
    const availablePlayers = await db
      .select({
        id: playerTable.id,
        firstName: playerTable.firstName,
        lastName: playerTable.lastName,
        gender: playerTable.gender,
        interestRating: playerEventInterestTable.interestRating,
      })
      .from(playerTable)
      .innerJoin(teamRosterTable, eq(playerTable.id, teamRosterTable.playerId))
      .leftJoin(playerEventInterestTable, and(
        eq(playerTable.id, playerEventInterestTable.playerId),
        eq(playerEventInterestTable.eventType, eventType)
      ))
      .leftJoin(eventRosterTable, and(
        eq(playerTable.id, eventRosterTable.playerId),
        eq(eventRosterTable.companyTeamId, teamId),
        eq(eventRosterTable.eventType, eventType)
      ))
      .where(
        and(
          eq(teamRosterTable.companyTeamId, teamId),
          eq(playerTable.organizationId, ctx.organization.id),
          ne(playerTable.status, PlayerStatus.INACTIVE), // Exclude inactive players
          sql`${eventRosterTable.playerId} IS NULL` // Not already assigned to this event
        )
      )
      .orderBy(playerEventInterestTable.interestRating); // Order by interest (1 = most interested, 5 = least)

    if (availablePlayers.length === 0) {
      return { success: false, error: 'No available players to assign' };
    }

    const requirements = getEventRequirements(eventType);
    if (requirements.total === 0) {
      return { success: false, error: 'Invalid event type' };
    }

    // Separate players by gender and interest level
    const malePlayers = availablePlayers.filter(p => p.gender === 'male')
      .sort((a, b) => (a.interestRating || 5) - (b.interestRating || 5));
    const femalePlayers = availablePlayers.filter(p => p.gender === 'female')
      .sort((a, b) => (a.interestRating || 5) - (b.interestRating || 5));

    const rosterAssignments: Array<{
      companyTeamId: string;
      playerId: string;
      eventType: EventType;
      isStarter: boolean;
      squadLeader: boolean;
    }> = [];

    // For corn toss (no gender restrictions)
    if (eventType === EventType.CORN_TOSS) {
      const allPlayers = [...malePlayers, ...femalePlayers]
        .sort((a, b) => (a.interestRating || 5) - (b.interestRating || 5));

      for (let i = 0; i < Math.min(requirements.total, allPlayers.length); i++) {
        rosterAssignments.push({
          companyTeamId: teamId,
          playerId: allPlayers[i].id,
          eventType,
          isStarter: true, // All players are "starters" in corn toss
          squadLeader: i === 0 // First player becomes squad leader
        });
      }
    } else {
      // For events with gender requirements
      let assignedMales = 0;
      let assignedFemales = 0;
      let assignedStarterMales = 0;
      let assignedStarterFemales = 0;

      // Get precise starter requirements for this event type
      const starterRequirements = getStarterRequirements(eventType);
      const maleStarterRequirement = starterRequirements.male;
      const femaleStarterRequirement = starterRequirements.female;

      // Assign male players
      for (let i = 0; i < Math.min(requirements.male, malePlayers.length); i++) {
        const isStarter = assignedStarterMales < maleStarterRequirement;
        rosterAssignments.push({
          companyTeamId: teamId,
          playerId: malePlayers[i].id,
          eventType,
          isStarter,
          squadLeader: i === 0 && assignedFemales === 0 // First assigned player becomes squad leader
        });
        assignedMales++;
        if (isStarter) assignedStarterMales++;
      }

      // Assign female players
      for (let i = 0; i < Math.min(requirements.female, femalePlayers.length); i++) {
        const isStarter = assignedStarterFemales < femaleStarterRequirement;
        rosterAssignments.push({
          companyTeamId: teamId,
          playerId: femalePlayers[i].id,
          eventType,
          isStarter,
          squadLeader: i === 0 && assignedMales === 0 // First assigned player becomes squad leader if no males assigned yet
        });
        assignedFemales++;
        if (isStarter) assignedStarterFemales++;
      }
    }

    // Insert all assignments in a transaction
    if (rosterAssignments.length > 0) {
      await db.transaction(async (tx) => {
        await tx.insert(eventRosterTable).values(rosterAssignments);
      });
    }

    revalidatePath('/organizations/[slug]/teams/[teamId]/events', 'page');

    return {
      success: true,
      playersAssigned: rosterAssignments.length,
      eventType
    };

  } catch (error) {
    console.error('Error auto-generating event roster:', error);
    return { success: false, error: 'Failed to auto-generate event roster' };
  }
}

/**
 * Helper function to get event requirements
 */
function getEventRequirements(eventType: EventType) {
  switch (eventType) {
    case EventType.BEACH_VOLLEYBALL:
      return { total: 12, male: 6, female: 6, any: 0 };
    case EventType.BEACH_DODGEBALL:
      return { total: 10, male: 5, female: 5, any: 0 };
    case EventType.BOTE_BEACH_CHALLENGE:
      return { total: 11, male: 7, female: 4, any: 0 };
    case EventType.TUG_OF_WAR:
      return { total: 9, male: 5, female: 4, any: 0 };
    case EventType.CORN_TOSS:
      return { total: 4, male: 0, female: 0, any: 4 };
    default:
      return { total: 0, male: 0, female: 0, any: 0 };
  }
}

/**
 * Helper function to get starter requirements by event type
 */
function getStarterRequirements(eventType: EventType) {
  switch (eventType) {
    case EventType.BEACH_VOLLEYBALL:
      return { male: 3, female: 3 };
    case EventType.BEACH_DODGEBALL:
      return { male: 3, female: 3 };
    case EventType.BOTE_BEACH_CHALLENGE:
      return { male: 4, female: 3 };
    case EventType.TUG_OF_WAR:
      return { male: 3, female: 2 };
    case EventType.CORN_TOSS:
      return { male: 2, female: 2 }; // 2 squads of 2 players each
    default:
      return { male: 0, female: 0 };
  }
}

/**
 * Validate if a player can be assigned to an event roster slot
 */
async function validateEventRosterSlot(
  teamId: string,
  eventType: EventType,
  playerGender: string,
  isStarter: boolean
): Promise<{ valid: boolean; error?: string }> {
  const requirements = getEventRequirements(eventType);

  if (requirements.total === 0) {
    return { valid: false, error: 'Invalid event type' };
  }

  // Get current roster count for this event
  const currentRoster = await db
    .select({
      playerId: eventRosterTable.playerId,
      isStarter: eventRosterTable.isStarter,
      gender: playerTable.gender,
    })
    .from(eventRosterTable)
    .innerJoin(playerTable, eq(eventRosterTable.playerId, playerTable.id))
    .where(
      and(
        eq(eventRosterTable.companyTeamId, teamId),
        eq(eventRosterTable.eventType, eventType)
      )
    );

  const currentCount = currentRoster.length;
  const currentMaleCount = currentRoster.filter(p => p.gender === 'male').length;
  const currentFemaleCount = currentRoster.filter(p => p.gender === 'female').length;
  const currentMaleStarters = currentRoster.filter(p => p.gender === 'male' && p.isStarter).length;
  const currentFemaleStarters = currentRoster.filter(p => p.gender === 'female' && p.isStarter).length;

  // Check total capacity
  if (currentCount >= requirements.total) {
    return { valid: false, error: 'Event roster is full' };
  }

  // Check gender requirements (corn toss has no gender restrictions)
  if (eventType !== EventType.CORN_TOSS) {
    if (playerGender === 'male' && currentMaleCount >= requirements.male) {
      return { valid: false, error: 'Male slots are full for this event' };
    }
    if (playerGender === 'female' && currentFemaleCount >= requirements.female) {
      return { valid: false, error: 'Female slots are full for this event' };
    }
  }

  // Check gender-specific starter capacity
  if (isStarter) {
    const starterRequirements = getStarterRequirements(eventType);

    if (playerGender === 'male' && currentMaleStarters >= starterRequirements.male) {
      return { valid: false, error: 'Male starter slots are full for this event' };
    }
    if (playerGender === 'female' && currentFemaleStarters >= starterRequirements.female) {
      return { valid: false, error: 'Female starter slots are full for this event' };
    }
  }

  return { valid: true };
}

/**
 * Validate if a player can change starter/substitute status (excludes the player being toggled from counts)
 */
async function validateEventRosterSlotForToggle(
  teamId: string,
  eventType: EventType,
  playerGender: string,
  isStarter: boolean,
  excludePlayerId: string
): Promise<{ valid: boolean; error?: string }> {
  const requirements = getEventRequirements(eventType);

  if (requirements.total === 0) {
    return { valid: false, error: 'Invalid event type' };
  }

  // Get current roster count for this event (excluding the player being toggled)
  const currentRoster = await db
    .select({
      playerId: eventRosterTable.playerId,
      isStarter: eventRosterTable.isStarter,
      gender: playerTable.gender,
    })
    .from(eventRosterTable)
    .innerJoin(playerTable, eq(eventRosterTable.playerId, playerTable.id))
    .where(
      and(
        eq(eventRosterTable.companyTeamId, teamId),
        eq(eventRosterTable.eventType, eventType),
        sql`${eventRosterTable.playerId} != ${excludePlayerId}` // Exclude the player being toggled
      )
    );

  const currentMaleStarters = currentRoster.filter(p => p.gender === 'male' && p.isStarter).length;
  const currentFemaleStarters = currentRoster.filter(p => p.gender === 'female' && p.isStarter).length;

  // Check gender-specific starter capacity
  if (isStarter) {
    const starterRequirements = getStarterRequirements(eventType);

    if (playerGender === 'male' && currentMaleStarters >= starterRequirements.male) {
      return { valid: false, error: 'Male starter slots are full for this event' };
    }
    if (playerGender === 'female' && currentFemaleStarters >= starterRequirements.female) {
      return { valid: false, error: 'Female starter slots are full for this event' };
    }
  }

  return { valid: true };
}
