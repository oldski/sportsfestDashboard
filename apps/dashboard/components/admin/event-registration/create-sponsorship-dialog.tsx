'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { DollarSignIcon, LoaderIcon } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';
import { toast } from '@workspace/ui/components/sonner';

import { useCreateSponsorshipDialog } from './create-sponsorship-dialog-provider';
import { createSponsorshipInvoice } from '~/actions/admin/create-sponsorship-invoice';
import { getOrganizationsForSelect, type OrganizationOption } from '~/actions/admin/get-organizations';

// Client-side fee calculation (mirrors server-side logic)
function calculateProcessingFee(baseAmount: number): number {
  return Math.round((baseAmount * 0.029 + 0.30) * 100) / 100;
}

function calculateTotal(baseAmount: number): number {
  return Math.round((baseAmount + calculateProcessingFee(baseAmount)) * 100) / 100;
}

const sponsorshipSchema = z.object({
  organizationId: z.string().uuid('Please select an organization'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  baseAmount: z.number().min(1, 'Amount must be at least $1').max(1000000, 'Amount cannot exceed $1,000,000')
});

type SponsorshipFormData = z.infer<typeof sponsorshipSchema>;

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

function SponsorshipForm({
  onSubmit,
  onCancel
}: {
  onSubmit: (data: SponsorshipFormData) => Promise<void>;
  onCancel: () => void;
}): React.JSX.Element {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [organizations, setOrganizations] = React.useState<OrganizationOption[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = React.useState(true);

  const form = useForm<SponsorshipFormData>({
    resolver: zodResolver(sponsorshipSchema) as any,
    defaultValues: {
      organizationId: '',
      description: '',
      baseAmount: 0
    }
  });

  // Fetch organizations
  React.useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoadingOrganizations(true);
        const orgs = await getOrganizationsForSelect();
        setOrganizations(orgs);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        toast.error('Failed to load organizations');
      } finally {
        setIsLoadingOrganizations(false);
      }
    };

    fetchOrganizations();
  }, []);

  const watchBaseAmount = form.watch('baseAmount');
  const processingFee = watchBaseAmount > 0 ? calculateProcessingFee(watchBaseAmount) : 0;
  const totalAmount = watchBaseAmount > 0 ? calculateTotal(watchBaseAmount) : 0;

  const handleSubmit = async (data: SponsorshipFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
    } catch (_error) {
      // Error is handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pb-4">
        {/* Organization Select */}
        <FormField
          control={form.control}
          name="organizationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoadingOrganizations}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingOrganizations
                          ? 'Loading organizations...'
                          : 'Select an organization'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the organization to invoice for sponsorship
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
            <h4 className="text-sm font-medium text-muted-foreground">Invoice Preview</h4>
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
              The processing fee ensures you receive the full sponsorship amount after Stripe fees.
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="sticky bottom-0 bg-background pt-4 border-t mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoadingOrganizations}>
            {isSubmitting ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Creating Invoice...
              </>
            ) : (
              'Create Sponsorship Invoice'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function CreateSponsorshipDialog(): React.JSX.Element {
  const { isOpen, closeDialog, onSuccess: onSuccessRef } = useCreateSponsorshipDialog();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (data: SponsorshipFormData) => {
    try {
      const result = await createSponsorshipInvoice(data);

      if (result.success) {
        toast.success(`Sponsorship invoice ${result.invoiceNumber} created and sent successfully`);

        // Refresh the table data
        if (onSuccessRef.current) {
          onSuccessRef.current();
        }

        closeDialog();
      } else {
        toast.error(result.error || 'Failed to create sponsorship invoice');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating sponsorship invoice:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (!errorMessage.includes('Failed to')) {
        toast.error('Failed to create sponsorship invoice. Please try again.');
      }
      throw error;
    }
  };

  if (!mounted) {
    return <></>;
  }

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-lg w-full max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Create Sponsorship Invoice</DialogTitle>
            <DialogDescription>
              Create a sponsorship invoice for an organization. The invoice will be emailed to the organization&apos;s admins.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1">
            <SponsorshipForm
              onSubmit={handleSubmit}
              onCancel={closeDialog}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="text-left flex-shrink-0">
          <DrawerTitle>Create Sponsorship Invoice</DrawerTitle>
          <DrawerDescription>
            Create a sponsorship invoice for an organization. The invoice will be emailed to the organization&apos;s admins.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 flex-1 overflow-y-auto">
          <SponsorshipForm
            onSubmit={handleSubmit}
            onCancel={closeDialog}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
