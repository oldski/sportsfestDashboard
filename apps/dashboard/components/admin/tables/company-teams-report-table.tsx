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

import type { CompanyTeamRow, CompanyTeamPaymentStatus } from '~/actions/admin/get-company-teams-report';

const STATUS_CONFIG: Record<CompanyTeamPaymentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  fully_paid: { label: 'Fully Paid', variant: 'default' },
  deposit_paid: { label: 'Deposit Paid', variant: 'secondary' },
  unpaid: { label: 'Unpaid', variant: 'destructive' },
};

const columnHelper = createColumnHelper<CompanyTeamRow>();

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
  columnHelper.accessor('teamNumber', {
    id: 'teamNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Team #" />
    ),
    cell: ({ row }) => (
      <span className="text-sm font-mono">{row.getValue('teamNumber')}</span>
    ),
    meta: { title: 'Team #' },
  }),
  columnHelper.accessor('teamName', {
    id: 'teamName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Team Name" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue('teamName') || '—'}</span>
    ),
    meta: { title: 'Team Name' },
  }),
  columnHelper.accessor('paymentStatus', {
    id: 'paymentStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('paymentStatus') as CompanyTeamPaymentStatus;
      const config = STATUS_CONFIG[status];
      return (
        <Badge variant={config.variant}>
          {config.label}
        </Badge>
      );
    },
    meta: { title: 'Status' },
  }),
  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date | null;
      return (
        <span className="text-sm">
          {date ? new Date(date).toLocaleDateString() : '—'}
        </span>
      );
    },
    meta: { title: 'Created' },
  }),
];

export interface CompanyTeamsReportTableProps {
  data: CompanyTeamRow[];
}

export function CompanyTeamsReportTable({ data }: CompanyTeamsReportTableProps): React.JSX.Element {
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

  const filename = `sportsfest-company-teams-${new Date().toISOString().slice(0, 10)}`;
  const title = 'SportsFest Company Teams';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Search teams..."
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
