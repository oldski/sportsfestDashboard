-- ========================================
-- PREVIEW: Clear Team Rosters for Entire Organization
-- Organization ID: 52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe
-- ========================================
--
-- This script shows what WOULD be deleted without actually deleting anything.
-- Run this first to verify you're targeting the correct organization and teams.
--

-- Preview: Organization details
SELECT
  id,
  name,
  slug,
  (SELECT COUNT(*) FROM "companyTeam" WHERE "organizationId" = o.id) as total_teams
FROM "organization" o
WHERE id = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe';

-- Preview: How many records will be deleted
SELECT
  'Event Roster' as roster_type,
  COUNT(*) as records_to_delete
FROM "eventRoster" er
JOIN "companyTeam" ct ON er."companyTeamId" = ct.id
WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
UNION ALL
SELECT
  'Team Roster' as roster_type,
  COUNT(*) as records_to_delete
FROM "teamRoster" tr
JOIN "companyTeam" ct ON tr."companyTeamId" = ct.id
WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
UNION ALL
SELECT
  'TOTAL' as roster_type,
  (SELECT COUNT(*) FROM "eventRoster" er
   JOIN "companyTeam" ct ON er."companyTeamId" = ct.id
   WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe') +
  (SELECT COUNT(*) FROM "teamRoster" tr
   JOIN "companyTeam" ct ON tr."companyTeamId" = ct.id
   WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe') as records_to_delete;

-- Preview: Teams and their roster counts
SELECT
  ct.id as team_id,
  ct.name as team_name,
  ct."teamNumber",
  ey.year as event_year,
  (SELECT COUNT(*) FROM "teamRoster" WHERE "companyTeamId" = ct.id) as team_roster_count,
  (SELECT COUNT(*) FROM "eventRoster" WHERE "companyTeamId" = ct.id) as event_roster_count,
  (SELECT COUNT(*) FROM "teamRoster" WHERE "companyTeamId" = ct.id) +
  (SELECT COUNT(*) FROM "eventRoster" WHERE "companyTeamId" = ct.id) as total_assignments
FROM "companyTeam" ct
LEFT JOIN "eventYear" ey ON ct."eventYearId" = ey.id
WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
ORDER BY ct."teamNumber";

-- Preview: All players who will be removed from team rosters
SELECT
  ct.name as team_name,
  ct."teamNumber",
  p.id as player_id,
  p."firstName",
  p."lastName",
  p.email,
  tr."isCaptain",
  tr."assignedAt"
FROM "teamRoster" tr
JOIN "companyTeam" ct ON tr."companyTeamId" = ct.id
JOIN "player" p ON tr."playerId" = p.id
WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
ORDER BY ct."teamNumber", tr."isCaptain" DESC, p."lastName", p."firstName";

-- Preview: All players who will be removed from event rosters
SELECT
  ct.name as team_name,
  ct."teamNumber",
  er."eventType",
  p.id as player_id,
  p."firstName",
  p."lastName",
  p.email,
  er."isStarter",
  er."squadLeader",
  er."assignedAt"
FROM "eventRoster" er
JOIN "companyTeam" ct ON er."companyTeamId" = ct.id
JOIN "player" p ON er."playerId" = p.id
WHERE ct."organizationId" = '52e3a0a1-5e55-4fb3-b03f-9d3a4acd9cfe'
ORDER BY ct."teamNumber", er."eventType", er."squadLeader" DESC, p."lastName", p."firstName";
