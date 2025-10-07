import * as React from 'react';
import type {Metadata} from "next";
import {Footer} from "~/components/footer";
import {createTitle} from "~/lib/formatters";

export const metadata: Metadata = {
  title: createTitle('SportsFest Team Member Sign Up'),
};

// Special layout for team member signup - no header/footer
export default function TeamSignupLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <div className="min-h-screen">
      {children}
      <Footer />
    </div>
  );
}
