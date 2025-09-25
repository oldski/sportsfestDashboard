import * as React from 'react';
import { notFound } from 'next/navigation';

import { PlayersDataTable } from '~/components/organizations/slug/players/players-data-table';
import { getPlayers } from '~/data/players/get-players';
import { getEventYears } from '~/data/players/get-event-years';
import { getOrganizationBySlug } from '~/data/organization/get-organization-by-slug';

interface PlayersTablePageProps {
  params: { slug: string };
}

export default async function PlayersTablePage({
  params
}: PlayersTablePageProps): Promise<React.JSX.Element> {
  const organization = await getOrganizationBySlug(params.slug);
  if (!organization) {
    notFound();
  }

  const [playersData, eventYears] = await Promise.all([
    getPlayers({
      organizationId: organization.id,
      pagination: {
        page: 1,
        limit: 1000 // Get all players for export - set high limit
      }
    }),
    getEventYears(),
  ]);

  return (
    <PlayersDataTable
      data={playersData}
      eventYears={eventYears}
      organization={organization}
    />
  );
}
