import * as React from 'react';
import type { Metadata } from 'next';

import { getPlayers } from '~/actions/admin/get-players';
import { PlayersDataTable } from '~/components/admin/players-data-table';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Players')
};

export default async function PlayersTablePage(): Promise<React.JSX.Element> {
  const players = await getPlayers();

  return <PlayersDataTable data={players} />;
}
