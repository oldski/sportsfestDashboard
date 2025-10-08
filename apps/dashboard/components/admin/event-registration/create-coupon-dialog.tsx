'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarIcon, PercentIcon, DollarSignIcon, LoaderIcon } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@workspace/ui/components/button';
import { Calendar } from '@workspace/ui/components/calendar';
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
import { Label } from '@workspace/ui/components/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@workspace/ui/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';
import { MultiSelect } from '@workspace/ui/components/multi-select';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';
import { cn } from '@workspace/ui/lib/utils';

import { useCreateCouponDialog } from './create-coupon-dialog-provider';
import { createCoupon, updateCoupon, getCouponById, type CouponFormData as CouponActionData } from '~/actions/admin/coupon-actions';
import { getOrganizationsForSelect, type OrganizationOption } from '~/actions/admin/get-organizations';
import { toast } from '@workspace/ui/components/sonner';

const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'Coupon code must be at least 3 characters')
    .max(50, 'Coupon code must be less than 50 characters')
    .regex(/^[A-Z0-9-_]+$/, 'Coupon code can only contain uppercase letters, numbers, hyphens, and underscores'),
  discountType: z.enum(['percentage', 'fixed_amount']),
  discountValue: z.number().min(0.01, 'Discount value must be greater than 0'),
  organizationRestriction: z.enum(['anyone', 'specific']),
  restrictedOrganizations: z.array(z.string()).optional(),
  maxUses: z.number().int().min(1, 'Max uses must be at least 1'),
  minimumOrderAmount: z.number().min(0, 'Minimum order amount must be 0 or greater').default(0),
  expiresAt: z.string().optional()
}).superRefine((data, ctx) => {
  // Validate percentage discount
  if (data.discountType === 'percentage') {
    if (data.discountValue < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage discount must be at least 1%',
        path: ['discountValue']
      });
    }
    if (data.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage discount cannot exceed 100%',
        path: ['discountValue']
      });
    }
  }
  // Validate fixed amount discount
  if (data.discountType === 'fixed_amount' && data.discountValue < 0.01) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Fixed amount discount must be at least $0.01',
      path: ['discountValue']
    });
  }
  // Validate organization restriction
  if (data.organizationRestriction === 'specific') {
    if (!data.restrictedOrganizations || data.restrictedOrganizations.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select at least one organization when using specific restriction',
        path: ['restrictedOrganizations']
      });
    }
  }
});

type CouponFormData = z.infer<typeof couponSchema>;

