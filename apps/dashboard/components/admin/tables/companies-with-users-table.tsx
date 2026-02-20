'use client';

import * as React from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ExpandedState,
  type Row,
  flexRender,
} from '@tanstack/react-table';
import { ChevronRightIcon, ChevronDownIcon, DownloadIcon } from 'lucide-react';

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { exportToCSV, exportToExcel } from '@workspace/ui/lib/data-table-utils';
import { formatPhoneNumber } from '~/lib/formatters';

import type { CompanyWithUsers, CompanyUser } from '~/actions/admin/get-companies-with-users';

const columnHelper = createColumnHelper<CompanyWithUsers>();

const columns = [
  columnHelper.display({
    id: 'expand',
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={(e) => {
          e.stopPropagation();
          row.toggleExpanded();
        }}
      >
        {row.getIsExpanded() ? (
          <ChevronDownIcon className="h-4 w-4" />
        ) : (
          <ChevronRightIcon className="h-4 w-4" />
        )}
      </Button>
    ),
    size: 40,
  }),
  columnHelper.accessor('name', {
    id: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
    meta: { title: 'Company' },
  }),
  columnHelper.accessor('city', {
    id: 'city',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue('city') || '—'}</span>
    ),
    meta: { title: 'City' },
  }),
  columnHelper.accessor('state', {
    id: 'state',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="State" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue('state') || '—'}</span>
    ),
    meta: { title: 'State' },
  }),
  columnHelper.accessor('phone', {
    id: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => (
      <span className="text-sm font-mono">
        {formatPhoneNumber(row.getValue('phone'))}
      </span>
    ),
    meta: { title: 'Phone' },
  }),
  columnHelper.accessor('memberCount', {
    id: 'memberCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Members" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.getValue('memberCount')}
      </Badge>
    ),
    meta: { title: 'Members' },
  }),
];

function UserSubRows({ users }: { users: CompanyUser[] }) {
  if (users.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-3 pl-12">
          No members found
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      <TableRow className="bg-muted/30 hover:bg-muted/30">
        <TableCell />
        <TableCell className="text-xs font-semibold text-muted-foreground">Name</TableCell>
        <TableCell className="text-xs font-semibold text-muted-foreground">Email</TableCell>
        <TableCell className="text-xs font-semibold text-muted-foreground">Phone</TableCell>
        <TableCell className="text-xs font-semibold text-muted-foreground" colSpan={2}>Role</TableCell>
      </TableRow>
      {users.map((user) => (
        <TableRow key={user.id} className="bg-muted/20 hover:bg-muted/30">
          <TableCell />
          <TableCell className="text-sm">{user.name || '—'}</TableCell>
          <TableCell className="text-sm font-mono">{user.email || '—'}</TableCell>
          <TableCell className="text-sm font-mono">{formatPhoneNumber(user.phone)}</TableCell>
          <TableCell colSpan={2}>
            <Badge variant={user.isOwner ? 'default' : 'outline'}>
              {user.isOwner ? 'Owner' : 'Member'}
            </Badge>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export interface CompaniesWithUsersTableProps {
  data: CompanyWithUsers[];
}

export function CompaniesWithUsersTable({ data }: CompaniesWithUsersTableProps): React.JSX.Element {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: {
      sorting,
      globalFilter,
      expanded,
    },
  });

  const filename = `sportsfest-companies-users-${new Date().toISOString().slice(0, 10)}`;
  const title = 'SportsFest Companies & Users';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Search companies..."
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
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-20 shadow-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => row.toggleExpanded()}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <UserSubRows users={row.original.users} />
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
