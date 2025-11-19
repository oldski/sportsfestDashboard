const fs = require('fs');
const path = require('path');

/**
 * Generate RLS fix migration from exported policies
 */

// Read the exported policies
const policiesFile = path.join(__dirname, 'supabase-policies-full.json');
const policies = JSON.parse(fs.readFileSync(policiesFile, 'utf8'));

console.log(`\n🔍 Analyzing ${policies.length} policies...\n`);

/**
 * Check if auth function calls need wrapping
 */
function needsWrapping(text) {
  if (!text) return false;

  // Look for unwrapped auth.uid() - but not if already in SELECT
  // Match: auth.uid() but not ( SELECT auth.uid()
  const unwrappedAuthPattern = /(?<!\(\s*SELECT\s+)auth\.(uid|jwt|role|email)\(\)/gi;

  return unwrappedAuthPattern.test(text);
}

/**
 * Wrap auth function calls with SELECT
 */
function wrapAuthCalls(text) {
  if (!text) return text;

  // Replace auth.uid() with (SELECT auth.uid()) if not already wrapped
  // This regex looks for auth.uid() that's NOT already preceded by "( SELECT"
  return text.replace(/(?<!\(\s*SELECT\s+)(auth\.(uid|jwt|role|email)\(\))/gi, '(SELECT $1)');
}

/**
 * Map command codes to SQL
 */
function cmdToSql(cmd) {
  const map = {
    'SELECT': 'SELECT',
    'INSERT': 'INSERT',
    'UPDATE': 'UPDATE',
    'DELETE': 'DELETE',
    'ALL': 'ALL'
  };
  return map[cmd] || cmd;
}

// Analyze policies
const policiesToFix = [];
const alreadyOptimized = [];

policies.forEach(policy => {
  const { tablename, policyname, cmd, qual, with_check } = policy;

  const qualNeedsWrap = needsWrapping(qual);
  const withCheckNeedsWrap = needsWrapping(with_check);

  if (qualNeedsWrap || withCheckNeedsWrap) {
    policiesToFix.push({
      ...policy,
      fixedQual: wrapAuthCalls(qual),
      fixedWithCheck: wrapAuthCalls(with_check)
    });
  } else if (qual && qual.includes('auth.')) {
    alreadyOptimized.push(policy);
  }
});

console.log(`✅ Already optimized: ${alreadyOptimized.length} policies`);
console.log(`⚠️  Need fixing: ${policiesToFix.length} policies`);
console.log('');

if (policiesToFix.length === 0) {
  console.log('🎉 All policies are already optimized!');
  process.exit(0);
}

// Generate migration statements
const migrationStatements = [];

policiesToFix.forEach(policy => {
  const { tablename, policyname, cmd, fixedQual, fixedWithCheck } = policy;

  migrationStatements.push(`-- Fix: ${tablename}.${policyname}`);
  migrationStatements.push(`DROP POLICY IF EXISTS "${policyname}" ON "${tablename}";`);

  let createPolicy = `CREATE POLICY "${policyname}" ON "${tablename}"\nFOR ${cmdToSql(cmd)}`;

  if (fixedQual) {
    createPolicy += `\nUSING (${fixedQual})`;
  }

  if (fixedWithCheck && fixedWithCheck !== fixedQual) {
    createPolicy += `\nWITH CHECK (${fixedWithCheck})`;
  }

  createPolicy += ';';

  migrationStatements.push(createPolicy);
  migrationStatements.push('');
});

// Build full migration
const migration = `-- Migration: Fix Auth RLS InitPlan Warnings
-- Generated: ${new Date().toISOString()}
-- Description: Wraps auth.* function calls in (SELECT ...) to prevent per-row re-evaluation
-- Based on: Exported database policies
--
-- This migration will:
-- 1. Drop existing policies that need optimization
-- 2. Recreate them with optimized auth function calls
--
-- Backup your database before running this migration!
-- You can run this directly in Supabase SQL Editor.

BEGIN;

${migrationStatements.join('\n')}

COMMIT;

-- Migration complete!
-- Fixed ${policiesToFix.length} policies
--
-- Next steps:
-- 1. Review the migration file
-- 2. Run in Supabase SQL Editor
-- 3. Check that warnings decreased in Dashboard Advisors
`;

// Write migration file
const outputFile = path.join(__dirname, 'migrations', `fix-rls-from-export-${Date.now()}.sql`);
fs.writeFileSync(outputFile, migration);

console.log(`📄 Migration generated: ${outputFile}`);
console.log('');

// Show summary by table
const byTable = {};
policiesToFix.forEach(p => {
  if (!byTable[p.tablename]) {
    byTable[p.tablename] = [];
  }
  byTable[p.tablename].push(p.policyname);
});

console.log('📊 Policies to fix by table:');
Object.entries(byTable)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 20)
  .forEach(([table, policyNames]) => {
    console.log(`  ${table}: ${policyNames.length} policies`);
  });

console.log('');
console.log('✨ Done! Ready to apply migration.');
console.log('');
console.log('Next steps:');
console.log('  1. Review the migration file');
console.log('  2. Copy the SQL');
console.log('  3. Paste into Supabase SQL Editor');
console.log('  4. Run the migration');
console.log('  5. Check Dashboard Advisors for reduced warnings');
console.log('');