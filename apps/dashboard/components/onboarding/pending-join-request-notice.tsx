'use client';

import * as React from 'react';
import { ClockIcon, XCircleIcon, Loader2Icon, Building2Icon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { toast } from '@workspace/ui/components/sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog';

import { cancelJoinRequest } from '~/actions/organization/request-to-join-organization';

interface PendingRequest {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  organizationLogo: string | null;
  status: string;
  createdAt: Date;
}

interface PendingJoinRequestNoticeProps {
  requests: PendingRequest[];
  onRequestCancelled: () => void;
  onContinueWithNew: () => void;
}

export function PendingJoinRequestNotice({
  requests,
  onRequestCancelled,
  onContinueWithNew,
}: PendingJoinRequestNoticeProps): React.JSX.Element | null {
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);

  if (requests.length === 0) {
    return null;
  }

  const handleCancelRequest = async (requestId: string) => {
    setCancellingId(requestId);
    try {
      const result = await cancelJoinRequest(requestId);
      if (result.success) {
        toast.success(result.message);
        onRequestCancelled();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to cancel request. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
        <ClockIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            You have {requests.length} pending join request{requests.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Waiting for organization admin approval. You'll be notified when they respond.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h4 className="font-medium">{request.organizationName}</h4>
                <p className="text-xs text-muted-foreground">
                  Requested on {formatDate(request.createdAt)}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={cancellingId === request.id}
                  >
                    {cancellingId === request.id ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <XCircleIcon className="mr-1 h-4 w-4" />
                        Cancel
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Join Request?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your request to join{' '}
                      <strong>{request.organizationName}</strong>? You can submit a new request later if needed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Request</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleCancelRequest(request.id)}
                    >
                      Cancel Request
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-2 flex flex-col items-center gap-2 text-center">
        <p className="text-sm text-muted-foreground">
          Don't want to wait? You can create your own organization instead.
        </p>
        <Button variant="outline" onClick={onContinueWithNew}>
          <Building2Icon className="mr-2 h-4 w-4" />
          Create New Organization
        </Button>
      </div>
    </div>
  );
}
