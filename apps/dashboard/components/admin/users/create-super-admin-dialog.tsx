'use client';

import * as React from 'react';
import NiceModal, { type NiceModalHocProps, useModal } from '@ebay/nice-modal-react';
import { UserPlusIcon } from 'lucide-react';
import { type SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@workspace/ui/components/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@workspace/ui/components/drawer';
import {
  FormProvider,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { toast } from '@workspace/ui/components/sonner';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';
import { MediaQueries } from '@workspace/ui/lib/media-queries';

import {
  createSuperAdmin,
  type CreateSuperAdminSchema
} from '~/actions/admin/create-super-admin';
import { useZodForm } from '~/hooks/use-zod-form';
import { z } from 'zod';

const createSuperAdminFormSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required.',
      invalid_type_error: 'Email must be a string.'
    })
    .email('Email is invalid.')
    .trim()
    .toLowerCase(),
  name: z
    .string({
      required_error: 'Name is required.',
      invalid_type_error: 'Name must be a string.'
    })
    .trim()
    .min(1, 'Name is required.')
    .max(64, 'Maximum 64 characters allowed.'),
  sendWelcomeEmail: z.boolean().default(true)
});

type CreateSuperAdminFormSchema = z.infer<typeof createSuperAdminFormSchema>;

export const CreateSuperAdminDialog = NiceModal.create<NiceModalHocProps>(() => {
  const modal = useModal();
  const router = useRouter();
  const mdUp = useMediaQuery(MediaQueries.MdUp, { ssr: false });

  const methods = useZodForm({
    schema: createSuperAdminFormSchema,
    mode: 'onBlur',
    defaultValues: {
      email: '',
      name: '',
      sendWelcomeEmail: true
    }
  });

  const onSubmit: SubmitHandler<CreateSuperAdminFormSchema> = async (values) => {
    const result = await createSuperAdmin(values);

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }

    if (result?.validationErrors) {
      // Set form errors
      Object.entries(result.validationErrors).forEach(([field, errors]) => {
        if (errors && typeof errors === 'object' && '_errors' in errors && Array.isArray(errors._errors)) {
          methods.setError(field as keyof CreateSuperAdminFormSchema, {
            message: errors._errors[0]
          });
        }
      });
      return;
    }

    if (result?.data?.success) {
      toast.success(
        `Super admin account created for ${result.data.name}`,
        {
          description: values.sendWelcomeEmail
            ? 'Password setup email sent successfully'
            : 'User can request password reset to set their password'
        }
      );
      modal.hide();
      methods.reset();
      router.refresh(); // Refresh the users table
    }
  };

  const handleClose = () => {
    if (!methods.formState.isSubmitting) {
      modal.hide();
      methods.reset();
    }
  };

  const renderForm = (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit as any)} className="space-y-4">
        <FormField
          control={methods.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="John Doe"
                  disabled={methods.formState.isSubmitting}
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
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="john@sportsfest.com"
                  disabled={methods.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={methods.control}
          name="sendWelcomeEmail"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={methods.formState.isSubmitting}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Send welcome email</FormLabel>
                <FormDescription>
                  Send password setup instructions to the new super admin
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </form>
    </FormProvider>
  );

  const renderButtons = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={methods.formState.isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        onClick={methods.handleSubmit(onSubmit as any)}
        loading={methods.formState.isSubmitting}
        disabled={!methods.formState.isValid || methods.formState.isSubmitting}
      >
        <UserPlusIcon className="size-4 mr-2" />
        Create Super Admin
      </Button>
    </>
  );

  return mdUp ? (
    <Dialog open={modal.visible} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Super Admin Account</DialogTitle>
          <DialogDescription>
            Create a new super admin account with full system access. The user will
            bypass onboarding and receive password setup instructions via email.
          </DialogDescription>
        </DialogHeader>
        {renderForm}
        <DialogFooter>{renderButtons}</DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={modal.visible} onOpenChange={handleClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Create Super Admin Account</DrawerTitle>
          <DrawerDescription>
            Create a new super admin account with full system access. The user will
            bypass onboarding and receive password setup instructions via email.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">{renderForm}</div>
        <DrawerFooter className="flex-col-reverse pt-4">
          {renderButtons}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
});
