'use client';

import * as React from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { DownloadIcon } from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  DataTable,
  DataTableColumnHeader,
  DataTableColumnOptionsHeader,
  DataTablePagination,
} from '@workspace/ui/components/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Input } from '@workspace/ui/components/input';
import { exportToCSV, exportToExcel } from '@workspace/ui/lib/data-table-utils';
import { formatCurrency } from '~/lib/formatters';

import type { TeamPaymentRow } from '~/actions/admin/get-teams-by-payment-status';

const columnHelper = createColumnHelper<TeamPaymentRow>();

const columns = [
  columnHelper.accessor('companyName', {
    id: 'companyName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('companyName')}</div>
    ),
    meta: { title: 'Company' },
  }),
  columnHelper.accessor('orderNumber', {
    id: 'orderNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order #" />
    ),
    cell: ({ row }) => (
      <span className="text-sm font-mono">{row.getValue('orderNumber')}</span>
    ),
    meta: { title: 'Order #' },
  }),
  columnHelper.accessor('teamCount', {
    id: 'teamCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teams" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue('teamCount')}</Badge>
    ),
    meta: { title: 'Teams' },
  }),
  columnHelper.accessor('totalAmount', {
    id: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {formatCurrency(row.getValue('totalAmount'))}
      </span>
    ),
    meta: { title: 'Total' },
  }),
  columnHelper.accessor('depositPaid', {
    id: 'depositPaid',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deposit Paid" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">
        {formatCurrency(row.getValue('depositPaid'))}
      </span>
    ),
    meta: { title: 'Deposit Paid' },
  }),
  columnHelper.accessor('balanceOwed', {
    id: 'balanceOwed',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Balance Owed" />
    ),
    cell: ({ row }) => {
      const balance = row.getValue('balanceOwed') as number;
      return (
        <span className={balance > 0 ? 'text-sm font-medium text-amber-600' : 'text-sm'}>
          {formatCurrency(balance)}
        </span>
      );
    },
    meta: { title: 'Balance Owed' },
  }),
  columnHelper.accessor('date', {
    id: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('date') as Date | null;
      return (
        <span className="text-sm">
          {date ? new Date(date).toLocaleDateString() : '—'}
        </span>
      );
    },
    meta: { title: 'Date' },
  }),
];

export interface TeamsDepositPaidTableProps {
  data: TeamPaymentRow[];
}

export function TeamsDepositPaidTable({ data }: TeamsDepositPaidTableProps): React.JSX.Element {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
  });

  const filename = `sportsfest-teams-deposit-paid-${new Date().toISOString().slice(0, 10)}`;
  const title = 'SportsFest Teams - Deposit Paid';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Search orders..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
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
          <DataTableColumnOptionsHeader table={table} />
        </div>
      </div>
      <DataTable table={table} fixedHeader />
      <DataTablePagination table={table} />
    </div>
  );
}
