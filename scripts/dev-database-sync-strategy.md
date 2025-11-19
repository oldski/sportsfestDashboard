# Dev Database Sync Strategy

## Overview

After production launch, you'll want to maintain separate databases:
- **Production**: Real customer data
- **Development**: Test data for development work

---

## Option 1: Fork Production Database (Recommended)

### Initial Setup

1. **Create Dev Project in Supabase**
   - Go to Supabase Dashboard
   - Create new project: `sportsfest-dev`
   - Note the connection details

2. **Copy Schema from Production**
   ```bash
   # Using Supabase CLI
   supabase db dump --linked > prod-schema.sql

   # Apply to dev database
   supabase db push --db-url <dev-database-url> --file prod-schema.sql
   ```

3. **Seed Dev Database with Test Data**
   - Create test organizations
   - Create test users
   - Generate sample players/orders

### Ongoing Sync

**When you make schema changes in dev:**

```bash
# 1. Generate migration from dev changes
supabase db diff --linked > migrations/new-feature.sql

# 2. Test migration in dev
supabase db push --linked

# 3. When ready, apply to production
supabase db push --db-url <prod-database-url> --file migrations/new-feature.sql
```

---

## Option 2: Drizzle Migrations (Current Setup)

Since you're using Drizzle ORM:

### Workflow

1. **Make Schema Changes in Drizzle**
   ```typescript
   // packages/database/src/schema.ts
   // Add/modify tables
   ```

2. **Generate Migration**
   ```bash
   cd packages/database
   pnpm run generate
   ```

3. **Test in Dev Environment**
   ```bash
   # Point to dev database
   DATABASE_URL=<dev-url> pnpm run migrate
   ```

4. **Apply to Production**
   ```bash
   # Point to prod database
   DATABASE_URL=<prod-url> pnpm run migrate
   ```

---

## Option 3: Supabase Branching (Easiest)

Supabase offers database branching on paid plans:

1. **Create Preview Branch**
   - Automatically creates isolated database
   - Full copy of production schema
   - Own connection string

2. **Make Changes**
   - Test in preview branch
   - Run migrations

3. **Merge to Production**
   - Apply changes to main database
   - Automatic migration

**Pros:**
- Easiest to manage
- Built-in to Supabase
- Automatic schema sync

**Cons:**
- Requires Supabase Pro plan ($25/mo)

---

## Environment Setup

### Local `.env` Files

**Production** (`packages/database/.env`):
```bash
DATABASE_URL=postgresql://postgres.plpmhzbnwlbrvuebmrvw:...@supabase.com:6543/postgres
```

**Development** (`packages/database/.env.dev`):
```bash
DATABASE_URL=postgresql://postgres.xxx:...@supabase.com:6543/postgres
```

### Package.json Scripts

```json
{
  "scripts": {
    "migrate:prod": "dotenv -e .env -- drizzle-kit migrate",
    "migrate:dev": "dotenv -e .env.dev -- drizzle-kit migrate",
    "generate": "drizzle-kit generate"
  }
}
```

---

## Recommended Workflow

### For Most Changes

1. Develop locally with dev database
2. Generate Drizzle migration
3. Test migration in dev
4. Review migration SQL
5. Apply to production during low-traffic window
6. Monitor for issues

### For Schema-Breaking Changes

1. Create backup of production
2. Test migration in dev extensively
3. Write rollback migration
4. Schedule maintenance window
5. Apply migration
6. Verify application works
7. Monitor error logs

---

## Syncing Test Data

### Create Seed Script for Dev

```typescript
// scripts/seed-dev-database.ts
import { db } from '@workspace/database/client';

async function seed() {
  // Create test organizations
  await db.insert(organization).values([
    { name: 'Test Org 1' },
    { name: 'Test Org 2' }
  ]);

  // Create test users
  // Create test players
  // etc.
}

seed();
```

Run after creating dev database:
```bash
DATABASE_URL=<dev-url> npx tsx scripts/seed-dev-database.ts
```

---

## Schema Sync Checklist

When making database changes:

- [ ] Update Drizzle schema
- [ ] Generate migration
- [ ] Test migration in dev
- [ ] Review generated SQL
- [ ] Update TypeScript types
- [ ] Test application in dev
- [ ] Create rollback plan
- [ ] Apply to production
- [ ] Verify production works
- [ ] Commit migration to git

---

## Tools

### Supabase CLI
```bash
# Link to project
supabase link --project-ref <ref>

# Dump schema
supabase db dump --linked

# Apply migration
supabase migration up
```

### Drizzle Kit
```bash
# Generate migration
drizzle-kit generate

# Push to database
drizzle-kit push

# Open studio
drizzle-kit studio
```

---

## Best Practices

1. **Never test in production** - Always use dev database first
2. **Version control migrations** - Commit all migrations to git
3. **Test rollbacks** - Ensure you can undo changes
4. **Document breaking changes** - Note what might break
5. **Backup before major changes** - Create Supabase backup
6. **Monitor after deployment** - Check error logs
7. **Use transactions** - Wrap changes in BEGIN/COMMIT

---

## Next Steps

1. Decide on sync strategy (Option 1, 2, or 3)
2. Set up dev database
3. Create seed script for test data
4. Document your chosen workflow
5. Test the workflow with a small change