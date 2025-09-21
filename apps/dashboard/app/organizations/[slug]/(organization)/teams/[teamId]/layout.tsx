import * as React from 'react';
import type { Metadata } from 'next';

import { createTitle } from '~/lib/formatters';
import {getCompanyTeamById} from "~/data/teams/get-company-team-by-id";

export async function generateMetadata({
                                         params
                                       }: {
  params: Promise<{ teamId: string }>;
}): Promise<Metadata> {
  const { teamId } = await params;
  const team = await getCompanyTeamById(teamId);

  const title = team ? (team.name || `Team ${team.teamNumber}`) : 'Team';
  return {
    title: createTitle(title)
  };
}

export default function TeamLayout({
                                      children
                                    }: React.PropsWithChildren): React.JSX.Element {
  return (
    <div className="flex h-screen flex-row overflow-hidden">
      <div className="size-full">{children}</div>
    </div>
  );
}
