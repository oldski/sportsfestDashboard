import { NextRequest, NextResponse } from 'next/server';
import { db, eq, and } from '@workspace/database/client';
import {
  organizationTable,
  playerTable,
  playerEventInterestTable,
  eventYearTable,
  membershipTable,
  userTable,
  EventType,
  Gender,
  TShirtSize,
  Role
} from '@workspace/database/schema';
import { z } from 'zod';
import { sendTeamSignupNotificationEmail } from '@workspace/email/send-team-signup-notification-email';

// Validation schema
const teamSignupSchema = z.object({
  organizationId: z.string().uuid('Invalid organization ID'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  dateOfBirth: z.string().datetime('Invalid date of birth').transform((str) => new Date(str)),
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
    console.log('Team signup request received');
    const body = await request.json();
    console.log('Request body parsed:', { ...body, dateOfBirth: body.dateOfBirth ? 'date provided' : 'no date' });

    // Validate input
    console.log('Starting validation');
    const validatedData = teamSignupSchema.parse(body);
    console.log('Validation successful');

    // Get the current/active event year (you might need to adjust this logic)
    console.log('Fetching active event year');
    const currentEventYear = await db
      .select()
      .from(eventYearTable)
      .where(eq(eventYearTable.isActive, true))
      .limit(1);

    if (currentEventYear.length === 0) {
      console.log('No active event year found');
      return NextResponse.json(
        { error: 'No active event year found' },
        { status: 400 }
      );
    }

    const eventYearId = currentEventYear[0].id;
    console.log('Active event year found:', eventYearId);

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
    console.log('Creating player record');
    const newPlayer = await db
      .insert(playerTable)
      .values({
        organizationId: validatedData.organizationId,
        eventYearId: eventYearId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        dateOfBirth: validatedData.dateOfBirth,
        email: validatedData.email,
        phone: validatedData.phone || null,
        gender: validatedData.gender,
        tshirtSize: validatedData.tshirtSize,
        accuracyConfirmed: validatedData.confirmAccuracy,
        waiverSigned: validatedData.waiverAgreement,
      })
      .returning({ id: playerTable.id });

    const playerId = newPlayer[0].id;
    console.log('Player created with ID:', playerId);

    // Create event interests
    console.log('Processing event interests:', validatedData.eventInterests);
    const eventInterests = Object.entries(validatedData.eventInterests).map(([eventType, rating]) => {
      console.log('Processing event:', eventType, 'rating:', rating);
      return {
        playerId: playerId,
        eventType: eventType as EventType, // The form already sends the correct enum values
        interestRating: rating,
      };
    });
    console.log('Event interests to insert:', eventInterests);

    console.log('Creating event interests');
    await db.insert(playerEventInterestTable).values(eventInterests);
    console.log('Event interests created');

    // Get organization name for response
    console.log('Fetching organization name');
    const organization = await db
      .select({ name: organizationTable.name })
      .from(organizationTable)
      .where(eq(organizationTable.id, validatedData.organizationId))
      .limit(1);
    console.log('Organization found:', organization[0]?.name);

    // Send email notifications to organization admins
    try {
      console.log('Looking for organization admins for org:', validatedData.organizationId);
      const organizationAdmins = await db
        .select({
          email: userTable.email,
          name: userTable.name
        })
        .from(membershipTable)
        .innerJoin(userTable, eq(membershipTable.userId, userTable.id))
        .where(
          and(
            eq(membershipTable.organizationId, validatedData.organizationId),
            eq(membershipTable.role, Role.ADMIN)
          )
        );

      console.log('Found organization admins:', organizationAdmins);

      if (organizationAdmins.length === 0) {
        console.log('No organization admins found - skipping email notifications');
      } else {
        // Send notification emails to all admins (filter out null emails)
        const validAdmins = organizationAdmins.filter(admin => admin.email);
        console.log('Valid admins with emails:', validAdmins);

        const emailPromises = validAdmins.map(admin => {
          console.log('Sending email to:', admin.email);
          return sendTeamSignupNotificationEmail({
            recipient: admin.email!,
            appName: 'SportsFest Dashboard',
            organizationName: organization[0]?.name || 'the organization',
            playerName: `${validatedData.firstName} ${validatedData.lastName}`,
            playerEmail: validatedData.email,
            eventYearName: currentEventYear[0].name
          });
        });

        await Promise.all(emailPromises);
        console.log('All notification emails sent successfully');
      }
    } catch (emailError) {
      // Log email error but don't fail the signup
      console.error('Failed to send notification emails:', emailError);
    }

    console.log('Preparing success response');
    const response = {
      success: true,
      message: `Successfully registered ${validatedData.firstName} ${validatedData.lastName} for ${organization[0]?.name || 'the organization'}`,
      playerId: playerId,
    };
    console.log('Sending success response:', response);

    return NextResponse.json(response);

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