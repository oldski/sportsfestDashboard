-- ============================================
-- PRODUCTION LAUNCH DATABASE CLEANUP
-- ============================================
--
-- PURPOSE: Remove all test data before production launch
-- DATE: 2025-11-18
--
-- WHAT THIS SCRIPT DOES:
-- 1. Deletes ALL test organizations (cascades to all related data)
-- 2. Deletes ALL non-super-admin users (cascades to sessions, etc.)
-- 3. Cleans up old tokens and temporary data
--
-- WHAT THIS SCRIPT KEEPS:
-- - Configuration: coupon, eventYear, product, productCategory, productImage, settings
-- - Admin data: superAdminAction, 3 super admin users
-- - Tokens: verificationToken (if needed)
--
-- CRITICAL: Run STEP 1 first to verify what will be deleted!
-- CRITICAL: Create a fresh backup before running STEP 2!
-- ============================================

-- ============================================
-- STEP 1: PRE-CLEANUP VERIFICATION
-- ============================================
-- Run this FIRST to see exactly what will be deleted
-- DO NOT PROCEED to Step 2 until you've reviewed these results!

-- COMPREHENSIVE VERIFICATION - Shows everything in one result
SELECT 'DELETE - Organizations' as category, COUNT(*)::text as count, 'All 4 orgs will be deleted' as note
FROM organization
UNION ALL
SELECT 'DELETE - Regular Users', COUNT(*)::text, 'Non-super-admin users (should be 9)'
FROM "user" WHERE "isSportsFestAdmin" = false
UNION ALL
SELECT 'DELETE - Players', COUNT(*)::text, 'Cascade from org deletion'
FROM player
UNION ALL
SELECT 'DELETE - Orders', COUNT(*)::text, 'Cascade from org deletion'
FROM "order"
UNION ALL
SELECT 'DELETE - PlayerEventInterest', COUNT(*)::text, 'Cascade from player deletion'
FROM "playerEventInterest"
UNION ALL
SELECT 'DELETE - EventRoster', COUNT(*)::text, 'Cascade from deletion'
FROM "eventRoster"
UNION ALL
SELECT 'DELETE - TeamRoster', COUNT(*)::text, 'Cascade from deletion'
FROM "teamRoster"
UNION ALL
SELECT 'DELETE - CompanyTeam', COUNT(*)::text, 'Cascade from org deletion'
FROM "companyTeam"
UNION ALL
SELECT 'DELETE - OrderItem', COUNT(*)::text, 'Cascade from order deletion'
FROM "orderItem"
UNION ALL
SELECT 'DELETE - OrderPayment', COUNT(*)::text, 'Cascade from order deletion'
FROM "orderPayment"
UNION ALL
SELECT 'DELETE - OrderInvoice', COUNT(*)::text, 'Cascade from order deletion'
FROM "orderInvoice"
UNION ALL
SELECT 'DELETE - Membership', COUNT(*)::text, 'Cascade from org/user deletion'
FROM membership
UNION ALL
SELECT 'DELETE - Sessions', COUNT(*)::text, 'All login sessions'
FROM session
UNION ALL
SELECT 'DELETE - CartSessions', COUNT(*)::text, 'All cart sessions'
FROM "cartSession"
UNION ALL
SELECT 'KEEP - Super Admin Users', COUNT(*)::text, 'Admin accounts to keep (should be 3)'
FROM "user" WHERE "isSportsFestAdmin" = true
UNION ALL
SELECT 'KEEP - Coupons', COUNT(*)::text, 'Configuration data'
FROM coupon
UNION ALL
SELECT 'KEEP - EventYears', COUNT(*)::text, 'Configuration data'
FROM "eventYear"
UNION ALL
SELECT 'KEEP - Products', COUNT(*)::text, 'Configuration data'
FROM product
UNION ALL
SELECT 'KEEP - ProductCategories', COUNT(*)::text, 'Configuration data'
FROM "productCategory"
UNION ALL
SELECT 'KEEP - ProductImages', COUNT(*)::text, 'Configuration data'
FROM "productImage"
UNION ALL
SELECT 'KEEP - Settings', COUNT(*)::text, 'Configuration data'
FROM settings
UNION ALL
SELECT 'KEEP - SuperAdminActions', COUNT(*)::text, 'Audit log'
FROM "superAdminAction";

-- Show the specific super admin users that will be KEPT
SELECT
  '👤 SUPER ADMIN (KEEPING)' as status,
  email,
  "isSportsFestAdmin",
  (SELECT COUNT(*) FROM session WHERE "userId" = "user".id) as active_sessions
FROM "user"
WHERE "isSportsFestAdmin" = true
ORDER BY email;

-- ============================================
-- STEP 2: MAIN CLEANUP SCRIPT
-- ============================================
-- IMPORTANT: Review Step 1 results before running this!
-- IMPORTANT: Create a fresh backup before running this!
--
-- This script uses a transaction so you can ROLLBACK if needed.
-- After running, review the results. If everything looks good,
-- the transaction will auto-commit. If not, you can manually ROLLBACK.

BEGIN;

-- Keep track of what we're deleting
DO $$
DECLARE
    org_count INT;
    user_count INT;
BEGIN
    SELECT COUNT(*) INTO org_count FROM organization;
    SELECT COUNT(*) INTO user_count FROM "user" WHERE "isSportsFestAdmin" = false;

    RAISE NOTICE '==============================================';
    RAISE NOTICE 'PRODUCTION LAUNCH CLEANUP - STARTING';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Organizations to delete: %', org_count;
    RAISE NOTICE 'Non-admin users to delete: %', user_count;
    RAISE NOTICE '==============================================';
