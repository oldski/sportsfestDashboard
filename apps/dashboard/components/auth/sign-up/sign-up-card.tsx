'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertCircleIcon, InfoIcon, LockIcon, MailIcon, UserIcon } from 'lucide-react';
import { type SubmitHandler } from 'react-hook-form';

import { routes } from '@workspace/routes';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {
  GoogleIcon,
  MicrosoftIcon
} from '@workspace/ui/components/brand-icons';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type CardProps
} from '@workspace/ui/components/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { InputPassword } from '@workspace/ui/components/input-password';
import { InputWithAdornments } from '@workspace/ui/components/input-with-adornments';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';

import { continueWithGoogle } from '~/actions/auth/continue-with-google';
import { continueWithMicrosoft } from '~/actions/auth/continue-with-microsoft';
import { signUp } from '~/actions/auth/sign-up';
import { OrContinueWith } from '~/components/auth/or-continue-with';
import { PasswordFormMessage } from '~/components/auth/password-form-message';
import { useZodForm } from '~/hooks/use-zod-form';
import { signUpSchema, type SignUpSchema } from '~/schemas/auth/sign-up-schema';

export function SignUpCard({
  className,
  ...other
}: CardProps): React.JSX.Element {
  const [errorMessage, setErrorMessage] = React.useState<string>();
  const methods = useZodForm({
    schema: signUpSchema,
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      referralSource: '',
      referralSourceDetails: ''
    }
  });
  const password = methods.watch('password');
  const referralSource = methods.watch('referralSource');

  // Determine if we need to show the details field
  const showReferralDetails = referralSource === 'Referral from another company' || referralSource === 'Other';
  const onSubmit: SubmitHandler<SignUpSchema> = async (values) => {
    const result = await signUp(values);
    if (result?.serverError || result?.validationErrors) {
      if (result.validationErrors?.email?._errors?.[0]) {
        setErrorMessage(result.validationErrors?.email?._errors?.[0]);
      } else {
        setErrorMessage('An error occured during sign up.');
      }
    }
  };
  // const handleSignInWithGoogle = async (): Promise<void> => {
  //   const result = await continueWithGoogle();
  //   if (result?.serverError || result?.validationErrors) {
  //     setErrorMessage('An error occured during Google sign up.');
  //   }
  // };
  // const handleSignInWithMicrosoft = async (): Promise<void> => {
  //   const result = await continueWithMicrosoft();
  //   if (result?.serverError || result?.validationErrors) {
  //     setErrorMessage('An error occured during Microsoft sign up.');
  //   }
  // };
  return (
    <Card
      className={cn(
        'w-full lg:w-3/4 px-4 py-8 border-transparent dark:border-border',
        className
      )}
      {...other}
    >
      <CardHeader>
        <CardTitle className="text-base lg:text-lg">
          Create your account
        </CardTitle>
        <CardDescription>
          Please fill in the details to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormProvider {...methods}>
          <form
            className="flex flex-col gap-4"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <FormField
              control={methods.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <InputWithAdornments
                      type="text"
                      maxLength={64}
                      autoComplete="full name"
                      disabled={methods.formState.isSubmitting}
                      startAdornment={<UserIcon className="size-4 shrink-0" />}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <InputWithAdornments
                      type="email"
                      maxLength={255}
                      autoComplete="username"
                      disabled={methods.formState.isSubmitting}
                      startAdornment={<MailIcon className="size-4 shrink-0" />}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col">
              <FormField
                control={methods.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <InputPassword
                        maxLength={72}
                        autoCapitalize="off"
                        autoComplete="current-password"
                        disabled={methods.formState.isSubmitting}
                        startAdornment={
                          <LockIcon className="size-4 shrink-0" />
                        }
                        {...field}
                      />
                    </FormControl>
                    <PasswordFormMessage password={password} />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={methods.control}
              name="referralSource"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel>Where did you hear about SportsFest?</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Clear details when changing selection
                      if (value !== 'Referral from another company' && value !== 'Other') {
                        methods.setValue('referralSourceDetails', '');
                      }
                    }}
                    value={field.value}
                    disabled={methods.formState.isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="I'm a Previous Participating Company">
                        I&apos;m a Previous Participating Company
                      </SelectItem>
                      <SelectItem value="Referral from another company">
                        Referral from another company
                      </SelectItem>
                      <SelectItem value="Tampa Bay Business Journal">
                        Tampa Bay Business Journal
                      </SelectItem>
                      <SelectItem value="MOR TV">MOR TV</SelectItem>
                      <SelectItem value="Radio">Radio</SelectItem>
                      <SelectItem value="Google Search">Google Search</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showReferralDetails && (
              <FormField
                control={methods.control}
                name="referralSourceDetails"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>
                      {referralSource === 'Referral from another company'
                        ? 'What company?'
                        : 'How did you hear about us?'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        maxLength={500}
                        placeholder={
                          referralSource === 'Referral from another company'
                            ? 'Enter company name'
                            : 'Please specify'
                        }
                        disabled={methods.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Alert variant="default" className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
              <InfoIcon className="size-[18px] shrink-0 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                By creating an account, you acknowledge that you will receive marketing emails from SportsFest.
              </AlertDescription>
            </Alert>
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircleIcon className="size-[18px] shrink-0" />
                <AlertDescription className="inline">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={methods.formState.isSubmitting || !methods.formState.isValid}
              loading={methods.formState.isSubmitting}
            >
              Create account
            </Button>
          </form>
        </FormProvider>
        {/*<OrContinueWith />*/}
        {/*<div className="flex gap-4">*/}
        {/*  <Button*/}
        {/*    type="button"*/}
        {/*    variant="outline"*/}
        {/*    className="flex flex-1 items-center gap-2"*/}
        {/*    disabled={methods.formState.isSubmitting}*/}
        {/*    onClick={handleSignInWithGoogle}*/}
        {/*  >*/}
        {/*    <GoogleIcon*/}
        {/*      width="20"*/}
        {/*      height="20"*/}
        {/*    />*/}
        {/*    Google*/}
        {/*  </Button>*/}
        {/*  <Button*/}
        {/*    type="button"*/}
        {/*    variant="outline"*/}
        {/*    className="flex flex-1 items-center gap-2"*/}
        {/*    disabled={methods.formState.isSubmitting}*/}
        {/*    onClick={handleSignInWithMicrosoft}*/}
        {/*  >*/}
        {/*    <MicrosoftIcon*/}
        {/*      width="20"*/}
        {/*      height="20"*/}
        {/*    />*/}
        {/*    Microsoft*/}
        {/*  </Button>*/}
        {/*</div>*/}
      </CardContent>
      <CardFooter className="flex justify-center gap-1 text-sm text-muted-foreground">
        <span>Already have an account?</span>
        <Link
          href={routes.dashboard.auth.SignIn}
          className="text-foreground underline"
        >
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
