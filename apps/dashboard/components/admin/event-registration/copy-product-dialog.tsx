'use client';

import * as React from 'react';
import { CopyIcon, Loader2Icon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@workspace/ui/components/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { toast } from '@workspace/ui/components/sonner';

import { duplicateProduct } from '~/actions/admin/product';
import type { ProductFormSelectData } from '~/actions/admin/get-product-form-data';

interface CopyProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceProductId: string | null;
  defaultEventYearId: string | null;
  eventYears: ProductFormSelectData['eventYears'];
  onCopied?: () => void;
}

export function CopyProductDialog({
  open,
  onOpenChange,
  sourceProductId,
  defaultEventYearId,
  eventYears,
  onCopied
}: CopyProductDialogProps): React.JSX.Element {
  const [targetEventYearId, setTargetEventYearId] = React.useState<string>(
    defaultEventYearId ?? ''
  );
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTargetEventYearId(defaultEventYearId ?? '');
    }
  }, [open, defaultEventYearId]);

  const handleSubmit = async () => {
    if (!sourceProductId) {
      toast.error('No source product selected');
      return;
    }
    if (!targetEventYearId) {
      toast.error('Select a target event year');
      return;
    }

    setIsLoading(true);
    try {
      await duplicateProduct({
        sourceProductId,
        targetEventYearId
      });
      toast.success('Product copied successfully');
      onOpenChange(false);
      onCopied?.();
    } catch (error) {
      console.error('Error copying product:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to copy product. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CopyIcon className="h-5 w-5" />
            Copy Product
          </DialogTitle>
          <DialogDescription>
            Duplicate this product into another event year. Pricing, category, type, and inventory
            settings are copied; the new product will be created as Active.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <label className="text-sm font-medium">Target Event Year</label>
          <Select value={targetEventYearId} onValueChange={setTargetEventYearId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an event year" />
            </SelectTrigger>
            <SelectContent>
              {eventYears.map((eventYear) => (
                <SelectItem key={eventYear.id} value={eventYear.id}>
                  {eventYear.year} — {eventYear.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !targetEventYearId}>
            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Copy Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
