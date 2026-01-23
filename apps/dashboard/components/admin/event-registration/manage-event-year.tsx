'use client';

import * as React from 'react';
import Link from 'next/link';
import { SettingsIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { useEventYearDialog } from '~/components/admin/event-registration/event-year-dialog-provider';
import type { EventYearWithStats } from '~/actions/admin/get-event-years';

interface ManageEventYearProps {
  activeEventYear: EventYearWithStats | undefined;
}

export function ManageEventYear({ activeEventYear }: ManageEventYearProps): React.JSX.Element {
  const { openEditDialog } = useEventYearDialog();

  if (!activeEventYear) {
    return <></>;
  }

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        onClick={() => openEditDialog(activeEventYear.id)}
      >
        <SettingsIcon className="lg:mr-2 h-3 w-3" />
        <span className="hidden lg:inline">Manage</span>
      </Button>
    </div>
  );
}
