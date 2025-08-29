'use client';

import * as React from 'react';

import { SidebarProvider } from '@workspace/ui/components/sidebar';

export type ProvidersProps = React.PropsWithChildren<{
  defaultOpen?: boolean;
  defaultWidth?: string | null;
}>;

export function Providers({
  children,
  defaultOpen = true,
  defaultWidth
}: ProvidersProps): React.JSX.Element {
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          '--sidebar-width': defaultWidth || '16rem',
        } as React.CSSProperties
      }
    >
      {children}
    </SidebarProvider>
  );
}