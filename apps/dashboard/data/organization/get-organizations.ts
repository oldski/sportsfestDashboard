import 'server-only';

import { unstable_cache as cache } from 'next/cache';

import { getAuthContext } from '@workspace/auth/context';
import { db, eq, sql } from '@workspace/database/client';
import { membershipTable, organizationTable } from '@workspace/database/schema';

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  UserCacheKey
} from '~/data/caching';
import type { OrganizationDto } from '~/types/dtos/organization-dto';

export async function getOrganizations(): Promise<OrganizationDto[]> {
  const ctx = await getAuthContext();
  const isSuperAdmin = ctx.session.user.isSportsFestAdmin === true;

  return cache(
    async () => {
      let organizations;

      if (isSuperAdmin) {
        // Super admins see all organizations
        organizations = await db
          .select({
            id: organizationTable.id,
            logo: organizationTable.logo,
            name: organizationTable.name,
            slug: organizationTable.slug,
            membershipCount:
              sql<number>`COUNT(DISTINCT ${membershipTable.id})`.mapWith(Number),
            earliestMembershipCreatedAt:
              sql<Date>`MIN(${membershipTable.createdAt})`.mapWith(
                (value) => (value ? new Date(value as string) : null)
              )
          })
          .from(organizationTable)
          .leftJoin(
            membershipTable,
            eq(organizationTable.id, membershipTable.organizationId)
          )
          .groupBy(
            organizationTable.id,
            organizationTable.logo,
            organizationTable.name,
            organizationTable.slug
          );
      } else {
        // Regular users see only their organizations
        organizations = await db
          .select({
            id: organizationTable.id,
            logo: organizationTable.logo,
            name: organizationTable.name,
            slug: organizationTable.slug,
            membershipCount:
              sql<number>`COUNT(DISTINCT ${membershipTable.id})`.mapWith(Number),
            earliestMembershipCreatedAt:
              sql<Date>`MIN(${membershipTable.createdAt})`.mapWith(
                (value) => (value ? new Date(value as string) : null)
              )
          })
          .from(membershipTable)
          .innerJoin(
            organizationTable,
            eq(organizationTable.id, membershipTable.organizationId)
          )
          .where(eq(membershipTable.userId, ctx.session.user.id))
          .groupBy(
            organizationTable.id,
            organizationTable.logo,
            organizationTable.name,
            organizationTable.slug
          );
      }

      const response: OrganizationDto[] = organizations
        .sort((a, b) => {
          if (!a.earliestMembershipCreatedAt || !b.earliestMembershipCreatedAt) {
            return 0;
          }
          return (
            a.earliestMembershipCreatedAt.getTime() -
            b.earliestMembershipCreatedAt.getTime()
          );
        })
        .map((organization) => ({
          id: organization.id,
          logo: organization.logo ? organization.logo : undefined,
          name: organization.name,
          slug: organization.slug,
          memberCount: organization.membershipCount
        }));

      return response;
    },
    Caching.createUserKeyParts(UserCacheKey.Organizations, ctx.session.user.id),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createUserTag(UserCacheKey.Organizations, ctx.session.user.id)
      ]
    }
  )();
}
