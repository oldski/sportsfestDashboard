# Supabase Warnings Cleanup Plan

**Total Warnings:** 363
**Generated:** 2025-11-17
**Status:** Phase 1 in progress

---

## Executive Summary

Our Supabase database has 363 linter warnings across 44 tables, split into two categories:
- **97 Auth RLS InitPlan warnings**: Performance issue from `auth.uid()` being re-evaluated per row
- **266 Multiple Permissive Policies warnings**: Multiple permissive RLS policies on same tables

---

## Warning Breakdown by Type

### 1. Auth RLS Initialization Plan (97 warnings)
**Severity:** WARN
**Category:** PERFORMANCE
**Affected Tables:** 44

**Problem:**
Calls to `auth.uid()` and other `auth.*()` functions in RLS policies are being re-evaluated for each row, causing suboptimal query performance at scale.

**Solution:**
Replace `auth.uid()` with `(SELECT auth.uid())` to ensure the function is evaluated once per query instead of once per row.

**Example:**
```sql
-- BEFORE (inefficient)
WHERE "userId" = auth.uid()

-- AFTER (optimized)
WHERE "userId" = (SELECT auth.uid())
```

---

### 2. Multiple Permissive Policies (266 warnings)
**Severity:** WARN
**Category:** PERFORMANCE
**Affected Tables:** 43

**Problem:**
Multiple permissive row level security policies on the same table for the same role and command create OR conditions that can be inefficient and harder to maintain.

**Solution Options:**
1. Consolidate multiple permissive policies into single policies with OR conditions
2. Use RESTRICTIVE policies where AND logic is more appropriate
3. Accept warnings if policies are logically distinct and performance is acceptable

---

## Top 20 Tables by Warning Count

| Table | Warning Count | Warning Types |
|-------|--------------|---------------|
| cartSession | 18 | auth_rls_initplan, multiple_permissive_policies |
| payment | 16 | auth_rls_initplan, multiple_permissive_policies |
| order | 16 | auth_rls_initplan, multiple_permissive_policies |
| orderPayment | 16 | auth_rls_initplan, multiple_permissive_policies |
| tentPurchaseTracking | 16 | auth_rls_initplan, multiple_permissive_policies |
| orderItem | 16 | auth_rls_initplan, multiple_permissive_policies |
| companyTeam | 16 | auth_rls_initplan, multiple_permissive_policies |
| eventRoster | 16 | auth_rls_initplan, multiple_permissive_policies |
| playerEventInterest | 16 | auth_rls_initplan, multiple_permissive_policies |
| player | 16 | auth_rls_initplan, multiple_permissive_policies |
| teamRoster | 16 | auth_rls_initplan, multiple_permissive_policies |
| user | 10 | auth_rls_initplan, multiple_permissive_policies |
| coupon | 7 | auth_rls_initplan, multiple_permissive_policies |
| contactActivity | 6 | auth_rls_initplan, multiple_permissive_policies |
| contactComment | 6 | auth_rls_initplan, multiple_permissive_policies |
| userImage | 6 | auth_rls_initplan, multiple_permissive_policies |
| contactImage | 6 | auth_rls_initplan, multiple_permissive_policies |
| contactNote | 6 | auth_rls_initplan, multiple_permissive_policies |
| contactPageVisit | 6 | auth_rls_initplan, multiple_permissive_policies |
| contactToContactTag | 6 | auth_rls_initplan, multiple_permissive_policies |

---

## Phase 1: Fix Auth RLS InitPlan Warnings

### Objective
Fix all 97 auth RLS initialization warnings by wrapping auth function calls in SELECT statements.

### Effort Estimate
- **Complexity:** Low
- **Risk:** Low
- **Time:** 1-2 hours
- **Performance Impact:** High improvement

### Implementation Steps

1. **Preparation**
   - Backup current `database-rls-policies.sql`
   - Create test cases for critical tables
   - Set up staging environment for testing

2. **Automated Fixes**
   - Run `fix-rls-auth-warnings.js` script (initially on sample tables)
   - Script will:
     - Read `database-rls-policies.sql`
     - Find all `auth.uid()`, `auth.jwt()`, `auth.role()` calls
     - Wrap them in `(SELECT ...)`
     - Generate updated SQL file

3. **Testing**
   - Review changes in updated SQL file
   - Test policies with different user roles:
     - Regular user
     - Admin user
     - Super admin
     - Unauthenticated user
   - Verify no permissions regressions

4. **Deployment**
   - Apply changes to staging database
   - Run Supabase linter to verify warnings are resolved
   - Monitor performance improvements
   - Deploy to production

### Sample Tables for Initial Test
- companyTeam (16 warnings)
- player (16 warnings)
- payment (16 warnings)

### Transformations Required

