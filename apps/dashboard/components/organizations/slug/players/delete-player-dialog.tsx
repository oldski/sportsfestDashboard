'use client';

import * as React from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { AlertTriangleIcon, LoaderIcon, UserXIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@workspace/ui/components/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from '@workspace/ui/components/drawer';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';
import { toast } from '@workspace/ui/components/sonner';

import { deletePlayer } from '~/actions/players/delete-player';
import type { PlayerWithDetails } from '~/data/players/get-players';

interface DeletePlayerDialogProps {
  player: PlayerWithDetails;
  organizationId: string;
  onSuccess?: () => void;
}

export const DeletePlayerDialog = NiceModal.create<DeletePlayerDialogProps>(
  ({ player, organizationId, onSuccess }) => {
    const modal = useModal();
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const [mounted, setMounted] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const handleDelete = async () => {
      setIsDeleting(true);
      try {
        const result = await deletePlayer({
          playerId: player.id,
          organizationId
        });

        if (result.success) {
          toast.success('Player has been deactivated');
          onSuccess?.();
          modal.hide();
        } else {
          toast.error(result.error || 'Failed to deactivate player');
        }
      } catch (error) {
        console.error('Error deactivating player:', error);
        toast.error('Failed to deactivate player');
      } finally {
        setIsDeleting(false);
      }
    };

    const handleClose = () => {
      if (!isDeleting) {
        modal.hide();
      }
    };

    if (!mounted) {
      return null;
    }

    const content = (
      <div className="space-y-4">
        {/* Warning Message */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangleIcon className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-600" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-800">
              This player will be marked as inactive
            </p>
            <p className="text-sm text-amber-700">
              The player will no longer appear in active player lists but their records will be preserved.
              This action can be reversed by an administrator.
            </p>
          </div>
        </div>

        {/* Player Details */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{player.firstName} {player.lastName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span>{player.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Event Year</span>
            <span>{player.eventYear.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Status</span>
            <span className="capitalize">{player.status.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    );

    const footer = (
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              Deactivating...
            </>
          ) : (
            <>
              <UserXIcon className="mr-2 h-4 w-4" />
              Deactivate Player
            </>
          )}
        </Button>
      </div>
    );

    if (isDesktop) {
      return (
        <Dialog open={modal.visible} onOpenChange={(open) => !open && handleClose()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Deactivate Player</DialogTitle>
              <DialogDescription>
                Are you sure you want to deactivate this player?
              </DialogDescription>
            </DialogHeader>
            {content}
            <DialogFooter>
              {footer}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Drawer open={modal.visible} onOpenChange={(open) => !open && handleClose()}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Deactivate Player</DrawerTitle>
            <DrawerDescription>
              Are you sure you want to deactivate this player?
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            {content}
          </div>
          <DrawerFooter>
            {footer}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
);
