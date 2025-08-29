'use client';

import * as React from 'react';
import { Loader2Icon, AlertTriangleIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { toast } from '@workspace/ui/components/sonner';

interface DeleteEventYearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventYear: {
    id: string;
    year: number;
    name: string;
  };
  onDeleted?: () => void;
}

export function DeleteEventYearDialog({
  open,
  onOpenChange,
  eventYear,
  onDeleted,
}: DeleteEventYearDialogProps): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const { softDeleteEventYear } = await import('~/actions/admin/event-year');
      await softDeleteEventYear(eventYear.id);
      
      toast.success(`Event year ${eventYear.year} has been removed`);
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      console.error('Error deleting event year:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove event year. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-destructive" />
            Remove Event Year {eventYear.year}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to remove <strong>{eventYear.name}</strong>?
            </p>
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium mb-2">This action will:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Hide this event year from active registration</li>
                <li>Preserve all existing registrations and payment data</li>
                <li>Keep all products associated with this event year</li>
                <li>Allow restoration by an administrator if needed</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: This is a soft delete - no data will be permanently lost.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Remove Event Year
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}