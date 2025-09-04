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
import { downloadOrderPDF } from '~/lib/pdf-utils';
import type { RegistrationOrderDto } from '~/types/dtos/registration-order-dto';

export type OrderDetailsModalProps = NiceModalHocProps & {
  order: RegistrationOrderDto;
};

// Status badge variant mapping
const getStatusVariant = (status: RegistrationOrderDto['status']) => {
  switch (status) {
    case 'fully_paid':
      return 'default'; // Green
    case 'deposit_paid':
      return 'secondary'; // Blue
    case 'pending':
      return 'outline'; // Gray
    case 'cancelled':
      return 'destructive'; // Red
    case 'refunded':
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

export const OrderDetailsModal = NiceModal.create<OrderDetailsModalProps>(
  ({ order }) => {
    const modal = useEnhancedModal();
    const mdUp = useMediaQuery(MediaQueries.MdUp, { ssr: false });

    const handleDownload = async () => {
      try {
        await downloadOrderPDF(order);
        toast.success('Order PDF downloaded successfully');
      } catch (error) {
        console.error('Error downloading PDF:', error);
        toast.error('Failed to download order PDF');
      }
    };

    const handleCopyOrderNumber = async () => {
      try {
        await navigator.clipboard.writeText(order.orderNumber);
        toast.success('Order number copied to clipboard');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Failed to copy order number');
      }
    };

    const totalPaid = order.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const balanceOwed = order.totalAmount - totalPaid;

    const title = `Order ${order.orderNumber}`;
    
    const renderContent = (
      <div className="space-y-6">
        {/* Order Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <FileTextIcon className="size-5 text-muted-foreground" />
              <h3 className="font-semibold">Order Details</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete order information and payment history
            </p>
          </div>
          <Badge variant={getStatusVariant(order.status)} className="capitalize">
            {order.status.replace('_', ' ')}
          </Badge>
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Order Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Order Number:</span>
                  <span className="font-mono text-sm">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant={getStatusVariant(order.status)} className="capitalize text-xs">
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Created:</span>
                  <span className="text-sm">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Amount:</span>
                  <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Payment Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Amount Paid:</span>
                  <span className="text-green-600 font-medium">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Balance Owed:</span>
                  <span className={cn(
                    "font-medium",
                    balanceOwed > 0 ? "text-orange-600" : "text-green-600"
                  )}>
                    {formatCurrency(balanceOwed)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Invoices Information */}
            {order.invoices.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Related Invoices</h4>
                <div className="space-y-2">
                  {order.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex justify-between items-center">
                      <span className="font-mono text-xs">{invoice.invoiceNumber}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {invoice.status}
                        </Badge>
                        <span className="text-xs">{formatCurrency(invoice.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment History */}
            {order.payments.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Payment History</h4>
                <div className="space-y-2">
                  {order.payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center">
                      <div>
                        <span className="text-sm">{formatDate(payment.paymentDate)}</span>
                        <div className="text-xs text-muted-foreground">{payment.method}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-green-600 font-medium text-sm">
                          {formatCurrency(payment.amount)}
                        </span>
                        <div className="text-xs text-muted-foreground">{payment.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Order Items */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <PackageIcon className="size-4 text-muted-foreground" />
            <h4 className="font-medium">Order Items</h4>
          </div>
          <div className="space-y-3">
            {order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{item.productName}</h5>
                    <p className="text-xs text-muted-foreground">
                      {item.productCategory} • Quantity: {item.quantity} × {formatCurrency(item.unitPrice)}
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

          {/* Order Total */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Order Total:</span>
              <span className="text-lg font-bold">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    );

    const renderFooter = (
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleCopyOrderNumber}
          size="sm"
        >
          Copy Order #
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
                View complete order details, items, and payment information
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
              View complete order details, items, and payment information
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