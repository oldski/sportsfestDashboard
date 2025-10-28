export type RegistrationProductDto = {
  id: string;
  name: string;
  description?: string;
  type: 'tent_rental' | 'team_registration' | 'merchandise' | 'equipment' | 'services';
  status: 'active' | 'inactive' | 'archived';
  basePrice: number;
  requiresDeposit: boolean;
  depositAmount?: number;
  maxQuantityPerOrg?: number;
  totalInventory?: number;
  image?: string;
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
  // Availability information for smart quantity limits
  availableQuantity: number | null; // null means unlimited
  purchasedQuantity: number;
  isTentProduct?: boolean;
  requiresTeam?: boolean;
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
