import { redirect } from 'next/navigation';

import { getAuthContext } from '@workspace/auth/context';
import { routes } from '@workspace/routes';

import { isSuperAdmin } from '~/lib/admin-utils';

export default async function RootPage(): Promise<never> {
  const ctx = await getAuthContext();

  if (!ctx.session.user.completedOnboarding) {
    return redirect(routes.dashboard.onboarding.Index);
  }

  if (isSuperAdmin(ctx.session.user)) {
    return redirect('/admin');
  }

  return redirect(routes.dashboard.organizations.Index);
}