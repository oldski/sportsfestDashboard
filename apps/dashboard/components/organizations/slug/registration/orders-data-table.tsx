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
  SearchIcon
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
import { Input } from '@workspace/ui/components/input';
import { toast } from '@workspace/ui/components/sonner';
import { cn } from '@workspace/ui/lib/utils';

import { OrderDetailsModal } from '~/components/organizations/slug/registration/order-details-modal';
import { downloadOrderPDF } from '~/lib/pdf-utils';
import type { RegistrationOrderDto } from '~/types/dtos/registration-order-dto';

export type OrdersDataTableProps = {
  orders: RegistrationOrderDto[];
};

// Status badge variant mapping
const getStatusVariant = (status: RegistrationOrderDto['status']) => {
  switch (status) {
    case 'fully_paid':
      return 'default'; // Green
    case 'deposit_paid':
      return 'secondary'; // Blue
    case 'pending':
      return 'outline'; // Gray
    case 'cancelled':
      return 'destructive'; // Red
    case 'refunded':
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

export function OrdersDataTable({
  orders
}: OrdersDataTableProps): React.JSX.Element {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'createdAt', desc: true } // Default to newest first
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const columns: ColumnDef<RegistrationOrderDto>[] = [
    {
      accessorKey: 'orderNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order #" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.getValue('orderNumber')}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as RegistrationOrderDto['status'];
        return (
          <Badge variant={getStatusVariant(status)} className="capitalize">
            {status.replace('_', ' ')}
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
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => {
        const items = row.getValue('items') as RegistrationOrderDto['items'];
        const itemCount = items.length;
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

        return (
          <div className="text-sm">
            <span className="font-medium">{itemCount}</span> item{itemCount !== 1 ? 's' : ''}
            <span className="text-muted-foreground"> ({totalQuantity} qty)</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'payments',
      header: 'Payments',
      cell: ({ row }) => {
        const payments = row.getValue('payments') as RegistrationOrderDto['payments'];
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const paymentCount = payments.length;

        return (
          <div className="text-sm">
            <div className="font-medium text-green-600">
              {formatCurrency(totalPaid)}
            </div>
            {paymentCount > 0 && (
              <div className="text-muted-foreground">
                {paymentCount} payment{paymentCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'invoices',
      header: 'Invoices',
      cell: ({ row }) => {
        const invoices = row.getValue('invoices') as RegistrationOrderDto['invoices'];
        const invoiceCount = invoices.length;
        const totalBalance = invoices.reduce((sum, invoice) => sum + invoice.balanceOwed, 0);

        return (
          <div className="text-sm">
            <div className="font-medium">
              {invoiceCount} invoice{invoiceCount !== 1 ? 's' : ''}
            </div>
            {totalBalance > 0 && (
              <div className="text-orange-600 font-medium">
                {formatCurrency(totalBalance)} owed
              </div>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.getValue('createdAt'))}
        </div>
      )
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const order = row.original;

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
                    NiceModal.show(OrderDetailsModal, { order });
                  }}
                >
                  <EyeIcon className="mr-2 size-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      await downloadOrderPDF(order);
                      toast.success('Order PDF downloaded successfully');
                    } catch (error) {
                      console.error('Error downloading PDF:', error);
                      toast.error('Failed to download order PDF');
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
                      await navigator.clipboard.writeText(order.orderNumber);
                      toast.success('Order number copied to clipboard');
                    } catch (error) {
                      console.error('Error copying to clipboard:', error);
                      toast.error('Failed to copy order number');
                    }
                  }}
                >
                  Copy Order #
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data: orders,
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
            placeholder="Search orders..."
            value={(table.getColumn('orderNumber')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('orderNumber')?.setFilterValue(event.target.value)
            }
            className="pl-10"
          />
        </div>
        {/* TODO: Add status filter dropdown */}
      </div>

      {/* Data table */}
      <DataTable table={table} />
      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}
