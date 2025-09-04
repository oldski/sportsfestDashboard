'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, DollarSignIcon, CreditCardIcon, BanknoteIcon } from 'lucide-react';
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
import { Label } from '@workspace/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group';
import { cn } from '@workspace/ui/lib/utils';
import { formatCurrency } from '~/lib/formatters';

import { useRecordPaymentDialog } from './record-payment-dialog-provider';

// Mock invoice data - would come from database
const mockInvoiceData = {
  'invoice-1': {
    invoiceNumber: 'INV-2024-001',
    organizationName: 'Acme Corporation',
    totalAmount: 500.00,
    paidAmount: 150.00,
    balanceOwed: 350.00,
    status: 'partial' as const
  },
  'invoice-2': {
    invoiceNumber: 'INV-2024-002',
    organizationName: 'TechStart Innovations',
    totalAmount: 750.00,
    paidAmount: 0.00,
    balanceOwed: 750.00,
    status: 'sent' as const
  }
};

const recordPaymentSchema = z.object({
  paymentAmount: z.number().min(0.01, 'Payment amount must be greater than 0'),
  paymentMethod: z.enum(['check', 'cash', 'bank_transfer', 'credit_card'], {
    required_error: 'Please select a payment method',
  }),
  paymentDate: z.date({
    required_error: 'Please select a payment date',
  }),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  partialPaymentAction: z.enum(['close_invoice', 'create_new_invoice']).optional(),
});

type RecordPaymentFormData = z.infer<typeof recordPaymentSchema>;

export function RecordPaymentDialog(): React.JSX.Element {
  const { isOpen, invoiceId, closeDialog } = useRecordPaymentDialog();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const invoiceData = invoiceId ? mockInvoiceData[invoiceId as keyof typeof mockInvoiceData] : null;

  const form = useForm({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      paymentAmount: invoiceData?.balanceOwed || 0,
      paymentMethod: 'check',
      referenceNumber: '',
      notes: '',
      partialPaymentAction: 'create_new_invoice',
    },
  });

  const watchedPaymentAmount = form.watch('paymentAmount');
  const isPartialPayment = invoiceData && watchedPaymentAmount < invoiceData.balanceOwed;
  const isOverpayment = Boolean(invoiceData && watchedPaymentAmount > invoiceData.balanceOwed);

  React.useEffect(() => {
    if (invoiceData) {
      form.setValue('paymentAmount', invoiceData.balanceOwed);
    }
  }, [invoiceData, form]);

  const onSubmit = async (data: RecordPaymentFormData) => {
    if (!invoiceData) return;

    setIsSubmitting(true);

    try {
      // TODO: Implement actual payment recording
      console.log('Recording payment:', {
        invoiceId,
        invoiceNumber: invoiceData.invoiceNumber,
        ...data
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Close dialog and reset form
      closeDialog();
      form.reset();

      // TODO: Show success message and refresh data
    } catch (error) {
      console.error('Error recording payment:', error);
      // TODO: Show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!invoiceData) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Manual Payment</DialogTitle>
          <DialogDescription>
            Record a manual payment for invoice {invoiceData.invoiceNumber} from {invoiceData.organizationName}
          </DialogDescription>
        </DialogHeader>

        {/* Invoice Summary */}
        <div className="rounded-lg border p-4 bg-muted/50">
          <h4 className="font-medium mb-3">Invoice Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Invoice Total:</span>
              <div className="font-medium">{formatCurrency(invoiceData.totalAmount)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Previously Paid:</span>
              <div className="font-medium">{formatCurrency(invoiceData.paidAmount)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Balance Due:</span>
              <div className="font-bold text-lg">{formatCurrency(invoiceData.balanceOwed)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Organization:</span>
              <div className="font-medium">{invoiceData.organizationName}</div>
            </div>
          </div>
        </div>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Payment Amount */}
            <FormField
              control={form.control}
              name="paymentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={invoiceData.balanceOwed * 1.1}
                        className="pl-10"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  {isPartialPayment && (
                    <FormDescription className="text-orange-600">
                      This is a partial payment. Remaining balance: {formatCurrency(invoiceData.balanceOwed - watchedPaymentAmount)}
                    </FormDescription>
                  )}
                  {isOverpayment && (
                    <FormDescription className="text-red-600">
                      Payment amount exceeds balance due by {formatCurrency(watchedPaymentAmount - invoiceData.balanceOwed)}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Method */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="check">
                          <div className="flex items-center">
                            <BanknoteIcon className="mr-2 h-4 w-4" />
                            Check
                          </div>
                        </SelectItem>
                        <SelectItem value="cash">
                          <div className="flex items-center">
                            <DollarSignIcon className="mr-2 h-4 w-4" />
                            Cash
                          </div>
                        </SelectItem>
                        <SelectItem value="bank_transfer">
                          <div className="flex items-center">
                            <CreditCardIcon className="mr-2 h-4 w-4" />
                            Bank Transfer
                          </div>
                        </SelectItem>
                        <SelectItem value="credit_card">
                          <div className="flex items-center">
                            <CreditCardIcon className="mr-2 h-4 w-4" />
                            Credit Card
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Date */}
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
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
                            date > new Date() || date < new Date('2020-01-01')
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

            {/* Reference Number */}
            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Check number, transaction ID, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter check number, wire transfer ID, or other reference information
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Partial Payment Action */}
            {isPartialPayment && (
              <FormField
                control={form.control}
                name="partialPaymentAction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partial Payment Handling</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="create_new_invoice" id="create_new" />
                          <Label htmlFor="create_new">
                            Create new invoice for remaining balance ({formatCurrency(invoiceData.balanceOwed - watchedPaymentAmount)})
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="close_invoice" id="close_invoice" />
                          <Label htmlFor="close_invoice">
                            Mark invoice as paid and close (write off remaining balance)
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      Choose how to handle the remaining balance after this partial payment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this payment..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Internal notes about the payment (not visible to organization)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isOverpayment}>
                {isSubmitting ? 'Recording Payment...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
