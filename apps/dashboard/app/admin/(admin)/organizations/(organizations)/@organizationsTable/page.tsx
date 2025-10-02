import * as React from 'react';

import {getOrganizations} from "~/actions/admin/get-organizations";
import {OrganizationsDataTable} from "~/components/admin/organizations-data-table";

export default async function OrganizationsTablePage(): Promise<React.JSX.Element> {
  const organizations = await getOrganizations();

  return <OrganizationsDataTable data={organizations} />;
}
