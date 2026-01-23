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
import { CreditCardIcon, ExternalLinkIcon, DownloadIcon } from 'lucide-react';

import { replaceOrgSlug, routes } from '@workspace/routes';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  DataTable,
  DataTableColumnHeader,
  DataTableColumnOptionsHeader,
  DataTablePagination
} from '@workspace/ui/components/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu';
import { Input } from '@workspace/ui/components/input';

import { formatCurrency, formatDate } from '~/lib/formatters';
import type { OrderWithBalanceData } from '~/actions/admin/get-orders-with-balance';
import { exportToCSV, exportToExcel } from '@workspace/ui/lib/data-table-utils';

const columnHelper = createColumnHelper<OrderWithBalanceData>();

// Custom DataTableExport component for orders with balance
function OrdersWithBalanceDataTableExport({
  table,
}: {
  table: any;
}): React.JSX.Element {
  const filename = `sportsfest-orders-awaiting-payment-${new Date().toISOString().slice(0, 10)}`;
  const title = 'SportsFest Dashboard Orders Awaiting Payment';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 text-sm">
          <DownloadIcon className="size-4 shrink-0" />
          <span className="hidden lg:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export data</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => exportToCSV(table, filename, title)}
          className="cursor-pointer"
        >
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => exportToExcel(table, filename, title)}
          className="cursor-pointer"
        >
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface OrdersWithBalanceDataTableProps {
  data: OrderWithBalanceData[];
}

export function OrdersWithBalanceDataTable({ data }: OrdersWithBalanceDataTableProps): React.JSX.Element {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'balanceOwed', desc: true } // Default sort by balance owed (highest first)
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const columns = React.useMemo(() => [
    columnHelper.accessor('organizationName', {
      id: 'organizationName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Organization" />
      ),
      cell: ({ row }) => (
        <Link
          href={replaceOrgSlug(
            routes.dashboard.organizations.slug.Home,
            row.original.organizationSlug
          )}
          className="font-medium hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {row.getValue('organizationName')}
        </Link>
      ),
      meta: {
        title: 'Organization'
      }
    }),
    columnHelper.accessor('orderNumber', {
      id: 'orderNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order #" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.getValue('orderNumber')}
        </div>
      ),
      meta: {
        title: 'Order Number'
      }
    }),
    columnHelper.accessor('totalAmount', {
      id: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatCurrency(row.getValue('totalAmount'))}
        </div>
      ),
      meta: {
        title: 'Total Amount'
      }
    }),
    columnHelper.accessor('depositPaid', {
      id: 'depositPaid',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Paid" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-green-600">
          {formatCurrency(row.getValue('depositPaid'))}
        </div>
      ),
      meta: {
        title: 'Deposit Paid'
      }
    }),
    columnHelper.accessor('balanceOwed', {
      id: 'balanceOwed',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Balance Owed" />
      ),
      cell: ({ row }) => (
        <div className="font-medium text-orange-600">
          {formatCurrency(row.getValue('balanceOwed'))}
        </div>
      ),
      meta: {
        title: 'Balance Owed'
      }
    }),
    columnHelper.accessor('status', {
      id: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs capitalize">
          {String(row.getValue('status')).replace('_', ' ')}
        </Badge>
      ),
      meta: {
        title: 'Status'
      }
    }),
    columnHelper.accessor('createdAt', {
      id: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order Date" />
      ),
      cell: ({ row }) => (
        <div className="text-sm">{formatDate(row.getValue('createdAt'))}</div>
      ),
      meta: {
        title: 'Order Date'
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <Link
            href={replaceOrgSlug(
              routes.dashboard.organizations.slug.Home,
              order.organizationSlug
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors"
            title="View Organization"
          >
            <ExternalLinkIcon className="size-4 text-muted-foreground hover:text-foreground" />
            <span className="sr-only">View Organization</span>
          </Link>
        );
      }
    })
  ], []);

  const table = useReactTable({
    data,
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

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <CreditCardIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No pending payments</h3>
        <p className="text-sm text-muted-foreground">
          All orders are fully paid.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Search orders..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <OrdersWithBalanceDataTableExport table={table} />
        <DataTableColumnOptionsHeader table={table} />
      </div>
      <DataTable table={table} fixedHeader />
      <div className="rounded-b-xl overflow-hidden">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
