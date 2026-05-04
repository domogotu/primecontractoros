/**
 * Government Contracting Constants
 * Real data based on FAR, DFARS, SBA, and GSA guidelines
 */

// Contract Types per FAR Part 16
export const CONTRACT_TYPES = [
  {
    code: 'FFP',
    label: 'Firm Fixed Price (FFP)',
    description: 'Fixed price for a definite quantity of supplies or services',
    farReference: 'FAR 16.202-1',
    riskLevel: 'High for contractor',
    useCase: 'Well-defined requirements, stable market prices',
  },
  {
    code: 'CPFF',
    label: 'Cost Plus Fixed Fee (CPFF)',
    description: 'Contractor reimbursed for allowable costs plus fixed fee',
    farReference: 'FAR 16.306',
    riskLevel: 'Low for contractor',
    useCase: 'Uncertain requirements, R&D, complex services',
  },
  {
    code: 'CPIF',
    label: 'Cost Plus Incentive Fee (CPIF)',
    description: 'Contractor reimbursed for costs plus incentive fee based on performance',
    farReference: 'FAR 16.307',
    riskLevel: 'Medium',
    useCase: 'Performance-based contracts with cost targets',
  },
  {
    code: 'T&M',
    label: 'Time & Materials (T&M)',
    description: 'Contractor reimbursed for labor hours at fixed rates plus materials at cost',
    farReference: 'FAR 16.601',
    riskLevel: 'Medium',
    useCase: 'Maintenance, support services, emergency work',
  },
  {
    code: 'IDIQ',
    label: 'Indefinite Delivery/Indefinite Quantity (IDIQ)',
    description: 'Umbrella contract for indefinite quantities over a period of time',
    farReference: 'FAR 16.504',
    riskLevel: 'Variable',
    useCase: 'Recurring needs, multiple task orders, flexible requirements',
  },
  {
    code: 'BPA',
    label: 'Blanket Purchase Agreement (BPA)',
    description: 'Simplified purchasing arrangement for anticipated recurring needs',
    farReference: 'FAR 13.303',
    riskLevel: 'Low',
    useCase: 'Office supplies, routine services, small purchases',
  },
  {
    code: 'GSA',
    label: 'GSA Schedule Contract',
    description: 'Pre-negotiated contract under GSA Multiple Award Schedule',
    farReference: 'FAR 8.4',
    riskLevel: 'Low',
    useCase: 'Commercial products and services, government-wide availability',
  },
  {
    code: 'REQUIREMENTS',
    label: 'Requirements Contract',
    description: 'Contractor provides all requirements for a specific item/service',
    farReference: 'FAR 16.503',
    riskLevel: 'Medium',
    useCase: 'Sole source, exclusive supply arrangements',
  },
];

