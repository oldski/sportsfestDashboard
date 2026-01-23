'use client';

import { PlusIcon } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useProductDialog } from '~/components/admin/event-registration/product-dialog-provider';

export function CreateProductButton(): React.JSX.Element {
  const { openCreateDialog } = useProductDialog();

  return (
    <Button onClick={openCreateDialog}>
      <PlusIcon className="lg:mr-2 h-4 w-4" />
      <span className="hidden lg:inline">Create Product</span>
    </Button>
  );
}
