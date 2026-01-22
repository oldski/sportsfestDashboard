import 'server-only';

import { unstable_cache as cache } from 'next/cache';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { and, db, eq } from '@workspace/database/client';
import {
  organizationJoinRequestTable,
  userTable,
  JoinRequestStatus
} from '@workspace/database/schema';

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  OrganizationCacheKey
} from '~/data/caching';

export type JoinRequestDto = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  userImage: string | null;
  message: string | null;
  status: string;
  createdAt: Date;
};

export async function getJoinRequests(): Promise<JoinRequestDto[]> {
  const ctx = await getAuthOrganizationContext();

  return cache(
    async () => {
      const requests = await db
        .select({
          id: organizationJoinRequestTable.id,
          userId: organizationJoinRequestTable.userId,
          userName: userTable.name,
          userEmail: userTable.email,
          userImage: userTable.image,
          message: organizationJoinRequestTable.message,
          status: organizationJoinRequestTable.status,
          createdAt: organizationJoinRequestTable.createdAt,
        })
        .from(organizationJoinRequestTable)
        .innerJoin(userTable, eq(userTable.id, organizationJoinRequestTable.userId))
        .where(
          and(
            eq(organizationJoinRequestTable.organizationId, ctx.organization.id),
            eq(organizationJoinRequestTable.status, JoinRequestStatus.PENDING)
          )
        )
        .orderBy(organizationJoinRequestTable.createdAt);

      return requests.map((request) => ({
        id: request.id,
        userId: request.userId,
        userName: request.userName,
        userEmail: request.userEmail || '',
        userImage: request.userImage,
        message: request.message,
        status: request.status,
        createdAt: request.createdAt,
      }));
    },
    Caching.createOrganizationKeyParts(
      OrganizationCacheKey.JoinRequests,
      ctx.organization.id
    ),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createOrganizationTag(
          OrganizationCacheKey.JoinRequests,
          ctx.organization.id
        )
      ]
    }
  )();
}
