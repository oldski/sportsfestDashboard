'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { ForbiddenError } from '@workspace/common/errors';
import { db, eq } from '@workspace/database/client';
import { eventYearTable } from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';

const createEventYearSchema = z.object({
  year: z.number().min(2023).max(2030),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
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
  location: z.string().min(1, 'Location is required').max(255),
  maxTeamsPerOrg: z.number().min(1).max(10).default(1),
  teamRegistrationFee: z.number().min(0).default(150),
  isActive: z.boolean().default(false),
}).refine((data) => data.eventEndDate > data.eventStartDate, {
  message: 'Event end date must be after start date',
  path: ['eventEndDate'],
}).refine((data) => data.registrationClose < data.eventStartDate, {
  message: 'Registration must close before event starts',
  path: ['registrationClose'],
});

type CreateEventYearData = z.infer<typeof createEventYearSchema>;

export async function createEventYear(data: CreateEventYearData): Promise<void> {
  const { session } = await getAuthContext();
  
  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can create event years');
  }

  // Validate the input
  const validatedData = createEventYearSchema.parse(data);

  // Check if year already exists
  const existingEventYear = await db
    .select({ id: eventYearTable.id })
    .from(eventYearTable)
    .where(eq(eventYearTable.year, validatedData.year))
    .limit(1);

  if (existingEventYear.length > 0) {
    throw new Error(`Event year ${validatedData.year} already exists`);
  }

  // If setting as active, deactivate all other event years
  if (validatedData.isActive) {
    await db
      .update(eventYearTable)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      });
  }

  // Create the new event year
  await db
    .insert(eventYearTable)
    .values({
      year: validatedData.year,
      name: validatedData.name,
      description: validatedData.description || null,
      eventStartDate: validatedData.eventStartDate,
      eventEndDate: validatedData.eventEndDate,
      registrationOpen: validatedData.registrationOpen,
      registrationClose: validatedData.registrationClose,
      location: validatedData.location,
      maxTeamsPerOrg: validatedData.maxTeamsPerOrg,
      teamRegistrationFee: validatedData.teamRegistrationFee,
      isActive: validatedData.isActive
    });

  revalidatePath('/admin/event-registration/event-years');
  redirect('/admin/event-registration/event-years');
}