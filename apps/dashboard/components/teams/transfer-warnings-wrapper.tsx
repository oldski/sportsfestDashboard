'use client';

import * as React from 'react';
import { TransferWarningsCard } from './transfer-warnings-card';
import { TransferWarning } from '~/data/teams/get-transfer-warnings';
import { revalidateTeamsPage } from '~/actions/teams/revalidate-teams';

interface TransferWarningsWrapperProps {
  warnings: TransferWarning[];
  totalCount: number;
  orgSlug: string;
}

export function TransferWarningsWrapper({ 
  warnings, 
  totalCount, 
  orgSlug 
}: TransferWarningsWrapperProps) {
  const handleWarningsUpdated = React.useCallback(async () => {
    await revalidateTeamsPage(orgSlug);
  }, [orgSlug]);

  return (
    <TransferWarningsCard
      warnings={warnings}
      totalCount={totalCount}
      onWarningsUpdated={handleWarningsUpdated}
    />
  );
}