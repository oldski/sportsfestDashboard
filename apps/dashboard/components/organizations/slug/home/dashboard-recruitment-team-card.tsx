'use client';

import * as React from 'react';
import NiceModal from '@ebay/nice-modal-react';

import { InvitationStatus } from '@workspace/database/schema';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent, CardFooter,
  CardHeader,
  type CardProps, CardTitle
} from '@workspace/ui/components/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@workspace/ui/components/collapsible';
import { EmptyText } from '@workspace/ui/components/empty-text';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { cn } from '@workspace/ui/lib/utils';

import { InviteMemberModal } from '~/components/organizations/slug/settings/organization/members/invite-member-modal';
import { MemberList } from '~/components/organizations/slug/settings/organization/members/member-list';
import { sportsFestRoleLabels } from '~/lib/labels';
import type { InvitationDto } from '~/types/dtos/invitation-dto';
import type { MemberDto } from '~/types/dtos/member-dto';
import type { ProfileDto } from '~/types/dtos/profile-dto';
import { ChevronDown, UserPlusIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@workspace/ui/components/tooltip";

export type RecruitmentTeamCardProps = CardProps & {
  profile: ProfileDto;
  members: MemberDto[];
  pendingInvites?: InvitationDto[];
};

export function RecruitmentTeamCard({
  profile,
  members,
  pendingInvites = [],
  className,
  ...other
}: RecruitmentTeamCardProps): React.JSX.Element {
  const [isPendingInvitesOpen, setIsPendingInvitesOpen] = React.useState(false);
  const [isCardOpen, setIsCardOpen] = React.useState(false);

  // Filter to only show PENDING invitations
  const filteredPendingInvites = pendingInvites.filter(
    (invite) => invite.status === InvitationStatus.PENDING
  );
  const hasPendingInvites = filteredPendingInvites.length > 0;

  const handleShowInviteMemberModal = (): void => {
    NiceModal.show(InviteMemberModal, { profile });
  };

  const cardContent = (
    <>
      <CardHeader className="py-0">
        <div className="space-y-1 flex w-full lg:hidden">
          <Button
            type="button"
            variant="secondary"
            size="default"
            className="whitespace-nowrap w-full"
            onClick={handleShowInviteMemberModal}
          >
            <UserPlusIcon /> Add a Member
          </Button>
        </div>
        <div className="hidden lg:visible lg:flex flex-row items-center justify-between space-y-0">
          <CardTitle>
            Your Recruitment Team
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="whitespace-nowrap"
                  onClick={handleShowInviteMemberModal}
                >
                  <UserPlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Invite Member</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="max-h-72 flex-1 overflow-hidden p-0">
        {members.length > 0 ? (
          <ScrollArea className="h-full">
            <MemberList
              profile={profile}
              members={members}
              readOnly={true}
            />
          </ScrollArea>
        ) : (
          <EmptyText className="p-6">
            No members found.
          </EmptyText>
        )}
      </CardContent>
      {hasPendingInvites && (
        <CardFooter className="relative p-0">
          <Collapsible
            open={isPendingInvitesOpen}
            onOpenChange={setIsPendingInvitesOpen}
            className="w-full"
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between border-t px-4 py-3 text-sm font-medium hover:bg-muted/50">
              <span>
                Pending Invites ({filteredPendingInvites.length})
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  isPendingInvitesOpen && 'rotate-180'
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="absolute bottom-full left-0 right-0 z-10 border border-border bg-card shadow-lg rounded-t-xl">
              <div className="divide-y">
                <div className="p-2 font-semibold text-sm">
                  Pending Invites
                </div>

                {filteredPendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{invite.email}</span>
                      <Badge variant="secondary" className="w-fit rounded-3xl">
                        {sportsFestRoleLabels[invite.role]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardFooter>
      )}
    </>
  );

  return (
    <>
      {/* Desktop: Always show full card */}
      <div className="hidden lg:block">
        <Card
          className={cn('flex h-full flex-col gap-0 pb-0', className)}
          {...other}
        >
          {cardContent}
        </Card>
      </div>

      {/* Mobile/Tablet: Show as collapsible */}
      <div className="lg:hidden">
        <Card className={cn('p-0', className)} {...other}>
          <Collapsible open={isCardOpen} onOpenChange={setIsCardOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <span className="font-semibold">Your Recruitment Team</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform',
                  isCardOpen && 'rotate-180'
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col gap-0 pb-0">
                {cardContent}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </>
  );
}
