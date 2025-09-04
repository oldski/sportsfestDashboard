'use client';

import * as React from 'react';
import { DollarSignIcon } from 'lucide-react';

import { DropdownMenuItem } from '@workspace/ui/components/dropdown-menu';

import { useRecordPaymentDialog } from './record-payment-dialog-provider';

interface RecordPaymentButtonProps {
  invoiceId: string;
  asChild?: boolean;
  className?: string;
}

export function RecordPaymentButton({ 
  invoiceId, 
  asChild = false, 
  className 
}: RecordPaymentButtonProps): React.JSX.Element {
  const { openDialog } = useRecordPaymentDialog();

  const handleClick = () => {
    openDialog(invoiceId);
  };

  if (asChild) {
    return (
      <DropdownMenuItem onClick={handleClick} className={className}>
        <DollarSignIcon className="mr-2 size-4" />
        Record payment
      </DropdownMenuItem>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 ${className}`}
    >
      <DollarSignIcon className="size-4" />
      Record Payment
    </button>
  );
}