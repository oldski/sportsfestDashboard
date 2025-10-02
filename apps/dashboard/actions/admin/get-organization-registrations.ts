'use server';

import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getActiveEventYear } from './get-event-year';
import { db, gte, lte, and, eq } from '@workspace/database/client';
import { membershipTable, organizationTable } from '@workspace/database/schema';

interface OrganizationRegistrationData {
  date: string;
  newCompanies: number;
}

export async function getOrganizationRegistrations(frequency: 'day' | 'week' | 'month' = 'day'): Promise<OrganizationRegistrationData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access organization registration data');
  }

  try {
    const activeEvent = await getActiveEventYear();

    if (!activeEvent?.eventStartDate) {
      return [];
    }

    const eventStartDate = new Date(activeEvent.eventStartDate);
    const currentDate = new Date();

    // Query the earliest membership for each organization (which represents when the org was "registered")
    // We get the first membership created for each organization as a proxy for organization registration
    const organizationRegistrations = await db
      .select({
        organizationId: membershipTable.organizationId,
        createdAt: membershipTable.createdAt
      })
      .from(membershipTable)
      .innerJoin(organizationTable, eq(membershipTable.organizationId, organizationTable.id))
      .where(
        and(
          gte(membershipTable.createdAt, eventStartDate),
          lte(membershipTable.createdAt, currentDate)
        )
      )
      .orderBy(membershipTable.createdAt);

    // Group by organization and get the earliest membership date for each
    const earliestMemberships = new Map<string, Date>();
    organizationRegistrations.forEach(reg => {
      const orgId = reg.organizationId;
      const createdAt = reg.createdAt;

      if (createdAt && (!earliestMemberships.has(orgId) || createdAt < earliestMemberships.get(orgId)!)) {
        earliestMemberships.set(orgId, createdAt);
      }
    });

    // Convert to array format for processing
    const organizationDates = Array.from(earliestMemberships.values()).map(createdAt => ({ createdAt }));

    console.log('Organization registrations found:', organizationDates.length);

    // Process data by frequency
    return processRegistrationData(organizationDates, frequency, eventStartDate, currentDate);
  } catch (error) {
    console.error('Error fetching organization registrations:', error);
    throw new Error('Failed to fetch organization registration data');
  }
}

function processRegistrationData(
  registrations: { createdAt: Date | null }[],
  frequency: 'day' | 'week' | 'month',
  eventStartDate: Date,
  currentDate: Date
): OrganizationRegistrationData[] {
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
    newCompanies: count
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