import * as React from 'react';
import { type Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getAuthContext } from '@workspace/auth/context';
import { routes } from '@workspace/routes';

import { createTitle } from '~/lib/formatters';
import { isSuperAdmin } from '~/lib/admin-utils';

export const metadata: Metadata = {
  title: createTitle('Admin')
};

export default async function AdminLayout(
  props: React.PropsWithChildren
): Promise<React.JSX.Element> {
  const ctx = await getAuthContext();
  
  if (!isSuperAdmin(ctx.session.user)) {
    return redirect('/auth/sign-in');
  }
  return <>{props.children}</>;
}
