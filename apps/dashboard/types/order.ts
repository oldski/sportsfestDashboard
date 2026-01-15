/**
 * Shared type definitions for order-related data structures
 */

export interface AppliedCoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  calculatedDiscount: number;
}

export interface OrderMetadata {
  cartItems?: any[];
  paymentType?: 'full' | 'deposit';
  originalTotal?: number;
  couponDiscount?: number;
  appliedCoupon?: AppliedCoupon | null;
}

export interface OrderSummary {
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    isDeposit?: boolean;
    fullPrice?: number;
  }>;
  subtotal: number;
  depositAmount?: number;
  totalAmount: number;
  dueToday: number;
  futurePayments: number;
  paymentType: 'full' | 'deposit';
  appliedCoupon?: AppliedCoupon;
  couponDiscount: number;
  discountedSubtotal: number;
  discountedTotal: number;
  // For bank payments where processing fee is waived
  processingFeeWaived?: number;
  isBankPayment?: boolean;
}
