'use client';

import * as React from 'react';
import { PlusIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { useCreateCouponDialog } from './create-coupon-dialog-provider';

export function CreateCouponButton(): React.JSX.Element {
  const { openDialog } = useCreateCouponDialog();

  return (
    <Button onClick={openDialog} size="sm">
      <PlusIcon className="size-4 shrink-0" />
      <span className="hidden lg:inline">Coupon</span>
    </Button>
  );
}
