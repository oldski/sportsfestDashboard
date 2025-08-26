import * as React from 'react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default function WebooksLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnnotatedSection
      title="Webhooks"
      description="Register POST endpoints to be notified on asynchronous events."
    >
      {children}
    </AnnotatedSection>
  );
}
