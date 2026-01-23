-- Database Audit for Production Launch
-- Run these queries to identify test and stale data
-- Copy sections to Supabase SQL Editor as needed

-- ============================================
-- SECTION 1: ORGANIZATION AUDIT
-- ============================================

-- Organizations that might be test accounts
SELECT
    id,
    name,
    "createdAt",
    (SELECT COUNT(*) FROM membership WHERE "organizationId" = organization.id) as member_count,
    (SELECT COUNT(*) FROM "order" WHERE "organizationId" = organization.id) as order_count,
    (SELECT COUNT(*) FROM player WHERE "organizationId" = organization.id) as player_count
FROM organization
WHERE
    LOWER(name) LIKE '%test%'
    OR LOWER(name) LIKE '%demo%'
    OR LOWER(name) LIKE '%staging%'
    OR LOWER(name) LIKE '%dev%'
ORDER BY "createdAt" DESC;

-- Organizations with no activity (potential stale)
SELECT
    id,
    name,
    "createdAt",
    (SELECT COUNT(*) FROM membership WHERE "organizationId" = organization.id) as member_count,
    (SELECT COUNT(*) FROM "order" WHERE "organizationId" = organization.id) as order_count,
    (SELECT COUNT(*) FROM player WHERE "organizationId" = organization.id) as player_count
FROM organization
WHERE
    (SELECT COUNT(*) FROM "order" WHERE "organizationId" = organization.id) = 0
    AND "createdAt" < NOW() - INTERVAL '30 days'
ORDER BY "createdAt";

-- ============================================
-- SECTION 2: USER AUDIT
-- ============================================

-- Users with test email domains
SELECT
    id,
    email,
    "createdAt",
    "isSportsFestAdmin",
    "emailVerified"
FROM "user"
WHERE
    email LIKE '%@test.%'
    OR email LIKE '%@example.%'
    OR email LIKE '%@localhost%'
    OR email LIKE '%+test@%'
ORDER BY "createdAt" DESC;

-- Users with no organization membership (orphaned)
SELECT
    u.id,
    u.email,
    u."createdAt",
    u."emailVerified"
FROM "user" u
WHERE NOT EXISTS (
    SELECT 1 FROM membership m WHERE m."userId" = u.id
)
AND u."isSportsFestAdmin" = false
AND u."createdAt" < NOW() - INTERVAL '7 days'
ORDER BY u."createdAt";

-- ============================================
-- SECTION 3: STALE DATA AUDIT
-- ============================================

-- Old cart sessions (>30 days, not converted to orders)
SELECT
    cs.id,
    cs."userId",
    cs."organizationId",
    cs."createdAt",
    cs."updatedAt",
    EXTRACT(DAY FROM (NOW() - cs."updatedAt")) as days_old
FROM "cartSession" cs
WHERE
    cs."updatedAt" < NOW() - INTERVAL '30 days'
    AND NOT EXISTS (
        SELECT 1 FROM "order" o WHERE o."cartSessionId" = cs.id
    )
ORDER BY cs."updatedAt"
LIMIT 100;

-- Count of old cart sessions
SELECT COUNT(*) as old_cart_sessions_count
FROM "cartSession"
WHERE "updatedAt" < NOW() - INTERVAL '30 days';

-- Expired coupons still marked as active
SELECT
    id,
    code,
    "expiresAt",
    "isActive",
    "currentUses",
    "maxUses"
FROM coupon
WHERE
    "isActive" = true
    AND "expiresAt" < NOW()
ORDER BY "expiresAt";

-- Old verification/reset tokens (>7 days)
SELECT
    COUNT(*) as old_verification_tokens
FROM "verificationToken"
WHERE "createdAt" < NOW() - INTERVAL '7 days';

-- Old notifications (>90 days and read)
SELECT
    COUNT(*) as old_notifications_count
FROM notification
WHERE
    "createdAt" < NOW() - INTERVAL '90 days'
    AND "isRead" = true;

-- ============================================
-- SECTION 4: DATA INTEGRITY CHECKS
-- ============================================

-- Orders without organization (orphaned)
SELECT
    id,
    "createdAt",
    "organizationId",
    status
FROM "order"
WHERE NOT EXISTS (
    SELECT 1 FROM organization WHERE id = "order"."organizationId"
);

-- Memberships without valid user or organization
SELECT
    m.id,
    m."userId",
    m."organizationId",
    m.role
FROM membership m
WHERE
    NOT EXISTS (SELECT 1 FROM "user" WHERE id = m."userId")
    OR NOT EXISTS (SELECT 1 FROM organization WHERE id = m."organizationId");

-- Players without organization
SELECT
    id,
    "firstName",
    "lastName",
    "organizationId"
FROM player
WHERE NOT EXISTS (
    SELECT 1 FROM organization WHERE id = player."organizationId"
);

-- ============================================
-- SECTION 5: OVERALL STATISTICS
-- ============================================

-- Table row counts
SELECT
    'Organizations' as table_name,
    COUNT(*) as row_count
FROM organization
UNION ALL
SELECT 'Users', COUNT(*) FROM "user"
UNION ALL
SELECT 'Memberships', COUNT(*) FROM membership
UNION ALL
SELECT 'Orders', COUNT(*) FROM "order"
UNION ALL
SELECT 'Payments', COUNT(*) FROM payment
UNION ALL
SELECT 'Players', COUNT(*) FROM player
UNION ALL
SELECT 'Cart Sessions', COUNT(*) FROM "cartSession"
UNION ALL
SELECT 'Coupons', COUNT(*) FROM coupon
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notification
UNION ALL
SELECT 'Contacts', COUNT(*) FROM contact
ORDER BY table_name;

-- Database size by table (requires pg_total_relation_size)
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- ============================================
-- SECTION 6: ACTIVITY METRICS
-- ============================================

-- Orders by month
SELECT
    DATE_TRUNC('month', "createdAt") as month,
    COUNT(*) as order_count,
    COUNT(DISTINCT "organizationId") as unique_orgs
FROM "order"
GROUP BY DATE_TRUNC('month', "createdAt")
ORDER BY month DESC;

-- User signups by month
SELECT
    DATE_TRUNC('month', "createdAt") as month,
    COUNT(*) as user_count
FROM "user"
GROUP BY DATE_TRUNC('month', "createdAt")
ORDER BY month DESC;

-- ============================================
-- NOTES
-- ============================================
--
-- Run each section separately in Supabase SQL Editor
-- Export results to CSV for record keeping
-- Review with team before proceeding to deletion
--
-- Next step: Create cleanup scripts based on these results