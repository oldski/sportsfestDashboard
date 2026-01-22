'use server';

import { db, eq, sql, and, or, ne } from '@workspace/database/client';
import {
  organizationTable,
  membershipTable,
  userTable,
  Role
} from '@workspace/database/schema';
import { getAuthContext } from '@workspace/auth/context';

// Common personal email domains to exclude from domain matching
const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'live.com',
  'msn.com',
  'mail.com',
  'protonmail.com',
  'proton.me',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'gmx.net',
  'fastmail.com',
  'tutanota.com',
  'hey.com',
]);

export interface FoundOrganization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  matchType: 'domain' | 'name';
  memberCount: number;
  adminEmail: string | null;
}

/**
 * Extracts the domain from an email address
 */
function getEmailDomain(email: string): string | null {
  const parts = email.split('@');
  if (parts.length !== 2) return null;
  return parts[1].toLowerCase();
}

/**
 * Checks if an email domain is a personal/consumer domain
 */
function isPersonalDomain(domain: string): boolean {
  return PERSONAL_EMAIL_DOMAINS.has(domain.toLowerCase());
}

/**
 * Normalizes an organization name for comparison
 * Removes common suffixes, punctuation, and normalizes whitespace
 */
function normalizeOrgName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[,.'"\-_]/g, ' ')  // Replace punctuation with spaces
    .replace(/\b(inc|llc|ltd|corp|corporation|co|company|group|holdings|enterprises?)\b/gi, '')
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .trim();
}

/**
 * Calculates similarity between two strings using Levenshtein distance
 * Returns a score between 0 and 1 (1 = identical)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Create distance matrix
  const matrix: number[][] = [];
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const maxLength = Math.max(s1.length, s2.length);
  return 1 - (matrix[s1.length][s2.length] / maxLength);
}

/**
 * Finds organizations that might match based on the user's email domain
 */
export async function findOrganizationsByEmailDomain(): Promise<FoundOrganization[]> {
  const { session } = await getAuthContext();
  const userEmail = session.user.email;

  if (!userEmail) {
    return [];
  }

  const domain = getEmailDomain(userEmail);
  if (!domain || isPersonalDomain(domain)) {
    return [];
  }

  try {
    // Find organizations where any member has the same email domain
    const results = await db
      .select({
        id: organizationTable.id,
        name: organizationTable.name,
        slug: organizationTable.slug,
        logo: organizationTable.logo,
        memberCount: sql<number>`COUNT(DISTINCT ${membershipTable.userId})`.mapWith(Number),
        adminEmail: sql<string | null>`MIN(CASE WHEN ${membershipTable.role} = 'admin' OR ${membershipTable.isOwner} = true THEN ${userTable.email} END)`,
      })
      .from(organizationTable)
      .innerJoin(membershipTable, eq(membershipTable.organizationId, organizationTable.id))
      .innerJoin(userTable, eq(userTable.id, membershipTable.userId))
      .where(
        and(
          sql`LOWER(SPLIT_PART(${userTable.email}, '@', 2)) = ${domain}`,
          ne(userTable.id, session.user.id)
        )
      )
      .groupBy(organizationTable.id, organizationTable.name, organizationTable.slug, organizationTable.logo);

    return results.map((org) => ({
      ...org,
      matchType: 'domain' as const,
    }));
  } catch (error) {
    console.error('Failed to find organizations by email domain:', error);
    return [];
  }
}

/**
 * Finds organizations with similar names using fuzzy matching
 */
export async function findOrganizationsByName(
  searchName: string,
  threshold: number = 0.7
): Promise<FoundOrganization[]> {
  const { session } = await getAuthContext();

  if (!searchName || searchName.length < 2) {
    return [];
  }

  const normalizedSearch = normalizeOrgName(searchName);

  try {
    // Get all organizations with member counts
    const organizations = await db
      .select({
        id: organizationTable.id,
        name: organizationTable.name,
        slug: organizationTable.slug,
        logo: organizationTable.logo,
        memberCount: sql<number>`COUNT(DISTINCT ${membershipTable.userId})`.mapWith(Number),
        adminEmail: sql<string | null>`MIN(CASE WHEN ${membershipTable.role} = 'admin' OR ${membershipTable.isOwner} = true THEN ${userTable.email} END)`,
      })
      .from(organizationTable)
      .leftJoin(membershipTable, eq(membershipTable.organizationId, organizationTable.id))
      .leftJoin(userTable, eq(userTable.id, membershipTable.userId))
      .groupBy(organizationTable.id, organizationTable.name, organizationTable.slug, organizationTable.logo);

    // Filter by similarity score
    const matches = organizations
      .map((org) => {
        const normalizedOrgName = normalizeOrgName(org.name);
        const similarity = calculateSimilarity(normalizedSearch, normalizedOrgName);

        // Also check if one is a substring of the other (helps with "Acme" vs "Acme Inc")
        const containsMatch =
          normalizedOrgName.includes(normalizedSearch) ||
          normalizedSearch.includes(normalizedOrgName);

        return {
          ...org,
          similarity,
          containsMatch,
        };
      })
      .filter((org) => org.similarity >= threshold || org.containsMatch)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)  // Limit to top 5 matches
      .map(({ similarity, containsMatch, ...org }) => ({
        ...org,
        matchType: 'name' as const,
      }));

    return matches;
  } catch (error) {
    console.error('Failed to find organizations by name:', error);
    return [];
  }
}

/**
 * Combined search that checks both email domain and name similarity
 * Returns deduplicated results with domain matches prioritized
 */
export async function findExistingOrganizations(
  searchName: string
): Promise<FoundOrganization[]> {
  const [domainMatches, nameMatches] = await Promise.all([
    findOrganizationsByEmailDomain(),
    findOrganizationsByName(searchName),
  ]);

  // Combine and deduplicate (prioritize domain matches)
  const seen = new Set<string>();
  const results: FoundOrganization[] = [];

  // Add domain matches first
  for (const org of domainMatches) {
    if (!seen.has(org.id)) {
      seen.add(org.id);
      results.push(org);
    }
  }

  // Add name matches that aren't already included
  for (const org of nameMatches) {
    if (!seen.has(org.id)) {
      seen.add(org.id);
      results.push(org);
    }
  }

  return results;
}
