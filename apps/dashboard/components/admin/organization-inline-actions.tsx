'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon, GitMergeIcon, Loader2Icon, ExternalLinkIcon, AlertTriangleIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@workspace/ui/components/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { toast } from '@workspace/ui/components/sonner';
import { replaceOrgSlug, routes } from '@workspace/routes';

import {
  checkOrganizationDeleteStatus,
  deleteOrganization,
  mergeOrganizations,
  getOrganizationsForMerge,
  type OrganizationDeleteStatus,
} from '~/actions/admin/manage-organization';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface OrganizationInlineActionsProps {
  organization: Organization;
  onActionComplete?: () => void;
}

export function OrganizationInlineActions({
  organization,
  onActionComplete,
}: OrganizationInlineActionsProps): React.JSX.Element {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showMergeDialog, setShowMergeDialog] = React.useState(false);
  const [deleteStatus, setDeleteStatus] = React.useState<OrganizationDeleteStatus | null>(null);
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [targetOrgId, setTargetOrgId] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCheckingDelete, setIsCheckingDelete] = React.useState(false);

  const handleDeleteClick = async () => {
    setIsCheckingDelete(true);
    setShowDeleteDialog(true);
    try {
      const status = await checkOrganizationDeleteStatus(organization.id);
      setDeleteStatus(status);
    } catch (error) {
      toast.error('Failed to check organization status');
      setShowDeleteDialog(false);
    } finally {
      setIsCheckingDelete(false);
    }
  };

  const handleMergeClick = async () => {
    setIsLoading(true);
    setShowMergeDialog(true);
    try {
      const orgs = await getOrganizationsForMerge();
      setOrganizations(orgs.filter((org) => org.id !== organization.id));
    } catch (error) {
      toast.error('Failed to load organizations');
      setShowMergeDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteOrganization(organization.id);
      if (result.success) {
        toast.success(result.message);
        setShowDeleteDialog(false);
        router.refresh();
        onActionComplete?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete organization');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMerge = async () => {
    if (!targetOrgId) {
      toast.error('Please select a target organization');
      return;
    }

    setIsLoading(true);
    try {
      const result = await mergeOrganizations(organization.id, targetOrgId);
      if (result.success) {
        toast.success(result.message);
        setShowMergeDialog(false);
        setTargetOrgId('');
        router.refresh();
        onActionComplete?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to merge organizations');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link
                href={replaceOrgSlug(routes.dashboard.organizations.slug.Home, organization.slug)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">View Organization</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>View Organization</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleMergeClick}
            >
              <GitMergeIcon className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Merge Organization</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Merge Into Another</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDeleteClick}
            >
              <TrashIcon className="h-4 w-4 text-destructive" />
              <span className="sr-only">Delete Organization</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Organization</TooltipContent>
        </Tooltip>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              {isCheckingDelete ? (
                <div className="flex items-center gap-2">
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Checking organization status...
                </div>
              ) : deleteStatus?.canDelete ? (
                <>
                  Are you sure you want to delete <strong>{organization.name}</strong>? This action
                  cannot be undone.
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    <AlertTriangleIcon className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Cannot delete this organization</p>
                      <p className="text-sm">{deleteStatus?.reason}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded border p-2 text-center">
                      <div className="text-2xl font-bold">{deleteStatus?.orderCount || 0}</div>
                      <div className="text-muted-foreground">Orders</div>
                    </div>
                    <div className="rounded border p-2 text-center">
                      <div className="text-2xl font-bold">{deleteStatus?.playerCount || 0}</div>
                      <div className="text-muted-foreground">Players</div>
                    </div>
                    <div className="rounded border p-2 text-center">
                      <div className="text-2xl font-bold">{deleteStatus?.teamCount || 0}</div>
                      <div className="text-muted-foreground">Teams</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use the "Merge Into Another" option to move all data to a different organization.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {!deleteStatus?.canDelete && deleteStatus !== null && (
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  handleMergeClick();
                }}
                className="mr-auto"
              >
                <GitMergeIcon className="mr-2 h-4 w-4" />
                Merge Instead
              </Button>
            )}
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            {deleteStatus?.canDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge Dialog */}
      <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge Organization</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Merge <strong>{organization.name}</strong> into another organization. All data
                  (orders, players, teams, members) will be transferred.
                </p>

                {isLoading && !organizations.length ? (
                  <div className="flex items-center gap-2">
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                    Loading organizations...
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Organization</label>
                    <Select value={targetOrgId} onValueChange={setTargetOrgId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target organization..." />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  <strong>Warning:</strong> This action cannot be undone. The source organization
                  will be deleted after the merge.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleMerge}
              disabled={isLoading || !targetOrgId}
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <GitMergeIcon className="mr-2 h-4 w-4" />
                  Merge Organizations
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
