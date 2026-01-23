-- ========================================
-- Move Organization Data to Previous Event Year
-- Organization ID: 52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe
-- ========================================
--
-- This script moves company teams and tent purchases from the CURRENT active
-- event year to a SPECIFIED previous event year. This is useful for training
-- videos or clearing current year data while preserving historical records.
--
-- BEFORE RUNNING THIS SCRIPT:
-- 1. Run move-organization-to-previous-year-preview.sql to see what will be moved
-- 2. Identify the target event year ID from the preview
-- 3. Replace 'TARGET_EVENT_YEAR_ID_HERE' below with the actual UUID
-- 4. Make sure you have a database backup
--
-- This script uses a transaction so you can ROLLBACK if needed.
--

BEGIN;

-- ============================================
-- CONFIGURATION: Set the target event year ID
-- ============================================
-- Target event year: 55890b36-bd01-48b1-be58-1af27b2025c9
DO $$
DECLARE
  v_target_event_year_id uuid := '55890b36-bd01-48b1-be58-1af27b2025c9'::uuid;
  v_org_id uuid := '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'::uuid;
  v_current_year_id uuid;
  v_teams_moved int;
  v_tents_moved int;
BEGIN
  -- Get current active event year
  SELECT id INTO v_current_year_id
  FROM "eventYear"
  WHERE "isActive" = true AND "isDeleted" = false
  LIMIT 1;

  -- Verify target event year exists
  IF NOT EXISTS (SELECT 1 FROM "eventYear" WHERE id = v_target_event_year_id AND "isDeleted" = false) THEN
    RAISE EXCEPTION 'Target event year ID does not exist or is deleted. Please check the ID.';
  END IF;

  -- Verify we're not trying to move to the same year
  IF v_target_event_year_id = v_current_year_id THEN
    RAISE EXCEPTION 'Target event year is the same as current active year. Please select a different year.';
  END IF;

  -- Show before state
  RAISE NOTICE '=== BEFORE MOVE ===';
  RAISE NOTICE 'Current Event Year ID: %', v_current_year_id;
  RAISE NOTICE 'Target Event Year ID: %', v_target_event_year_id;
  RAISE NOTICE 'Organization ID: %', v_org_id;

  -- Count what we're about to move
  SELECT COUNT(*) INTO v_teams_moved
  FROM "companyTeam"
  WHERE "organizationId" = v_org_id
    AND "eventYearId" = v_current_year_id;

  SELECT COUNT(*) INTO v_tents_moved
  FROM "tentPurchaseTracking"
  WHERE "organizationId" = v_org_id
    AND "eventYearId" = v_current_year_id;

  RAISE NOTICE 'Company teams to move: %', v_teams_moved;
  RAISE NOTICE 'Tent purchases to move: %', v_tents_moved;

  -- Move company teams to target event year
  UPDATE "companyTeam"
  SET
    "eventYearId" = v_target_event_year_id,
    "updatedAt" = NOW()
  WHERE "organizationId" = v_org_id
    AND "eventYearId" = v_current_year_id;

  -- Move tent purchase tracking to target event year
  UPDATE "tentPurchaseTracking"
  SET
    "eventYearId" = v_target_event_year_id,
    "updatedAt" = NOW()
  WHERE "organizationId" = v_org_id
    AND "eventYearId" = v_current_year_id;

  -- Show after state
  RAISE NOTICE '=== AFTER MOVE ===';
  RAISE NOTICE 'Teams moved: %', v_teams_moved;
  RAISE NOTICE 'Tent purchases moved: %', v_tents_moved;
  RAISE NOTICE 'Move completed successfully!';

END $$;

-- Verify the move was successful
SELECT
  'Verification' as status,
  (SELECT year FROM "eventYear" WHERE "isActive" = true) as current_year,
  (SELECT COUNT(*) FROM "companyTeam" ct
   JOIN "eventYear" ey ON ct."eventYearId" = ey.id
   WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
   AND ey."isActive" = true) as teams_in_current_year,
  (SELECT COUNT(*) FROM "tentPurchaseTracking" tpt
   JOIN "eventYear" ey ON tpt."eventYearId" = ey.id
   WHERE tpt."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
   AND ey."isActive" = true) as tents_in_current_year;

-- Show where the data was moved to
SELECT
  ey.year as target_year,
  ey.name as target_year_name,
  (SELECT COUNT(*) FROM "companyTeam" WHERE "organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe' AND "eventYearId" = ey.id) as teams_in_target_year,
  (SELECT COUNT(*) FROM "tentPurchaseTracking" WHERE "organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe' AND "eventYearId" = ey.id) as tents_in_target_year
FROM "eventYear" ey
WHERE ey.id = '55890b36-bd01-48b1-be58-1af27b2025c9'::uuid;

-- IMPORTANT: Review the output above before proceeding
-- If everything looks correct, leave COMMIT below
-- If you want to undo these changes, replace COMMIT with ROLLBACK

COMMIT;
-- ROLLBACK;  -- Uncomment this line and comment COMMIT above to undo changes
