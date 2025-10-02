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
import { ExternalLinkIcon, ShieldIcon, UserIcon, DownloadIcon } from 'lucide-react';
import Link from 'next/link';

import { replaceOrgSlug, routes } from '@workspace/routes';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
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

import type { UserData } from '~/actions/admin/get-users';
import { generateAdminUsersReactPDF } from './generate-users-pdf';
import { exportToCSV, exportToExcel } from '@workspace/ui/lib/data-table-utils';

const columnHelper = createColumnHelper<UserData>();

const exportUsersToPDF = async (users: UserData[]) => {
  await generateAdminUsersReactPDF(users);
};

// Custom DataTableExport component for admin users
function AdminUsersDataTableExport({
  users,
  table,
}: {
  users: UserData[];
  table: any;
}): React.JSX.Element {
  const filename = `sportsfest-admin-users-${new Date().toISOString().slice(0, 10)}`;
  const title = 'SportsFest Admin Users';

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
          onClick={() => exportUsersToPDF(users)}
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => {
      const user = row.original;

      if (!user.organizationSlug) {
        return (
          <span className="text-muted-foreground text-sm">No organization</span>
        );
      }

      return (
        <Link
          href={replaceOrgSlug(
            routes.dashboard.organizations.slug.Home,
            user.organizationSlug
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
          <AdminUsersDataTableExport
            users={data}
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