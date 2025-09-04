export type RegistrationProductDto = {
  id: string;
  name: string;
  description?: string;
  type: 'physical' | 'service' | 'digital' | 'membership';
  status: 'active' | 'inactive' | 'out_of_stock';
  basePrice: number;
  requiresDeposit: boolean;
  depositAmount?: number;
  maxQuantityPerOrg?: number;
  totalInventory?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  // Category information
  category: {
    id: string;
    name: string;
    description?: string;
  };
  // Organization-specific pricing (if applicable)
  organizationPrice?: {
    customPrice: number;
    customDepositAmount?: number;
  };
};

export type CartItem = {
  productId: string;
  product: RegistrationProductDto;
  quantity: number;
  useDeposit: boolean; // Whether user selected deposit or full payment
  unitPrice: number; // Actual price selected (deposit or full)
  depositPrice: number; // Deposit amount if applicable
  totalPrice: number; // quantity * unitPrice
};