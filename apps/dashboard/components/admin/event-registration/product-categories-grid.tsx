'use client';

import * as React from 'react';
import { PlusIcon, EditIcon, TrashIcon, FolderIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';

import { useProductCategoryDialog } from '~/components/admin/event-registration/product-category-dialog-provider';
import type { ProductCategoryWithStats } from '~/actions/admin/get-product-categories';

interface ProductCategoriesGridProps {
  categories: ProductCategoryWithStats[];
}

export function ProductCategoriesGrid({ categories }: ProductCategoriesGridProps): React.JSX.Element {
  const { openCreateDialog, openEditDialog, openDeleteDialog } = useProductCategoryDialog();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Product Categories</h3>
          <p className="text-sm text-muted-foreground">
            Organize products by category for better management
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={openCreateDialog}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-4 gap-4">
        {categories.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-base text-muted-foreground">No Categories Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Create your first product category to get started.
              </p>
              <Button variant="outline" onClick={openCreateDialog}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Product Category
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <FolderIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-base">{category.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {category.description || 'No description provided'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {category.productCount} product{category.productCount !== 1 ? 's' : ''}
                      </Badge>
                      <Badge
                        variant={category.isActive ? 'default' : 'secondary'}
                        className="text-xs capitalize"
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(category.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(category.id)}
                      >
                        <EditIcon className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(category)}
                      >
                        <TrashIcon className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add Category Card */}
            <Card className="border-dashed">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-base text-muted-foreground">Add New Category</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full" onClick={openCreateDialog}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create Product Category
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
