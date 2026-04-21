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

import { formatPhoneNumber } from '~/lib/formatters';
import type { EquipmentPurchaseRow } from '~/actions/admin/get-equipment-purchases-report';

const columnHelper = createColumnHelper<EquipmentPurchaseRow>();

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
  columnHelper.accessor('organizerName', {
    id: 'organizerName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organizer" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">
        {(row.getValue('organizerName') as string | null) ?? '—'}
      </span>
    ),
    meta: { title: 'Organizer' },
  }),
  columnHelper.accessor('organizerEmail', {
    id: 'organizerEmail',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const email = row.getValue('organizerEmail') as string | null;
      return email ? (
        <a
          href={`mailto:${email}`}
          className="text-sm text-primary hover:underline"
        >
          {email}
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      );
    },
    meta: { title: 'Email' },
  }),
  columnHelper.accessor('organizerPhone', {
    id: 'organizerPhone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => {
      const phone = row.getValue('organizerPhone') as string | null;
      return (
        <span className="text-sm">
          {phone ? formatPhoneNumber(phone) : '—'}
        </span>
      );
    },
    meta: { title: 'Phone' },
  }),
  columnHelper.accessor('waterQuantity', {
    id: 'waterQuantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Water" />
    ),
    cell: ({ row }) => {
      const qty = row.getValue('waterQuantity') as number;
      return (
        <div className="text-right">
          {qty > 0 ? (
            <Badge variant="secondary">{qty}</Badge>
          ) : (
            <span className="text-sm text-muted-foreground">0</span>
          )}
        </div>
      );
    },
    meta: { title: 'Water (qty)' },
  }),
  columnHelper.accessor('iceQuantity', {
    id: 'iceQuantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ice" />
    ),
    cell: ({ row }) => {
      const qty = row.getValue('iceQuantity') as number;
      return (
        <div className="text-right">
          {qty > 0 ? (
            <Badge variant="secondary">{qty}</Badge>
          ) : (
            <span className="text-sm text-muted-foreground">0</span>
          )}
        </div>
      );
    },
    meta: { title: 'Ice (qty)' },
  }),
];

export interface EquipmentPurchasesTableProps {
  data: EquipmentPurchaseRow[];
}

export function EquipmentPurchasesTable({
  data,
}: EquipmentPurchasesTableProps): React.JSX.Element {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'companyName', desc: false },
  ]);
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

  const filename = `sportsfest-equipment-purchases-${new Date()
    .toISOString()
    .slice(0, 10)}`;
  const title = 'SportsFest Equipment Purchases';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Search organizations..."
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
