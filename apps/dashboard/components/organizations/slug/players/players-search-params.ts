import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

export const searchParams = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
  search: parseAsString.withDefault(''),
  status: parseAsString.withDefault(''),
  gender: parseAsString.withDefault(''),
  eventYear: parseAsString.withDefault(''),
  sortField: parseAsString.withDefault('createdAt'),
  sortOrder: parseAsString.withDefault('desc'),
});