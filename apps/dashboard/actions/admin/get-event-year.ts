'use server';

import { db, eq, and } from '@workspace/database/client';
import { eventYearTable } from '@workspace/database/schema';
import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';
import { EventYearFormData } from "~/actions/admin/event-year";

export async function getActiveEventYear(): Promise<any> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access event years');
  }

  try {
    const [eventYear] = await db
    .select()
    .from(eventYearTable)
    .where(and(
      eq(eventYearTable.isActive, true),
      eq(eventYearTable.isDeleted, false)
    ));

    if (!eventYear) {
      return null;
    }

    return {
      id: eventYear.id,
      year: eventYear.year,
      name: eventYear.name,
      eventStartDate: eventYear.eventStartDate,
      eventEndDate: eventYear.eventEndDate,
      registrationOpen: eventYear.registrationOpen,
      registrationClose: eventYear.registrationClose,
      locationName: eventYear.locationName || '',
      address: eventYear.address || '',
      city: eventYear.city || '',
      state: eventYear.state || 'FL',
      zipCode: eventYear.zipCode || '',
      latitude: eventYear.latitude || undefined,
      longitude: eventYear.longitude || undefined,
    };
  } catch (error) {
    console.error('Error fetching active event year:', error);
    throw new Error('Failed to fetch active event year');
  }
}

export async function getEventYear(id: string): Promise<EventYearFormData & { id: string } | null> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access event years');
  }

  try {
    const [eventYear] = await db
      .select()
      .from(eventYearTable)
      .where(and(
        eq(eventYearTable.id, id),
        eq(eventYearTable.isDeleted, false)
      ));

    if (!eventYear) {
      return null;
    }

    return {
      id: eventYear.id,
      year: eventYear.year,
      name: eventYear.name,
      eventStartDate: eventYear.eventStartDate,
      eventEndDate: eventYear.eventEndDate,
      registrationOpen: eventYear.registrationOpen,
      registrationClose: eventYear.registrationClose,
      locationName: eventYear.locationName || '',
      address: eventYear.address || '',
      city: eventYear.city || '',
      state: eventYear.state || 'FL',
      zipCode: eventYear.zipCode || '',
      latitude: eventYear.latitude || undefined,
      longitude: eventYear.longitude || undefined,
      isActive: eventYear.isActive,
    };
  } catch (error) {
    console.error('Error fetching event year:', error);
    throw new Error('Failed to fetch event year');
  }
}