| Pattern | Replacement |
|---------|-------------|
| `auth.uid()` | `(SELECT auth.uid())` |
| `auth.jwt()` | `(SELECT auth.jwt())` |
| `auth.role()` | `(SELECT auth.role())` |
| `current_setting('request.jwt.claims')` | `(SELECT current_setting('request.jwt.claims'))` |

---

## Phase 2: Fix Multiple Permissive Policies

### Objective
Reduce or consolidate the 266 multiple permissive policy warnings.

### Effort Estimate
- **Complexity:** Medium-High
- **Risk:** Medium (requires careful permission logic review)
- **Time:** 4-8 hours
- **Performance Impact:** Moderate improvement

### Implementation Approach

#### Option A: Consolidate Policies (Recommended for most tables)

**Before:**
```sql
CREATE POLICY "Users can view company teams from their organization" ON "companyTeam"
FOR SELECT USING (...);

CREATE POLICY "Super admins can manage all company teams" ON "companyTeam"
FOR ALL USING (...);
```

**After:**
```sql
CREATE POLICY "Company team access" ON "companyTeam"
FOR SELECT USING (
  -- Regular users can see their org
  "organizationId" IN (
    SELECT "organizationId" FROM "membership" WHERE "userId" = (SELECT auth.uid())
  )
  OR
  -- Super admins can see all
  EXISTS (SELECT 1 FROM "user" WHERE "id" = (SELECT auth.uid()) AND "isSportsFestAdmin" = true)
);
```

#### Option B: Use RESTRICTIVE Policies

For cases where AND logic is needed, convert some policies to RESTRICTIVE.

#### Option C: Accept Warnings

For tables where policies are logically distinct and consolidation would reduce clarity, document the decision to keep separate policies.

### Analysis Required

For each affected table, determine:
1. What are the distinct permission scenarios?
2. Can they be consolidated without losing clarity?
3. Are there performance issues with current approach?
4. What is the testing overhead for consolidation?

### Implementation Steps

1. **Table-by-Table Analysis**
   - Review all policies for each table
   - Identify consolidation opportunities
   - Document permission logic

2. **Create Consolidated Policies**
   - Write new consolidated policy definitions
   - Ensure all original conditions are preserved
   - Add comments explaining permission logic

3. **Testing**
   - Comprehensive testing of all permission scenarios
   - Edge case testing (user in multiple orgs, role changes, etc.)
   - Performance testing on large datasets

4. **Deployment**
   - Apply to staging
   - Run full test suite
   - Monitor for permission issues
   - Deploy to production

---

## Phase 3: Validation & Testing

### Pre-Deployment Checklist

- [ ] All Phase 1 changes reviewed
- [ ] Automated tests pass
- [ ] Manual testing completed for each user role
- [ ] Performance benchmarks show improvement
- [ ] Staging deployment successful
- [ ] Supabase linter shows reduced warnings

### Post-Deployment Monitoring

- Monitor error logs for permission denied errors
- Track query performance metrics
- Run linter weekly to catch new warnings
- Document any edge cases discovered

---

## Rollback Plan

1. Keep backup of original `database-rls-policies.sql`
2. If issues arise:
   - Revert to original SQL file
   - Apply to database
   - Investigate specific failing policies
   - Fix and redeploy

---

## Long-Term Maintenance

### Best Practices
1. Always wrap `auth.*()` calls in `(SELECT ...)` for new policies
2. Consider consolidating policies when creating new ones
3. Run Supabase linter before major releases
4. Document complex permission logic

### Automation
- Add pre-commit hook to check for unwrapped auth calls
- Automate linter runs in CI/CD pipeline
- Create policy templates for common patterns

---

## References

- [Supabase RLS Performance Docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)
- [Database Linter - Auth RLS InitPlan](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan)
- [Multiple Permissive Policies](https://supabase.com/docs/guides/database/database-linter)

---

## Progress Tracking

### Phase 1: Auth RLS InitPlan Fixes
- [ ] Script created
- [ ] Sample tables tested (companyTeam, player, payment)
- [ ] Full automated fix run
- [ ] Staging deployment
- [ ] Production deployment
- **Status:** In Progress

### Phase 2: Multiple Permissive Policies
- [ ] Table analysis complete
- [ ] Consolidation strategy defined
- [ ] New policies written
- [ ] Testing complete
- [ ] Deployment complete
- **Status:** Not Started

### Phase 3: Validation
- [ ] Linter warnings reduced
- [ ] Performance improvements verified
- [ ] Documentation updated
- **Status:** Not Started

---

## Notes

- Initial analysis completed: 2025-11-17
- Warnings exported to: `scripts/supabase-warnings.json`
- Analysis script: `scripts/analyze-warnings.js`
- Fix script: `scripts/fix-rls-auth-warnings.js` (pending)
