# Database Launch Preparation Plan

**Goal:** Clean up test and stale data before full production launch

**Date:** 2025-11-18

---

## Phase 1: Data Audit & Identification

### 1.1 Identify Test Organizations
- Organizations with "test", "demo", "staging" in names
- Organizations with minimal activity
- Organizations created by specific test users

### 1.2 Identify Test Users
- Users with test email domains (@test.com, @example.com, etc.)
- Users created during development/testing periods
- Admin/super admin accounts used for testing

### 1.3 Identify Stale Data
- Old cart sessions (abandoned carts)
- Expired coupons
- Incomplete orders
- Old verification/reset tokens
- Unused API keys

### 1.4 Check Data Integrity
- Orphaned records (foreign key violations)
- Duplicate records
- Invalid data states

---

## Phase 2: Cleanup Execution

### 2.1 Backup First
- Create full database backup
- Export critical data to CSV
- Document current record counts

### 2.2 Delete Test Data
- Remove test organizations and all related data
- Remove test user accounts
- Clean up test orders/payments

### 2.3 Clean Stale Data
- Archive or delete old cart sessions
- Remove expired tokens
- Clean up old notifications

### 2.4 Data Optimization
- Vacuum/analyze tables
- Update statistics
- Rebuild indexes if needed

---

## Phase 3: Validation

### 3.1 Verify Cleanup
- Check record counts before/after
- Verify no broken foreign keys
- Test application functionality

### 3.2 Monitor Performance
- Check query performance
- Monitor database size
- Verify RLS policies still work

---

## Safety Checklist

- [ ] Full database backup created
- [ ] Cleanup scripts reviewed
- [ ] Test in staging environment first
- [ ] Dry-run mode tested
- [ ] Rollback plan documented
- [ ] Team notified of maintenance window

---

## Queries to Run

See `audit-database-for-launch.sql` for detailed audit queries.

---

## Notes

- Always run in a transaction for easy rollback
- Start with smallest/safest deletes first
- Monitor foreign key constraints
- Keep audit logs of what was deleted
