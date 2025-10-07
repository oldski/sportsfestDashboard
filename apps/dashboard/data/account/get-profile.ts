import 'server-only';

import { unstable_cache as cache } from 'next/cache';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { ForbiddenError, NotFoundError } from '@workspace/common/errors';
import { db, eq } from '@workspace/database/client';
import { userTable } from '@workspace/database/schema';

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  UserCacheKey
} from '~/data/caching';
import type { ProfileDto } from '~/types/dtos/profile-dto';

export async function getProfile(): Promise<ProfileDto> {
  const ctx = await getAuthOrganizationContext();

  // Super admins don't need membership
  const isSuperAdmin = ctx.session.user.isSportsFestAdmin === true;

  const activeMembership = ctx.session.user.memberships.find(
    (m) => m.organizationId === ctx.organization.id
  );

  if (!isSuperAdmin && !activeMembership) {
    throw new ForbiddenError('User is not a member of this organization');
  }

  // For super admins without membership, create a virtual admin membership
  const membershipToUse = activeMembership || {
    organizationId: ctx.organization.id,
    userId: ctx.session.user.id,
    role: 'admin' as const,
    isOwner: false
  };

  return cache(
    async () => {
      const [userFromDb] = await db
        .select({
          id: userTable.id,
          image: userTable.image,
          name: userTable.name,
          email: userTable.email,
          locale: userTable.locale,
          isSportsFestAdmin: userTable.isSportsFestAdmin
        })
        .from(userTable)
        .where(eq(userTable.id, ctx.session.user.id))
        .limit(1);

      if (!userFromDb) {
        throw new NotFoundError('User not found');
      }

      const response: Omit<ProfileDto, 'isOwner' | 'role'> = {
        id: userFromDb.id,
        image: userFromDb.image ?? undefined,
        name: userFromDb.name,
        email: userFromDb.email ?? undefined,
        locale: userFromDb.locale,
        isSportsFestAdmin: userFromDb.isSportsFestAdmin
      };

      return response;
    },
    Caching.createUserKeyParts(UserCacheKey.Profile, ctx.session.user.id),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createUserTag(UserCacheKey.Profile, ctx.session.user.id),
        Caching.createUserTag(
          UserCacheKey.PersonalDetails,
          ctx.session.user.id
        ),
        Caching.createUserTag(UserCacheKey.Preferences, ctx.session.user.id)
      ]
    }
  )().then((profile) => ({
    ...profile,
    // We don't want to cache these two fields
    isOwner: membershipToUse.isOwner,
    role: membershipToUse.role
  }));
}
