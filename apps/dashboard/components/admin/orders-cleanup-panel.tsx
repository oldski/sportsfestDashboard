'use client';

import * as React from 'react';
import { TrashIcon, InfoIcon, RefreshCwIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import { Input } from '@workspace/ui/components/input';
import { Switch } from '@workspace/ui/components/switch';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Separator } from '@workspace/ui/components/separator';
import { toast } from '@workspace/ui/components/sonner';

interface CleanupResult {
  foundOrders: number;
  deletedOrders: number;
  dryRun: boolean;
  olderThanHours: number;
}

export function OrdersCleanupPanel(): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false);
  const [olderThanHours, setOlderThanHours] = React.useState(24);
  const [executeCleanup, setExecuteCleanup] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<CleanupResult | null>(null);

  const handleCleanup = async (quick: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/orders/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          olderThanHours: quick ? 1 : olderThanHours,
          execute: executeCleanup,
          quick
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLastResult(data.result);
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Cleanup failed');
      }
    } catch (error) {
      toast.error('Failed to perform cleanup');
      console.error('Cleanup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrashIcon className="h-5 w-5" />
          Abandoned Orders Cleanup
        </CardTitle>
        <CardDescription>
          Clean up pending orders with $0 payments (abandoned shopping carts)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning Alert */}
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            This will permanently delete pending orders that haven't been paid.
            Always run a dry run first to see what would be deleted.
          </AlertDescription>
        </Alert>

        {/* Configuration */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours Old</Label>
              <Input
                id="hours"
                type="number"
                min="1"
                value={olderThanHours}
                onChange={(e) => setOlderThanHours(parseInt(e.target.value) || 24)}
                placeholder="24"
              />
              <p className="text-xs text-muted-foreground">
                Delete orders older than this many hours
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="execute">Execute Cleanup</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="execute"
                  checked={executeCleanup}
                  onCheckedChange={setExecuteCleanup}
                />
                <span className="text-sm">
                  {executeCleanup ? 'Will DELETE orders' : 'Dry run only'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {executeCleanup
                  ? '⚠️ Orders will be permanently deleted'
                  : '👀 Preview what would be deleted'
                }
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => handleCleanup(false)}
            disabled={isLoading}
            variant={executeCleanup ? "destructive" : "default"}
            className="flex-1"
          >
            {isLoading && <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />}
            {executeCleanup ? `Delete Orders (${olderThanHours}h+)` : `Preview Cleanup (${olderThanHours}h+)`}
          </Button>

          <Button
            onClick={() => handleCleanup(true)}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            {executeCleanup ? 'Quick Delete (1h+)' : 'Quick Preview (1h+)'}
          </Button>
        </div>

        {/* Results */}
        {lastResult && (
          <div className="space-y-3">
            <Separator />
            <h4 className="font-medium">Last Cleanup Results</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Orders Found:</span>
                <span className="ml-2 font-medium">{lastResult.foundOrders}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Orders Deleted:</span>
                <span className="ml-2 font-medium">{lastResult.deletedOrders}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Age Threshold:</span>
                <span className="ml-2 font-medium">{lastResult.olderThanHours} hours</span>
              </div>
              <div>
                <span className="text-muted-foreground">Mode:</span>
                <span className="ml-2 font-medium">
                  {lastResult.dryRun ? '👀 Dry Run' : '🗑️ Executed'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}