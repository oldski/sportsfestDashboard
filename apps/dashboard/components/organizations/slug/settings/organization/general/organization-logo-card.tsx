'use client';

import * as React from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { ExternalLinkIcon, TrashIcon, UploadIcon } from 'lucide-react';
import { type SubmitHandler } from 'react-hook-form';

import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardFooter,
  type CardProps
} from '@workspace/ui/components/card';
import { FormProvider } from '@workspace/ui/components/form';
import { ImageDropzone } from '@workspace/ui/components/image-dropzone';
import { toast } from '@workspace/ui/components/sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@workspace/ui/components/tooltip';

import { updateOrganizationLogo } from '~/actions/organization/update-organization-logo';
import { CropPhotoModal } from '~/components/organizations/slug/settings/account/profile/crop-photo-modal';
import { useZodForm } from '~/hooks/use-zod-form';
import { ACCEPTED_IMAGE_TYPES, FileUploadAction, MAX_IMAGE_SIZE } from '~/lib/file-upload';
import {
  updateOrganizationLogoSchema,
  type UpdateOrganizationLogoSchema
} from '~/schemas/organization/update-organization-logo-schema';

export type OrganizationLogoCardProps = CardProps & {
  logo?: string;
  organizationSlug: string;
};

export function OrganizationLogoCard({
  logo: initialLogo,
  organizationSlug,
  ...props
}: OrganizationLogoCardProps): React.JSX.Element {
  const methods = useZodForm({
    schema: updateOrganizationLogoSchema,
    mode: 'onSubmit',
    defaultValues: {
      action: FileUploadAction.None,
      logo: initialLogo
    }
  });
  const logo = methods.watch('logo');
  const handleDrop = async (files: File[]): Promise<void> => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(
          `Uploaded image shouldn't exceed ${MAX_IMAGE_SIZE / 1000000} MB size limit`
        );
      } else {
        const base64Image: string = await NiceModal.show(CropPhotoModal, {
          file,
          aspectRatio: undefined,
          circularCrop: false
        });
        if (base64Image) {
          methods.setValue('action', FileUploadAction.Update);
          methods.setValue('logo', base64Image, {
            shouldValidate: true,
            shouldDirty: true
          });
          await onSubmit({
            action: FileUploadAction.Update,
            logo: base64Image
          });
        }
      }
    }
  };
  const handleRemoveLogo = async (): Promise<void> => {
    methods.setValue('action', FileUploadAction.Delete);
    methods.setValue('logo', undefined, {
      shouldValidate: true,
      shouldDirty: true
    });
    await onSubmit({ action: FileUploadAction.Delete, logo: undefined });
  };
  const canSubmit = !methods.formState.isSubmitting;
  const onSubmit: SubmitHandler<UpdateOrganizationLogoSchema> = async (
    values
  ) => {
    if (!canSubmit) {
      return;
    }
    const result = await updateOrganizationLogo(values);
    if (!result?.serverError && !result?.validationErrors) {
      toast.success('Logo updated');
    } else {
      toast.error("Couldn't update lgoo");
    }
  };
  return (
    <FormProvider {...methods}>
      <Card {...props}>
        <CardContent>
          <form
            className="flex items-center space-x-4"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <div className="relative">
              <ImageDropzone
                accept={ACCEPTED_IMAGE_TYPES}
                onDrop={handleDrop}
                src={logo}
                borderRadius="xl"
                className="h-20 w-32 rounded-xl p-0.5"
              >
                <div className="flex h-[76px] w-[124px] items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                  <UploadIcon className="size-5 shrink-0 text-muted-foreground" />
                </div>
              </ImageDropzone>
              {!!logo && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute bottom-[-12px] right-[-12px] z-10 rounded-full bg-background p-1"
                      onClick={handleRemoveLogo}
                    >
                      <TrashIcon className="size-4 shrink-0" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Remove logo</TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm">Upload your logo</span>
              <span className="text-xs text-muted-foreground">
                *.png, *.jpeg files up to 5 MB
              </span>
            </div>
          </form>
        </CardContent>
        {logo && (
          <CardFooter className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a
                href={`${process.env.NEXT_PUBLIC_MARKETING_URL}/on/${organizationSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                See it in action
                <ExternalLinkIcon className="size-4 shrink-0" />
              </a>
            </Button>
          </CardFooter>
        )}
      </Card>
    </FormProvider>
  );
}