// Real NAICS Codes (Sample - Top Government Contracting Industries)
export const NAICS_CODES = [
  { code: '236220', label: 'Commercial and Institutional Building Construction', sbaSize: '$7.0M' },
  { code: '237310', label: 'Highway, Street, and Bridge Construction', sbaSize: '$7.0M' },
  { code: '238910', label: 'Site Preparation Contractors', sbaSize: '$7.0M' },
  { code: '334511', label: 'Search, Detection, Navigation, Guidance, Aeronautical Systems and Instruments Manufacturing', sbaSize: '$35.5M' },
  { code: '334512', label: 'Automatic Environmental Control Manufacturing', sbaSize: '$35.5M' },
  { code: '334613', label: 'Magnetic and Optical Recording Media Manufacturing', sbaSize: '$35.5M' },
  { code: '335911', label: 'Storage Battery Manufacturing', sbaSize: '$35.5M' },
  { code: '336411', label: 'Aircraft Engine and Engine Parts Manufacturing', sbaSize: '$35.5M' },
  { code: '336412', label: 'Aircraft Propeller and Parts Manufacturing', sbaSize: '$35.5M' },
  { code: '336413', label: 'Other Aircraft Parts and Auxiliary Equipment Manufacturing', sbaSize: '$35.5M' },
  { code: '336414', label: 'Guided Missile and Space Vehicle Manufacturing', sbaSize: '$35.5M' },
  { code: '336415', label: 'Guided Missile and Space Vehicle Propulsion Unit and Propulsion Unit Parts Manufacturing', sbaSize: '$35.5M' },
  { code: '336419', label: 'Other Guided Missile and Space Vehicle Parts and Auxiliary Equipment Manufacturing', sbaSize: '$35.5M' },
  { code: '541330', label: 'Engineering Services', sbaSize: '$7.0M' },
  { code: '541511', label: 'Custom Computer Programming Services', sbaSize: '$7.0M' },
  { code: '541512', label: 'Computer Systems Design Services', sbaSize: '$7.0M' },
  { code: '541513', label: 'Computer Facilities Management Services', sbaSize: '$7.0M' },
  { code: '541519', label: 'Other Computer Related Services', sbaSize: '$7.0M' },
  { code: '541611', label: 'Administrative Management and General Management Consulting Services', sbaSize: '$7.0M' },
  { code: '541690', label: 'Other Professional, Scientific, and Technical Consulting Services', sbaSize: '$7.0M' },
  { code: '561110', label: 'Office Administrative Services', sbaSize: '$7.0M' },
  { code: '561320', label: 'Temporary Help Services', sbaSize: '$7.0M' },
  { code: '561710', label: 'Janitorial Services', sbaSize: '$7.0M' },
  { code: '561990', label: 'All Other Support Services', sbaSize: '$7.0M' },
  { code: '621610', label: 'Home Health Care Services', sbaSize: '$7.0M' },
  { code: '811410', label: 'General Automotive Repair and Maintenance', sbaSize: '$7.0M' },
];

// Small Business Set-Asides per FAR Part 19
export const SET_ASIDE_TYPES = [
  {
    code: '8A',
    label: '8(a) Business Development Program',
    description: 'For socially and economically disadvantaged small businesses',
    farReference: 'FAR 19.800',
    requirements: 'SBA certification, disadvantaged ownership',
  },
  {
    code: 'HUBZONE',
    label: 'HUBZone Empowerment Contracting',
    description: 'For small businesses in historically underutilized business zones',
    farReference: 'FAR 19.1300',
    requirements: 'SBA HUBZone certification, 35% employees in HUBZone',
  },
  {
    code: 'SDVOSB',
    label: 'Service-Disabled Veteran-Owned Small Business (SDVOSB)',
    description: 'For service-disabled veterans with majority ownership',
    farReference: 'FAR 19.1400',
    requirements: 'VA verification, service-disabled veteran ownership',
  },
  {
    code: 'WOSB',
    label: 'Women-Owned Small Business (WOSB)',
    description: 'For small businesses with majority female ownership',
    farReference: 'FAR 19.1500',
    requirements: 'SBA certification, 51% female ownership',
  },
  {
    code: 'VOSB',
    label: 'Veteran-Owned Small Business (VOSB)',
    description: 'For small businesses with veteran ownership',
    farReference: 'FAR 19.1400',
    requirements: 'Veteran status verification, ownership control',
  },
  {
    code: 'SMALL_BUSINESS',
    label: 'Small Business Set-Aside',
    description: 'Reserved for small businesses per size standards',
    farReference: 'FAR 19.502',
    requirements: 'SBA size standard compliance',
  },
];

