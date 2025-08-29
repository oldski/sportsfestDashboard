import 'server-only';

import { unstable_cache as cache } from 'next/cache';

import { getAuthContext } from '@workspace/auth/context';
import { NotFoundError } from '@workspace/common/errors';
import { db, eq } from '@workspace/database/client';
import { userTable } from '@workspace/database/schema';

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  UserCacheKey
} from '~/data/caching';

export type AdminProfileDto = {
  id: string;
  image?: string;
  name: string;
  email?: string;
  locale: string;
  isSportsFestAdmin: boolean | null;
};

export async function getAdminProfile(): Promise<AdminProfileDto> {
  const ctx = await getAuthContext();

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

      return {
        id: userFromDb.id,
        image: userFromDb.image ?? undefined,
        name: userFromDb.name,
        email: userFromDb.email ?? undefined,
        locale: userFromDb.locale,
        isSportsFestAdmin: userFromDb.isSportsFestAdmin
      };
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
  )();
}