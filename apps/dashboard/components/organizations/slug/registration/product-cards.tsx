'use client';

import * as React from 'react';
import Image from 'next/image';
import { PlusIcon, MinusIcon, ShoppingCartIcon, PackageIcon, ChevronDown } from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@workspace/ui/components/collapsible';
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
  const { addItem, items } = useShoppingCart();
  const [quantity, setQuantity] = React.useState(1);
  const [paymentOption, setPaymentOption] = React.useState<'full' | 'deposit'>('full');

  // Calculate quantities already in cart for this product
  const cartQuantity = React.useMemo(() => {
    return items
      .filter(item => item.productId === product.id)
      .reduce((total, item) => total + item.quantity, 0);
  }, [items, product.id]);

  // Calculate effective available quantity considering cart items
  const effectiveAvailableQuantity = React.useMemo(() => {
    if (product.availableQuantity === null) return null; // No limit
    return Math.max(0, product.availableQuantity - cartQuantity);
  }, [product.availableQuantity, cartQuantity]);

  const isOutOfStock = product.status === 'archived' || (product.totalInventory !== undefined && product.totalInventory === 0);
  const isInactive = product.status === 'inactive';
  const isQuantityLimited = effectiveAvailableQuantity !== null && effectiveAvailableQuantity === 0;
  const isUnavailable = isOutOfStock || isInactive || isQuantityLimited;


  const effectivePrice = product.organizationPrice?.customPrice || product.basePrice;
  const effectiveDepositAmount = product.organizationPrice?.customDepositAmount || product.depositAmount;

  const selectedPrice = paymentOption === 'deposit' && effectiveDepositAmount
    ? effectiveDepositAmount
    : effectivePrice;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;

    // Check effective available quantity (considering cart items)
    if (effectiveAvailableQuantity !== null && newQuantity > effectiveAvailableQuantity) {
      toast.error(`Only ${effectiveAvailableQuantity} more available for your organization`);
      return;
    }

    // Legacy check for products without availability system
    if (effectiveAvailableQuantity === null && product.maxQuantityPerOrg && newQuantity > product.maxQuantityPerOrg) {
      toast.error(`Maximum quantity is ${product.maxQuantityPerOrg}`);
      return;
    }

    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (isUnavailable) return;

    const useDeposit = paymentOption === 'deposit' && product.requiresDeposit;
    await addItem(product, quantity, useDeposit);

    // Reset quantity to 1 after adding
    setQuantity(1);
  };

  return (
    <Card className={cn(
      "h-full flex flex-col transition-shadow duration-200 hover:shadow-md p-4",
      isUnavailable && "opacity-60"
    )}>
      <CardHeader className="px-0">
        {/* Product Image */}
        <div className="flex items-start justify-between gap-3 h-full">
          <div className="aspect-square relative bg-muted rounded-lg w-1/3 overflow-hidden mb-2">
            {product.image ? (
              <Image
                src={product.image}
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
          <div className="flex flex-col items-between h-full w-2/3 py-2">
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
            <div>
              <div className="font-bold text-lg">{formatCurrency(effectivePrice)}</div>
              {product.requiresDeposit && effectiveDepositAmount && (
                <div className="text-sm text-muted-foreground">
                  Deposit: {formatCurrency(effectiveDepositAmount)}
                </div>
              )}
            </div>
          </div>
        </div>


        <div className="hidden aspect-square relative bg-muted rounded-lg overflow-hidden mb-2">
          {product.image ? (
            <Image
              src={product.image}
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
        <div className="hidden flex items-start justify-between">
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

      <CardContent className="flex flex-col space-y-3 justify-between h-full px-0">
        {product.description && (
          <Collapsible className="relative">
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between gap-2 bg-muted/50 p-2 rounded-lg cursor-pointer hover:bg-muted transition-colors w-full group">
                <h4 className="text-sm font-semibold">Description</h4>
                <div className="flex items-center gap-1">
                  <span className="sr-only">Toggle description</span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="absolute top-full left-0 right-0 z-10 mt-2 bg-background border border-border rounded-md shadow-lg p-3">
              <CardDescription className="text-sm leading-relaxed">
                {product.description}
              </CardDescription>
            </CollapsibleContent>
          </Collapsible>
        )}

        <div className="space-y-3">
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
                max={effectiveAvailableQuantity !== null ? effectiveAvailableQuantity : (product.maxQuantityPerOrg || 999)}
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
                  (effectiveAvailableQuantity !== null && quantity >= effectiveAvailableQuantity) ||
                  (effectiveAvailableQuantity === null && product.maxQuantityPerOrg != null && quantity >= product.maxQuantityPerOrg)
                }
              >
                <PlusIcon className="size-4" />
              </Button>
            </div>
            {/* Smart availability messaging */}
            <div className="mt-1 space-y-1">
              {product.availableQuantity !== null ? (
                <p className="text-xs text-muted-foreground">
                  {effectiveAvailableQuantity === 0 ? (
                    <span className="text-destructive font-medium">
                      {cartQuantity > 0 ? 'All available items in cart' : 'Limit reached for your organization'}
                    </span>
                  ) : (
                    `${effectiveAvailableQuantity} remaining for your organization`
                  )}
                  {product.purchasedQuantity > 0 && (
                    <span className="ml-2">({product.purchasedQuantity} purchased)</span>
                  )}
                  {cartQuantity > 0 && (
                    <span className="ml-2 text-blue-600">({cartQuantity} in cart)</span>
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
          <div className="bg-muted/50 p-2 rounded-lg">
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

      <CardFooter className="px-0">
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
    <div className="space-y-6 pb-24">
      {/* Active Products */}
      {activeProducts.length > 0 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
