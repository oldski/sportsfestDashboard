import * as React from 'react';
import type {Metadata} from "next";
import {createTitle} from "~/lib/formatters";

export const metadata: Metadata = {
  title: createTitle('SportsFest Team Member Sign Up'),
};

// Layout for team member signup pages
export default function TeamSignupLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
