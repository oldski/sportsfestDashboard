'use client';

import * as React from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Table as ReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {DownloadIcon} from 'lucide-react';
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
import type { PlayerWithDetails, GetPlayersResult } from '~/data/players/get-players';
import { formatPhoneNumber } from '~/lib/formatters';
import {Input} from "@workspace/ui/components/input";
import { generatePlayersReactPDF } from './generate-players-pdf';

interface PlayersDataTableProps {
  data: GetPlayersResult;
  eventYears: Array<{ id: string; year: number; name: string }>;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}


// Helper function to get gender display text
function getGenderDisplay(gender: string) {
  switch (gender) {
    case 'male':
      return 'Male';
    case 'female':
      return 'Female';
    case 'non_binary':
      return 'Non-binary';
    case 'prefer_not_to_say':
      return 'Prefer not to say';
    default:
      return gender;
  }
}

// Custom export functions for players data table
const exportPlayersToCSV = async (
  players: PlayerWithDetails[],
  filename: string
) => {
  const Papa = (await import('papaparse')).default;

  // Define headers manually for complete control
  const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Gender', 'Age', 'T-Shirt', 'Registered'];

  const data = players.map((player) => {
    return {
      'First Name': player.firstName || '',
      'Last Name': player.lastName || '',
      'Email': player.email || '',
      'Phone': player.phone || '',
      'Gender': getGenderDisplay(player.gender),
      'Age': player.dateOfBirth ? format(new Date(player.dateOfBirth), 'yyyy-MM-dd') : '',
      'T-Shirt': player.tshirtSize ? player.tshirtSize.toUpperCase() : '',
      'Registered': player.createdAt ? format(new Date(player.createdAt), 'yyyy-MM-dd') : '',
    };
  });

  const csv = Papa.unparse({ fields: headers, data });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportPlayersToExcel = async (
  players: PlayerWithDetails[],
  filename: string
) => {
  const XLSX = await import('xlsx');

  // Define headers manually for complete control
  const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Gender', 'Age', 'T-Shirt', 'Registered'];

  const data = [
    headers,
    ...players.map((player) => {
      return [
        player.firstName || '',
        player.lastName || '',
        player.email || '',
        player.phone || '',
        getGenderDisplay(player.gender),
        player.dateOfBirth ? format(new Date(player.dateOfBirth), 'yyyy-MM-dd') : '',
        player.tshirtSize ? player.tshirtSize.toUpperCase() : '',
        player.createdAt ? format(new Date(player.createdAt), 'yyyy-MM-dd') : '',
      ];
    })
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

const exportPlayersToPDF = async (
  players: PlayerWithDetails[],
  organizationName: string,
  eventYearName?: string
) => {
  await generatePlayersReactPDF(players, organizationName, eventYearName);
};

// Custom DataTableExport component for players
function PlayersDataTableExport({
  players,
  organizationName,
  eventYearName,
  filename
}: {
  players: PlayerWithDetails[];
  organizationName: string;
  eventYearName?: string;
  filename: string;
}) {
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
          onClick={() => exportPlayersToCSV(players, filename)}
          className="cursor-pointer"
        >
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => exportPlayersToExcel(players, filename)}
          className="cursor-pointer"
        >
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => exportPlayersToPDF(players, organizationName, eventYearName)}
          className="cursor-pointer"
        >
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PlayersDataTable({ data, organization, eventYears }: PlayersDataTableProps) {
  const [globalFilter, setGlobalFilter] = React.useState('');

  const columns: ColumnDef<PlayerWithDetails>[] = [
    {
      accessorKey: 'firstName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="First Name" />,
      cell: ({ row }) => {
        const firstName = row.getValue('firstName') as string;
        return <span className="font-medium">{firstName}</span>;
      },
      meta: {
        title: 'First Name'
      },
    },
    {
      accessorKey: 'lastName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Name" />,
      cell: ({ row }) => {
        const lastName = row.getValue('lastName') as string;
        return <span className="font-medium">{lastName}</span>;
      },
      meta: {
        title: 'Last Name'
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => {
        const email = row.getValue('email') as string;
        return <span className="text-sm">{email}</span>;
      },
      meta: {
        title: 'Email'
      }
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
      cell: ({ row }) => {
        const phone = row.getValue('phone') as string | null;
        return <span className="text-sm">{formatPhoneNumber(phone)}</span>;
      },
      meta: {
        title: 'Phone'
      }
    },
    {
      accessorKey: 'gender',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gender" />,
      cell: ({ row }) => getGenderDisplay(row.getValue('gender')),
      meta: {
        title: 'Gender'
      }
    },
    {
      accessorKey: 'dateOfBirth',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Age" />,
      cell: ({ row }) => {
        const dob = row.getValue('dateOfBirth') as Date;
        const age = new Date().getFullYear() - new Date(dob).getFullYear();
        return `${age} years`;
      },
      meta: {
        title: 'Age'
      }
    },
    {
      accessorKey: 'tshirtSize',
      header: ({ column }) => <DataTableColumnHeader column={column} title="T-Shirt" />,
      cell: ({ row }) => {
        const size = row.getValue('tshirtSize') as string;
        return size.toUpperCase();
      },
      meta: {
        title: 'T-Shirt'
      }
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Registered" />,
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as Date;
        return format(new Date(date), 'MMM dd, yyyy');
      },
      meta: {
        title: 'Registered'
      }
    },
  ];

  const table = useReactTable({
    data: data.players,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      columnVisibility: {},
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  console.log(data)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Search players..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center">
          <PlayersDataTableExport
            players={data.players}
            organizationName={organization.name}
            eventYearName={data.eventYear?.name}
            filename={`players-${organization.slug}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`}
          />
          <DataTableColumnOptionsHeader table={table} />
        </div>
      </div>
      <DataTable table={table} />
      <DataTablePagination table={table} />
    </div>
  );
}