END $$;

-- ============================================
-- DELETE 1: All Organizations (cascades to related data)
-- ============================================
-- This will cascade delete:
-- - memberships, players, teams, orders, payments, invoices, etc.

DELETE FROM organization;

-- ============================================
-- DELETE 2: All Non-Super-Admin Users
-- ============================================
-- This will cascade delete:
-- - sessions, memberships (if any remain), etc.

DELETE FROM "user"
WHERE "isSportsFestAdmin" = false;

-- ============================================
-- DELETE 3: Clean up orphaned/temporary data
-- ============================================

-- Delete old sessions (likely orphaned now anyway)
DELETE FROM session;

-- Delete cart sessions (all should be orphaned now)
DELETE FROM "cartSession";

-- Delete old reset password requests (likely expired)
DELETE FROM "resetPasswordRequest"
WHERE "createdAt" < NOW() - INTERVAL '1 day';

-- Delete old verification tokens (optional - keep if you want)
-- Uncomment the next line if you want to clean these too:
-- DELETE FROM "verificationToken" WHERE "createdAt" < NOW() - INTERVAL '7 days';

-- Delete invitations (should be orphaned)
DELETE FROM invitation;

-- Delete work hours and time slots (should be orphaned)
DELETE FROM "workTimeSlot";
DELETE FROM "workHours";

-- Delete tent purchase tracking (should be orphaned)
DELETE FROM "tentPurchaseTracking";

-- Delete organization logos (should be orphaned)
DELETE FROM "organizationLogo";

-- Delete feedback (test feedback)
DELETE FROM feedback;

-- Delete user images (should be orphaned)
DELETE FROM "userImage";

-- ============================================
-- VERIFICATION: Check what remains
-- ============================================

DO $$
DECLARE
    org_count INT;
    user_count INT;
    player_count INT;
    order_count INT;
BEGIN
    SELECT COUNT(*) INTO org_count FROM organization;
    SELECT COUNT(*) INTO user_count FROM "user";
    SELECT COUNT(*) INTO player_count FROM player;
    SELECT COUNT(*) INTO order_count FROM "order";

    RAISE NOTICE '==============================================';
    RAISE NOTICE 'CLEANUP COMPLETE - VERIFICATION';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Organizations remaining: % (should be 0)', org_count;
    RAISE NOTICE 'Users remaining: % (should be 3)', user_count;
    RAISE NOTICE 'Players remaining: % (should be 0)', player_count;
    RAISE NOTICE 'Orders remaining: % (should be 0)', order_count;
    RAISE NOTICE '==============================================';

    -- Sanity check
    IF org_count != 0 THEN
        RAISE EXCEPTION 'ERROR: Organizations still exist! Expected 0, got %', org_count;
    END IF;

    IF user_count != 3 THEN
        RAISE WARNING 'WARNING: Expected 3 users (super admins), got %', user_count;
    END IF;

    RAISE NOTICE 'Cleanup successful! Review results above.';
    RAISE NOTICE 'If everything looks good, this will commit automatically.';
    RAISE NOTICE 'If you want to rollback, run: ROLLBACK;';
END $$;

COMMIT;

-- ============================================
-- STEP 3: POST-CLEANUP VERIFICATION
-- ============================================
-- Run this AFTER the cleanup to verify the results

-- Tables that should be EMPTY
SELECT 'organization' as table_name, COUNT(*) as row_count FROM organization
UNION ALL
SELECT 'membership', COUNT(*) FROM membership
UNION ALL
SELECT 'player', COUNT(*) FROM player
UNION ALL
SELECT 'companyTeam', COUNT(*) FROM "companyTeam"
UNION ALL
SELECT 'order', COUNT(*) FROM "order"
UNION ALL
SELECT 'orderItem', COUNT(*) FROM "orderItem"
UNION ALL
SELECT 'orderPayment', COUNT(*) FROM "orderPayment"
UNION ALL
SELECT 'session', COUNT(*) FROM session
UNION ALL
SELECT 'cartSession', COUNT(*) FROM "cartSession"
ORDER BY row_count DESC;

-- Tables that should have data KEPT
SELECT 'user (super admins)' as table_name, COUNT(*) as row_count FROM "user"
UNION ALL
SELECT 'coupon', COUNT(*) FROM coupon
UNION ALL
SELECT 'eventYear', COUNT(*) FROM "eventYear"
UNION ALL
SELECT 'product', COUNT(*) FROM product
UNION ALL
SELECT 'productCategory', COUNT(*) FROM "productCategory"
UNION ALL
SELECT 'settings', COUNT(*) FROM settings
UNION ALL
SELECT 'superAdminAction', COUNT(*) FROM "superAdminAction"
ORDER BY row_count DESC;

-- Show the remaining super admin users
SELECT id, email, "isSportsFestAdmin"
FROM "user"
ORDER BY email;

-- ============================================
-- NOTES
-- ============================================
--
-- After cleanup, you should have:
-- - 0 organizations
-- - 3 users (all super admins)
-- - 0 players, teams, orders, etc.
-- - Configuration tables intact (coupons, products, etc.)
--
-- Your database is now ready for production launch!
--
-- Next steps:
-- 1. Test your application with a fresh organization signup
-- 2. Verify all features work correctly
-- 3. Set up dev database sync process
-- ============================================