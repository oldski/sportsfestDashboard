'use client';

import * as React from 'react';
import Link from 'next/link';
import NiceModal from '@ebay/nice-modal-react';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@workspace/ui/components/tooltip';
import {
  DataTable,
  DataTableColumnHeader,
  DataTableColumnOptionsHeader,
  DataTablePagination
} from '@workspace/ui/components/data-table';
import { exportToExcel } from '@workspace/ui/lib/data-table-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';

import { pdf } from '@react-pdf/renderer';
import { toast } from '@workspace/ui/components/sonner';
import { formatCurrency, formatDate } from '~/lib/formatters';
import type { InvoiceData } from '~/actions/admin/get-invoices';
import { InvoiceDetailsModal } from '~/components/organizations/slug/registration/invoice-details-modal';
import { InvoiceListPDF } from './invoice-list-pdf';

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

  const handleExportPDF = async () => {
    try {
      const visibleRows = table.getFilteredRowModel().rows;
      const visibleInvoices = visibleRows.map(row => row.original);

      const pdfTitle = status === 'all'
        ? 'SportsFest Invoices Report'
        : `SportsFest ${status.charAt(0).toUpperCase() + status.slice(1)} Invoices Report`;

      const blob = await pdf(
        InvoiceListPDF({
          invoices: visibleInvoices,
          title: pdfTitle,
        })
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = status === 'all' ? 'invoices-report' : `${status}-invoices-report`;
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Invoice PDF exported successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleExportCSV = () => {
    try {
      const visibleRows = table.getFilteredRowModel().rows;
      const visibleInvoices = visibleRows.map(row => row.original);

      // Define headers matching PDF columns
      const headers = ['Invoice #', 'Organization', 'Order #', 'Total Amount', 'Paid Amount', 'Balance', 'Status', 'Notes'];

      // Map data to CSV rows
      const csvRows = visibleInvoices.map(invoice => [
        invoice.invoiceNumber,
        invoice.organizationName,
        invoice.orderNumber || 'N/A',
        invoice.totalAmount.toString(),
        invoice.paidAmount.toString(),
        invoice.balanceOwed.toString(),
        invoice.status,
        invoice.notes || ''
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = status === 'all' ? 'invoices' : `${status}-invoices`;
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Invoice CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

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
      columnHelper.accessor('orderNumber', {
        id: 'orderNumber',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Order #" />
        ),
        cell: ({ row }) => (
          <div className="font-mono text-xs text-muted-foreground">
            {row.getValue('orderNumber') || 'N/A'}
          </div>
        ),
        meta: {
          title: 'Order Number'
        }
      }),
      columnHelper.accessor('isSponsorship', {
        id: 'type',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => {
          const isSponsorship = row.original.isSponsorship;
          return (
            <Badge variant={isSponsorship ? 'secondary' : 'outline'} className="text-xs">
              {isSponsorship ? 'Sponsorship' : 'Regular'}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          if (value === 'all') return true;
          const isSponsorship = row.original.isSponsorship;
          if (value === 'sponsorship') return isSponsorship === true;
          if (value === 'regular') return !isSponsorship;
          return true;
        },
        meta: {
          title: 'Type'
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
      columnHelper.accessor('notes', {
        id: 'notes',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Notes" />
        ),
        cell: ({ row }) => {
          const notes = row.getValue('notes') as string | undefined;
          return (
            <div className="text-xs text-muted-foreground max-w-[200px] truncate">
              {notes || '—'}
            </div>
          );
        },
        meta: {
          title: 'Notes'
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Actions" />
        ),
        cell: ({ row }) => {
          const invoice = row.original;

          return (
            <TooltipProvider>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        NiceModal.show(InvoiceDetailsModal, {
                          invoiceId: invoice.id,
                          organizationName: invoice.organizationName
                        });
                      }}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Invoice</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      asChild
                    >
                      <Link
                        href={replaceOrgSlug(
                          routes.dashboard.organizations.slug.Home,
                          invoice.organizationSlug
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLinkIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Organization</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
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
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search invoices..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
            <Select
              value={(table.getColumn('type')?.getFilterValue() as string) ?? 'all'}
              onValueChange={(value) => table.getColumn('type')?.setFilterValue(value)}
            >
              <SelectTrigger className="h-9 w-[130px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="sponsorship">Sponsorship</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-sm">
                  <DownloadIcon className="size-4 shrink-0" />
                  <span className="hidden lg:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export data</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={handleExportCSV}
                  className="cursor-pointer"
                >
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const filename = status === 'all' ? 'invoices' : `${status}-invoices`;
                    exportToExcel(table, `${filename}-${new Date().toISOString().split('T')[0]}`);
                    toast.success('Invoice Excel exported successfully');
                  }}
                  className="cursor-pointer"
                >
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleExportPDF}
                  className="cursor-pointer"
                >
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
