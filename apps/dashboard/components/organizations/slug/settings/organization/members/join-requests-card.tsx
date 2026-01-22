'use client';

import * as React from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  type CardProps
} from '@workspace/ui/components/card';
import { EmptyText } from '@workspace/ui/components/empty-text';
import { InputSearch } from '@workspace/ui/components/input-search';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { cn } from '@workspace/ui/lib/utils';

import { JoinRequestList } from '~/components/organizations/slug/settings/organization/members/join-request-list';
import type { JoinRequestDto } from '~/data/members/get-join-requests';

export type JoinRequestsCardProps = CardProps & {
  joinRequests: JoinRequestDto[];
};

export function JoinRequestsCard({
  joinRequests,
  className,
  ...other
}: JoinRequestsCardProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const filteredRequests = joinRequests.filter(
    (request) =>
      !searchQuery ||
      request.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const handleSearchQueryChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchQuery(e.target?.value || '');
  };

  return (
    <Card
      className={cn('flex h-full flex-col gap-0 pb-0', className)}
      {...other}
    >
      <CardHeader className="pb-0 flex flex-row items-center gap-2">
        <InputSearch
          placeholder="Filter by name or email"
          value={searchQuery}
          onChange={handleSearchQueryChange}
        />
      </CardHeader>
      <CardContent className="max-h-72 flex-1 overflow-hidden p-0">
        {filteredRequests.length > 0 ? (
          <ScrollArea className="h-full">
            <JoinRequestList joinRequests={filteredRequests} />
          </ScrollArea>
        ) : (
          <EmptyText className="p-6">
            No pending join requests found
            {!!searchQuery && ' (filtered)'}.
          </EmptyText>
        )}
      </CardContent>
    </Card>
  );
}
