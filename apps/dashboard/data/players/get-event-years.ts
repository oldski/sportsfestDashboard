import { db, desc } from '@workspace/database/client';
import { eventYearTable } from '@workspace/database/schema';

export interface EventYearOption {
  id: string;
  year: number;
  name: string;
  isActive: boolean;
}

export async function getEventYears(): Promise<EventYearOption[]> {
  const eventYears = await db
    .select({
      id: eventYearTable.id,
      year: eventYearTable.year,
      name: eventYearTable.name,
      isActive: eventYearTable.isActive,
    })
    .from(eventYearTable)
    .orderBy(desc(eventYearTable.year));

  return eventYears;
}