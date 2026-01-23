import * as React from 'react';

import {Page, PageActions, PageBody, PageHeader, PagePrimaryBar, PageSecondaryBar} from "@workspace/ui/components/page";
import {AdminPageTitle} from "~/components/admin/admin-page-title";
import { EventRegistrationNav } from '~/components/admin/event-registration/event-registration-nav';

interface EventRegistrationLayoutProps {
  children: React.ReactNode;
}

export default function EventRegistrationLayout({ children }: EventRegistrationLayoutProps): React.JSX.Element {
  return(
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">{children}</div>
    </div>
  )
}
