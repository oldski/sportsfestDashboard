import * as React from 'react';

import { getTransferWarnings } from '~/data/teams/get-transfer-warnings';
import { getCompanyTeams } from '~/data/teams/get-company-teams';
import { TransferWarningsWrapper } from '~/components/teams/transfer-warnings-wrapper';

type TransferWarningsParallelRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function TransferWarningsParallelRoute({
  params
}: TransferWarningsParallelRouteProps): Promise<React.JSX.Element> {
  const { slug } = await params;

  const [transferWarningsData, teamsData] = await Promise.all([
    getTransferWarnings(),
    getCompanyTeams()
  ]);

  // Only show if we have teams
  if (teamsData.teams.length === 0) {
    return <></>;
  }

  return (
    <TransferWarningsWrapper
      warnings={transferWarningsData.warnings}
      totalCount={transferWarningsData.totalCount}
      orgSlug={slug}
    />
  );
}