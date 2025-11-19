const fs = require('fs');

// Read the warnings file
const warnings = JSON.parse(fs.readFileSync('./scripts/supabase-warnings.json', 'utf8'));

console.log(`Total warnings: ${warnings.length}\n`);

// Group by warning type
const byType = {};
warnings.forEach(w => {
  if (!byType[w.name]) {
    byType[w.name] = {
      count: 0,
      title: w.title,
      description: w.description,
      tables: new Set()
    };
  }
  byType[w.name].count++;
  if (w.metadata?.name) {
    byType[w.name].tables.add(w.metadata.name);
  }
});

console.log('=== Warnings by Type ===');
Object.entries(byType).forEach(([name, data]) => {
  console.log(`\n${data.title} (${name})`);
  console.log(`  Count: ${data.count}`);
  console.log(`  Affected tables: ${data.tables.size}`);
  console.log(`  Description: ${data.description.substring(0, 100)}...`);
});

// Group by table
const byTable = {};
warnings.forEach(w => {
  if (w.metadata?.name) {
    if (!byTable[w.metadata.name]) {
      byTable[w.metadata.name] = {
        count: 0,
        types: new Set()
      };
    }
    byTable[w.metadata.name].count++;
    byTable[w.metadata.name].types.add(w.name);
  }
});

console.log('\n\n=== Top 20 Tables by Warning Count ===');
Object.entries(byTable)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 20)
  .forEach(([table, data]) => {
    console.log(`${table}: ${data.count} warnings (types: ${[...data.types].join(', ')})`);
  });

// Specific details for auth_rls_initplan (most common)
const authRlsWarnings = warnings.filter(w => w.name === 'auth_rls_initplan');
const policiesByTable = {};
authRlsWarnings.forEach(w => {
  const table = w.metadata?.name;
  if (table) {
    if (!policiesByTable[table]) {
      policiesByTable[table] = [];
    }
    // Extract policy name from detail
    const policyMatch = w.detail.match(/has a row level security policy `([^`]+)`/);
    if (policyMatch) {
      policiesByTable[table].push(policyMatch[1]);
    }
  }
});

console.log('\n\n=== Auth RLS InitPlan Warnings by Table ===');
Object.entries(policiesByTable)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([table, policies]) => {
    console.log(`\n${table} (${policies.length} policies):`);
    policies.forEach(p => console.log(`  - ${p}`));
  });
