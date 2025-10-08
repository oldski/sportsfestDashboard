import * as React from 'react';
import Link from 'next/link';

import { routes } from '@workspace/routes';
import { Alert } from '@workspace/ui/components/alert';
import { buttonVariants } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  type CardProps
} from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';

export type SignInToAcceptCardProps = CardProps & {
  organizationName: string;
  email: string;
  loggedIn: boolean;
};

export function SignInToAcceptCard({
  organizationName,
  email,
  loggedIn,
  className,
  ...other
}: SignInToAcceptCardProps): React.JSX.Element {
  return (
    <Card
      className={cn(
        'w-full px-4 py-8 border-transparent dark:border-border',
        className
      )}
      {...other}
    >
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">
          You have been invited to join
          <span className="block text-xl font-semibold text-foreground">
            {organizationName}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <p className="text-muted-foreground">
          To accept the invitation please sign in or create an account as
        </p>
        <p className="break-all font-medium">{email}</p>
        {loggedIn && (
          <Alert
            variant="info"
            className="mt-4"
          >
            You are currently logged in with a different account. Sign out and
            log in with the correct account to accept the invitation.
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Link
          href={routes.dashboard.auth.SignUp}
          className={buttonVariants({
            variant: 'default',
            className: 'w-full'
          })}
        >
          Sign up
        </Link>
        <Link
          href={routes.dashboard.auth.SignIn}
          className={buttonVariants({
            variant: 'outline',
            className: 'w-full'
          })}
        >
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
