'use client';

import * as React from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { PatternFormat } from 'react-number-format';
import { z } from 'zod';
import { LoaderIcon, SaveIcon, PhoneIcon, ShirtIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@workspace/ui/components/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from '@workspace/ui/components/drawer';
import {
  FormProvider as Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';
import { toast } from '@workspace/ui/components/sonner';

import { TShirtSize } from '@workspace/database/schema';
import { updatePlayer } from '~/actions/players/update-player';
import type { PlayerWithDetails } from '~/data/players/get-players';

const editPlayerSchema = z.object({
  phone: z.string()
    .transform(val => val === '' ? null : val)
    .nullable()
    .optional()
    .refine(val => !val || val.length === 10, 'Please enter a valid 10-digit phone number'),
  tshirtSize: z.nativeEnum(TShirtSize, { errorMap: () => ({ message: 'Invalid t-shirt size' }) })
});

type EditPlayerFormData = z.infer<typeof editPlayerSchema>;

interface EditPlayerFormProps {
  player: PlayerWithDetails;
  organizationId: string;
  onSubmit: (data: EditPlayerFormData) => Promise<void>;
  onCancel: () => void;
}

const tshirtSizeOptions = [
  { value: TShirtSize.XS, label: 'Extra Small (XS)' },
  { value: TShirtSize.S, label: 'Small (S)' },
  { value: TShirtSize.M, label: 'Medium (M)' },
  { value: TShirtSize.L, label: 'Large (L)' },
  { value: TShirtSize.XL, label: 'Extra Large (XL)' },
  { value: TShirtSize.XXL, label: '2XL (XXL)' },
  { value: TShirtSize.XXXL, label: '3XL (XXXL)' }
];

function EditPlayerForm({ player, onSubmit, onCancel }: EditPlayerFormProps): React.JSX.Element {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<EditPlayerFormData>({
    resolver: zodResolver(editPlayerSchema) as any,
    defaultValues: {
      phone: player.phone || '',
      tshirtSize: player.tshirtSize as TShirtSize
    },
    mode: 'onChange' // Validate on change for real-time feedback
  });

  // Watch form values for validation
  const watchPhone = form.watch('phone');
  const watchTshirtSize = form.watch('tshirtSize');

  // Check if form is valid for submission
  const isPhoneValid = !watchPhone || watchPhone.length === 0 || watchPhone.length === 10;
  const isTshirtValid = !!watchTshirtSize;
  const isFormValid = isPhoneValid && isTshirtValid;

  const handleSubmit = async (data: EditPlayerFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
    } catch (_error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pb-4">
        {/* Player Name (Read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Player</label>
          <div className="px-3 py-2 bg-muted rounded-md text-sm">
            {player.firstName} {player.lastName}
          </div>
          <p className="text-xs text-muted-foreground">
            Name and other registration details cannot be changed
          </p>
        </div>

        {/* Phone */}
        <FormItem>
          <FormLabel>Phone Number</FormLabel>
          <FormControl>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                <PhoneIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <Controller
                name="phone"
                control={form.control}
                render={({ field }) => (
                  <PatternFormat
                    format="(###) ###-####"
                    mask="_"
                    allowEmptyFormatting
                    customInput={Input}
                    className="pl-9"
                    value={field.value || ''}
                    onValueChange={(values) => {
                      field.onChange(values.value); // Store only raw digits
                    }}
                  />
                )}
              />
            </div>
          </FormControl>
          <FormDescription>
            Optional contact phone number for the player
          </FormDescription>
          {form.formState.errors.phone && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.phone.message}
            </p>
          )}
        </FormItem>

        {/* T-Shirt Size */}
        <FormField
          control={form.control}
          name="tshirtSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>T-Shirt Size *</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                    <ShirtIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {tshirtSizeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FormControl>
              <FormDescription>
                T-shirt size for the player&apos;s event gear
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="sticky bottom-0 bg-background pt-4 border-t mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !isFormValid}>
            {isSubmitting ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface EditPlayerDialogProps {
  player: PlayerWithDetails;
  organizationId: string;
  onSuccess?: () => void;
}

export const EditPlayerDialog = NiceModal.create<EditPlayerDialogProps>(
  ({ player, organizationId, onSuccess }) => {
    const modal = useModal();
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const handleSubmit = async (data: EditPlayerFormData) => {
      try {
        const result = await updatePlayer({
          playerId: player.id,
          organizationId,
          phone: data.phone,
          tshirtSize: data.tshirtSize
        });

        if (result.success) {
          toast.success('Player updated successfully');
          onSuccess?.();
          modal.hide();
        } else {
          toast.error(result.error || 'Failed to update player');
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Error updating player:', error);
        throw error;
      }
    };

    const handleClose = () => {
      modal.hide();
    };

    if (!mounted) {
      return null;
    }

    if (isDesktop) {
      return (
        <Dialog open={modal.visible} onOpenChange={(open) => !open && handleClose()}>
          <DialogContent className="sm:max-w-md w-full max-h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Edit Player</DialogTitle>
              <DialogDescription>
                Update the player&apos;s phone number and t-shirt size.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              <EditPlayerForm
                player={player}
                organizationId={organizationId}
                onSubmit={handleSubmit}
                onCancel={handleClose}
              />
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Drawer open={modal.visible} onOpenChange={(open) => !open && handleClose()}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="text-left flex-shrink-0">
            <DrawerTitle>Edit Player</DrawerTitle>
            <DrawerDescription>
              Update the player&apos;s phone number and t-shirt size.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 flex-1 overflow-y-auto">
            <EditPlayerForm
              player={player}
              organizationId={organizationId}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
);
