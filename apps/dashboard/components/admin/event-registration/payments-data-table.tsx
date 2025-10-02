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
import { CreditCardIcon, ExternalLinkIcon, DownloadIcon } from 'lucide-react';

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
  DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu';
import { Input } from '@workspace/ui/components/input';

import { formatCurrency, formatDate } from '~/lib/formatters';
import type { PaymentData } from '~/actions/admin/get-payments';
import { generateAdminPaymentsReactPDF } from '~/components/admin/generate-payments-pdf';
import { exportToCSV, exportToExcel } from '@workspace/ui/lib/data-table-utils';

const columnHelper = createColumnHelper<PaymentData>();

const exportPaymentsToPDF = async (payments: PaymentData[], status: 'pending' | 'completed' | 'failed' | 'refunded') => {
  await generateAdminPaymentsReactPDF(payments, status);
};

// Custom DataTableExport component for admin payments
function AdminPaymentsDataTableExport({
  payments,
  table,
  status,
}: {
  payments: PaymentData[];
  table: any;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}): React.JSX.Element {
  const filename = `sportsfest-${status}-payments-${new Date().toISOString().slice(0, 10)}`;
  const statusConfig = {
    pending: 'SportsFest Dashboard Pending Payments',
    failed: 'SportsFest Dashboard Failed Payments',
    completed: 'SportsFest Dashboard Completed Payments',
    refunded: 'SportsFest Dashboard Refunded Payments'
  };
  const title = statusConfig[status];

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
          onClick={() => exportPaymentsToPDF(payments, status)}
          className="cursor-pointer"
        >
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface PaymentsDataTableProps {
  data: PaymentData[];
  status: 'pending' | 'completed' | 'failed' | 'refunded';
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
        id: 'organizationName',
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
      columnHelper.accessor('orderNumber', {
        id: 'orderNumber',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Order #" />
        ),
        cell: ({ row }) => (
          <div className="font-mono text-sm">
            {row.getValue('orderNumber') || 'N/A'}
          </div>
        ),
        meta: {
          title: 'Order Number'
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
        id: 'stripePaymentIntentId',
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
    const actionsColumn = columnHelper.display({
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <Link
            href={replaceOrgSlug(
              routes.dashboard.organizations.slug.Home,
              payment.organizationSlug
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
    });

    baseColumns.push(actionsColumn as any);

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
    completed: { title: 'Completed Payments', description: 'Successfully processed transactions' },
    refunded: { title: 'Refunded Payments', description: 'Payments that have been refunded to customers' }
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
          {status === 'refunded' && 'No refunded payments found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder={`Search ${status} payments...`}
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <AdminPaymentsDataTableExport
            payments={data}
            table={table}
            status={status}
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
