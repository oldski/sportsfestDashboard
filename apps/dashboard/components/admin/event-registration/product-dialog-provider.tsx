'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ProductDialog } from '~/components/admin/event-registration/product-dialog';
import { DeleteProductDialog } from '~/components/admin/event-registration/delete-product-dialog';
import { CopyProductDialog } from '~/components/admin/event-registration/copy-product-dialog';
import type { ProductWithDetails } from '~/actions/admin/get-products';
import type { ProductFormSelectData } from '~/actions/admin/get-product-form-data';

interface ProductDialogContextType {
  openCreateDialog: () => void;
  openEditDialog: (productId: string) => void;
  openViewDialog: (productId: string) => void;
  openDeleteDialog: (product: ProductWithDetails) => void;
  openCopyDialog: (productId: string) => void;
}

const ProductDialogContext = React.createContext<ProductDialogContextType | null>(null);

export function useProductDialog() {
  const context = React.useContext(ProductDialogContext);
  if (!context) {
    throw new Error('useProductDialog must be used within ProductDialogProvider');
  }
  return context;
}

interface ProductDialogProviderProps {
  children: React.ReactNode;
  formData: ProductFormSelectData;
  activeEventYearId: string | null;
}

export function ProductDialogProvider({
  children,
  formData,
  activeEventYearId
}: ProductDialogProviderProps): React.JSX.Element {
  const router = useRouter();

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [viewProduct, setViewProduct] = React.useState<any>(null);
  const [copySourceProductId, setCopySourceProductId] = React.useState<string | null>(null);

  const openCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const openEditDialog = async (productId: string) => {
    try {
      const { getProduct } = await import('~/actions/admin/get-product');
      const fullProduct = await getProduct(productId);
      if (fullProduct) {
        setSelectedProduct(fullProduct);
        setEditDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching product for edit:', error);
    }
  };

  const openViewDialog = async (productId: string) => {
    try {
      const { getProduct } = await import('~/actions/admin/get-product');
      const fullProduct = await getProduct(productId);
      if (fullProduct) {
        setViewProduct(fullProduct);
        setViewDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching product for view:', error);
    }
  };

  const openDeleteDialog = (product: ProductWithDetails) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const openCopyDialog = (productId: string) => {
    setCopySourceProductId(productId);
    setCopyDialogOpen(true);
  };

  const handleDialogClose = () => {
    router.refresh();
  };

  return (
    <ProductDialogContext.Provider value={{ openCreateDialog, openEditDialog, openViewDialog, openDeleteDialog, openCopyDialog }}>
      {children}

      {/* Dialogs */}
      <ProductDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) handleDialogClose();
        }}
        mode="create"
        formData={formData}
      />

      <ProductDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setSelectedProduct(null);
            handleDialogClose();
          }
        }}
        product={selectedProduct}
        mode="edit"
        formData={formData}
      />

      <ProductDialog
        open={viewDialogOpen}
        onOpenChange={(open) => {
          setViewDialogOpen(open);
          if (!open) {
            setViewProduct(null);
          }
        }}
        product={viewProduct}
        mode="view"
        formData={formData}
      />

      {selectedProduct && (
        <DeleteProductDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          product={selectedProduct}
          onDeleted={() => {
            setDeleteDialogOpen(false);
            setSelectedProduct(null);
            handleDialogClose();
          }}
        />
      )}

      <CopyProductDialog
        open={copyDialogOpen}
        onOpenChange={(open) => {
          setCopyDialogOpen(open);
          if (!open) {
            setCopySourceProductId(null);
          }
        }}
        sourceProductId={copySourceProductId}
        defaultEventYearId={activeEventYearId}
        eventYears={formData.eventYears}
        onCopied={handleDialogClose}
      />
    </ProductDialogContext.Provider>
  );
}