// Certifications
export const CERTIFICATIONS = [
  { code: 'SBA_8A', label: 'SBA 8(a) Business Development', issuer: 'SBA' },
  { code: 'SBA_HUBZONE', label: 'SBA HUBZone', issuer: 'SBA' },
  { code: 'SBA_WOSB', label: 'SBA Women-Owned Small Business', issuer: 'SBA' },
  { code: 'VA_SDVOSB', label: 'VA Service-Disabled Veteran-Owned', issuer: 'VA' },
  { code: 'VA_VOSB', label: 'VA Veteran-Owned Small Business', issuer: 'VA' },
  { code: 'ISO_9001', label: 'ISO 9001 Quality Management', issuer: 'Third Party' },
  { code: 'ISO_27001', label: 'ISO 27001 Information Security', issuer: 'Third Party' },
  { code: 'CMMC_L1', label: 'CMMC Level 1 (Cybersecurity)', issuer: 'DoD' },
  { code: 'CMMC_L2', label: 'CMMC Level 2 (Cybersecurity)', issuer: 'DoD' },
  { code: 'CMMC_L3', label: 'CMMC Level 3 (Cybersecurity)', issuer: 'DoD' },
  { code: 'ITAR', label: 'ITAR Compliance', issuer: 'State Department' },
  { code: 'EAR', label: 'EAR Compliance', issuer: 'Commerce Department' },
  { code: 'FAR_COMPLIANCE', label: 'FAR Compliance', issuer: 'Government' },
  { code: 'DFARS_COMPLIANCE', label: 'DFARS Compliance', issuer: 'DoD' },
  { code: 'NIST_SP_800_171', label: 'NIST SP 800-171 Compliance', issuer: 'NIST' },
  { code: 'HAZMAT', label: 'Hazardous Materials Certification', issuer: 'DOT' },
  { code: 'SECURITY_CLEARANCE', label: 'Security Clearance (varies)', issuer: 'Government' },
];

// Opportunity Sources
export const OPPORTUNITY_SOURCES = [
  { code: 'SAM_GOV', label: 'SAM.gov (Federal Procurement Data System)', url: 'https://sam.gov' },
  { code: 'GOVWIN', label: 'GovWin (IvyExec)', url: 'https://www.govwin.com' },
  { code: 'FPDS', label: 'Federal Procurement Data System (FPDS-NG)', url: 'https://www.fpds.gov' },
  { code: 'AGENCY_FORECAST', label: 'Agency Forecast/Advance Planning' },
  { code: 'GSA_SCHEDULE', label: 'GSA Schedule Ordering Activity' },
  { code: 'AGENCY_WEBSITE', label: 'Agency Website/RFQ' },
  { code: 'INDUSTRY_DAY', label: 'Industry Day/Conference' },
  { code: 'PRIME_CONTRACTOR', label: 'Prime Contractor Subcontracting Opportunity' },
  { code: 'SBDC', label: 'Small Business Development Center' },
  { code: 'REFERRAL', label: 'Referral/Networking' },
];

// Proposal Evaluation Criteria per FAR Part 15
export const EVALUATION_CRITERIA = [
  { code: 'TECHNICAL', label: 'Technical Merit', weight: 'Typically 40-50%', description: 'Approach, methodology, solution quality' },
  { code: 'PAST_PERFORMANCE', label: 'Past Performance', weight: 'Typically 20-30%', description: 'Similar work history, references, quality record' },
  { code: 'PRICE', label: 'Price/Cost', weight: 'Typically 20-30%', description: 'Reasonableness, value for money' },
  { code: 'SMALL_BUSINESS', label: 'Small Business Participation', weight: 'Variable', description: 'Subcontracting plan, SB utilization' },
  { code: 'MANAGEMENT', label: 'Management Approach', weight: 'Variable', description: 'Staffing, schedule, risk mitigation' },
  { code: 'EXPERIENCE', label: 'Relevant Experience', weight: 'Variable', description: 'Team qualifications, certifications' },
];

// Status Workflows - Opportunity
export const OPPORTUNITY_STATUSES = [
  { code: 'NEW', label: 'New', description: 'Newly identified opportunity', color: 'blue' },
  { code: 'IN_REVIEW', label: 'In Review', description: 'Under internal evaluation', color: 'yellow' },
  { code: 'PURSUE', label: 'Pursue', description: 'Decision to bid on this opportunity', color: 'green' },
  { code: 'HOLD', label: 'Hold', description: 'Defer decision pending more information', color: 'gray' },
  { code: 'NO_PURSUE', label: 'No Pursue', description: 'Decision not to bid', color: 'red' },
  { code: 'MOVED_TO_PROPOSAL', label: 'Moved to Proposal', description: 'Converted to proposal in development', color: 'purple' },
  { code: 'ARCHIVED', label: 'Archived', description: 'Opportunity closed or no longer relevant', color: 'slate' },
];

