'use client';

import * as React from 'react';
import { Building2Icon, UsersIcon, MailIcon, CheckCircle2Icon, Loader2Icon } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Textarea } from '@workspace/ui/components/textarea';
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
} from '@workspace/ui/components/alert-dialog';
import { cn } from '@workspace/ui/lib/utils';

import { type FoundOrganization } from '~/actions/organization/find-existing-organizations';
import { requestToJoinOrganization } from '~/actions/organization/request-to-join-organization';

interface ExistingOrganizationPromptProps {
  organizations: FoundOrganization[];
  onContinueWithNew: () => void;
  onRequestSent: () => void;
}

export function ExistingOrganizationPrompt({
  organizations,
  onContinueWithNew,
  onRequestSent,
}: ExistingOrganizationPromptProps): React.JSX.Element {
  const [selectedOrg, setSelectedOrg] = React.useState<FoundOrganization | null>(null);
  const [message, setMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);

  const handleRequestToJoin = async () => {
    if (!selectedOrg) return;

    setIsSubmitting(true);
    try {
      const result = await requestToJoinOrganization(selectedOrg.id, message || undefined);

      if (result.success) {
        toast.success(result.message);
        setShowDialog(false);
        onRequestSent();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openJoinDialog = (org: FoundOrganization) => {
    setSelectedOrg(org);
    setMessage('');
    setShowDialog(true);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
        <Building2Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            We found {organizations.length} organization{organizations.length !== 1 ? 's' : ''} that might be yours
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            If your company is listed below, you can request to join instead of creating a duplicate.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {organizations.map((org) => (
          <Card
            key={org.id}
            className={cn(
              'cursor-pointer transition-colors hover:bg-muted/50',
            )}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{org.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {org.matchType === 'domain' ? (
                      <>
                        <MailIcon className="mr-1 h-3 w-3" />
                        Same email domain
                      </>
                    ) : (
                      'Similar name'
                    )}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UsersIcon className="h-3 w-3" />
                  <span>
                    {org.memberCount} member{org.memberCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => openJoinDialog(org)}
              >
                Request to Join
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-2 flex flex-col items-center gap-2 text-center">
        <p className="text-sm text-muted-foreground">
          Don't see your organization? You can still create a new one.
        </p>
        <Button variant="outline" onClick={onContinueWithNew}>
          Create New Organization
        </Button>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request to Join {selectedOrg?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Your request will be sent to the organization's admin for approval.
              You'll be notified when they respond.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4">
            <label className="text-sm font-medium">
              Message to admin (optional)
            </label>
            <Textarea
              placeholder="Introduce yourself or explain why you'd like to join..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleRequestToJoin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <CheckCircle2Icon className="mr-2 h-4 w-4" />
                  Send Request
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
