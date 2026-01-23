-- Script to recalculate and fix tent purchase tracking limits
-- Run this to update maxAllowed and remainingAllowed based on actual team counts

-- This will recalculate tent limits for all organizations
-- Formula: maxAllowed = (created teams + purchased teams) * 2

WITH team_counts AS (
  SELECT
    ct."organizationId",
    ct."eventYearId",
    -- Count created teams
    COUNT(DISTINCT ct.id) as created_teams,
    -- Count purchased teams from paid orders
    COALESCE((
      SELECT SUM(oi.quantity)::int
      FROM "orderItem" oi
      INNER JOIN "order" o ON o.id = oi."orderId"
      INNER JOIN "product" p ON p.id = oi."productId"
      WHERE p.type = 'team_registration'
        AND p."eventYearId" = ct."eventYearId"
        AND o."organizationId" = ct."organizationId"
        AND o."eventYearId" = ct."eventYearId"
        AND (
          o.status != 'pending'
          OR EXISTS (
            SELECT 1 FROM "orderPayment" op
            WHERE op."orderId" = o.id
            AND op.status = 'completed'
          )
        )
    ), 0) as purchased_teams
  FROM "companyTeam" ct
  GROUP BY ct."organizationId", ct."eventYearId"
)
UPDATE "tentPurchaseTracking" tpt
SET
  "companyTeamCount" = GREATEST(tc.created_teams, tc.purchased_teams),
  "maxAllowed" = GREATEST(tc.created_teams, tc.purchased_teams) * 2,
  "remainingAllowed" = GREATEST(0, (GREATEST(tc.created_teams, tc.purchased_teams) * 2) - tpt."quantityPurchased"),
  "updatedAt" = NOW()
FROM team_counts tc
WHERE tpt."organizationId" = tc."organizationId"
  AND tpt."eventYearId" = tc."eventYearId";

-- Show updated tracking records
SELECT
  o.name as organization,
  ey.name as event_year,
  tpt."companyTeamCount" as teams,
  tpt."quantityPurchased" as tents_purchased,
  tpt."maxAllowed" as max_tents,
  tpt."remainingAllowed" as remaining_tents
FROM "tentPurchaseTracking" tpt
INNER JOIN "organization" o ON o.id = tpt."organizationId"
INNER JOIN "eventYear" ey ON ey.id = tpt."eventYearId"
ORDER BY o.name, ey.year;
