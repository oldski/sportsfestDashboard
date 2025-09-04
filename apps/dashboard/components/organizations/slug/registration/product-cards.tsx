'use client';

import * as React from 'react';
import Image from 'next/image';
import { PlusIcon, MinusIcon, ShoppingCartIcon, PackageIcon } from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group';
import { toast } from '@workspace/ui/components/sonner';
import { cn } from '@workspace/ui/lib/utils';

import { useShoppingCart } from '~/contexts/shopping-cart-context';
import type { RegistrationProductDto } from '~/types/dtos/registration-product-dto';

export type ProductCardsProps = {
  products: RegistrationProductDto[];
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Status badge variant mapping
const getStatusVariant = (status: RegistrationProductDto['status']) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'secondary';
    case 'archived':
      return 'destructive';
    default:
      return 'outline';
  }
};

type ProductCardProps = {
  product: RegistrationProductDto;
};

function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useShoppingCart();
  const [quantity, setQuantity] = React.useState(1);
  const [paymentOption, setPaymentOption] = React.useState<'full' | 'deposit'>('full');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);

  const isOutOfStock = product.status === 'archived' || (product.totalInventory !== undefined && product.totalInventory === 0);
  const isInactive = product.status === 'inactive';
  const isQuantityLimited = product.availableQuantity === 0;
  const isUnavailable = isOutOfStock || isInactive || isQuantityLimited;

  const effectivePrice = product.organizationPrice?.customPrice || product.basePrice;
  const effectiveDepositAmount = product.organizationPrice?.customDepositAmount || product.depositAmount;

  const selectedPrice = paymentOption === 'deposit' && effectiveDepositAmount
    ? effectiveDepositAmount
    : effectivePrice;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;

    // Check available quantity limits (takes precedence over maxQuantityPerOrg)
    if (product.availableQuantity !== null && newQuantity > product.availableQuantity) {
      toast.error(`Only ${product.availableQuantity} available for your organization`);
      return;
    }

    // Legacy check for products without availability system
    if (product.maxQuantityPerOrg && newQuantity > product.maxQuantityPerOrg) {
      toast.error(`Maximum quantity is ${product.maxQuantityPerOrg}`);
      return;
    }

    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (isUnavailable) return;

    const useDeposit = paymentOption === 'deposit' && product.requiresDeposit;
    addItem(product, quantity, useDeposit);

    // Reset quantity to 1 after adding
    setQuantity(1);
  };

  return (
    <Card className={cn(
      "h-full flex flex-col transition-shadow duration-200 hover:shadow-md", 
      isUnavailable && "opacity-60"
    )}>
      <CardHeader className="pb-3">
        {/* Product Image */}
        <div className="aspect-video relative bg-muted rounded-lg overflow-hidden mb-3">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <PackageIcon className="size-12 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={getStatusVariant(product.status)} className="text-xs">
                {product.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {product.category.name}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">{formatCurrency(effectivePrice)}</div>
            {product.requiresDeposit && effectiveDepositAmount && (
              <div className="text-sm text-muted-foreground">
                Deposit: {formatCurrency(effectiveDepositAmount)}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col space-y-4 justify-between h-full">
        {product.description && (
          <div className="space-y-2">
            <CardDescription className="text-sm leading-relaxed">
              {isDescriptionExpanded
                ? product.description
                : `${product.description.substring(0, 120)}${product.description.length > 120 ? '...' : ''}`
              }
            </CardDescription>
            {product.description.length > 120 && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {isDescriptionExpanded ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
        )}

        <div className="space-y-4">
          {/* Payment Options */}
          {product.requiresDeposit && effectiveDepositAmount && (
            <div>
              <Label className="text-sm font-medium">Payment Option</Label>
              <RadioGroup
                value={paymentOption}
                onValueChange={(value) => setPaymentOption(value as 'full' | 'deposit')}
                className="mt-2"
                disabled={isUnavailable}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full" id={`${product.id}-full`} />
                  <Label htmlFor={`${product.id}-full`} className="text-sm">
                    Pay Full Amount ({formatCurrency(effectivePrice)})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="deposit" id={`${product.id}-deposit`} />
                  <Label htmlFor={`${product.id}-deposit`} className="text-sm">
                    Pay Deposit ({formatCurrency(effectiveDepositAmount)})
                    <span className="text-muted-foreground ml-1">
                    + {formatCurrency(effectivePrice - effectiveDepositAmount)} later
                  </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <Label className="text-sm font-medium">Quantity</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isUnavailable}
              >
                <MinusIcon className="size-4" />
              </Button>
              <Input
                type="number"
                min="1"
                max={product.availableQuantity !== null ? product.availableQuantity : (product.maxQuantityPerOrg || 999)}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-20 text-center"
                disabled={isUnavailable}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={
                  isUnavailable ||
                  (product.availableQuantity !== null && quantity >= product.availableQuantity) ||
                  (product.maxQuantityPerOrg !== undefined && quantity >= product.maxQuantityPerOrg)
                }
              >
                <PlusIcon className="size-4" />
              </Button>
            </div>
            {/* Smart availability messaging */}
            <div className="mt-1 space-y-1">
              {product.availableQuantity !== null ? (
                <p className="text-xs text-muted-foreground">
                  {product.availableQuantity === 0 ? (
                    <span className="text-destructive font-medium">Limit reached for your organization</span>
                  ) : (
                    `${product.availableQuantity} remaining for your organization`
                  )}
                  {product.purchasedQuantity > 0 && (
                    <span className="ml-2">({product.purchasedQuantity} purchased)</span>
                  )}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Unlimited quantity available
                </p>
              )}

              {product.maxQuantityPerOrg && (
                <p className="text-xs text-muted-foreground">
                  Max {product.maxQuantityPerOrg} per organization
                </p>
              )}
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total:</span>
              <span className="font-bold">
              {formatCurrency(selectedPrice * quantity)}
            </span>
            </div>
            {paymentOption === 'deposit' && effectiveDepositAmount && (
              <div className="text-xs text-muted-foreground mt-1">
                Future payment: {formatCurrency((effectivePrice - effectiveDepositAmount) * quantity)}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleAddToCart}
          disabled={isUnavailable}
          className="w-full"
        >
          <ShoppingCartIcon className="size-4 mr-2" />
          {isOutOfStock
            ? 'Out of Stock'
            : isInactive
              ? 'Unavailable'
              : isQuantityLimited
                ? 'Limit Reached'
                : 'Add to Cart'
          }
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ProductCards({ products }: ProductCardsProps) {
  const activeProducts = products.filter(product => product.status === 'active');
  const unavailableProducts = products.filter(product => product.status !== 'active');

  return (
    <div className="space-y-6">
      {/* Active Products */}
      {activeProducts.length > 0 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Unavailable Products */}
      {unavailableProducts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-4">
            Unavailable Products
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unavailableProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-12">
          <PackageIcon className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No Products Available</h3>
          <p className="text-sm text-muted-foreground">
            Products will appear here when they are added to the system.
          </p>
        </div>
      )}
    </div>
  );
}
