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
import { BarChartIcon, PencilIcon, TrashIcon } from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  DataTable,
  DataTableColumnHeader,
  DataTableColumnOptionsHeader,
  DataTablePagination
} from '@workspace/ui/components/data-table';
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
      const year = row.getValue('year') as number;
      const status = row.original.status;

      return (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{year}</span>
          {status === 'active' && (
            <Badge variant="default" className="text-xs">Active</Badge>
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
  columnHelper.accessor('companyTeamsCount', {
    id: 'companyTeamsCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company Teams" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('companyTeamsCount')}</span>
    ),
    meta: {
      title: 'Company Teams Count'
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => {
      const eventYear = row.original;
      const { openEditDialog, openDeleteDialog } = useEventYearDialog();

      return (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => openEditDialog(eventYear.id)}
            title="Edit event year"
          >
            <PencilIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            <span className="sr-only">Edit event year</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => openDeleteDialog(eventYear)}
            title="Delete event year"
          >
            <TrashIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            <span className="sr-only">Delete event year</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 w-8 p-0"
          >
            <Link
              href="/admin/reports"
              title="View analytics"
            >
              <BarChartIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              <span className="sr-only">View analytics</span>
            </Link>
          </Button>
        </div>
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
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <DataTableColumnOptionsHeader table={table} />
        </div>
      </div>
      <div className="-mx-2 overflow-x-auto px-2 sm:mx-0 sm:px-0">
        <DataTable table={table} fixedHeader />
      </div>
      <div className="rounded-b-xl overflow-hidden">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
