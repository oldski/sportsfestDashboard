import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider
} from '@workspace/ui/components/sidebar';

import { RegistrationSidebar } from '~/components/organizations/slug/registration/registration-sidebar';

export type RegistrationLayoutProps = React.PropsWithChildren;

export default function RegistrationLayout({
  children
}: RegistrationLayoutProps): React.JSX.Element {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar variant="sidebar" className="w-60">
          <SidebarContent>
            <RegistrationSidebar />
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1">
          <main className="flex-1 space-y-4 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}