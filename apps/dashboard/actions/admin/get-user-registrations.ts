'use server';

import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getActiveEventYear } from './get-event-year';
import { db, gte, lte, and } from '@workspace/database/client';
import { userTable } from '@workspace/database/schema';

interface UserRegistrationData {
  date: string;
  newUsers: number;
}

export async function getUserRegistrations(frequency: 'day' | 'week' | 'month' = 'day'): Promise<UserRegistrationData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access user registration data');
  }

  try {
    const activeEvent = await getActiveEventYear();

    if (!activeEvent?.eventStartDate) {
      return [];
    }

    const eventStartDate = new Date(activeEvent.eventStartDate);
    const currentDate = new Date();

    // Query all users created since event start date
    const users = await db
      .select({
        createdAt: userTable.createdAt
      })
      .from(userTable)
      .where(
        and(
          gte(userTable.createdAt, eventStartDate),
          lte(userTable.createdAt, currentDate)
        )
      )
      .orderBy(userTable.createdAt);

    console.log('User registrations found:', users.length);

    // Process data by frequency
    return processRegistrationData(users, frequency, eventStartDate, currentDate);
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    throw new Error('Failed to fetch user registration data');
  }
}

function processRegistrationData(
  registrations: { createdAt: Date | null }[],
  frequency: 'day' | 'week' | 'month',
  eventStartDate: Date,
  currentDate: Date
): UserRegistrationData[] {
  const groupedData: Record<string, number> = {};

  // Group registrations by date key
  registrations.forEach(reg => {
    if (!reg.createdAt) return;

    const date = new Date(reg.createdAt);
    let dateKey: string;

    switch (frequency) {
      case 'day':
        dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'week':
        // Get Monday of the week
        const monday = new Date(date);
        monday.setDate(date.getDate() - date.getDay() + 1);
        dateKey = monday.toISOString().split('T')[0];
        break;
      case 'month':
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        dateKey = date.toISOString().split('T')[0];
    }

    groupedData[dateKey] = (groupedData[dateKey] || 0) + 1;
  });

  // Fill in missing dates with zeros
  const filledData = fillMissingDates(groupedData, frequency, eventStartDate, currentDate);

  return filledData.map(([date, count]) => ({
    date,
    newUsers: count
  })).sort((a, b) => a.date.localeCompare(b.date));
}

function fillMissingDates(
  groupedData: Record<string, number>,
  frequency: 'day' | 'week' | 'month',
  startDate: Date,
  endDate: Date
): [string, number][] {
  const filledData: [string, number][] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    let dateKey: string;

    switch (frequency) {
      case 'day':
        dateKey = current.toISOString().split('T')[0];
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        // Get Monday of the week
        const monday = new Date(current);
        monday.setDate(current.getDate() - current.getDay() + 1);
        dateKey = monday.toISOString().split('T')[0];
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        current.setMonth(current.getMonth() + 1);
        break;
      default:
        dateKey = current.toISOString().split('T')[0];
        current.setDate(current.getDate() + 1);
    }

    filledData.push([dateKey, groupedData[dateKey] || 0]);
  }

  return filledData;
}