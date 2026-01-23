-- ========================================
-- Diagnose Organization Data
-- Organization ID: 52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe
-- ========================================

-- Step 1: Check if organization exists
SELECT
  'Organization Check' as check_type,
  id,
  name,
  slug
FROM "organization"
WHERE id = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe';

-- Step 2: Check all event years
SELECT
  'All Event Years' as info,
  id,
  year,
  name,
  "isActive",
  "isDeleted"
FROM "eventYear"
ORDER BY year DESC;

-- Step 3: Check current active event year
SELECT
  'Current Active Year' as info,
  id,
  year,
  name
FROM "eventYear"
WHERE "isActive" = true AND "isDeleted" = false;

-- Step 4: Check company teams for this org (ALL years)
SELECT
  'Company Teams (All Years)' as info,
  ct.id as team_id,
  ct.name as team_name,
  ct."teamNumber",
  ey.year as event_year,
  ey.name as event_year_name,
  ey."isActive" as is_active_year,
  ct."eventYearId"
FROM "companyTeam" ct
LEFT JOIN "eventYear" ey ON ct."eventYearId" = ey.id
WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
ORDER BY ey.year DESC, ct."teamNumber";

-- Step 5: Check tent purchases for this org (ALL years)
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

-- Step 6: Count summary by event year
SELECT
  ey.year,
  ey.name,
  ey."isActive",
  COUNT(DISTINCT ct.id) as team_count,
  COUNT(DISTINCT tpt.id) as tent_purchase_count
FROM "eventYear" ey
LEFT JOIN "companyTeam" ct ON ct."eventYearId" = ey.id AND ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
LEFT JOIN "tentPurchaseTracking" tpt ON tpt."eventYearId" = ey.id AND tpt."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
WHERE ey."isDeleted" = false
GROUP BY ey.id, ey.year, ey.name, ey."isActive"
ORDER BY ey.year DESC;
