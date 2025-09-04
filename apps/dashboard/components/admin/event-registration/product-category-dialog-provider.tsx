'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ProductCategoryDialog } from '~/components/admin/event-registration/product-category-dialog';
import { DeleteProductCategoryDialog } from '~/components/admin/event-registration/delete-product-category-dialog';
import type { ProductCategoryWithStats } from '~/actions/admin/get-product-categories';

interface ProductCategoryDialogContextType {
  openCreateDialog: () => void;
  openEditDialog: (categoryId: string) => void;
  openDeleteDialog: (category: ProductCategoryWithStats) => void;
}

const ProductCategoryDialogContext = React.createContext<ProductCategoryDialogContextType | null>(null);

export function useProductCategoryDialog() {
  const context = React.useContext(ProductCategoryDialogContext);
  if (!context) {
    throw new Error('useProductCategoryDialog must be used within ProductCategoryDialogProvider');
  }
  return context;
}

interface ProductCategoryDialogProviderProps {
  children: React.ReactNode;
}

export function ProductCategoryDialogProvider({ children }: ProductCategoryDialogProviderProps): React.JSX.Element {
  const router = useRouter();
  
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<any>(null);

  const openCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const openEditDialog = async (categoryId: string) => {
    try {
      const { getProductCategory } = await import('~/actions/admin/get-product-categories');
      const fullCategory = await getProductCategory(categoryId);
      if (fullCategory) {
        setSelectedCategory(fullCategory);
        setEditDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching category for edit:', error);
    }
  };

  const openDeleteDialog = (category: ProductCategoryWithStats) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    router.refresh();
  };

  return (
    <ProductCategoryDialogContext.Provider value={{ openCreateDialog, openEditDialog, openDeleteDialog }}>
      {children}
      
      {/* Dialogs */}
      <ProductCategoryDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) handleDialogClose();
        }}
        mode="create"
      />

      <ProductCategoryDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setSelectedCategory(null);
            handleDialogClose();
          }
        }}
        category={selectedCategory}
        mode="edit"
      />

      {selectedCategory && (
        <DeleteProductCategoryDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          category={selectedCategory}
          onDeleted={() => {
            setDeleteDialogOpen(false);
            setSelectedCategory(null);
            handleDialogClose();
          }}
        />
      )}
    </ProductCategoryDialogContext.Provider>
  );
}