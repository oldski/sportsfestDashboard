-- ========================================
-- PREVIEW: Move Organization Data to Previous Event Year
-- Organization ID: 52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe
-- ========================================
--
-- This script shows what WOULD be moved without actually moving anything.
-- This is a safer alternative to deleting - it moves teams and tent purchases
-- to a previous event year, effectively removing them from the current year
-- while preserving the data for historical reference.
--

-- Preview: Show available event years
SELECT
  id,
  year,
  name,
  "isActive",
  "eventStartDate",
  "eventEndDate",
  CASE
    WHEN "isActive" = true THEN '← CURRENT ACTIVE YEAR'
    ELSE ''
  END as note
FROM "eventYear"
WHERE "isDeleted" = false
ORDER BY year DESC;

-- Preview: Organization details
SELECT
  o.id,
  o.name,
  o.slug,
  (SELECT COUNT(*) FROM "companyTeam" WHERE "organizationId" = o.id) as total_teams_all_years,
  (SELECT COUNT(*) FROM "companyTeam" ct
   JOIN "eventYear" ey ON ct."eventYearId" = ey.id
   WHERE ct."organizationId" = o.id AND ey."isActive" = true) as teams_in_current_year,
  (SELECT COUNT(*) FROM "tentPurchaseTracking" WHERE "organizationId" = o.id) as total_tent_purchases_all_years,
  (SELECT COUNT(*) FROM "tentPurchaseTracking" tpt
   JOIN "eventYear" ey ON tpt."eventYearId" = ey.id
   WHERE tpt."organizationId" = o.id AND ey."isActive" = true) as tent_purchases_in_current_year
FROM "organization" o
WHERE o.id = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe';

-- Preview: Current year company teams that will be moved
SELECT
  ct.id as team_id,
  ct.name as team_name,
  ct."teamNumber",
  ey.year as current_year,
  ey.name as current_year_name,
  (SELECT COUNT(*) FROM "teamRoster" WHERE "companyTeamId" = ct.id) as team_roster_count,
  (SELECT COUNT(*) FROM "eventRoster" WHERE "companyTeamId" = ct.id) as event_roster_count
FROM "companyTeam" ct
JOIN "eventYear" ey ON ct."eventYearId" = ey.id
WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
  AND ey."isActive" = true
ORDER BY ct."teamNumber";

-- Preview: Current year tent purchases that will be moved
SELECT
  tpt.id as tent_purchase_id,
  ey.year as current_year,
  ey.name as current_year_name,
  p.name as tent_product_name,
  tpt."quantityPurchased",
  tpt."maxAllowed",
  tpt."companyTeamCount"
FROM "tentPurchaseTracking" tpt
JOIN "eventYear" ey ON tpt."eventYearId" = ey.id
JOIN "product" p ON tpt."tentProductId" = p.id
WHERE tpt."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
  AND ey."isActive" = true;

-- Preview: Summary of what will be moved
SELECT
  'Summary' as info,
  (SELECT COUNT(*) FROM "companyTeam" ct
   JOIN "eventYear" ey ON ct."eventYearId" = ey.id
   WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
   AND ey."isActive" = true) as company_teams_to_move,
  (SELECT COUNT(*) FROM "tentPurchaseTracking" tpt
   JOIN "eventYear" ey ON tpt."eventYearId" = ey.id
   WHERE tpt."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
   AND ey."isActive" = true) as tent_purchases_to_move,
  (SELECT COUNT(*) FROM "teamRoster" tr
   JOIN "companyTeam" ct ON tr."companyTeamId" = ct.id
   JOIN "eventYear" ey ON ct."eventYearId" = ey.id
   WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
   AND ey."isActive" = true) as team_roster_entries_affected,
  (SELECT COUNT(*) FROM "eventRoster" er
   JOIN "companyTeam" ct ON er."companyTeamId" = ct.id
   JOIN "eventYear" ey ON ct."eventYearId" = ey.id
   WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
   AND ey."isActive" = true) as event_roster_entries_affected;
