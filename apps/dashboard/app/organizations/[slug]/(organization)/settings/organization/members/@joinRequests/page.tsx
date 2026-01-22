import * as React from 'react';

import { JoinRequestsCard } from '~/components/organizations/slug/settings/organization/members/join-requests-card';
import { getJoinRequests } from '~/data/members/get-join-requests';

export default async function JoinRequestsPage(): Promise<React.JSX.Element> {
  const joinRequests = await getJoinRequests();

  return <JoinRequestsCard joinRequests={joinRequests} />;
}
