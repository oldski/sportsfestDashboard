import * as React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';

import { CreateProductForm } from '~/components/admin/event-registration/create-product-form';

export default function CreateProductPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/event-registration/products">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Product</h1>
          <p className="text-muted-foreground">
            Add a new product to the SportsFest catalog for organizations to purchase
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Configure the product details, pricing, and availability settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateProductForm />
        </CardContent>
      </Card>
    </div>
  );
}