function CouponForm({
  onSubmit,
  onCancel,
  editingCouponId
}: {
  onSubmit: (data: CouponFormData) => Promise<void>;
  onCancel: () => void;
  editingCouponId?: string | null;
}): React.JSX.Element {
  const [isLoadingData, setIsLoadingData] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [organizations, setOrganizations] = React.useState<OrganizationOption[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = React.useState(true);
  const isEditMode = !!editingCouponId;

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema) as any,
    defaultValues: {
      code: '',
      discountType: 'percentage',
      discountValue: 100,
      organizationRestriction: 'anyone',
      restrictedOrganizations: [],
      maxUses: 1,
      minimumOrderAmount: 0,
      expiresAt: ''
    }
  });

  // Load existing coupon data when in edit mode
  React.useEffect(() => {
    if (editingCouponId) {
      const loadCouponData = async () => {
        setIsLoadingData(true);
        try {
          const result = await getCouponById(editingCouponId);
          if (result.success && result.data) {
            console.log('Received coupon data:', result.data);
            try {
              // Use setValue instead of reset to avoid potential Object.entries issues
              form.setValue('code', result.data.code || '');
              form.setValue('discountType', result.data.discountType || 'percentage');
              form.setValue('discountValue', result.data.discountValue || 0);
              form.setValue('organizationRestriction', result.data.organizationRestriction || 'anyone');
              form.setValue('restrictedOrganizations', result.data.restrictedOrganizations || []);
              form.setValue('maxUses', result.data.maxUses || 1);
              form.setValue('minimumOrderAmount', result.data.minimumOrderAmount || 0);
              form.setValue('expiresAt', result.data.expiresAt || '');
              console.log('Form values set successfully');
            } catch (formError) {
              console.error('Error setting form values:', formError);
              throw formError;
            }
          } else {
            toast.error(result.error || 'Failed to load coupon data');
          }
        } catch (error) {
          console.error('Error loading coupon:', error);
          toast.error('Failed to load coupon data');
        } finally {
          setIsLoadingData(false);
        }
      };
      loadCouponData();
    } else {
      // Reset to default values when creating new coupon
      form.reset({
        code: '',
        discountType: 'percentage',
        discountValue: 100,
        organizationRestriction: 'anyone',
        restrictedOrganizations: [],
        maxUses: 1,
        minimumOrderAmount: 0,
        expiresAt: ''
      });
    }
  }, [editingCouponId, form]);

  // Fetch organizations for the multi-select
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

  const watchDiscountType = form.watch('discountType');
  const watchOrganizationRestriction = form.watch('organizationRestriction');

  const handleSubmit = async (data: CouponFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      // Reset form to defaults if submission was successful
      form.reset();
    } catch (_error) {
      // Error is handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="space-y-6 pb-4">
        <div className="flex items-center justify-center py-8">
          <LoaderIcon className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading coupon data...</span>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pb-4">
        {/* Coupon Code */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coupon Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="SPONSOR2025"
                  className="font-mono"
                  disabled={isEditMode}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormDescription>
                Enter a unique coupon code (uppercase letters, numbers, hyphens, and underscores only)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Discount Type & Value */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 gap-6 items-start">
          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditMode}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">
                      <div className="flex items-center">
                        <PercentIcon className="mr-2 size-4" />
                        Percentage
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed_amount">
                      <div className="flex items-center">
                        <DollarSignIcon className="mr-2 size-4" />
                        Fixed Amount
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      min={watchDiscountType === 'percentage' ? '1' : '0.01'}
                      step={watchDiscountType === 'percentage' ? '1' : '0.01'}
                      max={watchDiscountType === 'percentage' ? '100' : undefined}
                      placeholder={watchDiscountType === 'percentage' ? '100' : '50.00'}
                      disabled={isEditMode}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-muted-foreground text-sm">
                        {watchDiscountType === 'percentage' ? '%' : '$'}
                      </span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Organization Restriction */}
          <div className="lg:col-span-2">
            <FormField
              control={form.control}
              name="organizationRestriction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Access</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditMode}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select access level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="anyone">Anyone</SelectItem>
                      <SelectItem value="specific">Specific organizations</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        </div>

        {/* Organization Multi-Select when restriction is 'specific' */}
        {watchOrganizationRestriction === 'specific' && (
          <FormField
            control={form.control}
            name="restrictedOrganizations"
            render={({ field }) => {
              const [selectedOrgs, setSelectedOrgs] = React.useState<string[]>(field.value || []);

              // Sync local state with form field value
              React.useEffect(() => {
                setSelectedOrgs(field.value || []);
              }, [field.value]);

              // Update form when local state changes
              const handleChange = React.useCallback((updater: React.SetStateAction<string[]>) => {
                setSelectedOrgs(prev => {
                  const newValue = typeof updater === 'function' ? updater(prev) : updater;
                  field.onChange(newValue);
                  return newValue;
                });
              }, [field]);

              return (
                <FormItem>
                  <FormLabel>Restricted Organizations</FormLabel>
                  <FormControl>
                    <div className={isEditMode || isLoadingOrganizations ? 'pointer-events-none opacity-50' : ''}>
                      <MultiSelect
                        options={organizations.map(org => ({
                          label: org.name,
                          value: org.id
                        }))}
                        selected={selectedOrgs}
                        onChange={handleChange}
                        placeholder={
                          isLoadingOrganizations
                            ? "Loading organizations..."
                            : "Select organizations..."
                        }
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Select which organizations can use this coupon. If none are selected, the coupon will be available to anyone.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        )}

        {/* Usage & Limits */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 gap-6 items-start">
          <FormField
            control={form.control}
            name="maxUses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Uses</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormDescription>
                  Total number of times this coupon can be used across all organizations
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minimumOrderAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Order Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                      <span className="text-muted-foreground text-sm">$</span>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-8"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Minimum order total required to use this coupon (0 for no minimum)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expiration Date */}
          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiration Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value && typeof field.value === 'string' ? (
                          (() => {
                            // Create date in local timezone for display
                            const [year, month, day] = field.value.split('-').map(Number);
                            const displayDate = new Date(year, month - 1, day);
                            return format(displayDate, 'PPP');
                          })()
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" side="top" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value && typeof field.value === 'string' ? (() => {
                        // Create date in local timezone to avoid UTC issues
                        const [year, month, day] = field.value.split('-').map(Number);
                        return new Date(year, month - 1, day); // month is 0-indexed
                      })() : undefined}
                      onSelect={(date) => {
                        if (date) {
                          // Ensure we get the local date, not UTC
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          field.onChange(`${year}-${month}-${day}`);
                        } else {
                          field.onChange('');
                        }
                      }}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Leave blank to use the event year registration closing date as expiration
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        {/* Form Actions */}
        <div className="sticky bottom-0 bg-background pt-4 border-t mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? (isEditMode ? 'Updating...' : 'Creating...')
              : (isEditMode ? 'Update Coupon' : 'Create Coupon')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function CreateCouponDialog(): React.JSX.Element {
  const { isOpen, closeDialog, editingCoupon, onDataChange: onDataChangeRef } = useCreateCouponDialog();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isEditMode = !!editingCoupon;

  const handleSubmit = async (data: CouponFormData) => {
    try {
      const result = isEditMode
        ? await updateCoupon(editingCoupon, {
            // Only pass editable fields in edit mode
            maxUses: data.maxUses,
            minimumOrderAmount: data.minimumOrderAmount,
            expiresAt: data.expiresAt
          })
        : await createCoupon(data);

      if (result.success) {
        toast.success(`Coupon "${data.code}" ${isEditMode ? 'updated' : 'created'} successfully`);

        // Refresh the table data
        if (onDataChangeRef.current) {
          onDataChangeRef.current();
        }

        closeDialog();
      } else {
        toast.error(result.error || `Failed to ${isEditMode ? 'update' : 'create'} coupon`);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} coupon:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (!errorMessage.includes('Failed to')) {
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} coupon. Please try again.`);
      }
      throw error;
    }
  };

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-3xl w-full max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{isEditMode ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Edit the discount coupon details. Note: Some fields cannot be changed after creation.'
                : 'Create a new discount coupon for sponsor organizations. All fields marked with * are required.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1">
            <CouponForm
              onSubmit={handleSubmit}
              onCancel={closeDialog}
              editingCouponId={editingCoupon}
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
          <DrawerTitle>{isEditMode ? 'Edit Coupon' : 'Create New Coupon'}</DrawerTitle>
          <DrawerDescription>
            {isEditMode
              ? 'Edit the discount coupon details. Note: Some fields cannot be changed after creation.'
              : 'Create a new discount coupon for sponsor organizations. All fields marked with * are required.'
            }
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 flex-1 overflow-y-auto">
          <CouponForm
            onSubmit={handleSubmit}
            onCancel={closeDialog}
            editingCouponId={editingCoupon}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
