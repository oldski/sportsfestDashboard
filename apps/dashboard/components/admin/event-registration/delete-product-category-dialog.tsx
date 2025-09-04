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

import type { ProductCategoryWithStats } from '~/actions/admin/get-product-categories';

interface DeleteProductCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ProductCategoryWithStats;
  onDeleted: () => void;
}

export function DeleteProductCategoryDialog({
  open,
  onOpenChange,
  category,
  onDeleted
}: DeleteProductCategoryDialogProps): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const { deleteProductCategory } = await import('~/actions/admin/product-category');
      await deleteProductCategory(category.id);
      
      toast.success(`Category "${category.name}" has been removed successfully!`);
      onDeleted();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove category. Please try again.');
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
            Remove Category
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to remove <strong>"{category.name}"</strong>?
            </p>
            {category.productCount > 0 && (
              <p className="text-sm text-destructive">
                Warning: This category contains {category.productCount} product{category.productCount !== 1 ? 's' : ''}. 
                Removing this category may affect existing products.
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              This action will deactivate the category. This cannot be easily undone.
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
            Remove Category
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}