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
import { ExternalLinkIcon, MoreHorizontalIcon } from 'lucide-react';
import Link from 'next/link';

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

import type { OrganizationData } from '~/actions/admin/get-organizations';

const columnHelper = createColumnHelper<OrganizationData>();

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
    cell: ({ row }) => {
      const organization = row.original;
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
                  organization.slug
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
          <DataTableExport
            table={table}
            filename="organizations"
            title="SportsFest Organizations"
          />
          <DataTableColumnOptionsHeader table={table} />
        </div>
      </div>
      <DataTable table={table} fixedHeader />
      <DataTablePagination table={table} />
    </div>
  );
}
