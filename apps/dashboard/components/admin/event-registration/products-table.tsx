'use client';

import * as React from 'react';
import {EditIcon, InfinityIcon, TrashIcon} from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';

import { formatCurrency } from '~/lib/formatters';
import { useProductDialog } from '~/components/admin/event-registration/product-dialog-provider';
import type { ProductWithDetails } from '~/actions/admin/get-products';

interface ProductsTableProps {
  products: ProductWithDetails[];
}

export function ProductsTable({ products }: ProductsTableProps): React.JSX.Element {
  const { openEditDialog, openDeleteDialog } = useProductDialog();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Event Year</TableHead>
          <TableHead>Full Price</TableHead>
          <TableHead>Deposit</TableHead>
          <TableHead>Max Qty</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
              No products found. Create your first product to get started.
            </TableCell>
          </TableRow>
        ) : (
          products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.categoryName}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {product.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </TableCell>
              <TableCell>{product.eventYear}</TableCell>
              <TableCell>{formatCurrency(product.basePrice)}</TableCell>
              <TableCell>
                {formatCurrency(product.depositAmount || 0)}
              </TableCell>
              <TableCell>
                {product.maxQuantityPerOrg ? (
                  <Badge variant="destructive" className="text-xs">
                    {product.maxQuantityPerOrg}
                  </Badge>
                ) : (
                  <InfinityIcon />
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={product.status === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {product.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(product.id)}
                  >
                    <EditIcon className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(product)}
                  >
                    <TrashIcon className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
