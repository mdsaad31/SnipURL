// Migration: Add analytics columns to links table
// Run with: node scripts/migrate-analytics.mjs

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://saad:n8gRoYEcG7XZXYZwcSeXtw@snip-url-27051.j77.aws-ap-south-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full';

async function migrate() {
  // Use pg module
  let pg;
  try {
    pg = require('pg');
  } catch {
    console.log('pg not available, trying postgres...');
    const { default: postgres } = await import('postgres');
    const sql = postgres(DATABASE_URL);
    
    console.log('Checking for existing columns...');
    
    // Check if columns exist
    const cols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'links' 
      AND column_name IN ('analytics_public', 'analytics_shared_fields')
    `;
    
    const existingCols = cols.map(r => r.column_name);
    
    if (!existingCols.includes('analytics_public')) {
      console.log('Adding analytics_public column...');
      await sql`ALTER TABLE links ADD COLUMN IF NOT EXISTS analytics_public boolean DEFAULT false NOT NULL`;
      console.log('✓ analytics_public added');
    } else {
      console.log('✓ analytics_public already exists');
    }
    
    if (!existingCols.includes('analytics_shared_fields')) {
      console.log('Adding analytics_shared_fields column...');
      await sql`ALTER TABLE links ADD COLUMN IF NOT EXISTS analytics_shared_fields text`;
      console.log('✓ analytics_shared_fields added');
    } else {
      console.log('✓ analytics_shared_fields already exists');
    }
    
    console.log('\n✅ Migration complete!');
    await sql.end();
    return;
  }
  
  const { Client } = pg;
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  
  console.log('Checking for existing columns...');
  const res = await client.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'links' 
    AND column_name IN ('analytics_public', 'analytics_shared_fields')
  `);
  const existing = res.rows.map(r => r.column_name);
  
  if (!existing.includes('analytics_public')) {
    console.log('Adding analytics_public...');
    await client.query(`ALTER TABLE links ADD COLUMN IF NOT EXISTS analytics_public boolean DEFAULT false NOT NULL`);
    console.log('✓ analytics_public added');
  } else {
    console.log('✓ analytics_public already exists');
  }
  
  if (!existing.includes('analytics_shared_fields')) {
    console.log('Adding analytics_shared_fields...');
    await client.query(`ALTER TABLE links ADD COLUMN IF NOT EXISTS analytics_shared_fields text`);
    console.log('✓ analytics_shared_fields added');
  } else {
    console.log('✓ analytics_shared_fields already exists');
  }
  
  await client.end();
  console.log('\n✅ Migration complete!');
}

migrate().catch(console.error);
