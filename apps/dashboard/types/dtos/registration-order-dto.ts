export type RegistrationOrderDto = {
  id: string;
  orderNumber: string;
  organizationId: string;
  totalAmount: number;
  status: 'pending' | 'deposit_paid' | 'fully_paid' | 'cancelled' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
  eventYear: {
    id: string;
    name: string;
    year: number;
  };
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