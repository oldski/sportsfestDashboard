export type RegistrationOrderDto = {
  id: string;
  orderNumber: string;
  organizationId: string;
  totalAmount: number;
  originalTotal?: number;
  status: 'pending' | 'payment_processing' | 'deposit_paid' | 'fully_paid' | 'cancelled' | 'refunded';
  isSponsorship: boolean;
  // Sponsorship-specific details (only present for sponsorship orders)
  sponsorshipDetails?: {
    baseAmount: number;
    processingFee: number;
    description?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  eventYear: {
    id: string;
    name: string;
    year: number;
  };
  // Coupon information
  appliedCoupon?: {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    calculatedDiscount: number;
  };
  couponDiscount?: number;
  // Order items
  items: {
    id: string;
    productName: string;
    productCategory: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  // Payment information
  payments: {
    id: string;
    amount: number;
    paymentDate: Date;
    method: string;
    status: string;
    last4?: string;
  }[];
  // Invoice information
  invoices: {
    id: string;
    invoiceNumber: string;
    status: string;
    totalAmount: number;
    paidAmount: number;
    balanceOwed: number;
  }[];
};