import * as React from 'react';

import { getSponsorships } from '~/actions/admin/get-sponsorships';
import { SponsorshipDataTable } from '~/components/admin/event-registration/sponsorship-data-table';

export default async function SponsorshipTablePage(): Promise<React.JSX.Element> {
  const sponsorships = await getSponsorships();

  return (
    <div className="space-y-6">
      <SponsorshipDataTable data={sponsorships} />
    </div>
  );
}
