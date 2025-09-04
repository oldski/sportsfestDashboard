'use client';

import * as React from 'react';
import { PlusIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';

import { useCreateInvoiceDialog } from './create-invoice-dialog-provider';

export function CreateInvoiceButton(): React.JSX.Element {
  const { openDialog } = useCreateInvoiceDialog();

  return (
    <Button onClick={openDialog} size="sm">
      <PlusIcon className="mr-2 h-4 w-4" />
      Create Invoice
    </Button>
  );
}