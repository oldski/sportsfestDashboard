import { APP_NAME } from '@workspace/common/app';

export function createTitle(title: string, addSuffix: boolean = true): string {
  if (!addSuffix) {
    return title;
  }
  if (!title) {
    return APP_NAME;
  }

  return `${title} | ${APP_NAME}`;
}

export function capitalize(str: string): string {
  if (!str) {
    return str;
  }

  if (str.length === 1) {
    return str.charAt(0).toUpperCase();
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getInitials(name: string): string {
  if (!name) {
    return '';
  }
  return name
    .replace(/\s+/, ' ')
    .split(' ')
    .slice(0, 2)
    .map((v) => v && v[0].toUpperCase())
    .join('');
}

export function getTimeSlot(hours: number, minutes: number): Date {
  const date = new Date(0);

  date.setMilliseconds(0);
  date.setSeconds(0);
  date.setMinutes(0);
  date.setHours(0);

  date.setHours(hours);
  date.setMinutes(minutes);

  return date;
}

export function formatDate(dateString: string): string {
  // Parse date as local time to avoid timezone shift
  // Input format is YYYY-MM-DD
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US');
}

export function formatDateLong(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(dateObj);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatPhoneNumber(phoneNumber: string | null): string {
  if (!phoneNumber) {
    return '—';
  }

  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Check if it's a valid US phone number (10 digits)
  if (cleaned.length !== 10) {
    return phoneNumber; // Return original if not 10 digits
  }

  // Format as (XXX) XXX-XXXX
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return phoneNumber; // Fallback to original
}
