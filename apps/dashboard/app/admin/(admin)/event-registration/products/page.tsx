import * as React from 'react';
import Link from 'next/link';
import { PlusIcon, EditIcon, TrashIcon, PackageIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';

// Mock data - will be replaced with real data from database actions
const mockProducts = [
  {
    id: '1',
    name: 'SportsFest Team Registration',
    category: 'Registration',
    productType: 'team_registration',
    eventYear: '2025',
    fullAmount: 150.00,
    depositAmount: 50.00,
    requiresDeposit: true,
    maxQuantityPerOrg: null,
    status: 'active',
    createdAt: '2025-01-15'
  },
  {
    id: '2',
    name: '10x10 Event Tent',
    category: 'Equipment',
    productType: 'tent_rental',
    eventYear: '2025',
    fullAmount: 200.00,
    depositAmount: 75.00,
    requiresDeposit: true,
    maxQuantityPerOrg: 2,
    status: 'active',
    createdAt: '2025-01-10'
  },
  {
    id: '3',
    name: 'SportsFest T-Shirt',
    category: 'Merchandise',
    productType: 'merchandise',
    eventYear: '2025',
    fullAmount: 25.00,
    depositAmount: 0,
    requiresDeposit: false,
    maxQuantityPerOrg: 50,
    status: 'active',
    createdAt: '2025-01-08'
  },
  {
    id: '4',
    name: 'Team Lunch Package',
    category: 'Food & Beverage',
    productType: 'food_service',
    eventYear: '2025',
    fullAmount: 15.00,
    depositAmount: 5.00,
    requiresDeposit: true,
    maxQuantityPerOrg: 100,
    status: 'active',
    createdAt: '2025-01-05'
  }
];

export default function ProductsPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Product Management</h2>
          <p className="text-muted-foreground">
            Manage product catalog, categories, pricing, and deposit settings
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/event-registration/products/create">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Product
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProducts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requires Deposit</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockProducts.filter(p => p.requiresDeposit).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Quantity Limits</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockProducts.filter(p => p.maxQuantityPerOrg !== null).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue Potential</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockProducts.reduce((sum, p) => sum + p.fullAmount, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products Catalog</CardTitle>
          <CardDescription>
            Manage all products available for organization registration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
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
                {mockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.productType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.eventYear}</TableCell>
                    <TableCell>${product.fullAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      {product.requiresDeposit ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            ${product.depositAmount.toFixed(2)}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          None
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.maxQuantityPerOrg ? (
                        <Badge variant="destructive" className="text-xs">
                          {product.maxQuantityPerOrg}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Unlimited</span>
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
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/event-registration/products/${product.id}/edit`}>
                            <EditIcon className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <TrashIcon className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Product Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Product Categories</CardTitle>
          <CardDescription>
            Organize products by category for better management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Registration', count: 1, color: 'bg-blue-100 text-blue-800' },
              { name: 'Equipment', count: 1, color: 'bg-green-100 text-green-800' },
              { name: 'Merchandise', count: 1, color: 'bg-purple-100 text-purple-800' },
              { name: 'Food & Beverage', count: 1, color: 'bg-orange-100 text-orange-800' }
            ].map((category) => (
              <div key={category.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground">{category.count} products</p>
                </div>
                <Badge className={category.color}>
                  {category.count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}