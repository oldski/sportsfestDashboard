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
import { ExternalLinkIcon, CalendarIcon, CheckCircleIcon, XCircleIcon, DownloadIcon } from 'lucide-react';
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

import type { PlayerData } from '~/actions/admin/get-players';
import { generateAdminPlayersReactPDF } from './generate-players-pdf';
import { exportToCSV, exportToExcel } from '@workspace/ui/lib/data-table-utils';

const columnHelper = createColumnHelper<PlayerData>();

const exportPlayersToPDF = async (
  players: PlayerData[],
  eventYearName?: string
) => {
  await generateAdminPlayersReactPDF(players, eventYearName);
};

// Custom DataTableExport component for admin players
function AdminPlayersDataTableExport({
  players,
  eventYearName,
  table,
}: {
  players: PlayerData[];
  eventYearName?: string;
  table: any;
}): React.JSX.Element {
  const filename = `sportsfest-admin-players-${new Date().toISOString().slice(0, 10)}`;
  const title = `SportsFest Admin Players${eventYearName ? ` - ${eventYearName}` : ''}`;

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
          onClick={() => exportPlayersToPDF(players, eventYearName)}
          className="cursor-pointer"
        >
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columns = [
  columnHelper.accessor('firstName', {
    id: 'firstName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('firstName')}</div>
    ),
    meta: {
      title: 'First Name'
    }
  }),
  columnHelper.accessor('lastName', {
    id: 'lastName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('lastName')}</div>
    ),
    meta: {
      title: 'Last Name'
    }
  }),
  columnHelper.accessor('organizationName', {
    id: 'organizationName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organization" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <div className="font-medium">{row.getValue('organizationName')}</div>
      </div>
    ),
    meta: {
      title: 'Organization'
    }
  }),
  columnHelper.accessor('email', {
    id: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-sm text-muted-foreground">
        {row.getValue('email')}
      </div>
    ),
    meta: {
      title: 'Email'
    }
  }),
  columnHelper.accessor('phone', {
    id: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string | null;
      return (
        <div className="font-mono text-sm text-muted-foreground">
          {phone || 'Not provided'}
        </div>
      );
    },
    meta: {
      title: 'Phone'
    }
  }),
  columnHelper.accessor('gender', {
    id: 'gender',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => {
      const gender = row.getValue('gender') as string;
      return (
        <Badge variant="outline">
          {gender.charAt(0).toUpperCase() + gender.slice(1)}
        </Badge>
      );
    },
    meta: {
      title: 'Gender'
    }
  }),
  columnHelper.accessor('tshirtSize', {
    id: 'tshirtSize',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="T-Shirt Size" />
    ),
    cell: ({ row }) => {
      const size = row.getValue('tshirtSize') as string;
      return (
        <Badge variant="secondary">
          {size}
        </Badge>
      );
    },
    meta: {
      title: 'T-Shirt Size'
    }
  }),
  columnHelper.accessor('dateOfBirth', {
    id: 'dateOfBirth',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date of Birth" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('dateOfBirth') as Date;
      return (
        <div className="flex items-center space-x-1">
          <CalendarIcon className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{date.toLocaleDateString()}</span>
        </div>
      );
    },
    meta: {
      title: 'Date of Birth'
    }
  }),
  columnHelper.accessor('status', {
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const statusVariant = status === 'registered' ? 'default' :
                           status === 'checked_in' ? 'default' : 'secondary';
      return (
        <Badge variant={statusVariant}>
          {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      );
    },
    meta: {
      title: 'Status'
    }
  }),
  columnHelper.accessor('waiverSigned', {
    id: 'waiverSigned',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Waiver" />
    ),
    cell: ({ row }) => {
      const signed = row.getValue('waiverSigned') as boolean;
      return (
        <div className="flex items-center space-x-1">
          {signed ? (
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          ) : (
            <XCircleIcon className="h-4 w-4 text-red-600" />
          )}
          <span className="text-sm">{signed ? 'Signed' : 'Not Signed'}</span>
        </div>
      );
    },
    meta: {
      title: 'Waiver Status'
    }
  }),
  columnHelper.accessor('accuracyConfirmed', {
    id: 'accuracyConfirmed',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Info Confirmed" />
    ),
    cell: ({ row }) => {
      const confirmed = row.getValue('accuracyConfirmed') as boolean;
      return (
        <div className="flex items-center space-x-1">
          {confirmed ? (
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          ) : (
            <XCircleIcon className="h-4 w-4 text-red-600" />
          )}
          <span className="text-sm">{confirmed ? 'Confirmed' : 'Pending'}</span>
        </div>
      );
    },
    meta: {
      title: 'Info Confirmed'
    }
  }),
  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registered" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date;
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
    meta: {
      title: 'Registration Date'
    }
  }),
  columnHelper.display({
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => {
      const player = row.original;
      return (
        <Link
          href={replaceOrgSlug(
            routes.dashboard.organizations.slug.Home,
            player.organizationSlug
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors"
          title="Go To Organization"
        >
          <ExternalLinkIcon className="size-4 text-muted-foreground hover:text-foreground" />
          <span className="sr-only">Go To Organization</span>
        </Link>
      );
    }
  })
];

export interface PlayersDataTableProps {
  data: PlayerData[];
}

export function PlayersDataTable({ data }: PlayersDataTableProps): React.JSX.Element {
  // Get event year name from first player (all players should be from same event year)
  const eventYearName = data.length > 0 ? data[0].eventYearName : undefined;
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
          placeholder="Search players..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <AdminPlayersDataTableExport
            players={data}
            eventYearName={eventYearName}
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