import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function JoinRequestsLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Join Requests"
      description="Manage requests from users who want to join your organization."
    >
      {children}
    </AnnotatedSection>
  );
}
