import * as React from 'react';
import { type Metadata } from 'next';
import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';

import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar
} from '@workspace/ui/components/page';
import { PageTitle } from '@workspace/ui/components/page';

import { createTitle } from '~/lib/formatters';
import { ProductDialogProvider } from '~/components/admin/event-registration/product-dialog-provider';
import { ProductCategoryDialogProvider } from '~/components/admin/event-registration/product-category-dialog-provider';
import { CreateProductButton } from '~/components/admin/event-registration/create-product-button';
import { getProductFormData } from '~/actions/admin/get-product-form-data';

export const metadata: Metadata = {
  title: createTitle('Products')
};

export type ProductsLayoutProps = {
  products: React.ReactNode;
  categories: React.ReactNode;
};

export default async function ProductsLayout({
  products,
  categories
}: ProductsLayoutProps & NextPageProps): Promise<React.JSX.Element> {
  const formData = await getProductFormData();

  return (
    <ProductDialogProvider formData={formData}>
      <ProductCategoryDialogProvider>
        <Page>
          <PageHeader>
            <PagePrimaryBar>
              <div className="flex flex-row items-center gap-2">
                <Link
                  className="text-sm font-semibold hover:underline"
                  href="/admin/event-registration"
                >
                  Event Registration
                </Link>
                <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <PageTitle>Products Management</PageTitle>
              </div>
              <CreateProductButton />
            </PagePrimaryBar>
          </PageHeader>
          <PageBody disableScroll>
            <div className="mx-auto w-full space-y-6 p-2 sm:space-y-8 sm:p-6">
              {products}
              {categories}
            </div>
          </PageBody>
        </Page>
      </ProductCategoryDialogProvider>
    </ProductDialogProvider>
  );
}
