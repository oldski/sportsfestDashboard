'use client';

import { PlusIcon } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useEventYearDialog } from './event-year-dialog-provider';

export function CreateEventYearButton(): React.JSX.Element {
  const { openCreateDialog } = useEventYearDialog();
  
  return (
    <Button onClick={openCreateDialog}>
      <PlusIcon className="mr-2 h-4 w-4" />
      Create Event Year
    </Button>
  );
}