-- ========================================
-- Clear Team Rosters for Entire Organization
-- Organization ID: 52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe
-- ========================================
--
-- WARNING: This will DELETE all player roster assignments for ALL teams
-- in the specified organization. The teams and players themselves will
-- remain, but all roster assignments will be removed.
--
-- BEFORE RUNNING THIS SCRIPT:
-- 1. Run clear-organization-rosters-preview.sql to see what will be deleted
-- 2. Make sure you have a database backup
-- 3. Verify the organization ID is correct
--
-- This script uses a transaction so you can ROLLBACK if needed.
-- Change COMMIT to ROLLBACK at the end if you want to undo the changes.
--

BEGIN;

-- Store counts before deletion for reporting
CREATE TEMP TABLE deletion_summary AS
SELECT
  (SELECT COUNT(*) FROM "eventRoster" er
   JOIN "companyTeam" ct ON er."companyTeamId" = ct.id
   WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe') as event_roster_count_before,
  (SELECT COUNT(*) FROM "teamRoster" tr
   JOIN "companyTeam" ct ON tr."companyTeamId" = ct.id
   WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe') as team_roster_count_before;

-- Show what we're about to delete
SELECT
  'Organization' as info,
  o.name as organization_name,
  o.slug as organization_slug,
  (SELECT COUNT(*) FROM "companyTeam" WHERE "organizationId" = o.id) as teams_in_org
FROM "organization" o
WHERE id = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe';

SELECT
  'Before Deletion' as status,
  event_roster_count_before as event_roster_entries,
  team_roster_count_before as team_roster_entries,
  event_roster_count_before + team_roster_count_before as total_entries
FROM deletion_summary;

-- Step 1: Delete all event roster assignments for all teams in this organization
DELETE FROM "eventRoster"
WHERE "companyTeamId" IN (
  SELECT id FROM "companyTeam"
  WHERE "organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
);

-- Step 2: Delete all team roster assignments for all teams in this organization
DELETE FROM "teamRoster"
WHERE "companyTeamId" IN (
  SELECT id FROM "companyTeam"
  WHERE "organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
);

-- Show summary of what was deleted
SELECT
  'Deletion Summary' as status,
  ds.event_roster_count_before as event_roster_deleted,
  ds.team_roster_count_before as team_roster_deleted,
  ds.event_roster_count_before + ds.team_roster_count_before as total_deleted
FROM deletion_summary ds;

-- Verify counts after deletion (should all be 0)
SELECT
  'After Deletion' as status,
  (SELECT COUNT(*)
   FROM "eventRoster" er
   JOIN "companyTeam" ct ON er."companyTeamId" = ct.id
   WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe') as event_roster_remaining,
  (SELECT COUNT(*)
   FROM "teamRoster" tr
   JOIN "companyTeam" ct ON tr."companyTeamId" = ct.id
   WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe') as team_roster_remaining;

-- Verify all teams in the organization now have no players
SELECT
  ct.id,
  ct.name as team_name,
  ct."teamNumber",
  ey.year as event_year,
  (SELECT COUNT(*) FROM "teamRoster" WHERE "companyTeamId" = ct.id) as team_roster_count,
  (SELECT COUNT(*) FROM "eventRoster" WHERE "companyTeamId" = ct.id) as event_roster_count,
  CASE
    WHEN (SELECT COUNT(*) FROM "teamRoster" WHERE "companyTeamId" = ct.id) = 0
     AND (SELECT COUNT(*) FROM "eventRoster" WHERE "companyTeamId" = ct.id) = 0
    THEN '✓ Cleared'
    ELSE '✗ Still has players'
  END as status
FROM "companyTeam" ct
LEFT JOIN "eventYear" ey ON ct."eventYearId" = ey.id
WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
ORDER BY ct."teamNumber";

-- Clean up temp table
DROP TABLE deletion_summary;

-- IMPORTANT: Review the output above before proceeding
-- If everything looks correct, leave COMMIT below
-- If you want to undo these changes, replace COMMIT with ROLLBACK

COMMIT;
-- ROLLBACK;  -- Uncomment this line and comment COMMIT above to undo changes
