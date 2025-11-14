'use server';

import { redirect } from 'next/navigation';
import { returnValidationErrors } from 'next-safe-action';

import { hashPassword } from '@workspace/auth/password';
import { createOtpTokens } from '@workspace/auth/verification';
import { db, eq } from '@workspace/database/client';
import { userTable } from '@workspace/database/schema';
import { sendVerifyEmailAddressEmail } from '@workspace/email/send-verify-email-address-email';
import { routes } from '@workspace/routes';

import { actionClient } from '~/actions/safe-action';
import { constantContactService } from '~/lib/constant-contact';
import { signUpSchema } from '~/schemas/auth/sign-up-schema';

export const signUp = actionClient
  .metadata({ actionName: 'signUp' })
  .inputSchema(signUpSchema)
  .action(async ({ parsedInput }) => {
    const normalizedEmail = parsedInput.email.toLowerCase();
    const [user] = await db
      .select({})
      .from(userTable)
      .where(eq(userTable.email, normalizedEmail))
      .limit(1);

    if (user) {
      return returnValidationErrors(signUpSchema, {
        email: {
          _errors: ['Email address is already taken.']
        }
      });
    }

    const hashedPassword = await hashPassword(parsedInput.password);

    await db.insert(userTable).values({
      name: parsedInput.name,
      email: normalizedEmail,
      password: hashedPassword,
      locale: 'en-US',
      completedOnboarding: false,
      referralSource: parsedInput.referralSource,
      referralSourceDetails: parsedInput.referralSourceDetails
    });

    // Add user to Constant Contact admins/captains list
    try {
      // Parse name into first and last name (best effort)
      const nameParts = parsedInput.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await constantContactService.addAdmin({
        email: normalizedEmail,
        firstName,
        lastName,
        referralSource: parsedInput.referralSource
      });
    } catch (e) {
      // Log error but don't fail signup if Constant Contact fails
      console.error('Error adding user to Constant Contact:', e);
    }

    try {
      const { otp, hashedOtp } = await createOtpTokens(normalizedEmail);

      await sendVerifyEmailAddressEmail({
        recipient: normalizedEmail,
        name: parsedInput.name,
        otp,
        verificationLink: `${routes.dashboard.auth.verifyEmail.Request}/${hashedOtp}`
      });
    } catch (e) {
      console.error(e);
    }

    return redirect(
      `${routes.dashboard.auth.verifyEmail.Index}?email=${encodeURIComponent(parsedInput.email)}`
    );
  });
