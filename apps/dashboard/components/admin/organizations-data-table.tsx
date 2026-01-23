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
import { ExternalLinkIcon, CalendarIcon, MapPinIcon, PhoneIcon, DownloadIcon, CopyIcon, ExternalLink } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { toast } from '@workspace/ui/components/sonner';

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
    cell: ({ row }) => {
      const slug = row.getValue('slug') as string;
      const shouldTruncate = slug && slug.length > 50;
      const displaySlug = shouldTruncate ? `${slug.slice(0, 50)}...` : slug;

      if (shouldTruncate) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="font-mono text-sm text-muted-foreground cursor-help">
                  {displaySlug}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-md">
                <p className="font-mono text-xs break-all">{slug}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      return (
        <div className="font-mono text-sm text-muted-foreground">
          {slug}
        </div>
      );
    },
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
  columnHelper.accessor('city', {
    id: 'location',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => {
      const org = row.original;
      const { address, address2, city, state, zip } = org;

      const hasAddress = address || city || state || zip;

      if (!hasAddress) {
        return <span className="text-sm text-muted-foreground">No address</span>;
      }

      // Build preview text (City, State)
      const previewParts = [city, state].filter(Boolean);
      const preview = previewParts.length > 0 ? previewParts.join(', ') : 'View address';

      // Build full address for display and Google Maps
      const addressLines = [
        address,
        address2,
        [city, state, zip].filter(Boolean).join(', ')
      ].filter(Boolean);

      const fullAddress = addressLines.join('\n');
      const mapsQuery = encodeURIComponent(addressLines.join(', '));
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

      const handleCopyAddress = async () => {
        try {
          await navigator.clipboard.writeText(addressLines.join(', '));
          toast.success('Address copied to clipboard');
        } catch {
          toast.error('Failed to copy address');
        }
      };

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-sm font-normal hover:bg-muted"
            >
              <MapPinIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span className="truncate max-w-[120px]">{preview}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72">
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Address</h4>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {fullAddress}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleCopyAddress}
                >
                  <CopyIcon className="h-3.5 w-3.5 mr-1.5" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  asChild
                >
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Maps
                  </a>
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      );
    },
    meta: {
      title: 'Location'
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
      <div className="flex items-center justify-between gap-2">
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
