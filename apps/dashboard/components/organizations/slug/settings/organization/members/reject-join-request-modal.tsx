'use client';

import NiceModal, { type NiceModalHocProps } from '@ebay/nice-modal-react';
import { type SubmitHandler } from 'react-hook-form';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@workspace/ui/components/alert-dialog';
import { Button } from '@workspace/ui/components/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@workspace/ui/components/drawer';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider
} from '@workspace/ui/components/form';
import { Textarea } from '@workspace/ui/components/textarea';
import { toast } from '@workspace/ui/components/sonner';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';
import { MediaQueries } from '@workspace/ui/lib/media-queries';

import { rejectJoinRequest } from '~/actions/organization/manage-join-request';
import { useEnhancedModal } from '~/hooks/use-enhanced-modal';
import { useZodForm } from '~/hooks/use-zod-form';
import {
  rejectJoinRequestSchema,
  type RejectJoinRequestSchema
} from '~/schemas/organization/reject-join-request-schema';
import type { JoinRequestDto } from '~/data/members/get-join-requests';

export type RejectJoinRequestModalProps = NiceModalHocProps & {
  request: JoinRequestDto;
};

export const RejectJoinRequestModal =
  NiceModal.create<RejectJoinRequestModalProps>(({ request }) => {
    const modal = useEnhancedModal();
    const mdUp = useMediaQuery(MediaQueries.MdUp, { ssr: false });
    const methods = useZodForm({
      schema: rejectJoinRequestSchema,
      mode: 'all',
      defaultValues: {
        id: request.id,
        reason: ''
      }
    });
    const title = 'Reject this request?';
    const canSubmit =
      !methods.formState.isSubmitting && methods.formState.isValid;
    const onSubmit: SubmitHandler<RejectJoinRequestSchema> = async (values) => {
      if (!canSubmit) {
        return;
      }
      const result = await rejectJoinRequest(values.id, values.reason);
      if (result.success) {
        toast.success(result.message);
        modal.handleClose();
      } else {
        toast.error(result.message);
      }
    };
    const renderDescription = (
      <>
        The join request from{' '}
        <strong className="text-foreground font-medium">
          {request.userName || request.userEmail}
        </strong>{' '}
        will be rejected. You can optionally provide a reason.
      </>
    );
    const renderForm = (
      <FormField
        control={methods.control}
        name="reason"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reason (optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Provide a reason for rejection..."
                rows={3}
                disabled={methods.formState.isSubmitting}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
    const renderButtons = (
      <>
        <Button
          type="button"
          variant="outline"
          onClick={modal.handleClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={!canSubmit}
          loading={methods.formState.isSubmitting}
          onClick={methods.handleSubmit(onSubmit)}
        >
          Yes, reject
        </Button>
      </>
    );
    return (
      <FormProvider {...methods}>
        {mdUp ? (
          <AlertDialog open={modal.visible}>
            <AlertDialogContent
              className="max-w-sm"
              onClose={modal.handleClose}
              onAnimationEndCapture={modal.handleAnimationEndCapture}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {renderDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <input
                  type="hidden"
                  className="hidden"
                  disabled={methods.formState.isSubmitting}
                  {...methods.register('id')}
                />
                <div className="px-6 pb-4">
                  {renderForm}
                </div>
              </form>
              <AlertDialogFooter>{renderButtons}</AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Drawer
            open={modal.visible}
            onOpenChange={modal.handleOpenChange}
          >
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>{title}</DrawerTitle>
                <DrawerDescription>{renderDescription}</DrawerDescription>
              </DrawerHeader>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <input
                  type="hidden"
                  className="hidden"
                  disabled={methods.formState.isSubmitting}
                  {...methods.register('id')}
                />
                <div className="px-4 pb-4">
                  {renderForm}
                </div>
              </form>
              <DrawerFooter className="flex-col-reverse pt-4">
                {renderButtons}
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </FormProvider>
    );
  });
