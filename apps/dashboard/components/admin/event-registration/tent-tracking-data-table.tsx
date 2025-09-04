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
import { ExternalLinkIcon, FilterIcon, MoreHorizontalIcon, TentIcon } from 'lucide-react';

import { replaceOrgSlug, routes } from '@workspace/routes';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';

import { formatCurrency, formatDate } from '~/lib/formatters';
import type { TentTrackingData } from '~/actions/admin/get-tent-tracking';

const columnHelper = createColumnHelper<TentTrackingData>();

const columns = [
  columnHelper.accessor('organizationName', {
    id: 'organization',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organization" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <span className="font-medium">{row.getValue('organization')}</span>
        {row.original.isAtLimit && (
          <Badge variant="destructive" className="text-xs">
            At Limit
          </Badge>
        )}
      </div>
    ),
    meta: {
      title: 'Organization'
    }
  }),
  columnHelper.accessor('eventYear', {
    id: 'eventYear',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event Year" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('eventYear')}</div>
    ),
    meta: {
      title: 'Event Year'
    }
  }),
  columnHelper.accessor('tentCount', {
    id: 'tentsPurchased',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tents Purchased" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <TentIcon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.getValue('tentsPurchased')}</span>
        <span className="text-muted-foreground text-sm">
          / {row.original.maxAllowed} max
        </span>
      </div>
    ),
    meta: {
      title: 'Tents Purchased'
    }
  }),
  columnHelper.accessor('purchaseDate', {
    id: 'purchaseDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Purchase Date" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{formatDate(row.getValue('purchaseDate'))}</div>
    ),
    meta: {
      title: 'Purchase Date'
    }
  }),
  columnHelper.accessor('totalAmount', {
    id: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Amount" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{formatCurrency(row.getValue('totalAmount'))}</div>
    ),
    meta: {
      title: 'Total Amount'
    }
  }),
  columnHelper.display({
    id: 'paymentStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Status" />
    ),
    cell: ({ row }) => {
      const { balanceOwed, depositPaid, status } = row.original;

      if (status === 'cancelled') {
        return (
          <Badge variant="secondary" className="text-xs">
            Cancelled
          </Badge>
        );
      }

      if (balanceOwed > 0) {
        return (
          <div className="space-y-1">
            <div className="text-sm">
              Paid: {formatCurrency(depositPaid)}
            </div>
            <div className="text-sm text-red-600">
              Owed: {formatCurrency(balanceOwed)}
            </div>
          </div>
        );
      }

      return (
        <Badge variant="default" className="text-xs">
          Paid in Full
        </Badge>
      );
    },
    meta: {
      title: 'Payment Status'
    }
  }),
  columnHelper.accessor('status', {
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge
        variant={
          row.getValue('status') === 'confirmed' ? 'default' :
          row.getValue('status') === 'pending_payment' ? 'destructive' : 'secondary'
        }
        className="capitalize"
      >
        {String(row.getValue('status')).replace('_', ' ')}
      </Badge>
    ),
    meta: {
      title: 'Status'
    }
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => {
      const tracking = row.original;

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
            <DropdownMenuItem asChild>
              <Link
                href={replaceOrgSlug(
                  routes.dashboard.organizations.slug.Home,
                  tracking.organizationSlug
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <ExternalLinkIcon className="mr-2 size-4" />
                View organization
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  })
];

export interface TentTrackingDataTableProps {
  data: TentTrackingData[];
}

export function TentTrackingDataTable({ data }: TentTrackingDataTableProps): React.JSX.Element {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'purchaseDate', desc: true } // Default sort by purchase date (newest first)
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [quickFilter, setQuickFilter] = React.useState<string>('all');

  // Apply quick filter
  const filteredData = React.useMemo(() => {
    if (quickFilter === 'all') return data;
    if (quickFilter === 'at-limit') return data.filter(item => item.isAtLimit);
    if (quickFilter === 'pending-payment') return data.filter(item => item.status === 'pending_payment');
    if (quickFilter === 'confirmed') return data.filter(item => item.status === 'confirmed');
    return data;
  }, [data, quickFilter]);

  const table = useReactTable({
    data: filteredData,
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

  const atLimitCount = data.filter(item => item.isAtLimit).length;
  const pendingPaymentCount = data.filter(item => item.status === 'pending_payment').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search tent tracking..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
          <Select value={quickFilter} onValueChange={setQuickFilter}>
            <SelectTrigger className="w-[220px]">
              <FilterIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              <SelectItem value="at-limit">
                At Tent Limit ({atLimitCount})
              </SelectItem>
              <SelectItem value="pending-payment">
                Pending Payment ({pendingPaymentCount})
              </SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <DataTableExport
            table={table}
            filename="tent-tracking"
            title="SportsFest Tent Tracking"
          />
          <DataTableColumnOptionsHeader table={table} />
        </div>
      </div>
      <DataTable table={table} fixedHeader />
      <DataTablePagination table={table} />
    </div>
  );
}
