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

    </>
  );
}
