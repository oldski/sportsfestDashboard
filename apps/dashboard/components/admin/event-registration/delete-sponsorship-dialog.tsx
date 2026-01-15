'use client';

import * as React from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { AlertTriangleIcon, LoaderIcon, Trash2Icon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@workspace/ui/components/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from '@workspace/ui/components/drawer';
import { Textarea } from '@workspace/ui/components/textarea';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';
import { toast } from '@workspace/ui/components/sonner';

import { deleteSponsorship } from '~/actions/admin/delete-sponsorship';
import { formatCurrency } from '~/lib/formatters';
import type { SponsorshipData } from '~/actions/admin/get-sponsorships';

interface DeleteSponsorshipDialogProps {
  sponsorship: SponsorshipData;
  onSuccess?: () => void;
}

export const DeleteSponsorshipDialog = NiceModal.create<DeleteSponsorshipDialogProps>(
  ({ sponsorship, onSuccess }) => {
    const modal = useModal();
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const [mounted, setMounted] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [reason, setReason] = React.useState('');

    const hasPayments = sponsorship.paidAmount > 0;

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const handleDelete = async () => {
      setIsDeleting(true);
      try {
        const result = await deleteSponsorship({
          orderId: sponsorship.orderId,
          reason: reason || undefined
        });

        if (result.success) {
          if (result.action === 'cancelled') {
            toast.success('Sponsorship has been cancelled');
          } else {
            toast.success('Sponsorship has been deleted');
          }
          onSuccess?.();
          modal.hide();
        } else {
          toast.error(result.error || 'Failed to delete sponsorship');
        }
      } catch (error) {
        console.error('Error deleting sponsorship:', error);
        toast.error('Failed to delete sponsorship');
      } finally {
        setIsDeleting(false);
      }
    };

    const handleClose = () => {
      if (!isDeleting) {
        modal.hide();
      }
    };

    if (!mounted) {
      return null;
    }

    const content = (
      <div className="space-y-4">
        {/* Warning Message */}
        <div className={`flex items-start gap-3 p-4 rounded-lg ${hasPayments ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
          <AlertTriangleIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${hasPayments ? 'text-amber-600' : 'text-red-600'}`} />
          <div className="space-y-1">
            {hasPayments ? (
              <>
                <p className="text-sm font-medium text-amber-800">
                  This sponsorship has received payments
                </p>
                <p className="text-sm text-amber-700">
                  It will be marked as <strong>cancelled</strong> instead of deleted.
                  The payment record will be preserved for accounting purposes.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-red-800">
                  This action cannot be undone
                </p>
                <p className="text-sm text-red-700">
                  This sponsorship has no payments and will be permanently deleted.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Sponsorship Details */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Invoice #</span>
            <span className="font-mono">{sponsorship.invoiceNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Organization</span>
            <span className="font-medium">{sponsorship.organizationName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Amount</span>
            <span>{formatCurrency(sponsorship.totalAmount)}</span>
          </div>
          {hasPayments && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="text-green-600">{formatCurrency(sponsorship.paidAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="capitalize">{sponsorship.status}</span>
          </div>
        </div>

        {/* Cancellation Reason (optional) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Reason (Optional)
          </label>
          <Textarea
            placeholder="Enter a reason for deletion/cancellation..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="resize-none"
            rows={2}
            disabled={isDeleting}
          />
          <p className="text-xs text-muted-foreground">
            This will be recorded in the audit trail
          </p>
        </div>
      </div>
    );

    const footer = (
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              {hasPayments ? 'Cancelling...' : 'Deleting...'}
            </>
          ) : (
            <>
              <Trash2Icon className="mr-2 h-4 w-4" />
              {hasPayments ? 'Cancel Sponsorship' : 'Delete Sponsorship'}
            </>
          )}
        </Button>
      </div>
    );

    if (isDesktop) {
      return (
        <Dialog open={modal.visible} onOpenChange={(open) => !open && handleClose()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {hasPayments ? 'Cancel Sponsorship' : 'Delete Sponsorship'}
              </DialogTitle>
              <DialogDescription>
                {hasPayments
                  ? 'Are you sure you want to cancel this sponsorship?'
                  : 'Are you sure you want to delete this sponsorship?'}
              </DialogDescription>
            </DialogHeader>
            {content}
            <DialogFooter>
              {footer}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Drawer open={modal.visible} onOpenChange={(open) => !open && handleClose()}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>
              {hasPayments ? 'Cancel Sponsorship' : 'Delete Sponsorship'}
            </DrawerTitle>
            <DrawerDescription>
              {hasPayments
                ? 'Are you sure you want to cancel this sponsorship?'
                : 'Are you sure you want to delete this sponsorship?'}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            {content}
          </div>
          <DrawerFooter>
            {footer}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
);
