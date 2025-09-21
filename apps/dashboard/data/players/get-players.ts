import { db, eq, and, desc, asc, sql, count, like, or, inArray } from '@workspace/database/client';
import { 
  playerTable, 
  organizationTable, 
  eventYearTable, 
  playerEventInterestTable,
  type PlayerStatus 
} from '@workspace/database/schema';

export interface GetPlayersFilters {
  search?: string;
  status?: PlayerStatus;
  gender?: string;
  eventYear?: string;
}

export interface GetPlayersParams {
  organizationId: string;
  filters?: GetPlayersFilters;
  pagination?: {
    page?: number;
    limit?: number;
  };
  sorting?: {
    field?: 'firstName' | 'lastName' | 'email' | 'createdAt' | 'status';
    order?: 'asc' | 'desc';
  };
}

export interface PlayerWithDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  gender: string;
  tshirtSize: string;
  dateOfBirth: Date;
  status: PlayerStatus;
  accuracyConfirmed: boolean;
  waiverSigned: boolean;
  createdAt: Date;
  eventYear: {
    id: string;
    year: number;
    name: string;
  };
  eventInterests: Array<{
    eventType: string;
    interestRating: number;
  }>;
}

export interface GetPlayersResult {
  players: PlayerWithDetails[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getPlayers(params: GetPlayersParams): Promise<GetPlayersResult> {
  const {
    organizationId,
    filters = {},
    pagination = {},
    sorting = {}
  } = params;

  const {
    search = '',
    status,
    gender,
    eventYear
  } = filters;

  const {
    page = 1,
    limit = 20
  } = pagination;

  const {
    field = 'createdAt',
    order = 'desc'
  } = sorting;

  const offset = (page - 1) * limit;

  // Build where conditions
  const whereConditions = [
    eq(playerTable.organizationId, organizationId)
  ];

  // Search filter
  if (search) {
    whereConditions.push(
      or(
        like(playerTable.firstName, `%${search}%`),
        like(playerTable.lastName, `%${search}%`),
        like(playerTable.email, `%${search}%`)
      )!
    );
  }

  // Status filter
  if (status) {
    whereConditions.push(eq(playerTable.status, status));
  }

  // Gender filter
  if (gender) {
    whereConditions.push(eq(playerTable.gender, gender as any));
  }

  // Event year filter
  if (eventYear) {
    whereConditions.push(eq(playerTable.eventYearId, eventYear));
  }

  const whereClause = whereConditions.length > 1 
    ? and(...whereConditions) 
    : whereConditions[0];

  // Get total count - only from active event year
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(playerTable)
    .innerJoin(eventYearTable, eq(playerTable.eventYearId, eventYearTable.id))
    .where(and(whereClause, eq(eventYearTable.isActive, true)));

  // Get players with pagination and sorting - only from active event year
  const orderByClause = order === 'asc' 
    ? asc(playerTable[field]) 
    : desc(playerTable[field]);

  const playersQuery = db
    .select({
      id: playerTable.id,
      firstName: playerTable.firstName,
      lastName: playerTable.lastName,
      email: playerTable.email,
      phone: playerTable.phone,
      gender: playerTable.gender,
      tshirtSize: playerTable.tshirtSize,
      dateOfBirth: playerTable.dateOfBirth,
      status: playerTable.status,
      accuracyConfirmed: playerTable.accuracyConfirmed,
      waiverSigned: playerTable.waiverSigned,
      createdAt: playerTable.createdAt,
      eventYear: {
        id: eventYearTable.id,
        year: eventYearTable.year,
        name: eventYearTable.name,
      },
    })
    .from(playerTable)
    .innerJoin(eventYearTable, eq(playerTable.eventYearId, eventYearTable.id))
    .where(and(whereClause, eq(eventYearTable.isActive, true)))
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  const players = await playersQuery;

  // Get event interests for each player
  const playerIds = players.map(p => p.id);
  const eventInterests = playerIds.length > 0 ? await db
    .select({
      playerId: playerEventInterestTable.playerId,
      eventType: playerEventInterestTable.eventType,
      interestRating: playerEventInterestTable.interestRating,
    })
    .from(playerEventInterestTable)
    .where(inArray(playerEventInterestTable.playerId, playerIds))
    : [];

  // Group event interests by player ID
  const interestsByPlayer = eventInterests.reduce((acc, interest) => {
    if (!acc[interest.playerId]) {
      acc[interest.playerId] = [];
    }
    acc[interest.playerId].push({
      eventType: interest.eventType,
      interestRating: interest.interestRating,
    });
    return acc;
  }, {} as Record<string, Array<{ eventType: string; interestRating: number }>>);

  // Combine players with their event interests
  const playersWithDetails: PlayerWithDetails[] = players.map(player => ({
    ...player,
    eventInterests: interestsByPlayer[player.id] || [],
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return {
    players: playersWithDetails,
    totalCount,
    totalPages,
    currentPage: page,
  };
}