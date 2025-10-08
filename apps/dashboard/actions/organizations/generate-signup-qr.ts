'use server';

import qrcode from 'qrcode';
import { z } from 'zod';

import { actionClient } from '~/actions/safe-action';

const generateSignupQrSchema = z.object({
  organizationSlug: z.string().min(1)
});

export const generateSignupQr = actionClient
  .inputSchema(generateSignupQrSchema)
  .metadata({ actionName: 'generateSignupQr' })
  .action(async ({ parsedInput }) => {
    const { organizationSlug } = parsedInput;

    // Generate signup URL
    // In production, this should use the actual domain
    const isDevelopment = process.env.NODE_ENV === 'development';
    const baseUrl = isDevelopment
      ? process.env.NEXT_PUBLIC_MARKETING_URL || 'http://localhost:3001'
      : process.env.NEXT_PUBLIC_MARKETING_URL || 'https://join.sportsfest.com';

    const signupUrl = `${baseUrl}/${organizationSlug}`;

    // Generate QR code as data URI
    const qrDataUri = await qrcode.toDataURL(signupUrl, {
      errorCorrectionLevel: 'medium',
      width: 250,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return {
      signupUrl,
      qrDataUri
    };
  });
