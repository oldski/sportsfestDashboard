-- ========================================
-- Delete Organization Data from Current Active Event Year
-- Organization ID: 52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe
-- ========================================
--
-- This DELETES data for the organization in the current active year only:
-- - Company Teams (rosters cascade automatically)
-- - Team Rosters (cascade from teams)
-- - Event Rosters (cascade from teams)
-- - Tent Purchase Tracking
-- - Orders (items, payments, invoices cascade)
--
-- NOTE: Players are NOT deleted - they stay in the current event year
-- NOTE: Data in OTHER event years is NOT affected
--
-- BEFORE RUNNING:
-- 1. Make sure you have a database backup
-- 2. This is permanent deletion, not a move!
--

BEGIN;

-- Delete organization data from current active year
DO $$
DECLARE
  v_org_id uuid := '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'::uuid;
  v_current_year_id uuid;
  v_teams_deleted int;
  v_tents_deleted int;
  v_orders_deleted int;
BEGIN
  -- Get current active event year
  SELECT id INTO v_current_year_id
  FROM "eventYear"
  WHERE "isActive" = true AND "isDeleted" = false
  LIMIT 1;

  IF v_current_year_id IS NULL THEN
    RAISE EXCEPTION 'No active event year found';
  END IF;

  RAISE NOTICE '=== DELETING ORGANIZATION DATA FROM CURRENT YEAR ===';
  RAISE NOTICE 'Organization ID: %', v_org_id;
  RAISE NOTICE 'Active Event Year: %', v_current_year_id;
  RAISE NOTICE '';

  -- Count what we're about to delete
  SELECT COUNT(*) INTO v_teams_deleted
  FROM "companyTeam"
  WHERE "organizationId" = v_org_id AND "eventYearId" = v_current_year_id;

  SELECT COUNT(*) INTO v_tents_deleted
  FROM "tentPurchaseTracking"
  WHERE "organizationId" = v_org_id AND "eventYearId" = v_current_year_id;

  SELECT COUNT(*) INTO v_orders_deleted
  FROM "order"
  WHERE "organizationId" = v_org_id AND "eventYearId" = v_current_year_id;

  RAISE NOTICE '=== BEFORE DELETE ===';
  RAISE NOTICE 'Company teams to delete: %', v_teams_deleted;
  RAISE NOTICE 'Tent purchases to delete: %', v_tents_deleted;
  RAISE NOTICE 'Orders to delete: %', v_orders_deleted;
  RAISE NOTICE 'Players: NOT DELETING (staying in current year)';
  RAISE NOTICE '';

  -- Step 1: Delete company teams (rosters cascade automatically)
  DELETE FROM "companyTeam"
  WHERE "organizationId" = v_org_id
    AND "eventYearId" = v_current_year_id;

  RAISE NOTICE '✓ Deleted % company teams (and their rosters)', v_teams_deleted;

  -- Step 2: Delete tent purchase tracking
  DELETE FROM "tentPurchaseTracking"
  WHERE "organizationId" = v_org_id
    AND "eventYearId" = v_current_year_id;

  RAISE NOTICE '✓ Deleted % tent purchases', v_tents_deleted;

  -- Step 3: Delete orders (items, payments, invoices cascade)
  DELETE FROM "order"
  WHERE "organizationId" = v_org_id
    AND "eventYearId" = v_current_year_id;

  RAISE NOTICE '✓ Deleted % orders (and related items/payments/invoices)', v_orders_deleted;
  RAISE NOTICE '';
  RAISE NOTICE '=== DELETE COMPLETED SUCCESSFULLY ===';

END $$;

-- Verify the deletion - current year should be empty (except players)
SELECT
  'VERIFICATION - Current Active Year (should be EMPTY except players)' as status,
  (SELECT year FROM "eventYear" WHERE "isActive" = true) as current_year,
  (SELECT COUNT(*) FROM "companyTeam" ct
   JOIN "eventYear" ey ON ct."eventYearId" = ey.id
   WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
   AND ey."isActive" = true) as teams_remaining,
  (SELECT COUNT(*) FROM "tentPurchaseTracking" tpt
   JOIN "eventYear" ey ON tpt."eventYearId" = ey.id
   WHERE tpt."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
   AND ey."isActive" = true) as tents_remaining,
  (SELECT COUNT(*) FROM "order" o
   JOIN "eventYear" ey ON o."eventYearId" = ey.id
   WHERE o."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
   AND ey."isActive" = true) as orders_remaining,
  (SELECT COUNT(*) FROM "player" p
   JOIN "eventYear" ey ON p."eventYearId" = ey.id
   WHERE p."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
   AND ey."isActive" = true) as players_remaining;

-- Show summary
SELECT
  'SUMMARY' as info,
  'Current year data deleted. Players remain. Organization now appears clean.' as message,
  'Perfect for training videos - clean slate with existing players!' as result;

-- IMPORTANT: Review the output above
-- If everything looks correct, leave COMMIT below
-- If you want to undo, replace COMMIT with ROLLBACK

COMMIT;
-- ROLLBACK;  -- Uncomment to undo changes
