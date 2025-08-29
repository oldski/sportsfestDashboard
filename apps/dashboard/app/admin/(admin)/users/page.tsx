import * as React from 'react';
import type { Metadata } from 'next';

import { getUsers } from '~/actions/admin/get-users';
import { UsersDataTable } from './users-data-table';

export const metadata: Metadata = {
  title: 'Users | SportsFest Admin'
};

export default async function AdminUsersPage(): Promise<React.JSX.Element> {
  const users = await getUsers();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Users</h2>
            <p className="text-muted-foreground">
              Manage all users and their permissions across organizations.
            </p>
          </div>
        </div>
        <UsersDataTable data={users} />
      </div>
    </div>
  );
}