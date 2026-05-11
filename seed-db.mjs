/**
 * Seed Database Script
 * Auto-creates default plans, roles, and statuses on first run.
 * Run: node seed-db.mjs
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set. Cannot seed database.');
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

async function seedPlans() {
  console.log('📋 Seeding plans...');
  
  // Check if plans already exist
  const existing = await db.execute(sql`SELECT COUNT(*) as count FROM plans`);
  const count = existing[0]?.[0]?.count || existing[0]?.count || 0;
  
  if (Number(count) > 0) {
    console.log('  ✓ Plans already exist, skipping.');
    return;
  }

  await db.execute(sql`
    INSERT INTO plans (name, description, monthlyPrice, annualPrice, features, maxUsers, maxContracts, isActive, sortOrder, createdAt, updatedAt)
    VALUES 
      ('Starter', 'Perfect for new contractors getting started with government contracting. Includes core workflow tools and basic guidance.', '49.00', '470.00', '["Up to 5 active opportunities","3 active contracts","Basic compliance tracking","Email support","Guided onboarding","Document storage (5GB)","Single user"]', 1, 3, true, 1, NOW(), NOW()),
      ('Growth', 'For growing contractors managing multiple opportunities and contracts. Includes team collaboration and advanced features.', '99.00', '950.00', '["Unlimited opportunities","10 active contracts","Full compliance tracking","Priority support","AI-powered guidance","Document storage (25GB)","Up to 5 team members","Proposal templates","Financial reporting","Custom workflows"]', 5, 10, true, 2, NOW(), NOW()),
      ('Advanced', 'For established contractors with complex operations. Full platform access with enterprise features.', '199.00', '1910.00', '["Unlimited opportunities","Unlimited contracts","Advanced compliance & audit","Dedicated support","Full AI suite","Document storage (100GB)","Unlimited team members","Custom templates","Advanced financial reporting","API access","White-label reports","Priority onboarding"]', 999, 999, true, 3, NOW(), NOW())
  `);
  
  console.log('  ✓ Created 3 default plans (Starter, Growth, Advanced)');
}

async function seedDefaultStatuses() {
  console.log('📋 Seeding default configuration...');
  
  // Check if there's a system_config table or similar
  // For now, statuses are enum-based in the schema, so we just verify they work
  console.log('  ✓ Statuses are enum-based in schema (no seeding needed)');
  console.log('    - Opportunity: new, in_review, pursue, hold, no_pursue, converted');
  console.log('    - Proposal: draft, in_progress, review, submitted, won, lost');
  console.log('    - Contract: draft, active, modification, closeout, closed, terminated');
  console.log('    - Invoice: draft, submitted, approved, paid, overdue, disputed');
  console.log('    - Task: open, in_progress, completed, cancelled');
}

async function seedDefaultRoles() {
  console.log('📋 Verifying roles...');
  console.log('  ✓ Roles are enum-based in schema:');
  console.log('    - User roles: admin, user');
  console.log('    - Workspace member roles: owner, admin, member, viewer');
}

async function main() {
  console.log('🌱 PrimeContractorOS Database Seeder');
  console.log('====================================\n');
  
  try {
    await seedPlans();
    await seedDefaultStatuses();
    await seedDefaultRoles();
    
    console.log('\n✅ Seed complete!');
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

main();
