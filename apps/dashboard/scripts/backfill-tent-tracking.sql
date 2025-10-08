-- Backfill script to populate tentPurchaseTracking table with existing tent orders
-- Run this directly in your database

-- First, let's see what tent orders exist
SELECT
    o."organizationId",
    o."eventYearId",
    p.id as "productId",
    p.name as "productName",
    p."maxQuantityPerOrg",
    SUM(oi.quantity) as "totalQuantity",
    MIN(o."createdAt") as "earliestOrder"
FROM "order" o
INNER JOIN "orderItem" oi ON o.id = oi."orderId"
INNER JOIN product p ON oi."productId" = p.id
WHERE p.type = 'tent_rental'
  AND o.status IN ('fully_paid', 'deposit_paid')
GROUP BY o."organizationId", o."eventYearId", p.id, p.name, p."maxQuantityPerOrg"
ORDER BY "earliestOrder";

-- Insert tracking records for tent orders that don't already have tracking
INSERT INTO "tentPurchaseTracking" (
    "organizationId",
    "eventYearId",
    "tentProductId",
    "quantityPurchased",
    "maxAllowed",
    "remainingAllowed",
    "createdAt",
    "updatedAt"
)
SELECT
    o."organizationId",
    o."eventYearId",
    p.id as "tentProductId",
    SUM(oi.quantity) as "quantityPurchased",
    COALESCE(p."maxQuantityPerOrg", 0) as "maxAllowed",
    GREATEST(0, COALESCE(p."maxQuantityPerOrg", 0) - SUM(oi.quantity)) as "remainingAllowed",
    MIN(o."createdAt") as "createdAt",
    NOW() as "updatedAt"
FROM "order" o
INNER JOIN "orderItem" oi ON o.id = oi."orderId"
INNER JOIN product p ON oi."productId" = p.id
WHERE p.type = 'tent_rental'
  AND o.status IN ('fully_paid', 'deposit_paid')
  AND NOT EXISTS (
      SELECT 1 FROM "tentPurchaseTracking" tpt
      WHERE tpt."organizationId" = o."organizationId"
        AND tpt."eventYearId" = o."eventYearId"
        AND tpt."tentProductId" = p.id
  )
GROUP BY o."organizationId", o."eventYearId", p.id, p."maxQuantityPerOrg";

-- Check the results
SELECT
    tpt.*,
    p.name as "productName"
FROM "tentPurchaseTracking" tpt
INNER JOIN product p ON tpt."tentProductId" = p.id
ORDER BY tpt."createdAt";