'use client';

import * as React from 'react';
import { Loader2Icon, AlertTriangleIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { toast } from '@workspace/ui/components/sonner';

import type { ProductWithDetails } from '~/actions/admin/get-products';

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithDetails;
  onDeleted: () => void;
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
  onDeleted
}: DeleteProductDialogProps): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const { softDeleteProduct } = await import('~/actions/admin/product');
      await softDeleteProduct(product.id);
      
      toast.success(`Product "${product.name}" has been removed successfully!`);
      onDeleted();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-destructive" />
            Remove Product
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to remove <strong>"{product.name}"</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action will soft-delete the product and mark it as inactive. 
              This cannot be easily undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Remove Product
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}