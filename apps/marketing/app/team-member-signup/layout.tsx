import * as React from 'react';

// Special layout for team member signup - no header/footer
export default function TeamSignupLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
