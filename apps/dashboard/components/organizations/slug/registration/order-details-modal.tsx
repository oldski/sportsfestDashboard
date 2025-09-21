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
import { useOrderPaymentCompletion } from '~/hooks/use-order-payment-completion';
import { PaymentModal } from '~/components/organizations/slug/registration/payment-modal';
import { StripeElementsProvider } from '~/contexts/stripe-context';
import { useParams } from 'next/navigation';
import { useActiveOrganization } from '~/hooks/use-active-organization';
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
    console.log('🔄 OrderDetailsModal component starting render');
    
    const modal = useEnhancedModal();
    const mdUp = useMediaQuery(MediaQueries.MdUp, { ssr: false });
    
    console.log('🔍 Modal hook state:', { visible: modal.visible });
    
    const params = useParams();
    const organizationSlug = params.slug as string;
    const organization = useActiveOrganization();
    
    // Debug organization context
    React.useEffect(() => {
      console.log('🔍 Organization context:', {
        organizationSlug,
        organizationName: organization?.name,
        hasOrganization: !!organization
      });
    }, [organizationSlug, organization]);
    
    const [paymentModalOpen, setPaymentModalOpen] = React.useState(false);
    
    // Reset payment modal state on component mount to ensure clean state
    React.useEffect(() => {
      console.log('🔄 Component mounted, resetting payment modal state');
      setPaymentModalOpen(false);
    }, []);
    
    const {
      isLoading: isPaymentLoading,
      clientSecret,
      orderId: paymentOrderId,
      orderSummary,
      createPaymentIntent,
      resetPayment
    } = useOrderPaymentCompletion({
      onSuccess: (completedOrderId) => {
        toast.success('Payment completed successfully!');
        resetPayment();
        setPaymentModalOpen(false);
        modal.handleClose();
        // Trigger a page reload to refresh the order data
        window.location.reload();
      },
      onError: (error) => {
        toast.error(`Payment failed: ${error}`);
      }
    });

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

    const [shouldOpenModal, setShouldOpenModal] = React.useState(false);

    const handleCompletePayment = async () => {
      try {
        console.log('🔄 Starting payment completion for order:', order.id);
        setShouldOpenModal(false); // Reset flag
        await createPaymentIntent(order.id, order.items, order.totalAmount);
        console.log('✅ Payment intent created, setting flag to open modal');
        setShouldOpenModal(true);
      } catch (error) {
        console.error('❌ Error in handleCompletePayment:', error);
        toast.error('Failed to initiate payment. Please try again.');
      }
    };

    // Debug all state values on each render
    console.log('🔍 Component render - state values:', {
      shouldOpenModal,
      hasClientSecret: !!clientSecret,
      hasPaymentOrderId: !!paymentOrderId,
      hasOrderSummary: !!orderSummary,
      paymentModalOpen,
      shouldOpenModalNow: shouldOpenModal && clientSecret && paymentOrderId && orderSummary && !paymentModalOpen
    });

    // Open modal when all required data is available
    React.useEffect(() => {
      if (shouldOpenModal && clientSecret && paymentOrderId && orderSummary && !paymentModalOpen) {
        console.log('✅ All data ready, opening payment modal');
        setPaymentModalOpen(true);
        setShouldOpenModal(false); // Reset flag
      }
    }, [shouldOpenModal, clientSecret, paymentOrderId, orderSummary, paymentModalOpen]);

    console.log('🔍 About to calculate payment totals...');
    
    const totalPaid = order.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const balanceOwed = order.totalAmount - totalPaid;
    const canCompletePayment = balanceOwed > 0 && order.status === 'deposit_paid';
    
    console.log('✅ Payment calculations done:', { totalPaid, balanceOwed, canCompletePayment });

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

        {/* Payment Completion Alert */}
        {canCompletePayment && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CreditCardIcon className="size-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">Complete Your Payment</h4>
                <p className="text-sm text-blue-700">
                  You have a remaining balance of <span className="font-medium">{formatCurrency(balanceOwed)}</span> on this order.
                  Complete your payment to finalize your purchase.
                </p>
              </div>
            </div>
          </div>
        )}

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

    console.log('✅ renderContent created');

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
          {canCompletePayment && (
            <Button
              onClick={handleCompletePayment}
              disabled={isPaymentLoading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <CreditCardIcon className="size-4" />
              <span>
                {isPaymentLoading ? 'Processing...' : `Pay ${formatCurrency(balanceOwed)}`}
              </span>
            </Button>
          )}
          <Button
            onClick={handleDownload}
            variant="outline"
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

    console.log('✅ renderFooter created');

    // Debug modal state changes
    React.useEffect(() => {
      console.log('🔍 paymentModalOpen changed to:', paymentModalOpen);
    }, [paymentModalOpen]);

    // Debug modal component rendering
    React.useEffect(() => {
      console.log('🔍 Payment modal component state:', {
        clientSecret: !!clientSecret,
        paymentOrderId: !!paymentOrderId,
        orderSummary: !!orderSummary,
        paymentModalOpen,
        shouldRenderModal: !!(clientSecret && paymentOrderId && orderSummary)
      });
    }, [clientSecret, paymentOrderId, orderSummary, paymentModalOpen]);

    // Create payment modal component
    console.log('🔍 About to create payment modal component:', {
      hasClientSecret: !!clientSecret,
      hasPaymentOrderId: !!paymentOrderId,
      hasOrderSummary: !!orderSummary,
      paymentModalOpen,
      organizationName: organization?.name
    });

    const paymentModalComponent = React.useMemo(() => {
      console.log('🔍 useMemo running - payment modal component:', {
        hasClientSecret: !!clientSecret,
        hasPaymentOrderId: !!paymentOrderId,
        hasOrderSummary: !!orderSummary,
        paymentModalOpen,
        organizationName: organization?.name
      });

      if (clientSecret && paymentOrderId && orderSummary) {
        console.log('✅ All conditions met, creating Stripe payment modal component');
        
        return (
          <StripeElementsProvider clientSecret={clientSecret}>
            <PaymentModal
              isOpen={paymentModalOpen}
              onClose={() => {
                console.log('🔄 Payment modal onClose called');
                setPaymentModalOpen(false);
                resetPayment();
              }}
              onSuccess={(completedOrderId) => {
                console.log('✅ Payment modal onSuccess called:', completedOrderId);
                toast.success('Payment completed successfully!');
                resetPayment();
                setPaymentModalOpen(false);
                modal.handleClose();
                window.location.reload();
              }}
              clientSecret={clientSecret}
              orderId={paymentOrderId}
              orderSummary={orderSummary}
              organizationName={organization?.name || 'Organization'}
            />
          </StripeElementsProvider>
        );
      }
      
      console.log('❌ Payment modal conditions not met, not rendering');
      return null;
    }, [clientSecret, paymentOrderId, orderSummary, paymentModalOpen, organization?.name]);

    const orderDetailsComponent = mdUp ? (
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
    ) : (
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

    console.log('🔍 Rendering order details modal with payment modal:', {
      showOrderDetails: modal.visible,
      showPaymentModal: !!paymentModalComponent
    });

    return (
      <>
        {orderDetailsComponent}
        {paymentModalComponent}
      </>
    );
  }
);