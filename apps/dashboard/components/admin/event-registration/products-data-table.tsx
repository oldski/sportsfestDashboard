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
import { EditIcon, InfinityIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react';

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

import { formatCurrency } from '~/lib/formatters';
import { useProductDialog } from '~/components/admin/event-registration/product-dialog-provider';
import type { ProductWithDetails } from '~/actions/admin/get-products';

const columnHelper = createColumnHelper<ProductWithDetails>();

const columns = [
  columnHelper.accessor('name', {
    id: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
    meta: {
      title: 'Product Name'
    }
  }),
  columnHelper.accessor('categoryName', {
    id: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue('category')}</div>
    ),
    meta: {
      title: 'Category'
    }
  }),
  columnHelper.accessor('type', {
    id: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">
        {(row.getValue('type') as string).replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
      </Badge>
    ),
    meta: {
      title: 'Product Type'
    }
  }),
  columnHelper.accessor('eventYear', {
    id: 'eventYear',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event Year" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('eventYear')}</div>
    ),
    meta: {
      title: 'Event Year'
    }
  }),
  columnHelper.accessor('basePrice', {
    id: 'basePrice',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Full Price" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{formatCurrency(row.getValue('basePrice'))}</div>
    ),
    meta: {
      title: 'Base Price'
    }
  }),
  columnHelper.accessor('depositAmount', {
    id: 'depositAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deposit" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{formatCurrency(row.getValue('depositAmount') || 0)}</div>
    ),
    meta: {
      title: 'Deposit Amount'
    }
  }),
  columnHelper.accessor('maxQuantityPerOrg', {
    id: 'maxQuantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Max Qty" />
    ),
    cell: ({ row }) => {
      const maxQty = row.getValue('maxQuantity') as number | null;
      return maxQty ? (
        <Badge variant="destructive" className="text-xs">
          {maxQty}
        </Badge>
      ) : (
        <InfinityIcon className="h-4 w-4 text-muted-foreground" />
      );
    },
    meta: {
      title: 'Max Quantity'
    }
  }),
  columnHelper.accessor('status', {
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge
        variant={row.getValue('status') === 'active' ? 'default' : 'secondary'}
        className="capitalize"
      >
        {row.getValue('status')}
      </Badge>
    ),
    meta: {
      title: 'Status'
    }
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original;
      const { openEditDialog, openDeleteDialog } = useProductDialog();

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
            <DropdownMenuItem onClick={() => openEditDialog(product.id)}>
              <EditIcon className="mr-2 size-4" />
              Edit product
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openDeleteDialog(product)}
              className="text-destructive focus:text-destructive"
            >
              <TrashIcon className="mr-2 size-4" />
              Delete product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  })
];

export interface ProductsDataTableProps {
  products: ProductWithDetails[];
}

export function ProductsDataTable({ products }: ProductsDataTableProps): React.JSX.Element {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data: products,
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
          placeholder="Search products..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <DataTableExport
            table={table}
            filename="products"
            title="SportsFest Products"
          />
          <DataTableColumnOptionsHeader table={table} />
        </div>
      </div>
      <DataTable table={table} fixedHeader />
      <DataTablePagination table={table} />
    </div>
  );
}
