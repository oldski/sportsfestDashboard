'use client';

import * as React from 'react';
import NiceModal from '@ebay/nice-modal-react';

import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent, CardFooter,
  CardHeader,
  type CardProps
} from '@workspace/ui/components/card';
import { EmptyText } from '@workspace/ui/components/empty-text';
import { InputSearch } from '@workspace/ui/components/input-search';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { cn } from '@workspace/ui/lib/utils';

import { InviteMemberModal } from '~/components/organizations/slug/settings/organization/members/invite-member-modal';
import { MemberList } from '~/components/organizations/slug/settings/organization/members/member-list';
import type { MemberDto } from '~/types/dtos/member-dto';
import type { ProfileDto } from '~/types/dtos/profile-dto';

export type RecruitmentTeamCardProps = CardProps & {
  profile: ProfileDto;
  members: MemberDto[];
};

export function RecruitmentTeamCard({
  profile,
  members,
  className,
  ...other
}: RecruitmentTeamCardProps): React.JSX.Element {
  const handleShowInviteMemberModal = (): void => {
    NiceModal.show(InviteMemberModal, { profile });
  };
  return (
    <Card
      className={cn('flex h-full flex-col gap-0 pb-0', className)}
      {...other}
    >
      <CardHeader className="pb-0 flex flex-row items-center gap-2">
        Your Recruitment Team
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
      <CardFooter>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="whitespace-nowrap"
          onClick={handleShowInviteMemberModal}
        >
          Invite member
        </Button>
      </CardFooter>
    </Card>
  );
}