// Status Workflows - Proposal
export const PROPOSAL_STATUSES = [
  { code: 'DRAFT', label: 'Draft', description: 'Proposal in development', color: 'blue' },
  { code: 'IN_PROGRESS', label: 'In Progress', description: 'Proposal being written', color: 'yellow' },
  { code: 'SUBMITTED', label: 'Submitted', description: 'Proposal submitted to government', color: 'purple' },
  { code: 'WON', label: 'Won', description: 'Contract awarded', color: 'green' },
  { code: 'LOST', label: 'Lost', description: 'Proposal not selected', color: 'red' },
  { code: 'WITHDRAWN', label: 'Withdrawn', description: 'Proposal withdrawn by company', color: 'gray' },
];

// Status Workflows - Contract
export const CONTRACT_STATUSES = [
  { code: 'ACTIVE', label: 'Active', description: 'Contract in performance', color: 'green' },
  { code: 'ON_HOLD', label: 'On Hold', description: 'Performance suspended', color: 'yellow' },
  { code: 'COMPLETED', label: 'Completed', description: 'All deliverables completed', color: 'blue' },
  { code: 'CLOSEOUT', label: 'Closeout', description: 'Final administrative closeout in progress', color: 'purple' },
  { code: 'CLOSED', label: 'Closed', description: 'Contract fully closed per FAR 4.804', color: 'gray' },
  { code: 'TERMINATED', label: 'Terminated', description: 'Contract terminated for cause or convenience', color: 'red' },
];

// Contract Health Status
export const CONTRACT_HEALTH_STATUSES = [
  { code: 'HEALTHY', label: 'Healthy', description: 'On schedule, on budget, no issues', color: 'green' },
  { code: 'AT_RISK', label: 'At Risk', description: 'Minor issues, potential concerns', color: 'yellow' },
  { code: 'WARNING', label: 'Warning', description: 'Significant issues requiring attention', color: 'orange' },
  { code: 'CRITICAL', label: 'Critical', description: 'Severe issues threatening contract success', color: 'red' },
];

// Invoice/Payment Terms per FAR Part 32
export const PAYMENT_TERMS = [
  { code: 'NET_30', label: 'Net 30', description: 'Payment due 30 days after invoice receipt', farReference: 'FAR 32.908' },
  { code: 'NET_60', label: 'Net 60', description: 'Payment due 60 days after invoice receipt' },
  { code: 'NET_90', label: 'Net 90', description: 'Payment due 90 days after invoice receipt' },
  { code: 'PROMPT_PAYMENT', label: 'Prompt Payment Act', description: 'Interest accrues if payment delayed beyond agreed term', farReference: 'FAR 32.905' },
  { code: 'MILESTONE', label: 'Milestone-Based', description: 'Payment upon completion of specific milestones' },
  { code: 'MONTHLY', label: 'Monthly', description: 'Payment on monthly basis for services' },
  { code: 'UPON_DELIVERY', label: 'Upon Delivery', description: 'Payment upon delivery of goods/services' },
];

// Period of Performance Structure
export const PERIOD_OF_PERFORMANCE = {
  baseYear: 'Base Year (typically 1 year)',
  optionYears: 'Option Year(s) (1-5 years, at government\'s option)',
  totalPeriod: 'Total Period of Performance',
  farReference: 'FAR 17.2',
};

// Closeout Procedures per FAR Part 4.804
export const CLOSEOUT_PROCEDURES = [
  { step: 1, title: 'Final Invoice Submission', description: 'Contractor submits final invoice with all deliverables', farReference: 'FAR 4.804-1' },
  { step: 2, title: 'Deliverables Verification', description: 'Government verifies all deliverables received and acceptable', farReference: 'FAR 4.804-2' },
  { step: 3, title: 'Financial Reconciliation', description: 'Final accounting and payment reconciliation', farReference: 'FAR 4.804-3' },
  { step: 4, title: 'Records Disposition', description: 'Contractor disposes of government property and records per contract', farReference: 'FAR 4.804-4' },
  { step: 5, title: 'Final Release', description: 'Government issues final release and contract closure', farReference: 'FAR 4.804-5' },
];

