'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@workspace/ui/components/button';
import { Calendar } from '@workspace/ui/components/calendar';
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
import { Input } from '@workspace/ui/components/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';
import { cn } from '@workspace/ui/lib/utils';

import { useCreateInvoiceDialog } from './create-invoice-dialog-provider';

// Mock data for organizations and products - would come from database actions
const mockOrganizations = [
  { id: 'org-1', name: 'Acme Corporation', slug: 'acme-corp' },
  { id: 'org-2', name: 'TechStart Innovations', slug: 'techstart' },
  { id: 'org-3', name: 'Global Solutions Inc', slug: 'global-solutions' },
  { id: 'org-4', name: 'BlueSky Enterprises', slug: 'bluesky' },
  { id: 'org-5', name: 'Innovation Labs', slug: 'innovation-labs' },
];

const mockProducts = [
  { id: 'product-1', name: 'SportsFest Team Registration', defaultPrice: 150.00, category: 'Registration' },
  { id: 'product-2', name: '10x10 Event Tent', defaultPrice: 200.00, category: 'Tent Rental' },
  { id: 'product-3', name: 'Team Lunch Package', defaultPrice: 15.00, category: 'Catering' },
  { id: 'product-4', name: 'Event T-Shirt Package', defaultPrice: 25.00, category: 'Merchandise' },
  { id: 'product-5', name: 'Parking Pass', defaultPrice: 10.00, category: 'Parking' },
];

const createInvoiceSchema = z.object({
  organizationId: z.string().min(1, 'Please select an organization'),
  dueDate: z.date({
    required_error: 'Please select a due date',
  }),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Please select a product'),
    customPrice: z.number().min(0, 'Price must be 0 or greater'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
  })).min(1, 'Please add at least one line item'),
});

type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;

export function CreateInvoiceDialog(): React.JSX.Element {
  const { isOpen, closeDialog } = useCreateInvoiceDialog();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      organizationId: '',
      notes: '',
      items: [{ productId: '', customPrice: 0, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const addLineItem = () => {
    append({ productId: '', customPrice: 0, quantity: 1 });
  };

  const removeLineItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onProductChange = (productId: string, index: number) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.customPrice`, product.defaultPrice);
    }
  };

  const calculateTotal = () => {
    const items = form.watch('items');
    return items.reduce((total, item) => {
      return total + (item.customPrice * item.quantity);
    }, 0);
  };

  const onSubmit = async (data: CreateInvoiceFormData) => {
    setIsSubmitting(true);

    try {
      // TODO: Implement actual invoice creation
      console.log('Creating invoice:', data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Close dialog and reset form
      closeDialog();
      form.reset();

      // TODO: Show success message and refresh data
    } catch (error) {
      console.error('Error creating invoice:', error);
      // TODO: Show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Create a manual invoice for an organization with custom pricing.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Organization Selection */}
              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockOrganizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Invoice Line Items</h3>
                <Button type="button" onClick={addLineItem} size="sm">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Line Item
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-3 items-end p-3 border rounded-lg">
                    {/* Product Selection */}
                    <div className="col-span-5">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Product</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                onProductChange(value, index);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockProducts.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    <div>
                                      <div className="font-medium">{product.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        ${product.defaultPrice.toFixed(2)} • {product.category}
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Custom Price */}
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.customPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Custom Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                className="h-9"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Qty</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                className="h-9"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Line Total & Remove Button */}
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="text-sm font-medium">
                        ${((form.watch(`items.${index}.customPrice`) || 0) * (form.watch(`items.${index}.quantity`) || 0)).toFixed(2)}
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                          className="h-9 w-9 p-0"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Invoice Total */}
              <div className="flex justify-end">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Invoice Total</div>
                  <div className="text-xl font-bold">${calculateTotal().toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes for this invoice..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    These notes will appear on the invoice and be visible to the organization.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Invoice'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
