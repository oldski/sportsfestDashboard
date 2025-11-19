# Production Launch Database Cleanup Guide

## Quick Start

### 1. Create Fresh Backup
```bash
# In Supabase Dashboard:
# Settings → Database → Create backup
```

### 2. Run Pre-Cleanup Verification
Open `production-launch-cleanup.sql` and run **STEP 1** only in Supabase SQL Editor.

Review the results carefully:
- ✅ Should delete: 4 organizations, 9 regular users, all test data
- ✅ Should keep: 3 super admin users, coupons, products, settings

### 3. Run Main Cleanup
Run **STEP 2** in Supabase SQL Editor.

The script will:
- Show progress messages
- Auto-verify results
- Commit if successful
- Can be rolled back if needed

### 4. Verify Results
Run **STEP 3** to confirm cleanup was successful.

Expected results:
- 0 organizations
- 3 users (super admins only)
- 0 players, teams, orders
- Configuration tables intact

---

## What Gets Deleted

### Organizations (ALL 4)
- LAYBL Labs
- Dunder Mifflin
- SSOVA
- Acme Corp

### Cascading Deletes
When organizations are deleted, this automatically deletes:
- 700 playerEventInterest records
- 174 eventRoster records
- 144 players
- 133 teamRoster records
- 90 sessions
- 57 orderItems
- 41 orders
- 28 workHours
- 24 orderPayments
- 22 companyTeams
- 20 orderInvoices
- And more...

### Users (9 non-super-admins)
All regular user accounts and their:
- Sessions
- Memberships
- Personal data

---

## What Gets Kept

### Configuration Tables
- ✅ coupon (2 rows)
- ✅ eventYear (3 rows)
- ✅ product (2 rows)
- ✅ productCategory (2 rows)
- ✅ productImage (2 rows)
- ✅ settings (1 row)

### Admin Data
- ✅ superAdminAction (10 rows)
- ✅ user where isSportsFestAdmin = true (3 rows)

### Optional
- verificationToken (8 rows) - can be cleaned if desired

---

## Safety Features

1. **Transaction-based**: Entire cleanup runs in a single transaction
2. **Auto-verification**: Script checks results before committing
3. **Rollback capability**: Can undo if something goes wrong
4. **Progress messages**: Shows what's being deleted in real-time
5. **Sanity checks**: Prevents committing if unexpected results

---

## After Cleanup

Your database will be in a **fresh production state**:
- No test data
- No test organizations
- No test users
- Ready for real customer signups

### Test the Application

1. Create a new organization signup
2. Add players
3. Create an order
4. Test all critical workflows

---

## Emergency Rollback

If something goes wrong during cleanup:

```sql
-- Run this immediately if cleanup is in progress
ROLLBACK;
```

Then restore from your backup.

---

## Next: Dev Database Setup

See `dev-database-sync-strategy.md` for instructions on:
- Creating a dev database
- Syncing schema changes from prod to dev
- Keeping environments in sync