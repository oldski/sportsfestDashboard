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
import { CopyIcon, EditIcon, EyeIcon, InfinityIcon, TrashIcon } from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  DataTable,
  DataTableColumnHeader,
  DataTableColumnOptionsHeader,
  DataTablePagination
} from '@workspace/ui/components/data-table';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@workspace/ui/components/tooltip';

import { formatCurrency } from '~/lib/formatters';
import { useProductDialog } from '~/components/admin/event-registration/product-dialog-provider';
import type { ProductWithDetails } from '~/actions/admin/get-products';

const columnHelper = createColumnHelper<ProductWithDetails>();

const READ_ONLY_TOOLTIP = 'Read-only — not the active event year';

function getColumns(activeEventYearId: string | null) {
  return [
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
      filterFn: (row, columnId, filterValue) =>
        Number(row.getValue(columnId)) === Number(filterValue),
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => {
        const product = row.original;
        const { openEditDialog, openViewDialog, openDeleteDialog, openCopyDialog } = useProductDialog();
        const isLocked = !!activeEventYearId && product.eventYearId !== activeEventYearId;

        const editButton = (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={isLocked}
            onClick={() => openEditDialog(product.id)}
            title={isLocked ? READ_ONLY_TOOLTIP : 'Edit product'}
          >
            <EditIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            <span className="sr-only">Edit product</span>
          </Button>
        );

        const deleteButton = (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={isLocked}
            onClick={() => openDeleteDialog(product)}
            title={isLocked ? READ_ONLY_TOOLTIP : 'Delete product'}
          >
            <TrashIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            <span className="sr-only">Delete product</span>
          </Button>
        );

        return (
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => openViewDialog(product.id)}
              title="View product"
            >
              <EyeIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              <span className="sr-only">View product</span>
            </Button>
            {isLocked ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>{editButton}</span>
                </TooltipTrigger>
                <TooltipContent>{READ_ONLY_TOOLTIP}</TooltipContent>
              </Tooltip>
            ) : (
              editButton
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => openCopyDialog(product.id)}
              title="Copy product to another event year"
            >
              <CopyIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              <span className="sr-only">Copy product</span>
            </Button>
            {isLocked ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>{deleteButton}</span>
                </TooltipTrigger>
                <TooltipContent>{READ_ONLY_TOOLTIP}</TooltipContent>
              </Tooltip>
            ) : (
              deleteButton
            )}
          </div>
        );
      }
    })
  ];
}

export interface ProductsDataTableProps {
  products: ProductWithDetails[];
  activeEventYearId: string | null;
}

export function ProductsDataTable({
  products,
  activeEventYearId
}: ProductsDataTableProps): React.JSX.Element {
  const yearOptions = React.useMemo(() => {
    const seen = new Map<string, { id: string; year: number; name: string }>();
    for (const p of products) {
      if (!seen.has(p.eventYearId)) {
        seen.set(p.eventYearId, {
          id: p.eventYearId,
          year: p.eventYear,
          name: p.eventYearName
        });
      }
    }
    return Array.from(seen.values()).sort((a, b) => b.year - a.year);
  }, [products]);

  const activeYearOption = React.useMemo(
    () => yearOptions.find((y) => y.id === activeEventYearId),
    [yearOptions, activeEventYearId]
  );

  const initialYear = activeYearOption?.year ?? yearOptions[0]?.year;

  const [selectedYear, setSelectedYear] = React.useState<number | undefined>(initialYear);

  const columns = React.useMemo(() => getColumns(activeEventYearId), [activeEventYearId]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    initialYear !== undefined ? [{ id: 'eventYear', value: initialYear }] : []
  );
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

  const handleYearChange = (value: string) => {
    const year = Number(value);
    setSelectedYear(year);
    table.getColumn('eventYear')?.setFilterValue(year);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search products..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="flex-1 lg:max-w-sm"
          />
          {/* Desktop: fluid-width year filter inline with search */}
          <div className="hidden lg:block">
            <Select
              value={selectedYear !== undefined ? String(selectedYear) : undefined}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-auto min-w-[180px]">
                <SelectValue placeholder="Event Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.year)}>
                    <span className="whitespace-nowrap">
                      {option.year} — {option.name}
                      {option.id === activeEventYearId ? ' (active)' : ''}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Mobile/tablet: column options sit on the right of the search row */}
          <div className="ml-auto lg:hidden">
            <DataTableColumnOptionsHeader table={table} />
          </div>
        </div>
        {/* Mobile/tablet: full-width year filter stacked beneath, year-only label */}
        <div className="lg:hidden">
          <Select
            value={selectedYear !== undefined ? String(selectedYear) : undefined}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Event Year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option.id} value={String(option.year)}>
                  {option.year}
                  {option.id === activeEventYearId ? ' (active)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Desktop: column options on the right */}
        <div className="hidden items-center space-x-2 lg:flex">
          <DataTableColumnOptionsHeader table={table} />
        </div>
      </div>
      <DataTable table={table} fixedHeader />
      <DataTablePagination table={table} />
    </div>
  );
}
