'use client';

import { PlusIcon } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useEventYearDialog } from './event-year-dialog-provider';

export function CreateEventYearButton(): React.JSX.Element {
  const { openCreateDialog } = useEventYearDialog();

  return (
    <Button onClick={openCreateDialog}>
      <PlusIcon className="lg:mr-2 h-4 w-4" />
      <span className="hidden lg:inline">Create Event Year</span>
    </Button>
  );
}
