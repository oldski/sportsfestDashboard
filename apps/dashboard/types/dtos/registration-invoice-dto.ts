export type RegistrationInvoiceDto = {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
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
  // Related order information
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: Date;
    // Order items for invoice details
    items: {
      id: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
  };
};