'use client';

import * as React from 'react';
import { PlusIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { useCreateSponsorshipDialog } from './create-sponsorship-dialog-provider';

export function CreateSponsorshipButton(): React.JSX.Element {
  const { openDialog } = useCreateSponsorshipDialog();

  return (
    <Button onClick={openDialog} size="sm">
      <PlusIcon className="size-4 shrink-0" />
      Sponsorship
    </Button>
  );
}
