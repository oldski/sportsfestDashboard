import { NextRequest, NextResponse } from 'next/server';
import { db, eq, and } from '@workspace/database/client';
import { 
  organizationTable, 
  playerTable, 
  playerEventInterestTable,
  eventYearTable,
  EventType,
  Gender,
  TShirtSize
} from '@workspace/database/schema';
import { z } from 'zod';

// Validation schema
const teamSignupSchema = z.object({
  organizationId: z.string().uuid('Invalid organization ID'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  dateOfBirth: z.string().datetime('Invalid date of birth'),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().optional(),
  gender: z.nativeEnum(Gender),
  tshirtSize: z.nativeEnum(TShirtSize),
  confirmAccuracy: z.boolean().refine(val => val === true, 'You must confirm the accuracy of your information'),
  waiverAgreement: z.boolean().refine(val => val === true, 'You must agree to the waiver terms'),
  eventInterests: z.record(z.string(), z.number().min(1).max(5))
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = teamSignupSchema.parse(body);

    // Get the current/active event year (you might need to adjust this logic)
    const currentEventYear = await db
      .select()
      .from(eventYearTable)
      .where(eq(eventYearTable.isActive, true))
      .limit(1);

    if (currentEventYear.length === 0) {
      return NextResponse.json(
        { error: 'No active event year found' },
        { status: 400 }
      );
    }

    const eventYearId = currentEventYear[0].id;

    // Check if email already exists for this organization and event year
    const existingPlayer = await db
      .select()
      .from(playerTable)
      .where(
        and(
          eq(playerTable.email, validatedData.email),
          eq(playerTable.eventYearId, eventYearId)
        )
      )
      .limit(1);

    if (existingPlayer.length > 0) {
      return NextResponse.json(
        { error: 'A player with this email address already exists for this event year' },
        { status: 409 }
      );
    }

    // Create the player
    const newPlayer = await db
      .insert(playerTable)
      .values({
        organizationId: validatedData.organizationId,
        eventYearId: eventYearId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        email: validatedData.email,
        phone: validatedData.phone || null,
        gender: validatedData.gender,
        tshirtSize: validatedData.tshirtSize,
        accuracyConfirmed: validatedData.confirmAccuracy,
        waiverSigned: validatedData.waiverAgreement,
      })
      .returning({ id: playerTable.id });

    const playerId = newPlayer[0].id;

    // Create event interests
    const eventInterests = Object.entries(validatedData.eventInterests).map(([eventType, rating]) => ({
      playerId: playerId,
      eventType: eventType as keyof typeof EventType,
      interestRating: rating,
    }));

    await db.insert(playerEventInterestTable).values(eventInterests);

    // Get organization name for response
    const organization = await db
      .select({ name: organizationTable.name })
      .from(organizationTable)
      .where(eq(organizationTable.id, validatedData.organizationId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: `Successfully registered ${validatedData.firstName} ${validatedData.lastName} for ${organization[0]?.name || 'the organization'}`,
      playerId: playerId,
    });

  } catch (error) {
    console.error('Team signup error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // Check for unique constraint violations
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'A player with this email address already exists for this event year' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to register player. Please try again later or contact support.' },
      { status: 500 }
    );
  }
}