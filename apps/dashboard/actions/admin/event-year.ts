'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db, eq, and } from '@workspace/database/client';
import { eventYearTable } from '@workspace/database/schema';
import { auth } from '@workspace/auth';

const eventYearSchema = z.object({
  year: z.number().min(2023).max(2030),
  name: z.string().min(1, 'Event name is required').max(100),
  eventStartDate: z.date({
    required_error: 'Event start date is required',
  }),
  eventEndDate: z.date({
    required_error: 'Event end date is required',
  }),
  registrationOpen: z.date({
    required_error: 'Registration open date is required',
  }),
  registrationClose: z.date({
    required_error: 'Registration close date is required',
  }),
  // Location fields
  locationName: z.string().min(1, 'Location name is required').max(255),
  address: z.string().min(1, 'Address is required').max(255),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(50),
  zipCode: z.string().min(1, 'Zip code is required').max(20),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isActive: z.boolean().default(false),
}).refine((data) => data.eventEndDate > data.eventStartDate, {
  message: 'Event end date must be after start date',
  path: ['eventEndDate'],
}).refine((data) => data.registrationClose < data.eventEndDate, {
  message: 'Registration must close before event ends',
  path: ['registrationClose'],
});

export type EventYearFormData = z.infer<typeof eventYearSchema>;

export async function createEventYear(data: EventYearFormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validatedData = eventYearSchema.parse(data);

  try {
    const [eventYear] = await db
      .insert(eventYearTable)
      .values({
        ...validatedData,
        isDeleted: false,
      })
      .returning();

    revalidatePath('/admin/event-registration/event-years');
    return { success: true, eventYear };
  } catch (error) {
    console.error('Error creating event year:', error);
    throw new Error('Failed to create event year. Please try again.');
  }
}

export async function updateEventYear(id: string, data: EventYearFormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validatedData = eventYearSchema.parse(data);

  try {
    const [eventYear] = await db
      .update(eventYearTable)
      .set(validatedData)
      .where(and(
        eq(eventYearTable.id, id),
        eq(eventYearTable.isDeleted, false)
      ))
      .returning();

    if (!eventYear) {
      throw new Error('Event year not found');
    }

    revalidatePath('/admin/event-registration/event-years');
    return { success: true, eventYear };
  } catch (error) {
    console.error('Error updating event year:', error);
    throw new Error('Failed to update event year. Please try again.');
  }
}

export async function softDeleteEventYear(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    const [eventYear] = await db
      .update(eventYearTable)
      .set({ 
        isDeleted: true,
        isActive: false, // Also deactivate when soft deleting
      })
      .where(and(
        eq(eventYearTable.id, id),
        eq(eventYearTable.isDeleted, false)
      ))
      .returning();

    if (!eventYear) {
      throw new Error('Event year not found or already deleted');
    }

    revalidatePath('/admin/event-registration/event-years');
    return { success: true };
  } catch (error) {
    console.error('Error soft deleting event year:', error);
    throw new Error('Failed to remove event year. Please try again.');
  }
}

export async function restoreEventYear(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    const [eventYear] = await db
      .update(eventYearTable)
      .set({ isDeleted: false })
      .where(eq(eventYearTable.id, id))
      .returning();

    if (!eventYear) {
      throw new Error('Event year not found');
    }

    revalidatePath('/admin/event-registration/event-years');
    return { success: true, eventYear };
  } catch (error) {
    console.error('Error restoring event year:', error);
    throw new Error('Failed to restore event year. Please try again.');
  }
}

export async function getEventYears(includeDeleted = false) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    const eventYears = await db
      .select()
      .from(eventYearTable)
      .where(includeDeleted ? undefined : eq(eventYearTable.isDeleted, false))
      .orderBy(eventYearTable.year);

    return eventYears;
  } catch (error) {
    console.error('Error fetching event years:', error);
    throw new Error('Failed to fetch event years');
  }
}

export async function getEventYear(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    const [eventYear] = await db
      .select()
      .from(eventYearTable)
      .where(and(
        eq(eventYearTable.id, id),
        eq(eventYearTable.isDeleted, false)
      ));

    return eventYear || null;
  } catch (error) {
    console.error('Error fetching event year:', error);
    throw new Error('Failed to fetch event year');
  }
}