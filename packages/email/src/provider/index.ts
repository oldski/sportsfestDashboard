import type { EmailProvider as IEmailProvider } from './types';

/**
 * Email Provider Selection
 *
 * Automatically selects the appropriate email provider based on environment:
 * - Development (NODE_ENV !== 'production'): Console provider (logs emails, doesn't send)
 * - Production (NODE_ENV === 'production'): Resend provider (sends real emails)
 *
 * Override with EMAIL_PROVIDER env variable:
 * - 'console' - Always use console (useful for testing in production)
 * - 'resend' - Always use resend (useful for testing real emails in dev)
 */

const getEmailProvider = (): IEmailProvider => {
  const envProvider = process.env.EMAIL_PROVIDER;
  const isProduction = process.env.NODE_ENV === 'production';

  // Allow explicit override via EMAIL_PROVIDER env variable
  if (envProvider === 'console') {
    const ConsoleProvider = require('./console').default;
    return ConsoleProvider;
  }

  if (envProvider === 'resend') {
    const ResendProvider = require('./resend').default;
    return ResendProvider;
  }

  // Default behavior: console in dev, resend in production
  if (isProduction) {
    const ResendProvider = require('./resend').default;
    return ResendProvider;
  }

  const ConsoleProvider = require('./console').default;
  return ConsoleProvider;
};

export const EmailProvider = getEmailProvider();
