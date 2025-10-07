export type RegistrationInvoiceDto = {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  organizationName: string;
  totalAmount: number;
  paidAmount: number;
  balanceOwed: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate?: Date;
  paidAt?: Date;
  sentAt?: Date;
  downloadUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  eventYear: {
    id: string;
    name: string;
    year: number;
  };
  // Related order information
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    originalTotal?: number;
    status: string;
    createdAt: Date;
    // Coupon information
    appliedCoupon?: {
      id: string;
      code: string;
      discountType: 'percentage' | 'fixed_amount';
      discountValue: number;
      calculatedDiscount: number;
    };
    couponDiscount?: number;
    // Order items for invoice details
    items: {
      id: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
    // Payment history for detailed breakdown (optional for backward compatibility)
    payments?: {
      id: string;
      amount: number;
      method: string;
      status: string;
      paymentDate: Date;
      transactionId?: string;
      paymentType: 'deposit' | 'full' | 'balance_payment';
      last4?: string;
      failureReason?: string;
    }[];
  };
};