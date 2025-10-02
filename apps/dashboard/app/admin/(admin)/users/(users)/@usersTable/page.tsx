import * as React from 'react';
import type { Metadata } from 'next';

import { getUsers } from '~/actions/admin/get-users';
import { UsersDataTable } from '~/components/admin/users-data-table';
import { createTitle } from '~/lib/formatters';

export default async function UsersTablePage(): Promise<React.JSX.Element> {
  const users = await getUsers();

  return <UsersDataTable data={users} />;
}
