'use client';

import * as React from 'react';
import NiceModal from '@ebay/nice-modal-react';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getFilteredRowModel,
  ColumnFiltersState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  MoreHorizontalIcon,
  DownloadIcon,
  EyeIcon,
  SearchIcon,
  FilterIcon
} from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  DataTable,
  DataTableColumnHeader,
  DataTablePagination
} from '@workspace/ui/components/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Input } from '@workspace/ui/components/input';
import { toast } from '@workspace/ui/components/sonner';
import { cn } from '@workspace/ui/lib/utils';

import { InvoiceDetailsModal } from '~/components/organizations/slug/registration/invoice-details-modal';
import { downloadInvoicePDF } from '~/lib/pdf-utils';
import type { RegistrationInvoiceDto } from '~/types/dtos/registration-invoice-dto';

export type InvoicesDataTableProps = {
  invoices: RegistrationInvoiceDto[];
};

// Status badge variant mapping
const getStatusVariant = (status: RegistrationInvoiceDto['status']) => {
  switch (status) {
    case 'paid':
      return 'default'; // Green
    case 'sent':
      return 'secondary'; // Blue
    case 'overdue':
      return 'destructive'; // Red
    case 'draft':
      return 'outline'; // Gray
    case 'cancelled':
      return 'secondary'; // Gray
    default:
      return 'outline';
  }
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Format date
const formatDate = (date: Date) => {
  return format(date, 'MMM d, yyyy');
};

export function InvoicesDataTable({
  invoices
}: InvoicesDataTableProps): React.JSX.Element {
  // Safety check - ensure we have data
  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No invoices found</p>
      </div>
    );
  }
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'totalAmount', desc: true } // Default to highest amount first
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [eventYearFilter, setEventYearFilter] = React.useState<string>('all');

  // Get unique event years from invoices
  const availableEventYears = React.useMemo(() => {
    const eventYearMap = new Map();
    invoices.forEach(invoice => {
      if (!eventYearMap.has(invoice.eventYear.id)) {
        eventYearMap.set(invoice.eventYear.id, invoice.eventYear);
      }
    });
    return Array.from(eventYearMap.values()).sort((a, b) => b.year - a.year);
  }, [invoices]);

  // Apply event year filter
  const filteredInvoices = React.useMemo(() => {
    if (eventYearFilter === 'all') return invoices;
    return invoices.filter(invoice => invoice.eventYear.id === eventYearFilter);
  }, [invoices, eventYearFilter]);

  const columns: ColumnDef<RegistrationInvoiceDto>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice #" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.getValue('invoiceNumber')}
        </div>
      )
    },
    {
      accessorKey: 'order.orderNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order #" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.original.order.orderNumber}
        </div>
      )
    },
    {
      accessorKey: 'eventYear',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Event Year" />
      ),
      cell: ({ row }) => {
        const eventYear = row.getValue('eventYear') as RegistrationInvoiceDto['eventYear'];
        return (
          <div className="text-sm">
            <div className="font-medium">{eventYear.name}</div>
            <div className="text-muted-foreground">{eventYear.year}</div>
          </div>
        );
      }
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as RegistrationInvoiceDto['status'];
        return (
          <Badge variant={getStatusVariant(status)} className="capitalize">
            {status}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.getValue('totalAmount'))}
        </div>
      )
    },
    {
      accessorKey: 'paidAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Paid" />
      ),
      cell: ({ row }) => (
        <div className="text-green-600 font-medium">
          {formatCurrency(row.getValue('paidAmount'))}
        </div>
      )
    },
    {
      accessorKey: 'balanceOwed',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Balance" />
      ),
      cell: ({ row }) => {
        const balance = row.getValue('balanceOwed') as number;
        return (
          <div className={cn(
            'font-medium',
            balance > 0 ? 'text-orange-600' : 'text-green-600'
          )}>
            {formatCurrency(balance)}
          </div>
        );
      }
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt') as Date | string | undefined;
        return (
          <div className="text-sm text-muted-foreground">
            {createdAt ? formatDate(typeof createdAt === 'string' ? new Date(createdAt) : createdAt) : '-'}
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const invoice = row.original;

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontalIcon className="size-4" />
                  <span className="sr-only">Open actions menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem
                  onClick={() => {
                    NiceModal.show(InvoiceDetailsModal, { invoice });
                  }}
                >
                  <EyeIcon className="mr-2 size-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      await downloadInvoicePDF(invoice);
                      toast.success('Invoice PDF downloaded successfully');
                    } catch (error) {
                      console.error('Error downloading PDF:', error);
                      toast.error('Failed to download invoice PDF');
                    }
                  }}
                >
                  <DownloadIcon className="mr-2 size-4" />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(invoice.invoiceNumber);
                      toast.success('Invoice number copied to clipboard');
                    } catch (error) {
                      console.error('Error copying to clipboard:', error);
                      toast.error('Failed to copy invoice number');
                    }
                  }}
                >
                  Copy Invoice #
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data: filteredInvoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters
    }
  });

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={(table.getColumn('invoiceNumber')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('invoiceNumber')?.setFilterValue(event.target.value)
            }
            className="pl-10"
          />
        </div>
        <Select value={eventYearFilter} onValueChange={setEventYearFilter}>
          <SelectTrigger className="w-[200px]">
            <FilterIcon className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by event year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Event Years</SelectItem>
            {availableEventYears.map((eventYear) => (
              <SelectItem key={eventYear.id} value={eventYear.id}>
                {eventYear.year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data table */}
      <DataTable table={table} />
      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}
