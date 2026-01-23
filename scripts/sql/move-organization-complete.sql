-- ========================================
-- Move ALL Organization Data to Previous Event Year
-- Organization ID: 52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe
-- Target Event Year: 55890b36-bd01-48b1-be58-1af27b2025c9
-- ========================================
--
-- This moves MOST data associated with an organization from the current
-- active event year to the target event year:
-- - Company Teams
-- - Team Rosters (via cascade)
-- - Event Rosters (via cascade)
-- - Tent Purchase Tracking
-- - Orders
-- - Order Items (via cascade)
-- - Order Payments (via cascade)
-- - Order Invoices (via cascade)
--
-- NOTE: Players are NOT moved - they stay in the current event year
--
-- BEFORE RUNNING:
-- 1. Run diagnose-organization-data-v2.sql to verify data location
-- 2. Make sure you have a database backup
-- 3. Review the preview output below
--

BEGIN;

-- Get current active event year
DO $$
DECLARE
  v_target_event_year_id uuid := '55890b36-bd01-48b1-be58-1af27b2025c9'::uuid;
  v_org_id uuid := '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'::uuid;
  v_current_year_id uuid;
  v_teams_moved int;
  v_tents_moved int;
  v_orders_moved int;
BEGIN
  -- Get current active event year
  SELECT id INTO v_current_year_id
  FROM "eventYear"
  WHERE "isActive" = true AND "isDeleted" = false
  LIMIT 1;

  -- Verify target event year exists
  IF NOT EXISTS (SELECT 1 FROM "eventYear" WHERE id = v_target_event_year_id AND "isDeleted" = false) THEN
    RAISE EXCEPTION 'Target event year ID does not exist or is deleted.';
  END IF;

  -- Verify we're not trying to move to the same year
  IF v_target_event_year_id = v_current_year_id THEN
    RAISE EXCEPTION 'Target event year is the same as current active year.';
  END IF;

  RAISE NOTICE '=== MOVING ORGANIZATION DATA ===';
  RAISE NOTICE 'Organization ID: %', v_org_id;
  RAISE NOTICE 'From Event Year: %', v_current_year_id;
  RAISE NOTICE 'To Event Year: %', v_target_event_year_id;
  RAISE NOTICE '';

  -- Count what we're about to move
  SELECT COUNT(*) INTO v_teams_moved
  FROM "companyTeam"
  WHERE "organizationId" = v_org_id AND "eventYearId" = v_current_year_id;

  SELECT COUNT(*) INTO v_tents_moved
  FROM "tentPurchaseTracking"
  WHERE "organizationId" = v_org_id AND "eventYearId" = v_current_year_id;

  SELECT COUNT(*) INTO v_orders_moved
  FROM "order"
  WHERE "organizationId" = v_org_id AND "eventYearId" = v_current_year_id;

  RAISE NOTICE '=== BEFORE MOVE ===';
  RAISE NOTICE 'Company teams to move: %', v_teams_moved;
  RAISE NOTICE 'Tent purchases to move: %', v_tents_moved;
  RAISE NOTICE 'Orders to move: %', v_orders_moved;
  RAISE NOTICE 'Players: NOT MOVING (staying in current year)';
  RAISE NOTICE '';

  -- Step 1: Move company teams (rosters will cascade)
  UPDATE "companyTeam"
  SET
    "eventYearId" = v_target_event_year_id,
    "updatedAt" = NOW()
  WHERE "organizationId" = v_org_id
    AND "eventYearId" = v_current_year_id;

  RAISE NOTICE '✓ Moved % company teams', v_teams_moved;

  -- Step 2: Move tent purchase tracking
  UPDATE "tentPurchaseTracking"
  SET
    "eventYearId" = v_target_event_year_id,
    "updatedAt" = NOW()
  WHERE "organizationId" = v_org_id
    AND "eventYearId" = v_current_year_id;

  RAISE NOTICE '✓ Moved % tent purchases', v_tents_moved;

  -- Step 3: Move orders (items, payments, invoices will be linked)
  UPDATE "order"
  SET
    "eventYearId" = v_target_event_year_id,
    "updatedAt" = NOW()
  WHERE "organizationId" = v_org_id
    AND "eventYearId" = v_current_year_id;

  RAISE NOTICE '✓ Moved % orders', v_orders_moved;
  RAISE NOTICE '';
  RAISE NOTICE '=== MOVE COMPLETED SUCCESSFULLY ===';

END $$;

-- Verify the move was successful - current year should be empty (except players)
SELECT
  'VERIFICATION - Current Active Year (should be EMPTY except players)' as status,
  (SELECT year FROM "eventYear" WHERE "isActive" = true) as current_year,
  (SELECT COUNT(*) FROM "companyTeam" ct
   JOIN "eventYear" ey ON ct."eventYearId" = ey.id
   WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
   AND ey."isActive" = true) as teams_in_current_year,
  (SELECT COUNT(*) FROM "tentPurchaseTracking" tpt
   JOIN "eventYear" ey ON tpt."eventYearId" = ey.id
   WHERE tpt."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
   AND ey."isActive" = true) as tents_in_current_year,
  (SELECT COUNT(*) FROM "order" o
   JOIN "eventYear" ey ON o."eventYearId" = ey.id
   WHERE o."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
   AND ey."isActive" = true) as orders_in_current_year,
  (SELECT COUNT(*) FROM "player" p
   JOIN "eventYear" ey ON p."eventYearId" = ey.id
   WHERE p."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
   AND ey."isActive" = true) as players_staying_in_current_year;

-- Show where the data was moved to - target year should have data (but no players)
SELECT
  'VERIFICATION - Target Year (should have DATA but no players)' as status,
  ey.year as target_year,
  ey.name as target_year_name,
  (SELECT COUNT(*) FROM "companyTeam" WHERE "organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe' AND "eventYearId" = ey.id) as teams_in_target,
  (SELECT COUNT(*) FROM "tentPurchaseTracking" WHERE "organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe' AND "eventYearId" = ey.id) as tents_in_target,
  (SELECT COUNT(*) FROM "order" WHERE "organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe' AND "eventYearId" = ey.id) as orders_in_target
FROM "eventYear" ey
WHERE ey.id = '55890b36-bd01-48b1-be58-1af27b2025c9'::uuid;

-- Show detailed summary
SELECT
  'SUMMARY' as info,
  'Teams, tents, and orders moved to target year. Players remain in current year.' as message,
  'The organization should appear clean (no teams/orders) in current active year' as result;

-- IMPORTANT: Review the output above
-- If everything looks correct, leave COMMIT below
-- If you want to undo, replace COMMIT with ROLLBACK

COMMIT;
-- ROLLBACK;  -- Uncomment to undo changes
