'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarIcon } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';

export type EventYearOption = {
  id: string;
  year: number;
  name: string;
  isActive: boolean;
};

export interface EventYearSelectorProps {
  eventYears: EventYearOption[];
  currentYearId?: string;
}

export function EventYearSelector({
  eventYears,
  currentYearId
}: EventYearSelectorProps): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the current filter from URL or default to active year
  const currentFilter = searchParams.get('year') || currentYearId || 'current';

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === 'current' || value === currentYearId) {
      params.delete('year');
    } else {
      params.set('year', value);
    }

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : '/admin/reports', { scroll: false });
  };

  // Sort event years by year descending
  const sortedYears = [...eventYears].sort((a, b) => b.year - a.year);
  const activeYear = sortedYears.find(y => y.isActive);
  const priorYear = sortedYears.find(y => activeYear && y.year === activeYear.year - 1);

  return (
    <Select value={currentFilter} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[200px]">
        <CalendarIcon className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Select period..." />
      </SelectTrigger>
      <SelectContent>
        {activeYear && (
          <SelectItem value={activeYear.id}>
            {activeYear.year} (Current)
          </SelectItem>
        )}
        {priorYear && (
          <SelectItem value={priorYear.id}>
            {priorYear.year} (Prior Year)
          </SelectItem>
        )}
        <SelectItem value="all">All Time</SelectItem>
        {sortedYears.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              All Years
            </div>
            {sortedYears.map((year) => (
              <SelectItem key={year.id} value={year.id}>
                {year.year} - {year.name}
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
}
