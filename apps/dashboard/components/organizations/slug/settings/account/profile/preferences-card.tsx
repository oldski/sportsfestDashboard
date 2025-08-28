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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider
} from '@workspace/ui/components/form';
import { RadioCardItem, RadioCards } from '@workspace/ui/components/radio-card';
import { Separator } from '@workspace/ui/components/separator';
import { toast } from '@workspace/ui/components/sonner';
import { useMounted } from '@workspace/ui/hooks/use-mounted';
import { useTheme, type Theme } from '@workspace/ui/hooks/use-theme';

import { updatePreferences } from '~/actions/account/update-preferences';
import { ThemeOption } from '~/components/organizations/slug/settings/account/profile/theme-option';
import { useZodForm } from '~/hooks/use-zod-form';
import {
  updatePreferencesSchema,
  type UpdatePreferencesSchema
} from '~/schemas/account/update-preferences-schema';
import type { PreferencesDto } from '~/types/dtos/preferences-dto';

export type PreferencesCardProps = CardProps & {
  preferences: PreferencesDto;
};

export function PreferencesCard({
  preferences,
  ...other
}: PreferencesCardProps): React.JSX.Element {
  const { theme, setTheme } = useTheme();
  const isMounted = useMounted();
  const methods = useZodForm({
    schema: updatePreferencesSchema,
    mode: 'onSubmit',
    defaultValues: {
      locale: preferences.locale,
      theme: (theme as Theme) ?? 'system'
    }
  });
  const canSubmit = !methods.formState.isSubmitting;
  const onSubmit: SubmitHandler<UpdatePreferencesSchema> = async (values) => {
    if (!canSubmit) {
      return;
    }
    const result = await updatePreferences(values);
    if (!result?.serverError && !result?.validationErrors) {
      toast.success('Preferences updated');
      setTheme(values.theme);
    } else {
      toast.error("Couldn't update preferences");
    }
  };
  return (
    <FormProvider {...methods}>
      <Card {...other}>
        <CardContent>
          <form
            className="space-y-8"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <FormField
              control={methods.control}
              name="theme"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Theme</FormLabel>
                  <FormDescription>
                    Select the theme for the application.
                  </FormDescription>
                  <FormControl>
                    <RadioCards
                      onValueChange={field.onChange}
                      value={isMounted ? field.value : undefined}
                      className="flex flex-row flex-wrap gap-4"
                      disabled={methods.formState.isSubmitting}
                    >
                      {(['light', 'dark', 'system'] as const).map((theme) => (
                        <RadioCardItem
                          key={theme}
                          value={theme}
                          className="border-none p-0 hover:bg-transparent data-[state=checked]:bg-transparent"
                          checkClassName="bottom-8 group-data-[state=checked]:text-primary-foreground group-data-[state=checked]:bg-blue-500 group-data-[state=checked]:border-blue-500!"
                        >
                          <ThemeOption theme={theme} />{' '}
                        </RadioCardItem>
                      ))}
                    </RadioCards>
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
