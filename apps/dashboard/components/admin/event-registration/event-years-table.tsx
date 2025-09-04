'use client';

import * as React from 'react';
import Link from 'next/link';
import { PlusIcon, BarChartIcon, PencilIcon, TrashIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';

import { formatDate, formatCurrency } from '~/lib/formatters';
import { useEventYearDialog } from '~/components/admin/event-registration/event-year-dialog-provider';
import type { EventYearWithStats } from '~/actions/admin/get-event-years';

interface EventYearsTableProps {
  eventYears: EventYearWithStats[];
}

export function EventYearsTable({ eventYears }: EventYearsTableProps): React.JSX.Element {
  const currentYear = new Date().getFullYear();
  const { openEditDialog, openDeleteDialog } = useEventYearDialog();

  return (
    <>

      <div className="border border-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Event Date</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Registration Status</TableHead>
              <TableHead>Organizations</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventYears
              .sort((a, b) => b.year - a.year)
              .map((eventYear) => (
              <TableRow key={eventYear.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <span>{eventYear.year}</span>
                    {eventYear.year === currentYear && (
                      <Badge variant="outline" className="text-xs">Current</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{eventYear.name}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(eventYear.endDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">Until {formatDate(eventYear.registrationDeadline)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {eventYear.registrationOpen ? (
                    <Badge variant="default" className="text-xs">Open</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Closed</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{eventYear.organizationCount}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{eventYear.productCount}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{formatCurrency(eventYear.totalRevenue)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(eventYear.id)}
                    >
                      <PencilIcon className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(eventYear)}
                    >
                      <TrashIcon className="h-3 w-3" />
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/event-registration/event-years/${eventYear.id}/analytics`}>
                        <BarChartIcon className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    </>
  );
}
