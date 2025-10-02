'use server';

import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getActiveEventYear } from './get-event-year';
import { db, eq, and } from '@workspace/database/client';
import {
  playerTable,
  organizationTable,
  eventYearTable,
  type Gender,
  type TshirtSize,
  type PlayerStatus
} from '@workspace/database/schema';

export interface PlayerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  gender: Gender;
  tshirtSize: TshirtSize;
  dateOfBirth: Date;
  status: PlayerStatus;
  accuracyConfirmed: boolean;
  waiverSigned: boolean;
  createdAt: Date;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  eventYearName: string;
}

export async function getPlayers(): Promise<PlayerData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access player data');
  }

  try {
    const activeEvent = await getActiveEventYear();

    if (!activeEvent?.id) {
      return [];
    }

    const players = await db
      .select({
        id: playerTable.id,
        firstName: playerTable.firstName,
        lastName: playerTable.lastName,
        email: playerTable.email,
        phone: playerTable.phone,
        gender: playerTable.gender,
        tshirtSize: playerTable.tshirtSize,
        dateOfBirth: playerTable.dateOfBirth,
        status: playerTable.status,
        accuracyConfirmed: playerTable.accuracyConfirmed,
        waiverSigned: playerTable.waiverSigned,
        createdAt: playerTable.createdAt,
        organizationId: organizationTable.id,
        organizationName: organizationTable.name,
        organizationSlug: organizationTable.slug,
        eventYearName: eventYearTable.name
      })
      .from(playerTable)
      .innerJoin(organizationTable, eq(playerTable.organizationId, organizationTable.id))
      .innerJoin(eventYearTable, eq(playerTable.eventYearId, eventYearTable.id))
      .where(eq(playerTable.eventYearId, activeEvent.id))
      .orderBy(playerTable.createdAt);

    return players;

  } catch (error) {
    console.error('Failed to get players:', error);
    return [];
  }
}