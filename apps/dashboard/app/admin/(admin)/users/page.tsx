import * as React from 'react';
import type { Metadata } from 'next';

import { getUsers } from '~/actions/admin/get-users';
import { UsersDataTable } from '~/components/admin/users-data-table';

export default async function AdminUsersPage(): Promise<React.JSX.Element> {
  const users = await getUsers();

  return (
    <>
      <UsersDataTable data={users} />
    </>
  );
}
