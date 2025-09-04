'use client';

import { PlusIcon } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useProductDialog } from '~/components/admin/event-registration/product-dialog-provider';

export function CreateProductButton(): React.JSX.Element {
  const { openCreateDialog } = useProductDialog();

  return (
    <Button onClick={openCreateDialog}>
      <PlusIcon className="mr-2 h-4 w-4" />
      Create Product
    </Button>
  );
}