// Contract Modification Types
export const MODIFICATION_TYPES = [
  { code: 'BILATERAL', label: 'Bilateral Modification', description: 'Signed by both parties, changes terms/conditions' },
  { code: 'UNILATERAL', label: 'Unilateral Modification', description: 'Issued by government only, within contract authority' },
  { code: 'ADMINISTRATIVE', label: 'Administrative Modification', description: 'Corrects administrative errors, no substantive changes' },
  { code: 'OPTION_EXERCISE', label: 'Option Exercise', description: 'Government exercises pre-negotiated option' },
  { code: 'CHANGE_ORDER', label: 'Change Order', description: 'Bilateral change to scope of work' },
];

// Deliverable Types and CDRL References
export const DELIVERABLE_TYPES = [
  { code: 'REPORT', label: 'Report', cdrReference: 'CDRL A001' },
  { code: 'SOFTWARE', label: 'Software/Code', cdrReference: 'CDRL A002' },
  { code: 'DOCUMENTATION', label: 'Documentation', cdrReference: 'CDRL A003' },
  { code: 'TRAINING', label: 'Training Materials', cdrReference: 'CDRL A004' },
  { code: 'DATA', label: 'Data/Database', cdrReference: 'CDRL A005' },
  { code: 'HARDWARE', label: 'Hardware/Equipment', cdrReference: 'CDRL A006' },
  { code: 'SERVICES', label: 'Services/Labor', cdrReference: 'CDRL A007' },
  { code: 'TESTING', label: 'Test Results/Reports', cdrReference: 'CDRL A008' },
];

// FAR/DFARS Key References
export const FAR_DFARS_REFERENCES = {
  PART_15: { title: 'Contracting by Negotiation', url: 'https://www.acquisition.gov/far/part-15' },
  PART_16: { title: 'Types of Contracts', url: 'https://www.acquisition.gov/far/part-16' },
  PART_19: { title: 'Small Business Programs', url: 'https://www.acquisition.gov/far/part-19' },
  PART_32: { title: 'Contract Financing', url: 'https://www.acquisition.gov/far/part-32' },
  PART_4: { title: 'Administrative Matters', url: 'https://www.acquisition.gov/far/part-4' },
  DFARS_PART_200: { title: 'General', url: 'https://www.acquisition.gov/dfars/part-200-general' },
  DFARS_PART_252: { title: 'Clauses', url: 'https://www.acquisition.gov/dfars/part-252-solicitation-provisions-and-contract-clauses' },
};

// SAM.gov Registration Requirements
export const SAM_REQUIREMENTS = {
  uei: 'Unique Entity Identifier (UEI) - replaces DUNS',
  cage: 'Commercial and Government Entity (CAGE) Code',
  businessType: 'Business structure (Sole Proprietorship, Partnership, Corporation, etc.)',
  businessSize: 'SBA size standard classification',
  setAsides: 'Applicable small business set-asides',
  certifications: 'Relevant certifications and competencies',
  pointOfContact: 'Authorized representative contact information',
  banking: 'Banking information for electronic payment',
  farCompliance: 'FAR compliance certifications',
  dfarsCompliance: 'DFARS compliance certifications (if applicable)',
};

// UEI and CAGE Code Guidance
export const REGISTRATION_CODES = {
  uei: {
    description: 'Unique Entity Identifier',
    replaces: 'DUNS Number',
    issuer: 'SAM.gov',
    required: 'Yes - for all federal contractors',
    website: 'https://sam.gov',
  },
  cage: {
    description: 'Commercial and Government Entity Code',
    format: '5-character alphanumeric',
    issuer: 'Defense Logistics Agency (DLA)',
    required: 'Yes - for defense contractors',
    website: 'https://cage.dla.mil',
  },
};
