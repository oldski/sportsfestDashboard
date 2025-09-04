'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2Icon, PackageIcon } from 'lucide-react';
import { NumericFormat } from 'react-number-format';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Switch } from '@workspace/ui/components/switch';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import {
  FormProvider,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { toast } from '@workspace/ui/components/sonner';

import { ProductType, ProductStatus } from '@workspace/database/schema';
import type { ProductFormData } from '~/actions/admin/product';
import type { ProductFormSelectData } from '~/actions/admin/get-product-form-data';

const productFormSchema = z.object({
  categoryId: z.string().uuid('Category is required'),
  eventYearId: z.string().uuid('Event year is required'),
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().optional(),
  type: z.nativeEnum(ProductType, {
    required_error: 'Product type is required',
  }),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  basePrice: z.number().min(0, 'Price must be 0 or greater'),
  requiresDeposit: z.boolean().default(false),
  depositAmount: z.number().min(0, 'Deposit amount must be 0 or greater').optional(),
  maxQuantityPerOrg: z.number().int().min(1).optional(),
  totalInventory: z.number().int().min(0).optional(),
}).refine((data) => {
  if (data.requiresDeposit && (!data.depositAmount || data.depositAmount <= 0)) {
    return false;
  }
  return true;
}, {
  message: 'Deposit amount is required when deposit is required',
  path: ['depositAmount'],
}).refine((data) => {
  if (data.depositAmount && data.depositAmount >= data.basePrice) {
    return false;
  }
  return true;
}, {
  message: 'Deposit amount must be less than base price',
  path: ['depositAmount'],
});

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductFormData & { id?: string };
  mode?: 'create' | 'edit';
  formData: ProductFormSelectData;
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  mode = 'create',
  formData
}: ProductDialogProps): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      categoryId: '',
      eventYearId: '',
      name: '',
      description: '',
      type: ProductType.TEAM_REGISTRATION,
      status: ProductStatus.ACTIVE,
      basePrice: 0,
      requiresDeposit: false,
      depositAmount: undefined,
      maxQuantityPerOrg: undefined,
      totalInventory: undefined,
    },
  });

  const watchRequiresDeposit = form.watch('requiresDeposit');

  React.useEffect(() => {
    if (open) {
      if (product) {
        form.reset(product);
      } else {
        form.reset({
          categoryId: '',
          eventYearId: '',
          name: '',
          description: '',
          type: ProductType.TEAM_REGISTRATION,
          status: ProductStatus.ACTIVE,
          basePrice: 0,
          requiresDeposit: false,
          depositAmount: undefined,
          maxQuantityPerOrg: undefined,
          totalInventory: undefined,
        });
      }
    }
  }, [product, form, open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset({
        categoryId: '',
        eventYearId: '',
        name: '',
        description: '',
        type: ProductType.TEAM_REGISTRATION,
        status: ProductStatus.ACTIVE,
        basePrice: 0,
        requiresDeposit: false,
        depositAmount: undefined,
        maxQuantityPerOrg: undefined,
        totalInventory: undefined,
      });
    }
    onOpenChange(newOpen);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      if (mode === 'create') {
        const { createProduct } = await import('~/actions/admin/product');
        await createProduct(data);
      } else if (product?.id) {
        const { updateProduct } = await import('~/actions/admin/product');
        await updateProduct(product.id, data);
      } else {
        throw new Error('No product ID provided for update');
      }

      toast.success(`Product ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      handleOpenChange(false);
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} product:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} product. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageIcon className="h-5 w-5" />
            {mode === 'create' ? 'Create Product' : 'Edit Product'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new product to the event registration catalog'
              : 'Update the product information and pricing details'
            }
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="pt-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    Product Information
                  </h4>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="SportsFest Team Registration" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description of the product..."
                          className="min-h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="eventYearId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Year</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {formData.eventYears.map((eventYear) => (
                              <SelectItem key={eventYear.id} value={eventYear.id}>
                                {eventYear.year} - {eventYear.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {formData.categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(ProductType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(ProductStatus).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="space-y-4">
                <div className="pt-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    Pricing & Inventory
                  </h4>
                </div>

                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price</FormLabel>
                      <FormControl>
                        <NumericFormat
                          customInput={Input}
                          thousandSeparator
                          prefix="$"
                          decimalScale={2}
                          fixedDecimalScale
                          allowNegative={false}
                          placeholder="$0.00"
                          value={field.value}
                          onValueChange={(values) => field.onChange(values.floatValue || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiresDeposit"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Offer Deposit Option</FormLabel>
                        <FormDescription>
                          Allow customers to choose between deposit or full payment
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchRequiresDeposit && (
                  <FormField
                    control={form.control}
                    name="depositAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deposit Amount</FormLabel>
                        <FormControl>
                          <NumericFormat
                            customInput={Input}
                            thousandSeparator
                            prefix="$"
                            decimalScale={2}
                            fixedDecimalScale
                            allowNegative={false}
                            placeholder="$0.00"
                            value={field.value || ''}
                            onValueChange={(values) => field.onChange(values.floatValue || undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Must be less than base price. Customers can choose deposit or full payment.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="maxQuantityPerOrg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Quantity / Organization</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Leave blank for unlimited"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalInventory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Inventory</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Leave blank for unlimited"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </form>
        </FormProvider>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Create' : 'Update'} Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
