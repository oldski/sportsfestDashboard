'use client';

import * as React from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { MoreHorizontalIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu';
import { toast } from '@workspace/ui/components/sonner';
import { cn } from '@workspace/ui/lib/utils';

import { approveJoinRequest } from '~/actions/organization/manage-join-request';
import { RejectJoinRequestModal } from '~/components/organizations/slug/settings/organization/members/reject-join-request-modal';
import type { JoinRequestDto } from '~/data/members/get-join-requests';

export type JoinRequestListProps = React.HtmlHTMLAttributes<HTMLUListElement> & {
  joinRequests: JoinRequestDto[];
};

export function JoinRequestList({
  joinRequests,
  className,
  ...other
}: JoinRequestListProps): React.JSX.Element {
  return (
    <ul
      role="list"
      className={cn('m-0 list-none divide-y p-0', className)}
      {...other}
    >
      {joinRequests.map((request) => (
        <JoinRequestListItem
          key={request.id}
          request={request}
        />
      ))}
    </ul>
  );
}

type JoinRequestListItemProps = React.HtmlHTMLAttributes<HTMLLIElement> & {
  request: JoinRequestDto;
};

function JoinRequestListItem({
  request,
  className,
  ...other
}: JoinRequestListItemProps): React.JSX.Element {
  const handleApprove = async (): Promise<void> => {
    const result = await approveJoinRequest(request.id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleShowRejectModal = (): void => {
    NiceModal.show(RejectJoinRequestModal, { request });
  };

  const initials = request.userName
    ? request.userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : request.userEmail.slice(0, 2).toUpperCase();

  return (
    <li
      role="listitem"
      className={cn('flex w-full flex-row justify-between p-6', className)}
      {...other}
    >
      <div className="flex flex-row items-center gap-4">
        <Avatar className="size-10">
          <AvatarImage src={request.userImage || undefined} alt={request.userName || request.userEmail} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="text-sm font-medium">
            {request.userName || 'Unknown User'}
          </div>
          <div className="text-xs font-normal text-muted-foreground">
            {request.userEmail}
          </div>
          {request.message && (
            <div className="mt-1 text-xs text-muted-foreground italic max-w-xs truncate">
              &ldquo;{request.message}&rdquo;
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <span className="hidden text-xs text-muted-foreground sm:inline-block">
          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
        </span>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="size-8 p-0"
              title="Open menu"
            >
              <MoreHorizontalIcon className="size-4 shrink-0" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleApprove}
            >
              Approve
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive! cursor-pointer"
              onClick={handleShowRejectModal}
            >
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}
