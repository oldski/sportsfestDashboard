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
import {
  FileTextIcon,
  DownloadIcon,
  SendIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  DollarSignIcon,
  EyeIcon
} from 'lucide-react';

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
import type { InvoiceData } from '~/actions/admin/get-invoices';
import { RecordPaymentButton } from './record-payment-button';
import { downloadInvoicePDF } from '~/lib/pdf-utils';

const columnHelper = createColumnHelper<InvoiceData>();

interface InvoiceDataTableProps {
  data: InvoiceData[];
  status?: InvoiceData['status'] | 'all';
  showSearch?: boolean;
}

export function InvoiceDataTable({ data, status = 'all', showSearch = true }: InvoiceDataTableProps): React.JSX.Element {
  // Safety check - ensure we have data
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No invoices found</p>
      </div>
    );
  }
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'totalAmount', desc: true } // Default sort by amount (highest first)
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const columns = React.useMemo(() => {
    const baseColumns = [
      columnHelper.accessor('invoiceNumber', {
        id: 'invoiceNumber',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Invoice #" />
        ),
        cell: ({ row }) => (
          <div className="font-mono text-sm font-medium">
            {row.getValue('invoiceNumber')}
          </div>
        ),
        meta: {
          title: 'Invoice Number'
        }
      }),
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
            {row.getValue('organization')}
          </Link>
        ),
        meta: {
          title: 'Organization'
        }
      }),
      columnHelper.accessor('totalAmount', {
        id: 'totalAmount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total Amount" />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{formatCurrency(row.getValue('totalAmount'))}</div>
        ),
        meta: {
          title: 'Total Amount'
        }
      }),
      columnHelper.accessor('paidAmount', {
        id: 'paidAmount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Paid Amount" />
        ),
        cell: ({ row }) => {
          const paidAmount = row.getValue('paidAmount') as number;
          return (
            <div className={`text-sm ${paidAmount > 0 ? "text-green-600" : "text-muted-foreground"}`}>
              {formatCurrency(paidAmount)}
            </div>
          );
        },
        meta: {
          title: 'Paid Amount'
        }
      }),
      columnHelper.accessor('balanceOwed', {
        id: 'balanceOwed',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Balance" />
        ),
        cell: ({ row }) => {
          const balanceOwed = row.getValue('balanceOwed') as number;
          const invoiceStatus = row.original.status;
          return (
            <span className={
              balanceOwed > 0
                ? invoiceStatus === 'overdue'
                  ? "text-red-600 font-medium"
                  : "text-orange-600 font-medium"
                : "text-muted-foreground"
            }>
              {formatCurrency(balanceOwed)}
            </span>
          );
        },
        meta: {
          title: 'Balance Owed'
        }
      }),
      columnHelper.accessor('dueDate', {
        id: 'dueDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Due Date" />
        ),
        cell: ({ row }) => {
          const dueDate = row.getValue('dueDate') as string;
          const invoiceStatus = row.original.status;
          return (
            <div className="text-sm">
              {dueDate ? formatDate(dueDate) : 'N/A'}
              {invoiceStatus === 'overdue' && (
                <div className="text-xs text-red-600 font-medium">
                  Overdue
                </div>
              )}
            </div>
          );
        },
        meta: {
          title: 'Due Date'
        }
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as InvoiceData['status'];
          return (
            <Badge
              variant={
                status === 'paid' ? 'default' :
                status === 'partial' ? 'secondary' :
                status === 'overdue' ? 'destructive' :
                status === 'sent' ? 'outline' : 'secondary'
              }
              className="capitalize"
            >
              {status}
            </Badge>
          );
        },
        meta: {
          title: 'Status'
        }
      }),
      columnHelper.display({
        id: 'actions',
        cell: ({ row }) => {
          const invoice = row.original;

          const handleDownloadPDF = async () => {
            try {
              // Transform InvoiceData to RegistrationInvoiceDto format
              const invoiceForPDF = {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                orderId: invoice.orderId,
                orderNumber: `ORD-${invoice.orderId}`,
                totalAmount: invoice.totalAmount,
                paidAmount: invoice.paidAmount,
                balanceOwed: invoice.balanceOwed,
                status: invoice.status as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
                createdAt: new Date(invoice.createdAt || Date.now()),
                updatedAt: new Date(invoice.updatedAt || Date.now()),
                dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
                sentAt: invoice.sentAt ? new Date(invoice.sentAt) : undefined,
                paidAt: invoice.paidAt ? new Date(invoice.paidAt) : undefined,
                notes: invoice.notes || undefined,
                downloadUrl: invoice.downloadUrl || undefined,
                order: {
                  id: invoice.orderId,
                  orderNumber: `ORD-${invoice.orderId}`,
                  totalAmount: invoice.totalAmount,
                  status: 'pending',
                  createdAt: new Date(),
                  items: [
                    // Mock order items since we don't have them in InvoiceData
                    {
                      id: '1',
                      productName: 'SportsFest Registration',
                      productCategory: 'Registration',
                      quantity: 1,
                      unitPrice: invoice.totalAmount,
                      totalPrice: invoice.totalAmount
                    }
                  ]
                }
              };

              await downloadInvoicePDF(invoiceForPDF);
            } catch (error) {
              console.error('Error downloading PDF:', error);
              // TODO: Show error message to user
            }
          };

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
                  <Link href={`/admin/event-registration/invoices/${invoice.id}`}>
                    <EyeIcon className="mr-2 size-4" />
                    View invoice
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  <DownloadIcon className="mr-2 size-4" />
                  Download PDF
                </DropdownMenuItem>
                {invoice.status !== 'paid' && (
                  <>
                    <DropdownMenuItem>
                      <SendIcon className="mr-2 size-4" />
                      Send invoice
                    </DropdownMenuItem>
                    <RecordPaymentButton invoiceId={invoice.id} asChild />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link
                    href={replaceOrgSlug(
                      routes.dashboard.organizations.slug.Home,
                      invoice.organizationSlug
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

    return baseColumns;
  }, []);

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

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">
          {status === 'all' ? 'No invoices found' : `No ${status} invoices`}
        </h3>
        <p className="text-sm text-muted-foreground">
          {status === 'draft' && 'No draft invoices are pending.'}
          {status === 'sent' && 'All sent invoices have been processed.'}
          {status === 'partial' && 'No invoices have partial payments.'}
          {status === 'overdue' && 'All invoices are up to date.'}
          {status === 'paid' && 'No completed payments found.'}
          {status === 'all' && 'Create your first invoice to get started.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search invoices..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm ml-5"
          />
          <div className="flex items-center space-x-2">
            <DataTableExport
              table={table}
              filename={status === 'all' ? 'invoices' : `${status}-invoices`}
              title={`SportsFest ${status === 'all' ? 'Invoices' : `${status} Invoices`}`}
            />
            <DataTableColumnOptionsHeader table={table} />
          </div>
        </div>
      )}
      <DataTable table={table} fixedHeader />
      <div className="rounded-b-xl overflow-hidden">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
