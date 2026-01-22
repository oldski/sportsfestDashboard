'use client';

import * as React from 'react';
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
import { ExternalLinkIcon, CalendarIcon, MapPinIcon, PhoneIcon, DownloadIcon } from 'lucide-react';
import Link from 'next/link';

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
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Input } from '@workspace/ui/components/input';

import type { OrganizationData } from '~/actions/admin/get-organizations';
import { generateAdminOrganizationsReactPDF } from './generate-organizations-pdf';
import { exportToCSV, exportToExcel } from '@workspace/ui/lib/data-table-utils';
import { formatPhoneNumber } from '~/lib/formatters';
import { OrganizationInlineActions } from './organization-inline-actions';

const columnHelper = createColumnHelper<OrganizationData>();

const exportOrganizationsToPDF = async (organizations: OrganizationData[]) => {
  await generateAdminOrganizationsReactPDF(organizations);
};

// Custom DataTableExport component for admin organizations
function AdminOrganizationsDataTableExport({
  organizations,
  table,
}: {
  organizations: OrganizationData[];
  table: any;
}): React.JSX.Element {
  const filename = `sportsfest-admin-organizations-${new Date().toISOString().slice(0, 10)}`;
  const title = 'SportsFest Dashboard Companies';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 text-sm">
          <DownloadIcon className="size-4 shrink-0" />
          Export
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
        <DropdownMenuItem
          onClick={() => exportOrganizationsToPDF(organizations)}
          className="cursor-pointer"
        >
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columns = [
  columnHelper.accessor('name', {
    id: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <div className="font-medium">{row.getValue('name')}</div>
      </div>
    ),
    meta: {
      title: 'Name'
    }
  }),
  columnHelper.accessor('slug', {
    id: 'slug',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Slug" />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-sm text-muted-foreground">
        {row.getValue('slug')}
      </div>
    ),
    meta: {
      title: 'Slug'
    }
  }),
  columnHelper.accessor('memberCount', {
    id: 'memberCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Members" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.getValue('memberCount')} members
      </Badge>
    ),
    meta: {
      title: 'Member Count'
    }
  }),
  columnHelper.accessor('phone', {
    id: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string | null;
      const formattedPhone = formatPhoneNumber(phone);
      return (
        <div className="flex items-center space-x-1">
          <span className="text-sm font-mono">{formattedPhone || 'Not provided'}</span>
        </div>
      );
    },
    meta: {
      title: 'Phone'
    }
  }),
  columnHelper.accessor('address', {
    id: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
    ),
    cell: ({ row }) => {
      const address = row.getValue('address') as string | null;
      return (
        <div className="text-sm">
          <span className="truncate" title={address || ''}>
            {address || '—'}
          </span>
        </div>
      );
    },
    meta: {
      title: 'Address'
    }
  }),
  columnHelper.accessor('address2', {
    id: 'address2',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address 2" />
    ),
    cell: ({ row }) => {
      const address2 = row.getValue('address2') as string | null;
      return (
        <div className="text-sm max-w-32">
          <span className="truncate" title={address2 || ''}>
            {address2 || '—'}
          </span>
        </div>
      );
    },
    meta: {
      title: 'Address 2'
    }
  }),
  columnHelper.accessor('city', {
    id: 'city',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: ({ row }) => {
      const city = row.getValue('city') as string | null;
      return (
        <div className="text-sm max-w-28">
          <span className="truncate" title={city || ''}>
            {city || '—'}
          </span>
        </div>
      );
    },
    meta: {
      title: 'City'
    }
  }),
  columnHelper.accessor('state', {
    id: 'state',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="State" />
    ),
    cell: ({ row }) => {
      const state = row.getValue('state') as string | null;
      return (
        <div className="text-sm max-w-20">
          <span className="truncate" title={state || ''}>
            {state || '—'}
          </span>
        </div>
      );
    },
    meta: {
      title: 'State'
    }
  }),
  columnHelper.accessor('zip', {
    id: 'zip',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ZIP" />
    ),
    cell: ({ row }) => {
      const zip = row.getValue('zip') as string | null;
      return (
        <div className="text-sm max-w-20">
          <span className="font-mono" title={zip || ''}>
            {zip || '—'}
          </span>
        </div>
      );
    },
    meta: {
      title: 'ZIP Code'
    }
  }),
  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as Date | null;
      return (
        <div className="flex items-center space-x-1">
          <span className="text-sm">
            {createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown'}
          </span>
        </div>
      );
    },
    meta: {
      title: 'Created Date'
    }
  }),
  // columnHelper.accessor('isActive', {
  //   id: 'isActive',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Status" />
  //   ),
  //   cell: ({ row }) => (
  //     <Badge variant={row.getValue('isActive') ? 'default' : 'secondary'}>
  //       {row.getValue('isActive') ? 'Active' : 'Inactive'}
  //     </Badge>
  //   ),
  //   meta: {
  //     title: 'Status'
  //   }
  // }),
  columnHelper.display({
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => {
      const organization = row.original;
      return (
        <OrganizationInlineActions
          organization={{
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
          }}
        />
      );
    }
  })
];

export interface OrganizationsDataTableProps {
  data: OrganizationData[];
}

export function OrganizationsDataTable({ data }: OrganizationsDataTableProps): React.JSX.Element {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search organizations..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <AdminOrganizationsDataTableExport
            organizations={data}
            table={table}
          />
          <DataTableColumnOptionsHeader table={table} />
        </div>
      </div>
      <DataTable table={table} fixedHeader />
      <DataTablePagination table={table} />
    </div>
  );
}
