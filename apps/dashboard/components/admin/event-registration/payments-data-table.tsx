'use client';

import * as React from 'react';
import Link from 'next/link';
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
import { CreditCardIcon, ExternalLinkIcon, MoreHorizontalIcon, RefreshCwIcon, PlayIcon } from 'lucide-react';

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

import { formatCurrency, formatDate } from '~/lib/formatters';
import type { PaymentData } from '~/actions/admin/get-payments';

const columnHelper = createColumnHelper<PaymentData>();

interface PaymentsDataTableProps {
  data: PaymentData[];
  status: 'pending' | 'completed' | 'failed';
}

export function PaymentsDataTable({ data, status }: PaymentsDataTableProps): React.JSX.Element {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'createdAt', desc: true } // Default sort by creation date (newest first)
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  // Define columns based on payment status
  const columns = React.useMemo(() => {
    const baseColumns = [
      columnHelper.accessor('organizationName', {
        id: 'organization',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Organization" />
        ),
        cell: ({ row }) => (
          <Link
            href={replaceOrgSlug(
              routes.dashboard.organizations.slug.Home,
              row.original.organizationSlug
            )}
            className="font-medium hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {row.getValue('organizationName')}
          </Link>
        ),
        meta: {
          title: 'Organization'
        }
      }),
      columnHelper.accessor('paymentType', {
        id: 'paymentType',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Payment Type" />
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs capitalize">
            {String(row.getValue('paymentType')).replace('_', ' ')}
          </Badge>
        ),
        meta: {
          title: 'Payment Type'
        }
      }),
      columnHelper.accessor('amount', {
        id: 'amount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Amount" />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{formatCurrency(row.getValue('amount'))}</div>
        ),
        meta: {
          title: 'Amount'
        }
      }),
      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => (
          <div className="text-sm">{formatDate(row.getValue('createdAt'))}</div>
        ),
        meta: {
          title: 'Created Date'
        }
      })
    ];

    // Add status-specific columns
    if (status === 'failed') {
      const failureReasonColumn = {
        id: 'failureReason',
        accessorKey: 'failureReason',
        header: ({ column }: any) => (
          <DataTableColumnHeader column={column} title="Failure Reason" />
        ),
        cell: ({ row }: any) => (
          <div className="text-xs text-red-600">
            {row.getValue('failureReason')
              ? String(row.getValue('failureReason')).replace('_', ' ')
              : 'Unknown'
            }
          </div>
        ),
        meta: {
          title: 'Failure Reason'
        }
      } as any;
      
      baseColumns.splice(3, 0, failureReasonColumn);
    }

    if (status === 'completed') {
      const processedAtColumn = {
        id: 'processedAt',
        accessorKey: 'processedAt',
        header: ({ column }: any) => (
          <DataTableColumnHeader column={column} title="Completed" />
        ),
        cell: ({ row }: any) => (
          <div className="text-sm">
            {row.getValue('processedAt')
              ? formatDate(row.getValue('processedAt') as string)
              : 'N/A'
            }
          </div>
        ),
        meta: {
          title: 'Completed Date'
        }
      } as any;

      const stripeColumn = {
        id: 'stripeId',
        accessorKey: 'stripePaymentIntentId',
        header: ({ column }: any) => (
          <DataTableColumnHeader column={column} title="Stripe ID" />
        ),
        cell: ({ row }: any) => (
          <div className="text-xs font-mono">
            {row.getValue('stripePaymentIntentId') || 'N/A'}
          </div>
        ),
        meta: {
          title: 'Stripe Payment ID'
        }
      } as any;

      baseColumns.push(processedAtColumn, stripeColumn);
    }

    // Add actions column
    const actionsColumn = {
      id: 'actions',
      cell: ({ row }: any) => {
        const payment = row.original;

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
                    payment.organizationSlug
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  <ExternalLinkIcon className="mr-2 size-4" />
                  View organization
                </Link>
              </DropdownMenuItem>
              {status === 'pending' && (
                <DropdownMenuItem>
                  <PlayIcon className="mr-2 size-4" />
                  Process payment
                </DropdownMenuItem>
              )}
              {status === 'failed' && (
                <DropdownMenuItem>
                  <RefreshCwIcon className="mr-2 size-4" />
                  Retry payment
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    } as any;

    baseColumns.push(actionsColumn);

    return baseColumns;
  }, [status]);

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

  const statusConfig = {
    pending: { title: 'Pending Payments', description: 'Payments awaiting processing or customer action' },
    failed: { title: 'Failed Payments', description: 'Payments that failed processing and require attention' },
    completed: { title: 'Completed Payments', description: 'Successfully processed transactions' }
  };

  const config = statusConfig[status];

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <CreditCardIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No {status} payments</h3>
        <p className="text-sm text-muted-foreground">
          {status === 'pending' && 'All payments are up to date.'}
          {status === 'failed' && 'No failed payments to review.'}
          {status === 'completed' && 'No completed payments found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="ml-5">
          <h3 className="text-lg font-semibold">{config.title}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder={`Search ${status} payments...`}
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
          <DataTableExport
            table={table}
            filename={`${status}-payments`}
            title={`SportsFest ${config.title}`}
          />
          <DataTableColumnOptionsHeader table={table} />
        </div>
      </div>
      <DataTable table={table} fixedHeader />
      <div className="rounded-b-xl overflow-hidden">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
