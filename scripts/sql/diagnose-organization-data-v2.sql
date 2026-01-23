-- ========================================
-- Diagnose Organization Data (Updated)
-- Organization ID: 52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe
-- Target Event Year: 55890b36-bd01-48b1-be58-1af27b2025c9
-- ========================================

-- Step 1: Check if organization exists (including deleted status if column exists)
SELECT
  'Organization Check' as check_type,
  id,
  name,
  slug,
  email
FROM "organization"
WHERE id = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe';

-- Step 2: Check target event year exists
SELECT
  'Target Event Year Check' as check_type,
  id,
  year,
  name,
  "isActive",
  "isDeleted"
FROM "eventYear"
WHERE id = '55890b36-bd01-48b1-be58-1af27b2025c9';

-- Step 3: Check all event years
SELECT
  'All Event Years' as info,
  id,
  year,
  name,
  "isActive",
  "isDeleted",
  CASE
    WHEN id = '55890b36-bd01-48b1-be58-1af27b2025c9' THEN '← TARGET YEAR'
    WHEN "isActive" = true THEN '← CURRENT ACTIVE YEAR'
    ELSE ''
  END as note
FROM "eventYear"
ORDER BY year DESC;

-- Step 4: Check current active event year
SELECT
  'Current Active Year' as info,
  id,
  year,
  name
FROM "eventYear"
WHERE "isActive" = true AND "isDeleted" = false;

-- Step 5: Check company teams for this org (ALL years)
SELECT
  'Company Teams (All Years)' as info,
  ct.id as team_id,
  ct.name as team_name,
  ct."teamNumber",
  ey.year as event_year,
  ey.name as event_year_name,
  ey."isActive" as is_active_year,
  ct."eventYearId",
  (SELECT COUNT(*) FROM "teamRoster" WHERE "companyTeamId" = ct.id) as roster_count
FROM "companyTeam" ct
LEFT JOIN "eventYear" ey ON ct."eventYearId" = ey.id
WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
ORDER BY ey.year DESC, ct."teamNumber";

-- Step 6: Check tent purchases for this org (ALL years)
SELECT
  'Tent Purchases (All Years)' as info,
  tpt.id as purchase_id,
  ey.year as event_year,
  ey.name as event_year_name,
  ey."isActive" as is_active_year,
  tpt."quantityPurchased",
  tpt."maxAllowed",
  tpt."companyTeamCount",
  tpt."eventYearId"
FROM "tentPurchaseTracking" tpt
LEFT JOIN "eventYear" ey ON tpt."eventYearId" = ey.id
WHERE tpt."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
ORDER BY ey.year DESC;

-- Step 7: Count summary by event year
SELECT
  'Summary by Year' as info,
  ey.year,
  ey.name,
  ey."isActive",
  COUNT(DISTINCT ct.id) as team_count,
  COUNT(DISTINCT tpt.id) as tent_purchase_count,
  SUM(COALESCE((SELECT COUNT(*) FROM "teamRoster" WHERE "companyTeamId" = ct.id), 0)) as total_players_in_teams
FROM "eventYear" ey
LEFT JOIN "companyTeam" ct ON ct."eventYearId" = ey.id AND ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
LEFT JOIN "tentPurchaseTracking" tpt ON tpt."eventYearId" = ey.id AND tpt."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
WHERE ey."isDeleted" = false
GROUP BY ey.id, ey.year, ey.name, ey."isActive"
ORDER BY ey.year DESC;

-- Step 8: What will be moved?
SELECT
  'MOVE PREVIEW' as action,
  'FROM' as direction,
  ey.year as year,
  ey.name as event_name,
  COUNT(DISTINCT ct.id) as teams_to_move,
  COUNT(DISTINCT tpt.id) as tent_purchases_to_move
FROM "eventYear" ey
LEFT JOIN "companyTeam" ct ON ct."eventYearId" = ey.id AND ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
LEFT JOIN "tentPurchaseTracking" tpt ON tpt."eventYearId" = ey.id AND tpt."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
WHERE ey."isActive" = true AND ey."isDeleted" = false
GROUP BY ey.id, ey.year, ey.name
UNION ALL
SELECT
  'MOVE PREVIEW' as action,
  'TO' as direction,
  ey.year as year,
  ey.name as event_name,
  COUNT(DISTINCT ct.id) as current_teams_in_target,
  COUNT(DISTINCT tpt.id) as current_tents_in_target
FROM "eventYear" ey
LEFT JOIN "companyTeam" ct ON ct."eventYearId" = ey.id AND ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
LEFT JOIN "tentPurchaseTracking" tpt ON tpt."eventYearId" = ey.id AND tpt."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
WHERE ey.id = '55890b36-bd01-48b1-be58-1af27b2025c9'
GROUP BY ey.id, ey.year, ey.name;
