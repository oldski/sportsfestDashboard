import * as React from 'react';
import type { Metadata } from 'next';

import { getOrganizations } from '~/actions/admin/get-organizations';
import { OrganizationsDataTable } from './organizations-data-table';

export const metadata: Metadata = {
  title: 'Organizations | SportsFest Admin'
};

export default async function AdminOrganizationsPage(): Promise<React.JSX.Element> {
  const organizations = await getOrganizations();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Organizations</h2>
            <p className="text-muted-foreground">
              Manage all organizations and their settings.
            </p>
          </div>
        </div>
        <OrganizationsDataTable data={organizations} />
      </div>
    </div>
  );
}