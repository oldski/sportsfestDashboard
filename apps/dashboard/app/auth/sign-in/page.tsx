import * as React from 'react';
import { type Metadata } from 'next';

import { SignInCard } from '~/components/auth/sign-in/sign-in-card';
import { createTitle } from '~/lib/formatters';
import Link from "next/link";
import {routes} from "@workspace/routes";

export const metadata: Metadata = {
  title: createTitle('Sign in')
};

export default async function SignInPage(): Promise<React.JSX.Element> {
  return (
    <>
      <SignInCard />
      <div className="px-2 text-xs text-muted-foreground">
        Need help?{' '}
        <Link
          prefetch={false}
          href={routes.marketing.Contact}
          className="text-foreground underline"
        >
          Get in touch
        </Link>
        .
      </div>
    </>
  );
}
