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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Input } from '@workspace/ui/components/input';
import { toast } from '@workspace/ui/components/sonner';
import { cn } from '@workspace/ui/lib/utils';

import { OrderDetailsModal } from '~/components/organizations/slug/registration/order-details-modal';
import { generateOrderPDF } from '~/components/organizations/slug/registration/generate-order-pdf';
import type { RegistrationOrderDto } from '~/types/dtos/registration-order-dto';

export type OrdersDataTableProps = {
  orders: RegistrationOrderDto[];
  autoOpenOrderId?: string;
  organizationName: string;
};

// Status badge variant mapping
const getStatusVariant = (status: RegistrationOrderDto['status']) => {
  switch (status) {
    case 'fully_paid':
      return 'default'; // Green
    case 'deposit_paid':
      return 'secondary'; // Blue
    case 'payment_processing':
      return 'secondary'; // Blue - indicates payment is in progress
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
  orders,
  autoOpenOrderId,
  organizationName
}: OrdersDataTableProps): React.JSX.Element {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'createdAt', desc: true } // Default to newest first
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [eventYearFilter, setEventYearFilter] = React.useState<string>('all');

  // Get unique event years from orders
  const availableEventYears = React.useMemo(() => {
    const eventYearMap = new Map();
    orders.forEach(order => {
      if (!eventYearMap.has(order.eventYear.id)) {
        eventYearMap.set(order.eventYear.id, order.eventYear);
      }
    });
    return Array.from(eventYearMap.values()).sort((a, b) => b.year - a.year);
  }, [orders]);

  // Apply event year filter and hide pending $0 orders
  const filteredOrders = React.useMemo(() => {
    // First filter out pending orders with nothing paid (abandoned cart orders)
    // But keep sponsorship orders visible (they're pending but need payment)
    const validOrders = orders.filter(order => {
      // Always show sponsorship orders
      if (order.isSponsorship) {
        return true;
      }
      // Hide pending orders that haven't been paid (abandoned carts)
      // These are orders where status is pending AND no payments have been made
      if (order.status === 'pending') {
        const totalPaid = order.payments.reduce((sum, payment) => sum + payment.amount, 0);
        if (totalPaid === 0) {
          return false; // Hide abandoned cart orders
        }
      }
      return true;
    });

    // Then apply event year filter
    if (eventYearFilter === 'all') return validOrders;
    return validOrders.filter(order => order.eventYear.id === eventYearFilter);
  }, [orders, eventYearFilter]);

  // Auto-open order dialog if autoOpenOrderId is provided
  React.useEffect(() => {
    if (autoOpenOrderId && orders.length > 0) {
      const orderToOpen = orders.find(order => order.id === autoOpenOrderId);
      if (orderToOpen) {
        NiceModal.show(OrderDetailsModal, { order: orderToOpen });
      }
    }
  }, [autoOpenOrderId, orders]);

  const columns: ColumnDef<RegistrationOrderDto>[] = [
    {
      accessorKey: 'orderNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order #" />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-mono text-sm">
            {row.getValue('orderNumber')}
          </div>
          {row.original.isSponsorship && (
            <Badge variant="secondary" className="text-xs">
              Sponsorship
            </Badge>
          )}
        </div>
      )
    },
    {
      accessorKey: 'eventYear',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Event Year" />
      ),
      cell: ({ row }) => {
        const eventYear = row.getValue('eventYear') as RegistrationOrderDto['eventYear'];
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
          <div className="text-right flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                NiceModal.show(OrderDetailsModal, { order });
              }}
            >
              <EyeIcon className="size-4" />
              <span className="sr-only">View Details</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await generateOrderPDF(order, organizationName);
                  toast.success('Order PDF downloaded successfully');
                } catch (error) {
                  console.error('Error downloading PDF:', error);
                  toast.error('Failed to download order PDF');
                }
              }}
            >
              <DownloadIcon className="size-4" />
              <span className="sr-only">Download PDF</span>
            </Button>
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data: filteredOrders,
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
      <div className="overflow-x-auto">
        <DataTable table={table} className="min-w-[800px]" />
      </div>
      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}
