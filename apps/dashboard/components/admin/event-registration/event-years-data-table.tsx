'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState
} from '@tanstack/react-table';
import { BarChartIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  DataTable,
  DataTableColumnHeader,
  DataTableColumnOptionsHeader,
  DataTableExport,
  DataTablePagination
} from '@workspace/ui/components/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu';
import { Input } from '@workspace/ui/components/input';

import { formatDate, formatCurrency } from '~/lib/formatters';
import { useEventYearDialog } from '~/components/admin/event-registration/event-year-dialog-provider';
import type { EventYearWithStats } from '~/actions/admin/get-event-years';

const columnHelper = createColumnHelper<EventYearWithStats>();

const columns = [
  columnHelper.accessor('year', {
    id: 'year',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Year" />
    ),
    cell: ({ row }) => {
      const currentYear = new Date().getFullYear();
      const year = row.getValue('year') as number;

      return (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{year}</span>
          {year === currentYear && (
            <Badge variant="outline" className="text-xs">Current</Badge>
          )}
        </div>
      );
    },
    meta: {
      title: 'Event Year'
    }
  }),
  columnHelper.accessor('name', {
    id: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
    meta: {
      title: 'Event Name'
    }
  }),
  columnHelper.accessor('endDate', {
    id: 'eventDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event Date" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">
        {formatDate(row.getValue('eventDate'))}
      </div>
    ),
    meta: {
      title: 'Event Date'
    }
  }),
  columnHelper.accessor('registrationDeadline', {
    id: 'registrationDeadline',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registration" />
    ),
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="text-sm">Until {formatDate(row.getValue('registrationDeadline'))}</div>
      </div>
    ),
    meta: {
      title: 'Registration Deadline'
    }
  }),
  columnHelper.accessor('registrationOpen', {
    id: 'registrationStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registration Status" />
    ),
    cell: ({ row }) => (
      row.getValue('registrationStatus') ? (
        <Badge variant="default" className="text-xs">Open</Badge>
      ) : (
        <Badge variant="secondary" className="text-xs">Closed</Badge>
      )
    ),
    meta: {
      title: 'Registration Status'
    }
  }),
  columnHelper.accessor('organizationCount', {
    id: 'organizationCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organizations" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('organizationCount')}</span>
    ),
    meta: {
      title: 'Organization Count'
    }
  }),
  columnHelper.accessor('productCount', {
    id: 'productCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Products" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('productCount')}</span>
    ),
    meta: {
      title: 'Product Count'
    }
  }),
  columnHelper.accessor('totalRevenue', {
    id: 'totalRevenue',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Revenue" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{formatCurrency(row.getValue('totalRevenue'))}</span>
    ),
    meta: {
      title: 'Total Revenue'
    }
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => {
      const eventYear = row.original;
      const { openEditDialog, openDeleteDialog } = useEventYearDialog();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => openEditDialog(eventYear.id)}>
              <PencilIcon className="mr-2 size-4" />
              Edit event year
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openDeleteDialog(eventYear)}
              className="text-destructive focus:text-destructive"
            >
              <TrashIcon className="mr-2 size-4" />
              Delete event year
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/event-registration/event-years/${eventYear.id}/analytics`}>
                <BarChartIcon className="mr-2 size-4" />
                View analytics
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  })
];

export interface EventYearsDataTableProps {
  eventYears: EventYearWithStats[];
}

export function EventYearsDataTable({ eventYears }: EventYearsDataTableProps): React.JSX.Element {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'year', desc: true } // Default sort by year descending (newest first)
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data: eventYears,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search event years..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm ml-5"
        />
        <div className="flex items-center space-x-2">
          <DataTableExport
            table={table}
            filename="event-years"
            title="SportsFest Event Years"
          />
          <DataTableColumnOptionsHeader table={table} />
        </div>
      </div>
      <DataTable table={table} fixedHeader />
      <div className="rounded-b-xl overflow-hidden">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
