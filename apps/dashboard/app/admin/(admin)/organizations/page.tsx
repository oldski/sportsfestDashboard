import * as React from 'react';
import type { Metadata } from 'next';

import { getOrganizations } from '~/actions/admin/get-organizations';
import { OrganizationsDataTable } from '~/components/admin/organizations-data-table';
import {createTitle} from "~/lib/formatters";

export const metadata: Metadata = {
  title: createTitle('Organizations')
};

export default async function AdminOrganizationsPage(): Promise<React.JSX.Element> {
  const organizations = await getOrganizations();

  return <OrganizationsDataTable data={organizations} />;
}
