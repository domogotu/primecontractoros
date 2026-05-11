/**
 * Demo Workspace Seed Script
 * Creates a clearly-marked demo workspace with sample government contracting data.
 * Run: node seed-demo.mjs
 * 
 * All demo data is prefixed with [DEMO] to distinguish from real customer data.
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set. Cannot seed demo data.');
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

async function createDemoWorkspace() {
  console.log('🏢 Creating demo workspace...');
  
  // Check if demo workspace already exists
  const existing = await db.execute(sql`SELECT id FROM workspaces WHERE name = '[DEMO] Apex Federal Solutions'`);
  if (existing[0]?.length > 0 || (Array.isArray(existing) && existing[0]?.[0]?.id)) {
    console.log('  ⚠️  Demo workspace already exists. Skipping creation.');
    const rows = existing[0];
    return Array.isArray(rows) ? rows[0].id : rows.id;
  }

  const result = await db.execute(sql`
    INSERT INTO workspaces (name, companyName, industry, size, onboardingCompleted, createdAt, updatedAt)
    VALUES ('[DEMO] Apex Federal Solutions', '[DEMO] Apex Federal Solutions LLC', 'Government Contracting', '11-50', true, NOW(), NOW())
  `);
  
  const wsId = result[0]?.insertId || result[0]?.[0]?.insertId;
  console.log(`  ✓ Created demo workspace (ID: ${wsId})`);
  return wsId;
}

async function seedOpportunities(wsId) {
  console.log('🎯 Seeding demo opportunities...');
  
  await db.execute(sql`
    INSERT INTO opportunities (workspaceId, title, agency, status, value, dueDate, setAside, naicsCode, description, source, createdAt, updatedAt) VALUES
    (${wsId}, '[DEMO] USAF Cloud Migration Services', 'U.S. Air Force', 'pursue', '4500000.00', DATE_ADD(NOW(), INTERVAL 45 DAY), '8(a)', '541512', 'Cloud infrastructure migration for USAF legacy systems to AWS GovCloud. Includes assessment, planning, migration execution, and post-migration support.', 'SAM.gov', NOW(), NOW()),
    (${wsId}, '[DEMO] VA Health Records Modernization', 'Department of Veterans Affairs', 'in_review', '8200000.00', DATE_ADD(NOW(), INTERVAL 60 DAY), 'SDVOSB', '541511', 'Electronic health records system modernization for VA medical centers. Transition from VistA to new interoperable platform.', 'SAM.gov', NOW(), NOW()),
    (${wsId}, '[DEMO] DHS Cybersecurity Assessment', 'Department of Homeland Security', 'new', '1200000.00', DATE_ADD(NOW(), INTERVAL 30 DAY), 'Small Business', '541519', 'Comprehensive cybersecurity assessment and penetration testing for DHS critical infrastructure systems.', 'GovWin', NOW(), NOW()),
    (${wsId}, '[DEMO] Army Training Simulation Platform', 'U.S. Army', 'pursue', '12000000.00', DATE_ADD(NOW(), INTERVAL 90 DAY), NULL, '541715', 'Next-generation training simulation platform using VR/AR technology for infantry combat scenarios.', 'SAM.gov', NOW(), NOW()),
    (${wsId}, '[DEMO] GSA IT Professional Services BPA', 'General Services Administration', 'converted', '25000000.00', DATE_SUB(NOW(), INTERVAL 30 DAY), 'Small Business', '541512', 'Blanket Purchase Agreement for IT professional services across multiple federal agencies.', 'GSA eBuy', NOW(), NOW()),
    (${wsId}, '[DEMO] NASA Data Analytics Support', 'NASA', 'no_pursue', '3100000.00', DATE_SUB(NOW(), INTERVAL 15 DAY), NULL, '541511', 'Data analytics and machine learning support for Earth observation satellite data processing.', 'SAM.gov', NOW(), NOW())
  `);
  
  console.log('  ✓ Created 6 demo opportunities');
}

async function seedProposals(wsId) {
  console.log('📝 Seeding demo proposals...');
  
  await db.execute(sql`
    INSERT INTO proposals (workspaceId, title, status, dueDate, value, opportunityId, description, createdAt, updatedAt) VALUES
    (${wsId}, '[DEMO] USAF Cloud Migration - Technical Volume', 'in_progress', DATE_ADD(NOW(), INTERVAL 30 DAY), '4500000.00', NULL, 'Technical approach for migrating 47 legacy applications to AWS GovCloud with zero-downtime strategy.', NOW(), NOW()),
    (${wsId}, '[DEMO] GSA IT BPA Response', 'submitted', DATE_SUB(NOW(), INTERVAL 5 DAY), '25000000.00', NULL, 'Response to GSA IT Professional Services BPA solicitation. Includes past performance, technical capability, and pricing volumes.', NOW(), NOW()),
    (${wsId}, '[DEMO] Army VR Training Platform Proposal', 'draft', DATE_ADD(NOW(), INTERVAL 75 DAY), '12000000.00', NULL, 'Draft proposal for next-gen VR training simulation. Includes Unity-based engine, haptic feedback integration, and AI-driven scenarios.', NOW(), NOW()),
    (${wsId}, '[DEMO] DHS Cyber Assessment Proposal', 'review', DATE_ADD(NOW(), INTERVAL 20 DAY), '1200000.00', NULL, 'Proposal for comprehensive penetration testing and vulnerability assessment of DHS systems.', NOW(), NOW()),
    (${wsId}, '[DEMO] DOE Solar Grid Integration', 'won', DATE_SUB(NOW(), INTERVAL 60 DAY), '6800000.00', NULL, 'Won proposal for Department of Energy solar grid integration project across 12 federal facilities.', NOW(), NOW())
  `);
  
  console.log('  ✓ Created 5 demo proposals');
}

async function seedContracts(wsId) {
  console.log('📄 Seeding demo contracts...');
  
  await db.execute(sql`
    INSERT INTO contracts (workspaceId, title, contractNumber, status, value, startDate, endDate, contractType, agency, description, createdAt, updatedAt) VALUES
    (${wsId}, '[DEMO] DOE Solar Grid Integration', 'DE-CR-0045821', 'active', '6800000.00', DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_ADD(NOW(), INTERVAL 320 DAY), 'FFP', 'Department of Energy', 'Solar grid integration across 12 federal facilities including design, installation, testing, and commissioning.', NOW(), NOW()),
    (${wsId}, '[DEMO] DISA Network Modernization', 'HC1028-22-C-0034', 'active', '3200000.00', DATE_SUB(NOW(), INTERVAL 180 DAY), DATE_ADD(NOW(), INTERVAL 185 DAY), 'T&M', 'Defense Information Systems Agency', 'Network infrastructure modernization for DISA regional data centers.', NOW(), NOW()),
    (${wsId}, '[DEMO] EPA Environmental Monitoring', 'EP-W-21-006', 'modification', '2100000.00', DATE_SUB(NOW(), INTERVAL 365 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 'CPFF', 'Environmental Protection Agency', 'Environmental monitoring system deployment and maintenance for EPA Superfund sites.', NOW(), NOW()),
    (${wsId}, '[DEMO] Census Data Processing', 'YA1323-20-CN-0089', 'closeout', '1500000.00', DATE_SUB(NOW(), INTERVAL 730 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY), 'FFP', 'U.S. Census Bureau', 'Data processing and quality assurance for Census 2020 supplemental surveys.', NOW(), NOW())
  `);
  
  console.log('  ✓ Created 4 demo contracts');
}

async function seedInvoices(wsId) {
  console.log('💰 Seeding demo invoices...');
  
  await db.execute(sql`
    INSERT INTO invoices (workspaceId, contractId, invoiceNumber, amount, status, dueDate, description, createdAt, updatedAt) VALUES
    (${wsId}, NULL, '[DEMO] INV-2026-001', '425000.00', 'paid', DATE_SUB(NOW(), INTERVAL 30 DAY), 'DOE Solar Grid - Phase 1 Milestone: Site Assessment Complete', NOW(), NOW()),
    (${wsId}, NULL, '[DEMO] INV-2026-002', '680000.00', 'submitted', DATE_ADD(NOW(), INTERVAL 15 DAY), 'DOE Solar Grid - Phase 2 Milestone: Design Deliverables', NOW(), NOW()),
    (${wsId}, NULL, '[DEMO] INV-2026-003', '160000.00', 'paid', DATE_SUB(NOW(), INTERVAL 15 DAY), 'DISA Network - Monthly T&M February 2026', NOW(), NOW()),
    (${wsId}, NULL, '[DEMO] INV-2026-004', '160000.00', 'approved', DATE_ADD(NOW(), INTERVAL 5 DAY), 'DISA Network - Monthly T&M March 2026', NOW(), NOW()),
    (${wsId}, NULL, '[DEMO] INV-2026-005', '87500.00', 'overdue', DATE_SUB(NOW(), INTERVAL 10 DAY), 'EPA Monitoring - Q1 2026 CPFF Billing', NOW(), NOW()),
    (${wsId}, NULL, '[DEMO] INV-2026-006', '150000.00', 'draft', DATE_ADD(NOW(), INTERVAL 30 DAY), 'Census Data - Final Deliverable & Closeout', NOW(), NOW())
  `);
  
  console.log('  ✓ Created 6 demo invoices');
}

async function seedTasks(wsId) {
  console.log('✅ Seeding demo tasks...');
  
  await db.execute(sql`
    INSERT INTO tasks (workspaceId, title, status, priority, dueDate, description, assignee, createdAt, updatedAt) VALUES
    (${wsId}, '[DEMO] Submit USAF Cloud Migration proposal', 'in_progress', 'high', DATE_ADD(NOW(), INTERVAL 25 DAY), 'Complete technical volume and submit via SAM.gov', 'Sarah Chen', NOW(), NOW()),
    (${wsId}, '[DEMO] Review DHS cyber assessment SOW', 'open', 'high', DATE_ADD(NOW(), INTERVAL 5 DAY), 'Review statement of work for accuracy and completeness before proposal submission', 'Mike Johnson', NOW(), NOW()),
    (${wsId}, '[DEMO] DOE Solar - Phase 2 kickoff meeting', 'open', 'medium', DATE_ADD(NOW(), INTERVAL 3 DAY), 'Schedule and prepare for Phase 2 design kickoff with DOE COR', 'Sarah Chen', NOW(), NOW()),
    (${wsId}, '[DEMO] DISA - Monthly status report', 'completed', 'medium', DATE_SUB(NOW(), INTERVAL 2 DAY), 'Submit March 2026 monthly status report to DISA PM', 'James Wilson', NOW(), NOW()),
    (${wsId}, '[DEMO] EPA contract modification review', 'in_progress', 'high', DATE_ADD(NOW(), INTERVAL 7 DAY), 'Review proposed modification for scope extension and prepare response', 'Mike Johnson', NOW(), NOW()),
    (${wsId}, '[DEMO] Census closeout documentation', 'open', 'low', DATE_ADD(NOW(), INTERVAL 30 DAY), 'Compile all deliverables and prepare DD Form 1594 for contract closeout', 'Lisa Park', NOW(), NOW()),
    (${wsId}, '[DEMO] Update capability statement', 'open', 'medium', DATE_ADD(NOW(), INTERVAL 14 DAY), 'Update capability statement with DOE Solar project and recent certifications', 'Sarah Chen', NOW(), NOW()),
    (${wsId}, '[DEMO] Quarterly compliance review', 'open', 'high', DATE_ADD(NOW(), INTERVAL 10 DAY), 'Conduct quarterly compliance review across all active contracts', 'James Wilson', NOW(), NOW())
  `);
  
  console.log('  ✓ Created 8 demo tasks');
}

async function seedContacts(wsId) {
  console.log('👥 Seeding demo contacts...');
  
  await db.execute(sql`
    INSERT INTO contacts (workspaceId, name, email, phone, company, role, type, createdAt, updatedAt) VALUES
    (${wsId}, '[DEMO] Col. Robert Martinez', 'robert.martinez@us.af.mil', '(703) 555-0142', 'U.S. Air Force', 'Contracting Officer', 'government', NOW(), NOW()),
    (${wsId}, '[DEMO] Dr. Patricia Williams', 'patricia.williams@va.gov', '(202) 555-0198', 'Department of Veterans Affairs', 'Program Manager', 'government', NOW(), NOW()),
    (${wsId}, '[DEMO] Thomas Chen', 'thomas.chen@dhs.gov', '(202) 555-0167', 'Department of Homeland Security', 'COTR', 'government', NOW(), NOW()),
    (${wsId}, '[DEMO] Jennifer Adams', 'jadams@techpartners.com', '(571) 555-0134', 'TechPartners Inc.', 'VP of Business Development', 'subcontractor', NOW(), NOW()),
    (${wsId}, '[DEMO] David Kim', 'dkim@cyberdefense.io', '(703) 555-0189', 'CyberDefense Solutions', 'CEO', 'subcontractor', NOW(), NOW()),
    (${wsId}, '[DEMO] Maria Rodriguez', 'mrodriguez@doe.gov', '(202) 555-0156', 'Department of Energy', 'COR', 'government', NOW(), NOW()),
    (${wsId}, '[DEMO] Kevin O''Brien', 'kobrien@gsaebuy.gov', '(816) 555-0123', 'General Services Administration', 'Contract Specialist', 'government', NOW(), NOW())
  `);
  
  console.log('  ✓ Created 7 demo contacts');
}

async function seedDeliverables(wsId) {
  console.log('📦 Seeding demo deliverables...');
  
  await db.execute(sql`
    INSERT INTO deliverables (workspaceId, contractId, title, description, dueDate, status, createdAt, updatedAt) VALUES
    (${wsId}, 1, '[DEMO] Site Assessment Report', 'Complete site assessment for all 12 federal facilities', DATE_SUB(NOW(), INTERVAL 30 DAY), 'accepted', NOW(), NOW()),
    (${wsId}, 1, '[DEMO] System Design Document', 'Detailed design for solar grid integration system', DATE_ADD(NOW(), INTERVAL 15 DAY), 'in_progress', NOW(), NOW()),
    (${wsId}, 1, '[DEMO] Installation Plan', 'Phased installation plan with safety protocols', DATE_ADD(NOW(), INTERVAL 45 DAY), 'not_started', NOW(), NOW()),
    (${wsId}, 2, '[DEMO] Monthly Status Report - March', 'DISA Network monthly progress report', DATE_SUB(NOW(), INTERVAL 2 DAY), 'submitted', NOW(), NOW()),
    (${wsId}, 2, '[DEMO] Network Architecture Diagram v2', 'Updated network architecture after Phase 2 changes', DATE_ADD(NOW(), INTERVAL 20 DAY), 'in_progress', NOW(), NOW()),
    (${wsId}, 3, '[DEMO] Q1 Monitoring Data Package', 'EPA environmental monitoring data for Q1 2026', DATE_ADD(NOW(), INTERVAL 5 DAY), 'in_progress', NOW(), NOW())
  `);
  
  console.log('  ✓ Created 6 demo deliverables');
}

async function seedLessonsLearned(wsId) {
  console.log('📚 Seeding demo lessons learned...');
  
  await db.execute(sql`
    INSERT INTO lessonsLearned (workspaceId, title, category, description, impact, severity, rootCause, recommendation, tags, createdAt, updatedAt) VALUES
    (${wsId}, '[DEMO] Understaffed during peak migration period', 'management', 'During the DISA network migration, we were understaffed by 3 engineers during the critical cutover weekend, leading to a 48-hour delay.', 'negative', 'high', 'Staffing plan did not account for concurrent leave requests and one unexpected resignation.', 'Build 20% buffer into staffing plans for critical phases. Establish backup personnel agreements with subcontractors before project start.', 'staffing, DISA, network, planning', NOW(), NOW()),
    (${wsId}, '[DEMO] Early stakeholder engagement improved requirements', 'technical', 'Conducting stakeholder interviews 6 weeks before proposal submission resulted in significantly better requirements understanding and a stronger technical approach.', 'positive', 'low', 'Previous proposals relied solely on SOW language without direct stakeholder input.', 'Always schedule stakeholder engagement sessions during capture phase. Budget 2-3 weeks for requirements validation.', 'requirements, stakeholder, capture', NOW(), NOW()),
    (${wsId}, '[DEMO] Compliance documentation gap in subcontractor flow', 'compliance', 'Subcontractor CyberDefense Solutions did not maintain required NIST 800-171 documentation, creating a compliance gap discovered during DCMA audit.', 'negative', 'critical', 'Subcontractor compliance requirements were not explicitly stated in teaming agreement. No periodic compliance verification was conducted.', 'Include explicit compliance requirements in all teaming agreements. Conduct quarterly compliance verification for all subcontractors.', 'compliance, subcontractor, NIST, audit', NOW(), NOW()),
    (${wsId}, '[DEMO] Agile methodology improved delivery speed', 'schedule', 'Adopting 2-week sprints for the EPA monitoring system reduced delivery time by 30% compared to waterfall approach used in previous similar contracts.', 'positive', 'medium', 'Traditional waterfall approach caused long feedback loops and late-stage requirement changes.', 'Default to agile methodology for software-intensive contracts. Ensure government COR is trained on agile ceremonies.', 'agile, schedule, methodology, EPA', NOW(), NOW())
  `);
  
  console.log('  ✓ Created 4 demo lessons learned');
}

async function seedAlerts(wsId) {
  console.log('🔔 Seeding demo alerts...');
  
  await db.execute(sql`
    INSERT INTO alerts (workspaceId, title, message, severity, type, isRead, createdAt, updatedAt) VALUES
    (${wsId}, '[DEMO] Invoice overdue: EPA Monitoring Q1', 'Invoice INV-2026-005 for $87,500 is 10 days past due. Follow up with EPA accounts payable.', 'high', 'financial', false, NOW(), NOW()),
    (${wsId}, '[DEMO] Proposal deadline approaching: USAF Cloud', 'USAF Cloud Migration proposal is due in 25 days. Technical volume is 60% complete.', 'medium', 'deadline', false, NOW(), NOW()),
    (${wsId}, '[DEMO] Contract modification pending: EPA', 'EPA contract EP-W-21-006 has a pending modification requiring review within 7 days.', 'high', 'compliance', false, NOW(), NOW()),
    (${wsId}, '[DEMO] Deliverable accepted: DOE Site Assessment', 'DOE Solar Grid site assessment report has been accepted by the COR.', 'low', 'milestone', true, NOW(), NOW()),
    (${wsId}, '[DEMO] New opportunity matched: Navy IT Services', 'A new opportunity matching your NAICS codes was posted on SAM.gov: Navy IT Infrastructure Services ($5.2M).', 'medium', 'opportunity', false, NOW(), NOW())
  `);
  
  console.log('  ✓ Created 5 demo alerts');
}

async function main() {
  console.log('🌱 PrimeContractorOS Demo Workspace Seeder');
  console.log('==========================================\n');
  console.log('⚠️  All demo data is prefixed with [DEMO] for clear identification.\n');
  
  try {
    const wsId = await createDemoWorkspace();
    
    if (!wsId) {
      console.error('❌ Failed to create or find demo workspace.');
      process.exit(1);
    }
    
    await seedOpportunities(wsId);
    await seedProposals(wsId);
    await seedContracts(wsId);
    await seedInvoices(wsId);
    await seedTasks(wsId);
    await seedContacts(wsId);
    await seedDeliverables(wsId);
    await seedLessonsLearned(wsId);
    await seedAlerts(wsId);
    
    console.log('\n✅ Demo workspace seeded successfully!');
    console.log(`   Workspace ID: ${wsId}`);
    console.log('   Company: [DEMO] Apex Federal Solutions LLC');
    console.log('   Data includes: 6 opportunities, 5 proposals, 4 contracts,');
    console.log('   6 invoices, 8 tasks, 7 contacts, 6 deliverables,');
    console.log('   4 lessons learned, 5 alerts');
    console.log('\n   All records are prefixed with [DEMO] for easy identification.');
  } catch (error) {
    console.error('\n❌ Demo seed failed:', error.message);
    console.error(error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();
