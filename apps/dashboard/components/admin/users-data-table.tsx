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
import { ExternalLinkIcon, MoreHorizontalIcon, ShieldIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';

import { replaceOrgSlug, routes } from '@workspace/routes';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
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

import type { UserData } from '~/actions/admin/get-users';

const columnHelper = createColumnHelper<UserData>();

const columns = [
  columnHelper.accessor('name', {
    id: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        <Avatar className="size-8">
          <AvatarImage src="" alt="" />
          <AvatarFallback>
            {(row.getValue('name') as string)
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.getValue('name')}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
    meta: {
      title: 'User'
    }
  }),
  columnHelper.accessor('isSportsFestAdmin', {
    id: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        {row.getValue('role') ? (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <ShieldIcon className="size-3" />
            <span>Super Admin</span>
          </Badge>
        ) : (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <UserIcon className="size-3" />
            <span>User</span>
          </Badge>
        )}
      </div>
    ),
    meta: {
      title: 'Role'
    }
  }),
  columnHelper.accessor('organizationName', {
    id: 'organization',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organization" />
    ),
    cell: ({ row }) => {
      const orgName = row.getValue('organization') as string;
      const orgSlug = row.original.organizationSlug;

      if (!orgName) {
        return <span className="text-muted-foreground">No organization</span>;
      }

      return (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{orgName}</span>
          {orgSlug && (
            <span className="text-xs text-muted-foreground">({orgSlug})</span>
          )}
        </div>
      );
    },
    meta: {
      title: 'Organization'
    }
  }),
  columnHelper.accessor('isActive', {
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge variant={row.getValue('status') ? 'default' : 'secondary'}>
        {row.getValue('status') ? 'Active' : 'Inactive'}
      </Badge>
    ),
    meta: {
      title: 'Status'
    }
  }),
  columnHelper.accessor('lastLogin', {
    id: 'lastLogin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Login" />
    ),
    cell: ({ row }) => {
      const lastLogin = row.getValue('lastLogin') as Date | null;
      if (!lastLogin) {
        return <span className="text-muted-foreground">Never</span>;
      }
      return (
        <div className="text-sm text-muted-foreground">
          {new Date(lastLogin).toLocaleDateString()}
        </div>
      );
    },
    meta: {
      title: 'Last Login'
    }
  }),
  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {new Date(row.getValue('createdAt')).toLocaleDateString()}
      </div>
    ),
    meta: {
      title: 'Created Date'
    }
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
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
            {user.organizationSlug && (
              <DropdownMenuItem asChild>
                <Link
                  href={replaceOrgSlug(
                    routes.dashboard.organizations.slug.Home,
                    user.organizationSlug
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  <ExternalLinkIcon className="mr-2 size-4" />
                  View organization
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  })
];

export interface UsersDataTableProps {
  data: UserData[];
}

export function UsersDataTable({ data }: UsersDataTableProps): React.JSX.Element {
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
          placeholder="Search users..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <DataTableExport
            table={table}
            filename="users"
            title="SportsFest Users"
          />
          <DataTableColumnOptionsHeader table={table} />
        </div>
      </div>
      <DataTable table={table} fixedHeader />
      <DataTablePagination table={table} />
    </div>
  );
}