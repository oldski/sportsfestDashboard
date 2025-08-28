'use client';

import * as React from 'react';
import { type SubmitHandler } from 'react-hook-form';

import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardFooter,
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Separator } from '@workspace/ui/components/separator';
import { toast } from '@workspace/ui/components/sonner';

import { updateOrganizationDetails } from '~/actions/organization/update-organization-details';
import { useZodForm } from '~/hooks/use-zod-form';
import { US_STATES } from '~/lib/constants';
import {
  updateOrganizationDetailsSchema,
  type UpdateOrganizationDetailsSchema
} from '~/schemas/organization/update-organization-details-schema';
import type { OrganizationDetailsDto } from '~/types/dtos/organization-details-dto';

export type OrganizationDetailsCardProps = CardProps & {
  details: OrganizationDetailsDto;
};

export function OrganizationDetailsCard({
  details,
  ...props
}: OrganizationDetailsCardProps): React.JSX.Element {
  const methods = useZodForm({
    schema: updateOrganizationDetailsSchema,
    mode: 'onSubmit',
    defaultValues: {
      name: details.name ?? '',
      address: details.address ?? '',
      address2: details.address2 ?? '',
      city: details.city ?? '',
      state: details.state ?? '',
      zip: details.zip ?? '',
      phone: details.phone ?? '',
      email: details.email ?? '',
      website: details.website ?? ''
    }
  });
  const canSubmit = !methods.formState.isSubmitting;
  const onSubmit: SubmitHandler<UpdateOrganizationDetailsSchema> = async (
    values
  ) => {
    if (!canSubmit) {
      return;
    }
    const result = await updateOrganizationDetails(values);
    if (!result?.serverError && !result?.validationErrors) {
      toast.success('Details updated');
    } else {
      toast.error("Couldn't update details");
    }
  };
  return (
    <FormProvider {...methods}>
      <Card {...props}>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <FormField
              control={methods.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel required>Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      maxLength={255}
                      required
                      autoComplete="organization"
                      disabled={methods.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      maxLength={255}
                      autoComplete="street-address"
                      disabled={methods.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="address2"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel>Address 2</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      maxLength={255}
                      placeholder="Apt, suite, etc. (optional)"
                      autoComplete="address-line2"
                      disabled={methods.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex w-full gap-4">
              <FormField
                control={methods.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        maxLength={100}
                        autoComplete="address-level2"
                        disabled={methods.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Select
                        disabled={methods.formState.isSubmitting}
                        onValueChange={field.onChange}
                        value={field.value}
                        name={field.name}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>States</SelectLabel>
                            {US_STATES.map((abbr) => (
                              <SelectItem key={abbr} value={abbr}>
                                {abbr}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="zip"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        maxLength={10}
                        autoComplete="postal-code"
                        disabled={methods.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={methods.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      maxLength={32}
                      autoComplete="tel"
                      disabled={methods.formState.isSubmitting}
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
                    <Input
                      type="email"
                      maxLength={255}
                      autoComplete="email"
                      disabled={methods.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="website"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      maxLength={2000}
                      autoComplete="url"
                      disabled={methods.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </CardContent>
        <Separator />
        <CardFooter className="flex w-full justify-end">
          <Button
            type="button"
            variant="default"
            size="default"
            disabled={!canSubmit}
            loading={methods.formState.isSubmitting}
            onClick={methods.handleSubmit(onSubmit)}
          >
            Save
          </Button>
        </CardFooter>
      </Card>
    </FormProvider>
  );
}
