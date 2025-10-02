'use client';

import * as React from 'react';
import NiceModal, { type NiceModalHocProps } from '@ebay/nice-modal-react';
import { format } from 'date-fns';
import {
  DownloadIcon,
  FileTextIcon,
  CalendarIcon,
  DollarSignIcon,
  PackageIcon,
  CreditCardIcon,
  ReceiptIcon
} from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { toast } from '@workspace/ui/components/sonner';
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
import { Separator } from '@workspace/ui/components/separator';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';
import { MediaQueries } from '@workspace/ui/lib/media-queries';
import { cn } from '@workspace/ui/lib/utils';

import { useEnhancedModal } from '~/hooks/use-enhanced-modal';
import { generateInvoicePDF } from '~/components/organizations/slug/registration/generate-invoice-pdf';
import { useActiveOrganization } from '~/hooks/use-active-organization';
import type { RegistrationInvoiceDto } from '~/types/dtos/registration-invoice-dto';

export type InvoiceDetailsModalProps = NiceModalHocProps & {
  invoice: RegistrationInvoiceDto;
};

// Status badge variant mapping
const getStatusVariant = (status: RegistrationInvoiceDto['status']) => {
  switch (status) {
    case 'paid':
      return 'default'; // Green
    case 'sent':
      return 'secondary'; // Blue  
    case 'overdue':
      return 'destructive'; // Red
    case 'draft':
      return 'outline'; // Gray
    case 'cancelled':
      return 'secondary'; // Gray
    default:
      return 'outline';
  }
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Format date
const formatDate = (date: Date) => {
  return format(date, 'MMM d, yyyy');
};

// Format payment type for display
const formatPaymentType = (paymentType: string) => {
  switch (paymentType) {
    case 'deposit':
      return 'Deposit Payment';
    case 'full':
      return 'Full Payment';
    case 'balance_payment':
      return 'Balance Payment';
    default:
      return 'Payment';
  }
};

// Get payment type badge variant
const getPaymentTypeVariant = (paymentType: string) => {
  switch (paymentType) {
    case 'deposit':
      return 'secondary'; // Blue
    case 'full':
      return 'default'; // Green
    case 'balance_payment':
      return 'outline'; // Gray
    default:
      return 'outline';
  }
};

export const InvoiceDetailsModal = NiceModal.create<InvoiceDetailsModalProps>(
  ({ invoice }) => {
    const modal = useEnhancedModal();
    const mdUp = useMediaQuery(MediaQueries.MdUp, { ssr: false });
    const organization = useActiveOrganization();

    // Debug logging to check invoice structure
    React.useEffect(() => {
      console.log('🔍 Invoice data structure:', {
        hasOrder: !!invoice.order,
        hasPayments: !!(invoice.order?.payments),
        paymentsLength: invoice.order?.payments?.length,
        invoiceData: invoice
      });
    }, [invoice]);

    const handleDownload = async () => {
      try {
        await generateInvoicePDF(invoice, organization?.name || 'Organization');
        toast.success('Invoice PDF downloaded successfully');
      } catch (error) {
        console.error('Error downloading PDF:', error);
        toast.error('Failed to download invoice PDF');
      }
    };

    const handleCopyInvoiceNumber = async () => {
      try {
        await navigator.clipboard.writeText(invoice.invoiceNumber);
        toast.success('Invoice number copied to clipboard');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Failed to copy invoice number');
      }
    };

    const title = `Invoice ${invoice.invoiceNumber}`;
    
    const renderContent = (
      <div className="space-y-6">
        {/* Invoice Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <FileTextIcon className="size-5 text-muted-foreground" />
              <h3 className="font-semibold">Invoice Details</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete invoice information and order details
            </p>
          </div>
          <Badge variant={getStatusVariant(invoice.status)} className="capitalize">
            {invoice.status}
          </Badge>
        </div>

        <Separator />

        {/* Coupon Applied Alert */}
        {invoice.order.appliedCoupon && invoice.order.couponDiscount && invoice.order.couponDiscount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-lg">🎟️</span>
              <div className="flex-1">
                <h4 className="font-medium text-green-900 mb-1">Coupon Applied</h4>
                <p className="text-sm text-green-700">
                  Coupon <span className="font-medium">"{invoice.order.appliedCoupon.code}"</span> saved{' '}
                  <span className="font-medium">{formatCurrency(invoice.order.couponDiscount)}</span>
                  {invoice.order.appliedCoupon.discountType === 'percentage'
                    ? ` (${invoice.order.appliedCoupon.discountValue}% off)`
                    : ' (fixed discount)'
                  } on this order.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Invoice Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Invoice Number:</span>
                  <span className="font-mono text-sm">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Order Number:</span>
                  <span className="font-mono text-sm">{invoice.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Created:</span>
                  <span className="text-sm">{formatDate(invoice.createdAt)}</span>
                </div>
                {invoice.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-sm">Due Date:</span>
                    <span className={cn(
                      "text-sm",
                      invoice.dueDate < new Date() && invoice.status !== 'paid' 
                        ? "text-red-600 font-medium" 
                        : ""
                    )}>
                      {formatDate(invoice.dueDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Payment Summary</h4>
              <div className="space-y-2">
                {/* Show original total and coupon discount if coupon was applied */}
                {invoice.order.appliedCoupon && invoice.order.couponDiscount && invoice.order.couponDiscount > 0 ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm">Subtotal:</span>
                      <span className="text-sm">{formatCurrency(invoice.order.originalTotal || (invoice.totalAmount + invoice.order.couponDiscount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-600">Coupon Discount ({invoice.order.appliedCoupon.code}):</span>
                      <span className="text-green-600 font-medium">-{formatCurrency(invoice.order.couponDiscount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Amount:</span>
                      <span className="font-medium">{formatCurrency(invoice.totalAmount)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-sm">Total Amount:</span>
                    <span className="font-medium">{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm">Amount Paid:</span>
                  <span className="text-green-600 font-medium">{formatCurrency(invoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Balance Owed:</span>
                  <span className={cn(
                    "font-medium",
                    invoice.balanceOwed > 0 ? "text-orange-600" : "text-green-600"
                  )}>
                    {formatCurrency(invoice.balanceOwed)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Order Status */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Order Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Order Status:</span>
                  <Badge variant="outline" className="capitalize">
                    {invoice.order.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Order Date:</span>
                  <span className="text-sm">{formatDate(invoice.order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Order Total:</span>
                  <span className="font-medium">{formatCurrency(invoice.order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Invoice Status Info */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Invoice Status</h4>
              <div className="space-y-2">
                {invoice.sentAt && (
                  <div className="flex justify-between">
                    <span className="text-sm">Invoice Sent:</span>
                    <span className="text-sm">{formatDate(invoice.sentAt)}</span>
                  </div>
                )}
                {invoice.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-sm">Fully Paid:</span>
                    <span className="text-sm text-green-600">{formatDate(invoice.paidAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Payment Transaction History */}
        {invoice.order.payments && invoice.order.payments.length > 0 && (
          <>
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <CreditCardIcon className="size-4 text-muted-foreground" />
                <h4 className="font-medium">Payment Transactions</h4>
              </div>
              <div className="space-y-3">
                {invoice.order.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium text-sm">{formatPaymentType(payment.paymentType)}</h5>
                        <Badge variant={getPaymentTypeVariant(payment.paymentType)} className="text-xs">
                          {payment.paymentType === 'deposit' ? 'Deposit' : payment.paymentType === 'full' ? 'Full' : 'Balance'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center space-x-4">
                          <span>Method: {payment.method}{payment.last4 ? ` ****${payment.last4}` : ''}</span>
                          <span>Date: {formatDate(payment.paymentDate)}</span>
                        </div>
                        {payment.transactionId && (
                          <div className="font-mono text-xs">
                            Transaction ID: {payment.transactionId}
                          </div>
                        )}
                        {payment.failureReason && (
                          <div className="text-xs text-red-600">
                            Failure reason: {payment.failureReason}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Summary */}
              <div className="mt-4 pt-4 border-t bg-blue-50/50 rounded-lg p-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Total Payments Received:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency((invoice.order.payments || []).reduce((sum, payment) => sum + payment.amount, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Invoice Total:</span>
                    <span className="font-semibold">{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                  {invoice.balanceOwed > 0 && (
                    <div className="flex justify-between text-sm pt-1 border-t">
                      <span className="font-medium text-orange-600">Outstanding Balance:</span>
                      <span className="font-semibold text-orange-600">{formatCurrency(invoice.balanceOwed)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Order Items */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <PackageIcon className="size-4 text-muted-foreground" />
            <h4 className="font-medium">Order Items</h4>
          </div>
          <div className="space-y-3">
            {invoice.order.items.length > 0 ? (
              invoice.order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{item.productName}</h5>
                    <p className="text-xs text-muted-foreground">
                      Quantity: {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No items found</p>
            )}
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Notes</h4>
              <p className="text-sm bg-muted/50 p-3 rounded-lg">{invoice.notes}</p>
            </div>
          </>
        )}
      </div>
    );

    const renderFooter = (
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleCopyInvoiceNumber}
          size="sm"
        >
          Copy Invoice #
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleDownload}
            className="flex items-center space-x-2"
          >
            <DownloadIcon className="size-4" />
            <span>Download PDF</span>
          </Button>
          <Button
            variant="secondary"
            onClick={modal.handleClose}
          >
            Close
          </Button>
        </div>
      </div>
    );

    if (mdUp) {
      return (
        <Dialog open={modal.visible} onOpenChange={modal.handleClose}>
          <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                View complete invoice details and order information
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              {renderContent}
            </div>
            <DialogFooter className="flex-shrink-0 border-t pt-4">
              {renderFooter}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Drawer open={modal.visible} onOpenChange={modal.handleClose}>
        <DrawerContent className="max-h-[95vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>
              View complete invoice details and order information
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4">
            {renderContent}
          </div>
          <DrawerFooter className="flex-shrink-0 border-t">
            {renderFooter}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
);