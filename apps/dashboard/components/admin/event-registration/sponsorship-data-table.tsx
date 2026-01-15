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
  HeartHandshakeIcon,
  DownloadIcon,
  ExternalLinkIcon,
  EyeIcon,
  MailIcon,
  LoaderIcon,
  PencilIcon,
  Trash2Icon
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu';
import { Input } from '@workspace/ui/components/input';
import { toast } from '@workspace/ui/components/sonner';

import { formatCurrency, formatDateLong } from '~/lib/formatters';
import type { SponsorshipData } from '~/actions/admin/get-sponsorships';
import { resendSponsorshipEmail } from '~/actions/admin/resend-sponsorship-email';
import { InvoiceDetailsModal } from '~/components/organizations/slug/registration/invoice-details-modal';
import { useCreateSponsorshipDialog } from './create-sponsorship-dialog-provider';
import { EditSponsorshipDialog } from './edit-sponsorship-dialog';
import { DeleteSponsorshipDialog } from './delete-sponsorship-dialog';

// Action cell component to handle resend state
function SponsorshipActionCell({ sponsorship }: { sponsorship: SponsorshipData }) {
  const [isResending, setIsResending] = React.useState(false);

  // Can only edit if no payments have been made
  const canEdit = sponsorship.paidAmount === 0 && sponsorship.status !== 'paid' && sponsorship.status !== 'partial' && sponsorship.status !== 'cancelled';
  // Can delete/cancel any sponsorship that isn't already cancelled or fully paid
  const canDelete = sponsorship.status !== 'cancelled' && sponsorship.status !== 'paid';

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const result = await resendSponsorshipEmail(sponsorship.id);
      if (result.success) {
        toast.success(`Email resent to ${result.emailsSent} admin(s)`);
      } else {
        toast.error(result.error || 'Failed to resend email');
      }
    } catch (error) {
      toast.error('Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  const handleEdit = () => {
    NiceModal.show(EditSponsorshipDialog, {
      sponsorship,
      onSuccess: () => {
        window.location.reload();
      }
    });
  };

  const handleDelete = () => {
    NiceModal.show(DeleteSponsorshipDialog, {
      sponsorship,
      onSuccess: () => {
        window.location.reload();
      }
    });
  };

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
                  invoiceId: sponsorship.id,
                  organizationName: sponsorship.organizationName
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
              onClick={handleEdit}
              disabled={!canEdit}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{canEdit ? 'Edit Sponsorship' : 'Cannot edit after payment received'}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleResendEmail}
              disabled={isResending || sponsorship.status === 'cancelled' || sponsorship.status === 'paid'}
            >
              {isResending ? (
                <LoaderIcon className="h-4 w-4 animate-spin" />
              ) : (
                <MailIcon className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{sponsorship.status === 'cancelled' ? 'Cannot resend cancelled invoice' : sponsorship.status === 'paid' ? 'Invoice already paid' : 'Resend Email'}</p>
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
                  sponsorship.organizationSlug
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

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={!canDelete}
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{!canDelete
              ? (sponsorship.status === 'paid' ? 'Cannot cancel paid sponsorship' : 'Already cancelled')
              : (sponsorship.paidAmount > 0 ? 'Cancel Sponsorship' : 'Delete Sponsorship')
            }</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

const columnHelper = createColumnHelper<SponsorshipData>();

interface SponsorshipDataTableProps {
  data: SponsorshipData[];
}

export function SponsorshipDataTable({ data }: SponsorshipDataTableProps): React.JSX.Element {
  const { onSuccess } = useCreateSponsorshipDialog();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'createdAt', desc: true }
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  // Set up the onSuccess callback to refresh data
  React.useEffect(() => {
    onSuccess.current = () => {
      // This will trigger a page refresh through revalidatePath in the server action
      window.location.reload();
    };
    return () => {
      onSuccess.current = null;
    };
  }, [onSuccess]);

  const handleExportCSV = () => {
    try {
      const visibleRows = table.getFilteredRowModel().rows;
      const visibleSponsorships = visibleRows.map(row => row.original);

      const headers = ['Invoice #', 'Organization', 'Event Year', 'Description', 'Base Amount', 'Processing Fee', 'Total', 'Paid', 'Balance', 'Status', 'Created'];

      const csvRows = visibleSponsorships.map(s => [
        s.invoiceNumber,
        s.organizationName,
        s.eventYearName,
        s.description || '',
        s.baseAmount.toString(),
        s.processingFee.toString(),
        s.totalAmount.toString(),
        s.paidAmount.toString(),
        s.balanceOwed.toString(),
        s.status,
        s.createdAt
      ]);

      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sponsorships-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Sponsorships CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  const columns = React.useMemo(() => [
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
    columnHelper.accessor('eventYearName', {
      id: 'eventYear',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Event Year" />
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {row.getValue('eventYear')}
        </div>
      ),
      meta: {
        title: 'Event Year'
      }
    }),
    columnHelper.accessor('description', {
      id: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        const description = row.getValue('description') as string | null;
        return (
          <div className="text-sm text-muted-foreground max-w-[200px] truncate">
            {description || '—'}
          </div>
        );
      },
      meta: {
        title: 'Description'
      }
    }),
    columnHelper.accessor('baseAmount', {
      id: 'baseAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Base Amount" />
      ),
      cell: ({ row }) => (
        <div className="text-sm">{formatCurrency(row.getValue('baseAmount'))}</div>
      ),
      meta: {
        title: 'Base Amount'
      }
    }),
    columnHelper.accessor('processingFee', {
      id: 'processingFee',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fee" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{formatCurrency(row.getValue('processingFee'))}</div>
      ),
      meta: {
        title: 'Processing Fee'
      }
    }),
    columnHelper.accessor('totalAmount', {
      id: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{formatCurrency(row.getValue('totalAmount'))}</div>
      ),
      meta: {
        title: 'Total Amount'
      }
    }),
    columnHelper.accessor('balanceOwed', {
      id: 'balanceOwed',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Balance" />
      ),
      cell: ({ row }) => {
        const balanceOwed = row.getValue('balanceOwed') as number;
        const status = row.original.status;
        return (
          <span className={
            balanceOwed > 0
              ? status === 'overdue'
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
        const status = row.getValue('status') as string;
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
    columnHelper.accessor('createdAt', {
      id: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDateLong(row.getValue('createdAt'))}
        </div>
      ),
      meta: {
        title: 'Created Date'
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => {
        return <SponsorshipActionCell sponsorship={row.original} />;
      }
    })
  ], []);

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
        <HeartHandshakeIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No sponsorships found</h3>
        <p className="text-sm text-muted-foreground">
          Create your first sponsorship invoice to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search sponsorships..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm ml-5"
        />
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-sm">
                <DownloadIcon className="size-4 shrink-0" />
                Export
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
            </DropdownMenuContent>
          </DropdownMenu>
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
