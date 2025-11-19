# Quick Start: RLS Warning Fixes

## What's Been Done

✅ Analyzed 363 Supabase warnings
✅ Created comprehensive cleanup plan
✅ Built automated fix script for Phase 1

## Files Created

1. **`supabase-warnings-cleanup-plan.md`** - Full detailed plan
2. **`fix-rls-auth-warnings.js`** - Automated script to fix auth.uid() warnings
3. **`analyze-warnings.js`** - Analysis script for understanding warnings

## Getting Started Tomorrow

### Step 1: Test with Sample Tables (Recommended)

Start with just 3 tables to verify the approach works:

```bash
node scripts/fix-rls-auth-warnings.js --tables=companyTeam,player,payment --dry-run
```

This will show you what changes would be made without modifying files.

### Step 2: Apply to Sample Tables

Once you're comfortable with the changes:

```bash
node scripts/fix-rls-auth-warnings.js --tables=companyTeam,player,payment
```

This will:
- Create a backup: `database-rls-policies.sql.backup`
- Update `database-rls-policies.sql` with optimized auth calls

### Step 3: Review Changes

```bash
git diff database-rls-policies.sql
```

Look for changes like:
- `auth.uid()` → `(SELECT auth.uid())`

### Step 4: Test in Staging

Apply the updated SQL to your staging Supabase instance and test:
- User can view their org's data
- Admin can manage their org
- Super admin can manage all orgs
- Users can't see other orgs' data

### Step 5: Run All Tables

Once confident:

```bash
node scripts/fix-rls-auth-warnings.js
```

This fixes all 44 tables at once.

## Script Options

```bash
# Preview changes for specific tables
node scripts/fix-rls-auth-warnings.js --tables=companyTeam,player --dry-run

# Fix specific tables
node scripts/fix-rls-auth-warnings.js --tables=companyTeam,player

# Fix all tables (97 warnings across 44 tables)
node scripts/fix-rls-auth-warnings.js

# Show help
node scripts/fix-rls-auth-warnings.js --help
```

## What This Fixes

**Auth RLS InitPlan Warnings (97 total)**

These warnings occur when `auth.uid()` is evaluated for every row in a query. By wrapping it in `(SELECT auth.uid())`, it's evaluated once per query instead.

**Performance Impact:** High - especially noticeable on tables with many rows

## What's NOT Fixed Yet

**Multiple Permissive Policies (266 warnings)**

These require manual review and consolidation. See the full plan in `supabase-warnings-cleanup-plan.md` for Phase 2 approach.

## Safety

- Script creates automatic backup before modifying files
- Use `--dry-run` to preview changes
- Test on sample tables first
- Review all changes with `git diff`
- Test thoroughly in staging before production

## Rollback

If something goes wrong:

```bash
cp database-rls-policies.sql.backup database-rls-policies.sql
```

## Questions?

See the full plan in `supabase-warnings-cleanup-plan.md` for:
- Detailed explanation of warnings
- Phase 2 approach (multiple permissive policies)
- Testing checklist
- Long-term maintenance recommendations
