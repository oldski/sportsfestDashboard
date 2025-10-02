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
import { TicketIcon, EditIcon, TrashIcon, DownloadIcon, ToggleLeftIcon, ToggleRightIcon, LoaderIcon } from 'lucide-react';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';

import { formatCurrency, formatDate } from '~/lib/formatters';
import type { CouponData } from '~/actions/admin/get-coupons-simple';
import { exportToCSV, exportToExcel } from '@workspace/ui/lib/data-table-utils';
import { toggleCouponStatus, updateCoupon, deleteCoupon } from '~/actions/admin/coupon-actions';
import { useCreateCouponDialog } from './create-coupon-dialog-provider';
import { toast } from '@workspace/ui/components/sonner';

const columnHelper = createColumnHelper<CouponData>();

// Custom DataTableExport component for admin coupons
function AdminCouponsDataTableExport({
  coupons,
  table,
}: {
  coupons: CouponData[];
  table: any;
}): React.JSX.Element {
  const filename = `sportsfest-coupons-${new Date().toISOString().slice(0, 10)}`;
  const title = 'SportsFest Dashboard Coupons';

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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface CouponDataTableProps {
  data: CouponData[];
  onDataChange?: () => void;
}

export function CouponDataTable({ data, onDataChange }: CouponDataTableProps): React.JSX.Element {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'createdAt', desc: true } // Default sort by creation date (newest first)
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [isToggling, setIsToggling] = React.useState<string | null>(null);
  const [deletingCoupon, setDeletingCoupon] = React.useState<{ id: string; code: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { setEditingCoupon, openDialog, onDataChange: onDataChangeRef } = useCreateCouponDialog();

  // Set the onDataChange callback in the context so the dialog can use it
  React.useEffect(() => {
    onDataChangeRef.current = onDataChange || null;
  }, [onDataChange, onDataChangeRef]);

  const handleToggleStatus = React.useCallback(async (couponId: string) => {
    setIsToggling(couponId);
    try {
      const result = await toggleCouponStatus(couponId);
      if (result.success) {
        toast.success('Coupon status updated successfully');
        onDataChange?.();
      } else {
        toast.error(result.error || 'Failed to update coupon status');
      }
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      toast.error('Failed to update coupon status. Please try again.');
    } finally {
      setIsToggling(null);
    }
  }, [onDataChange]);

  const handleEditCoupon = React.useCallback((couponId: string) => {
    setEditingCoupon(couponId);
    openDialog();
  }, [setEditingCoupon, openDialog]);

  const handleDeleteCoupon = React.useCallback((coupon: { id: string; code: string; currentUses: number }) => {
    if (coupon.currentUses > 0) {
      toast.error('Cannot delete coupon that has been used. Disable it instead.');
      return;
    }
    setDeletingCoupon({ id: coupon.id, code: coupon.code });
  }, []);

  const confirmDelete = React.useCallback(async () => {
    if (!deletingCoupon) return;

    setIsDeleting(true);
    try {
      const result = await deleteCoupon(deletingCoupon.id);
      if (result.success) {
        toast.success(`Coupon "${deletingCoupon.code}" deleted successfully`);
        onDataChange?.();
      } else {
        toast.error(result.error || 'Failed to delete coupon');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeletingCoupon(null);
    }
  }, [deletingCoupon, onDataChange]);

  const cancelDelete = React.useCallback(() => {
    setDeletingCoupon(null);
  }, []);
  const [globalFilter, setGlobalFilter] = React.useState('');

  // Define columns
  const columns = React.useMemo(() => {
    const baseColumns = [
      columnHelper.accessor('code', {
        id: 'code',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Coupon Code" />
        ),
        cell: ({ row }) => (
          <div className="font-mono text-sm font-medium">
            {row.getValue('code')}
          </div>
        ),
        meta: {
          title: 'Coupon Code'
        }
      }),
      columnHelper.accessor('discountType', {
        id: 'discountType',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Discount" />
        ),
        cell: ({ row }) => {
          const discountType = row.getValue('discountType') as string;
          const discountValue = row.original.discountValue;
          const isPercentage = discountType === 'percentage';

          return (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {isPercentage
                  ? `${discountValue}% off`
                  : `${formatCurrency(discountValue)} off`
                }
              </Badge>
            </div>
          );
        },
        meta: {
          title: 'Discount'
        }
      }),
      columnHelper.accessor('organizationRestriction', {
        id: 'restriction',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Organization" />
        ),
        cell: ({ row }) => {
          const restriction = row.getValue('restriction') as string;
          const orgNames = row.original.restrictedOrganizationNames;

          if (restriction === 'anyone') {
            return (
              <Badge variant="outline" className="text-xs">
                Anyone
              </Badge>
            );
          } else {
            return (
              <div className="space-y-1">
                <Badge variant="default" className="text-xs">
                  Specific
                </Badge>
                {orgNames && orgNames.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {orgNames.slice(0, 2).join(', ')}
                    {orgNames.length > 2 && ` +${orgNames.length - 2} more`}
                  </div>
                )}
              </div>
            );
          }
        },
        meta: {
          title: 'Organization Restriction'
        }
      }),
      columnHelper.accessor('currentUses', {
        id: 'usage',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Usage" />
        ),
        cell: ({ row }) => {
          const currentUses = row.getValue('usage') as number;
          const maxUses = row.original.maxUses;
          const percentage = maxUses > 0 ? (currentUses / maxUses) * 100 : 0;

          return (
            <div className="space-y-1">
              <div className="text-sm font-medium">
                {currentUses} / {maxUses}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        },
        meta: {
          title: 'Usage Count'
        }
      }),
      columnHelper.accessor('isActive', {
        id: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const isActive = row.getValue('status') as boolean;
          const currentUses = row.original.currentUses;
          const maxUses = row.original.maxUses;
          const expiresAt = row.original.expiresAt;
          const now = new Date();
          const isExpired = expiresAt && new Date(expiresAt) <= now;
          const isUsedUp = currentUses >= maxUses;

          let status = 'Active';
          let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';

          if (!isActive) {
            status = 'Disabled';
            variant = 'secondary';
          } else if (isExpired) {
            status = 'Expired';
            variant = 'destructive';
          } else if (isUsedUp) {
            status = 'Used Up';
            variant = 'outline';
          }

          return (
            <Badge variant={variant} className="text-xs">
              {status}
            </Badge>
          );
        },
        meta: {
          title: 'Status'
        }
      }),
      columnHelper.accessor('expiresAt', {
        id: 'expiresAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Expires" />
        ),
        cell: ({ row }) => {
          const expiresAt = row.getValue('expiresAt') as string | undefined;
          const registrationClose = row.original.registrationClose;

          const now = new Date();

          if (!expiresAt) {
            // Use registration close date when no specific expiration is set
            if (!registrationClose) {
              return (
                <span className="text-sm text-muted-foreground">No expiration</span>
              );
            }

            const regCloseDate = new Date(registrationClose);

            // Check if the date is valid
            if (isNaN(regCloseDate.getTime())) {
              return (
                <span className="text-sm text-muted-foreground">No expiration</span>
              );
            }

            const isExpired = regCloseDate <= now;

            return (
              <div className="text-sm">
                {formatDate(registrationClose)}
              </div>
            );
          }

          const expDate = new Date(expiresAt);
          const isExpired = expDate <= now;

          return (
            <div className="text-sm">
              {formatDate(expiresAt)}
            </div>
          );
        },
        meta: {
          title: 'Expiration Date'
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
      }),
    ];

    // Add actions column
    const actionsColumn = columnHelper.display({
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleToggleStatus(coupon.id)}
                    disabled={isToggling === coupon.id}
                  >
                    {isToggling === coupon.id ? (
                      <LoaderIcon className="h-4 w-4 animate-spin" />
                    ) : coupon.isActive ? (
                      <ToggleRightIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <ToggleLeftIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{coupon.isActive ? 'Disable' : 'Enable'} Coupon</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEditCoupon(coupon.id)}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Coupon</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 ${
                      coupon.currentUses > 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'hover:text-red-600'
                    }`}
                    onClick={() => {
                      handleDeleteCoupon({
                        id: coupon.id,
                        code: coupon.code,
                        currentUses: coupon.currentUses
                      });
                    }}
                    disabled={coupon.currentUses > 0}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {coupon.currentUses > 0
                      ? 'Cannot delete used coupon'
                      : 'Delete Coupon'
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        );
      }
    });

    baseColumns.push(actionsColumn as any);

    return baseColumns;
  }, [handleToggleStatus, handleEditCoupon, isToggling]);

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
        <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No coupons found</h3>
        <p className="text-sm text-muted-foreground">
          Create your first coupon to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search coupons..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <AdminCouponsDataTableExport
            coupons={data}
            table={table}
          />
          <DataTableColumnOptionsHeader table={table} />
        </div>
      </div>
      <DataTable table={table} fixedHeader />
      <div className="rounded-b-xl overflow-hidden">
        <DataTablePagination table={table} />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingCoupon} onOpenChange={(open) => !open && cancelDelete()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the coupon <strong>"{deletingCoupon?.code}"</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Coupon'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
