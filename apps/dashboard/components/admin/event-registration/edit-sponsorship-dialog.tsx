'use client';

import * as React from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { DollarSignIcon, LoaderIcon, PencilIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@workspace/ui/components/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from '@workspace/ui/components/drawer';
import {
  FormProvider as Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';
import { toast } from '@workspace/ui/components/sonner';

import { updateSponsorship } from '~/actions/admin/update-sponsorship';
import type { SponsorshipData } from '~/actions/admin/get-sponsorships';

function calculateProcessingFee(baseAmount: number): number {
  return Math.round((baseAmount * 0.029 + 0.30) * 100) / 100;
}

function calculateTotal(baseAmount: number): number {
  return Math.round((baseAmount + calculateProcessingFee(baseAmount)) * 100) / 100;
}

const editSponsorshipSchema = z.object({
  baseAmount: z.number().min(1, 'Amount must be at least $1').max(1000000, 'Amount cannot exceed $1,000,000'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional()
});

type EditSponsorshipFormData = z.infer<typeof editSponsorshipSchema>;

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

interface EditSponsorshipFormProps {
  sponsorship: SponsorshipData;
  onSubmit: (data: EditSponsorshipFormData) => Promise<void>;
  onCancel: () => void;
}

function EditSponsorshipForm({ sponsorship, onSubmit, onCancel }: EditSponsorshipFormProps): React.JSX.Element {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<EditSponsorshipFormData>({
    resolver: zodResolver(editSponsorshipSchema) as any,
    defaultValues: {
      baseAmount: sponsorship.baseAmount,
      description: sponsorship.description || ''
    }
  });

  const watchBaseAmount = form.watch('baseAmount');
  const processingFee = watchBaseAmount > 0 ? calculateProcessingFee(watchBaseAmount) : 0;
  const totalAmount = watchBaseAmount > 0 ? calculateTotal(watchBaseAmount) : 0;

  const handleSubmit = async (data: EditSponsorshipFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
    } catch (_error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pb-4">
        {/* Organization (Read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Organization</label>
          <div className="px-3 py-2 bg-muted rounded-md text-sm">
            {sponsorship.organizationName}
          </div>
          <p className="text-xs text-muted-foreground">
            Organization cannot be changed after creation
          </p>
        </div>

        {/* Invoice Number (Read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Invoice Number</label>
          <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono">
            {sponsorship.invoiceNumber}
          </div>
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Gold Sponsorship, Event Banner Sponsor"
                  className="resize-none"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional description to appear on the invoice
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Base Amount */}
        <FormField
          control={form.control}
          name="baseAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sponsorship Amount *</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                    <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    max="1000000"
                    placeholder="10000.00"
                    className="pl-9"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </FormControl>
              <FormDescription>
                The sponsorship amount the client receives (before processing fees)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fee Breakdown (Read-only) */}
        {watchBaseAmount > 0 && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Updated Invoice Preview</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sponsorship Amount</span>
                <span>{formatCurrency(watchBaseAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Processing Fee (2.9% + $0.30)</span>
                <span>{formatCurrency(processingFee)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total Due</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              An updated invoice email will be sent to the organization admins.
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="sticky bottom-0 bg-background pt-4 border-t mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <PencilIcon className="mr-2 h-4 w-4" />
                Update Sponsorship
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface EditSponsorshipDialogProps {
  sponsorship: SponsorshipData;
  onSuccess?: () => void;
}

export const EditSponsorshipDialog = NiceModal.create<EditSponsorshipDialogProps>(
  ({ sponsorship, onSuccess }) => {
    const modal = useModal();
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const handleSubmit = async (data: EditSponsorshipFormData) => {
      try {
        const result = await updateSponsorship({
          orderId: sponsorship.orderId,
          baseAmount: data.baseAmount,
          description: data.description
        });

        if (result.success) {
          toast.success('Sponsorship updated successfully. Updated invoice email sent.');
          onSuccess?.();
          modal.hide();
        } else {
          toast.error(result.error || 'Failed to update sponsorship');
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Error updating sponsorship:', error);
        throw error;
      }
    };

    const handleClose = () => {
      modal.hide();
    };

    if (!mounted) {
      return null;
    }

    if (isDesktop) {
      return (
        <Dialog open={modal.visible} onOpenChange={(open) => !open && handleClose()}>
          <DialogContent className="sm:max-w-lg w-full max-h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Edit Sponsorship</DialogTitle>
              <DialogDescription>
                Update the sponsorship details. An updated invoice email will be sent to the organization.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              <EditSponsorshipForm
                sponsorship={sponsorship}
                onSubmit={handleSubmit}
                onCancel={handleClose}
              />
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Drawer open={modal.visible} onOpenChange={(open) => !open && handleClose()}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="text-left flex-shrink-0">
            <DrawerTitle>Edit Sponsorship</DrawerTitle>
            <DrawerDescription>
              Update the sponsorship details. An updated invoice email will be sent to the organization.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 flex-1 overflow-y-auto">
            <EditSponsorshipForm
              sponsorship={sponsorship}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
);
