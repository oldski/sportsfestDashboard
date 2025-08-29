'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2Icon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Switch } from '@workspace/ui/components/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
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

// Mock data - replace with actual data from database
const mockEventYears = [
  { id: '1', year: 2025, name: 'SportsFest 2025' },
  { id: '2', year: 2024, name: 'SportsFest 2024' },
];

const mockCategories = [
  { id: '1', name: 'Registration' },
  { id: '2', name: 'Equipment' },
  { id: '3', name: 'Merchandise' },
  { id: '4', name: 'Food & Beverage' },
];

const productTypes = [
  { value: 'team_registration', label: 'Team Registration' },
  { value: 'tent_rental', label: 'Tent Rental' },
  { value: 'merchandise', label: 'Merchandise' },
  { value: 'food_service', label: 'Food Service' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'other', label: 'Other' },
];

const productStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' },
];

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().max(1000).optional(),
  categoryId: z.string().min(1, 'Category is required'),
  eventYearId: z.string().min(1, 'Event year is required'),
  productType: z.string().min(1, 'Product type is required'),
  fullAmount: z.number().min(0, 'Amount must be non-negative'),
  depositAmount: z.number().min(0, 'Deposit amount must be non-negative').default(0),
  requiresDeposit: z.boolean().default(false),
  maxQuantityPerOrg: z.number().min(1).optional(),
  hasQuantityLimit: z.boolean().default(false),
  status: z.string().min(1, 'Status is required'),
}).refine((data) => {
  // If requires deposit, deposit amount must be less than full amount
  if (data.requiresDeposit && data.depositAmount >= data.fullAmount) {
    return false;
  }
  return true;
}, {
  message: 'Deposit amount must be less than full amount',
  path: ['depositAmount'],
}).refine((data) => {
  // If requires deposit, deposit amount must be greater than 0
  if (data.requiresDeposit && data.depositAmount <= 0) {
    return false;
  }
  return true;
}, {
  message: 'Deposit amount must be greater than 0 when deposit is required',
  path: ['depositAmount'],
});

type CreateProductFormData = z.infer<typeof createProductSchema>;

export function CreateProductForm(): React.JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      eventYearId: '',
      productType: '',
      fullAmount: 0,
      depositAmount: 0,
      requiresDeposit: false,
      maxQuantityPerOrg: undefined,
      hasQuantityLimit: false,
      status: 'active',
    },
  });

  const watchRequiresDeposit = form.watch('requiresDeposit');
  const watchHasQuantityLimit = form.watch('hasQuantityLimit');

  const onSubmit = async (data: CreateProductFormData) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Creating product:', {
        ...data,
        maxQuantityPerOrg: data.hasQuantityLimit ? data.maxQuantityPerOrg : null,
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Product "${data.name}" created successfully!`);
      
      router.push('/admin/event-registration/products');
    } catch (error) {
      toast.error('Failed to create product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="SportsFest Team Registration" {...field} />
                </FormControl>
                <FormDescription>
                  The display name for this product
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="productType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {productTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The type of product for fulfillment logic
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Register your team for SportsFest 2025..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional description of this product
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Product category for organization
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="eventYearId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Year</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockEventYears.map((eventYear) => (
                      <SelectItem key={eventYear.id} value={eventYear.id}>
                        {eventYear.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Which event year this product belongs to
                </FormDescription>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {productStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Product availability status
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fullAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="150.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  The total price for this product
                </FormDescription>
                <FormMessage />
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
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="50.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Required deposit amount (must be less than full price)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="requiresDeposit"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Requires Deposit Payment
                </FormLabel>
                <FormDescription>
                  Organizations must pay a deposit before paying the full amount
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

        <FormField
          control={form.control}
          name="hasQuantityLimit"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Has Quantity Limit
                </FormLabel>
                <FormDescription>
                  Limit how many of this product an organization can purchase
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

        {watchHasQuantityLimit && (
          <FormField
            control={form.control}
            name="maxQuantityPerOrg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Quantity per Organization</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="2"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormDescription>
                  Maximum number of this product an organization can purchase
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Create Product
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}