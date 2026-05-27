import React, { useState, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
  Users,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Info,
  DollarSign,
  FileText,
  Star,
} from 'lucide-react';
import PageGuide from "@/components/PageGuide";

// ─── Types ────────────────────────────────────────────────────────────────────
type SamStatus = 'active' | 'expired' | 'pending' | 'not_registered';
type ContractingModel = 'prime' | 'sub' | 'both';

interface FormData {
  legalName: string;
  dba: string;
  businessStructure: string;
  stateOfIncorporation: string;
  businessSize: string;
  yearFounded: string;
  numberOfEmployees: string;
  annualRevenue: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  uei: string;
  cage: string;
  entityType: string;
  samStatus: SamStatus;
  samExpirationDate: string;
  samRegistrationDate: string;
  gsaScheduleNumber: string;
  gsaScheduleExpiration: string;
  naicsPrimary: string;
  naicsSecondary: string;
  naicsCodes: string;
  socioeconomicCerts: string;
  certifications: string;
  keyPersonnel: string;
  capabilities: string;
  coreCompetencies: string;
  pastPerformance: string;
  bankingInfo: string;
  bondingCapacity: string;
  insuranceSummary: string;
  contractingModel: ContractingModel;
  usesSubcontractors: boolean;
  defaultContactName: string;
  defaultContactEmail: string;
  defaultContactPhone: string;
}

// ─── Field definitions for completeness tracking ──────────────────────────────
interface FieldDef {
  key: keyof FormData;
  label: string;
  why: string;
  priority: number; // 1 = critical, 2 = important, 3 = nice-to-have
  sectionId: string;
}

const FIELD_DEFS: FieldDef[] = [
  // Company Identity
  { key: 'legalName', label: 'Legal Company Name', why: 'Required on all federal forms, proposals, and contracts.', priority: 1, sectionId: 'identity' },
  { key: 'businessStructure', label: 'Business Structure', why: 'Determines legal and tax treatment for federal contracts.', priority: 1, sectionId: 'identity' },
  { key: 'businessSize', label: 'Business Size', why: 'Required for small business set-aside eligibility.', priority: 1, sectionId: 'identity' },
  { key: 'yearFounded', label: 'Year Founded', why: 'Used in capability statements and past performance.', priority: 2, sectionId: 'identity' },
  { key: 'numberOfEmployees', label: 'Number of Employees', why: 'Required for NAICS size standard verification.', priority: 2, sectionId: 'identity' },
  { key: 'annualRevenue', label: 'Annual Revenue', why: 'Required for NAICS size standard verification.', priority: 2, sectionId: 'identity' },
  // Contact
  { key: 'email', label: 'Business Email', why: 'Used for all government correspondence and notifications.', priority: 1, sectionId: 'contact' },
  { key: 'phone', label: 'Business Phone', why: 'Required on most federal forms and solicitations.', priority: 1, sectionId: 'contact' },
  { key: 'address', label: 'Street Address', why: 'Required for SAM.gov registration and contract awards.', priority: 1, sectionId: 'contact' },
  { key: 'city', label: 'City', why: 'Part of your registered business address.', priority: 1, sectionId: 'contact' },
  { key: 'state', label: 'State', why: 'Part of your registered business address.', priority: 1, sectionId: 'contact' },
  { key: 'zip', label: 'ZIP Code', why: 'Part of your registered business address.', priority: 1, sectionId: 'contact' },
  { key: 'website', label: 'Website URL', why: 'Included in capability statements and proposals.', priority: 3, sectionId: 'contact' },
  // Government Registrations
  { key: 'uei', label: 'UEI (Unique Entity Identifier)', why: 'Required for all SAM.gov registrations and federal proposals. Replaces DUNS number.', priority: 1, sectionId: 'registrations' },
  { key: 'cage', label: 'CAGE Code', why: 'Required for DoD contracts and many federal solicitations.', priority: 1, sectionId: 'registrations' },
  { key: 'samStatus', label: 'SAM.gov Registration Status', why: 'Active SAM registration is required to receive federal contract awards.', priority: 1, sectionId: 'registrations' },
  { key: 'samRegistrationDate', label: 'SAM Registration Date', why: 'Documents when your SAM registration was established.', priority: 2, sectionId: 'registrations' },
  { key: 'samExpirationDate', label: 'SAM Expiration Date', why: 'Track renewal deadlines — expired SAM = ineligible for awards.', priority: 1, sectionId: 'registrations' },
  // NAICS
  { key: 'naicsPrimary', label: 'Primary NAICS Code', why: 'Determines your industry classification and size standard for federal contracts.', priority: 1, sectionId: 'naics' },
  { key: 'naicsSecondary', label: 'Secondary NAICS Codes', why: 'Additional codes expand the types of contracts you can pursue.', priority: 2, sectionId: 'naics' },
  // Certifications
  { key: 'socioeconomicCerts', label: 'Socioeconomic Certifications', why: 'SBA certifications (8(a), WOSB, SDVOSB, HUBZone) unlock set-aside opportunities.', priority: 2, sectionId: 'certifications' },
  { key: 'certifications', label: 'Other Certifications', why: 'ISO, CMMI, and other certifications strengthen proposals and past performance.', priority: 3, sectionId: 'certifications' },
  // Capabilities
  { key: 'capabilities', label: 'Capabilities Statement', why: 'Core marketing document for federal contracting — required for most teaming and BD meetings.', priority: 1, sectionId: 'capabilities' },
  { key: 'coreCompetencies', label: 'Core Competencies', why: 'Used in proposals and capability statements to differentiate your firm.', priority: 2, sectionId: 'capabilities' },
  { key: 'keyPersonnel', label: 'Key Personnel', why: 'Required in proposals — agencies evaluate your team\'s qualifications.', priority: 2, sectionId: 'capabilities' },
  { key: 'pastPerformance', label: 'Past Performance References', why: 'One of the most heavily weighted evaluation factors in federal proposals.', priority: 1, sectionId: 'capabilities' },
  // Financial
  { key: 'bankingInfo', label: 'Banking Information', why: 'Required for ACH/EFT payment setup for contract payments.', priority: 2, sectionId: 'financial' },
  { key: 'bondingCapacity', label: 'Bonding Capacity', why: 'Required for construction contracts and some service contracts.', priority: 3, sectionId: 'financial' },
  { key: 'insuranceSummary', label: 'Insurance Summary', why: 'Most federal contracts require proof of general liability and workers comp insurance.', priority: 2, sectionId: 'financial' },
  // Contact
  { key: 'defaultContactName', label: 'Default Contact Name', why: 'Used as the primary point of contact on proposals and contracts.', priority: 2, sectionId: 'contact' },
  { key: 'defaultContactEmail', label: 'Default Contact Email', why: 'Used for all contracting officer communications.', priority: 2, sectionId: 'contact' },
];

const SECTIONS = [
  { id: 'identity', label: 'Company Identity', icon: Building2, color: 'text-blue-600' },
  { id: 'contact', label: 'Contact Info', icon: Users, color: 'text-purple-600' },
  { id: 'registrations', label: 'SAM Registration', icon: Shield, color: 'text-green-600' },
  { id: 'naics', label: 'NAICS Codes', icon: FileText, color: 'text-orange-600' },
  { id: 'certifications', label: 'Certifications', icon: Star, color: 'text-yellow-600' },
  { id: 'capabilities', label: 'Capabilities', icon: CheckCircle2, color: 'text-teal-600' },
  { id: 'financial', label: 'Banking / Finance', icon: DollarSign, color: 'text-red-600' },
];

function isFilled(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') return value.trim().length > 0;
  return false;
}

function calcSectionScore(fields: FieldDef[], formData: FormData): number {
  if (fields.length === 0) return 100;
  const filled = fields.filter(f => isFilled(formData[f.key])).length;
  return Math.round((filled / fields.length) * 100);
}

function calcOverallScore(formData: FormData): number {
  // Weight by priority
  const criticalFields = FIELD_DEFS.filter(f => f.priority === 1);
  const importantFields = FIELD_DEFS.filter(f => f.priority === 2);
  const niceFields = FIELD_DEFS.filter(f => f.priority === 3);

  const critFilled = criticalFields.filter(f => isFilled(formData[f.key])).length;
  const impFilled = importantFields.filter(f => isFilled(formData[f.key])).length;
  const niceFilled = niceFields.filter(f => isFilled(formData[f.key])).length;

  const total = criticalFields.length * 3 + importantFields.length * 2 + niceFields.length * 1;
  const filled = critFilled * 3 + impFilled * 2 + niceFilled * 1;
  return total > 0 ? Math.round((filled / total) * 100) : 0;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BusinessProfile() {
  const [, navigate] = useLocation();
  const { data: profile, isLoading } = trpc.businessProfile.get.useQuery();
  const upsertMutation = trpc.businessProfile.upsert.useMutation();
  const utils = trpc.useUtils();
  const [isSaving, setIsSaving] = useState(false);
  const [showCompleteness, setShowCompleteness] = useState(true);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const [formData, setFormData] = useState<FormData>({
    legalName: '',
    dba: '',
    businessStructure: '',
    stateOfIncorporation: '',
    businessSize: '',
    yearFounded: '',
    numberOfEmployees: '',
    annualRevenue: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    uei: '',
    cage: '',
    entityType: '',
    samStatus: 'not_registered',
    samExpirationDate: '',
    samRegistrationDate: '',
    gsaScheduleNumber: '',
    gsaScheduleExpiration: '',
    naicsPrimary: '',
    naicsSecondary: '',
    naicsCodes: '',
    socioeconomicCerts: '',
    certifications: '',
    keyPersonnel: '',
    capabilities: '',
    coreCompetencies: '',
    pastPerformance: '',
    bankingInfo: '',
    bondingCapacity: '',
    insuranceSummary: '',
    contractingModel: 'prime',
    usesSubcontractors: false,
    defaultContactName: '',
    defaultContactEmail: '',
    defaultContactPhone: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        legalName: profile.legalName || '',
        dba: profile.dba || '',
        businessStructure: profile.businessStructure || '',
        stateOfIncorporation: profile.stateOfIncorporation || '',
        businessSize: profile.businessSize || '',
        yearFounded: profile.yearFounded || '',
        numberOfEmployees: profile.numberOfEmployees || '',
        annualRevenue: profile.annualRevenue || '',
        email: profile.email || '',
        phone: profile.phone || '',
        website: profile.website || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zip: profile.zip || '',
        country: profile.country || 'United States',
        uei: profile.uei || '',
        cage: profile.cage || '',
        entityType: profile.entityType || '',
        samStatus: (profile.samStatus as SamStatus) || 'not_registered',
        samExpirationDate: profile.samExpirationDate ? new Date(profile.samExpirationDate).toISOString().split('T')[0] : '',
        samRegistrationDate: profile.samRegistrationDate ? new Date(profile.samRegistrationDate).toISOString().split('T')[0] : '',
        gsaScheduleNumber: profile.gsaScheduleNumber || '',
        gsaScheduleExpiration: profile.gsaScheduleExpiration ? new Date(profile.gsaScheduleExpiration).toISOString().split('T')[0] : '',
        naicsPrimary: profile.naicsPrimary || '',
        naicsSecondary: profile.naicsSecondary || '',
        naicsCodes: profile.naicsCodes || '',
        socioeconomicCerts: profile.socioeconomicCerts || '',
        certifications: profile.certifications || '',
        keyPersonnel: profile.keyPersonnel || '',
        capabilities: profile.capabilities || '',
        coreCompetencies: profile.coreCompetencies || '',
        pastPerformance: profile.pastPerformance || '',
        bankingInfo: profile.bankingInfo || '',
        bondingCapacity: profile.bondingCapacity || '',
        insuranceSummary: profile.insuranceSummary || '',
        contractingModel: (profile.contractingModel as ContractingModel) || 'prime',
        usesSubcontractors: profile.usesSubcontractors || false,
        defaultContactName: profile.defaultContactName || '',
        defaultContactEmail: profile.defaultContactEmail || '',
        defaultContactPhone: profile.defaultContactPhone || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await upsertMutation.mutateAsync(formData as any);
      await utils.businessProfile.get.invalidate();
      toast.success('Business profile saved successfully');
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const el = sectionRefs.current[sectionId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToField = (fieldKey: string, sectionId: string) => {
    // First scroll to section
    scrollToSection(sectionId);
    // Then focus the input
    setTimeout(() => {
      const el = document.getElementById(fieldKey);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 400);
  };

  const overallScore = calcOverallScore(formData);
  const criticalMissing = FIELD_DEFS.filter(f => f.priority === 1 && !isFilled(formData[f.key]));

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  return (
    <PageLayout
      title="Business Profile"
      subtitle="Complete your company information for government contracting"
      label="SETUP"
      actions={
        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Profile'}
        </Button>
      }
      summaryCards={[
        { label: 'Completeness', value: `${overallScore}%`, color: overallScore >= 80 ? 'text-green-600' : overallScore >= 50 ? 'text-amber-600' : 'text-red-600' },
        { label: 'SAM Status', value: profile?.samStatus === 'active' ? 'SAM Active' : profile?.samStatus === 'expired' ? 'SAM Expired' : 'SAM Inactive', color: profile?.samStatus === 'active' ? 'text-green-600' : 'text-amber-600' },
        { label: 'Critical Missing', value: String(criticalMissing.length), color: criticalMissing.length === 0 ? 'text-green-600' : 'text-red-600' },
      ]}
    >
      <PageGuide
        title="Business Profile"
        description="Your profile auto-populates across proposals, contracts, and compliance forms. Complete it once and it flows everywhere."
        whenToUse="Fill this out before creating proposals or contracts."
        whatToDoNext={[
          'Start with your UEI and CAGE code from SAM.gov',
          'Add your primary NAICS code',
          'Fill in your legal name and business address',
          'Add capabilities and past performance',
          'Click Save Profile when done',
        ]}
        alerts={criticalMissing.length > 0 ? [{ message: `${criticalMissing.length} critical field(s) missing. Complete them to unlock full functionality.`, type: 'warning' }] : []}
      />

      {/* ── PROFILE COMPLETENESS PANEL ─────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-2">
        <button
          onClick={() => setShowCompleteness(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className={`h-5 w-5 ${overallScore >= 80 ? 'text-green-500' : overallScore >= 50 ? 'text-amber-500' : 'text-red-500'}`} />
            <div className="text-left">
              <h2 className="text-base font-semibold text-gray-900">Profile Completeness — {overallScore}%</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {criticalMissing.length === 0
                  ? 'All critical fields are filled. Great job!'
                  : `${criticalMissing.length} critical field${criticalMissing.length !== 1 ? 's' : ''} still needed`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Progress bar */}
            <div className="hidden sm:block w-48 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${overallScore >= 80 ? 'bg-green-500' : overallScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${overallScore}%` }}
              />
            </div>
            {showCompleteness ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          </div>
        </button>

        {showCompleteness && (
          <div className="border-t border-gray-100 p-6">
            {/* Section-by-section breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {SECTIONS.map(section => {
                const sectionFields = FIELD_DEFS.filter(f => f.sectionId === section.id);
                const score = calcSectionScore(sectionFields, formData);
                const missing = sectionFields.filter(f => !isFilled(formData[f.key]));
                const Icon = section.icon;
                return (
                  <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${section.color}`} />
                        <span className="text-sm font-medium text-gray-700">{section.label}</span>
                      </div>
                      <span className={`text-sm font-bold ${score === 100 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                        {score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                      <div
                        className={`h-1.5 rounded-full ${score === 100 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    {missing.length > 0 ? (
                      <div className="space-y-1">
                        {missing.slice(0, 3).map(f => (
                          <button
                            key={f.key}
                            onClick={() => scrollToField(f.key, f.sectionId)}
                            className="w-full flex items-center gap-2 text-xs text-left text-gray-600 hover:text-blue-600 group"
                            title={f.why}
                          >
                            <AlertCircle className="h-3 w-3 text-amber-400 flex-shrink-0" />
                            <span className="group-hover:underline truncate">{f.label}</span>
                            <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 flex-shrink-0" />
                          </button>
                        ))}
                        {missing.length > 3 && (
                          <p className="text-xs text-gray-400 pl-5">+{missing.length - 3} more</p>
                        )}
                        <button
                          onClick={() => scrollToSection(section.id)}
                          className="mt-2 w-full text-xs text-blue-600 hover:text-blue-700 font-medium text-left flex items-center gap-1"
                        >
                          Complete Now <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> All fields complete
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Priority field list */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">All Fields — Priority Order</h3>
              <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                {FIELD_DEFS.sort((a, b) => a.priority - b.priority).map(field => {
                  const filled = isFilled(formData[field.key]);
                  return (
                    <div
                      key={field.key}
                      className={`flex items-start gap-3 p-2 rounded-lg ${filled ? 'bg-green-50' : 'bg-red-50 hover:bg-red-100 cursor-pointer'} transition-colors`}
                      onClick={() => !filled && scrollToField(field.key, field.sectionId)}
                    >
                      {filled ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${filled ? 'text-green-700' : 'text-red-700'}`}>
                            {field.label}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            field.priority === 1 ? 'bg-red-100 text-red-700' :
                            field.priority === 2 ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {field.priority === 1 ? 'Critical' : field.priority === 2 ? 'Important' : 'Optional'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-start gap-1">
                          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {field.why}
                        </p>
                      </div>
                      {!filled && (
                        <ArrowRight className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FORM SECTIONS ─────────────────────────────────────────────────────── */}
      <div className="space-y-6">

        {/* Company Identity */}
        <section
          id="section-identity"
          ref={el => { sectionRefs.current['identity'] = el; }}
          className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-4"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Company Identity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="legalName">Legal Company Name <span className="text-red-500">*</span></Label>
              <Input id="legalName" name="legalName" value={formData.legalName} onChange={handleInputChange} placeholder="Your company's legal name" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="dba">DBA (Doing Business As)</Label>
              <Input id="dba" name="dba" value={formData.dba} onChange={handleInputChange} placeholder="If different from legal name" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="businessStructure">Business Structure</Label>
              <select id="businessStructure" name="businessStructure" value={formData.businessStructure} onChange={handleInputChange} className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select...</option>
                <option value="LLC">LLC</option>
                <option value="S-Corp">S-Corp</option>
                <option value="C-Corp">C-Corp</option>
                <option value="Sole Proprietor">Sole Proprietor</option>
                <option value="Partnership">Partnership</option>
                <option value="Nonprofit">Nonprofit</option>
              </select>
            </div>
            <div>
              <Label htmlFor="stateOfIncorporation">State of Incorporation</Label>
              <Input id="stateOfIncorporation" name="stateOfIncorporation" value={formData.stateOfIncorporation} onChange={handleInputChange} placeholder="e.g., Delaware" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="businessSize">Business Size <span className="text-red-500">*</span></Label>
              <select id="businessSize" name="businessSize" value={formData.businessSize} onChange={handleInputChange} className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select...</option>
                <option value="small">Small Business</option>
                <option value="large">Large Business</option>
                <option value="other_than_small">Other Than Small</option>
              </select>
            </div>
            <div>
              <Label htmlFor="entityType">Entity Type</Label>
              <Input id="entityType" name="entityType" value={formData.entityType} onChange={handleInputChange} placeholder="e.g., For-Profit, Nonprofit" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="yearFounded">Year Founded</Label>
              <Input id="yearFounded" name="yearFounded" value={formData.yearFounded} onChange={handleInputChange} placeholder="YYYY" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="numberOfEmployees">Number of Employees</Label>
              <Input id="numberOfEmployees" name="numberOfEmployees" value={formData.numberOfEmployees} onChange={handleInputChange} placeholder="e.g., 25" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="annualRevenue">Annual Revenue</Label>
              <Input id="annualRevenue" name="annualRevenue" value={formData.annualRevenue} onChange={handleInputChange} placeholder="e.g., $5M - $10M" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="contractingModel">Contracting Model</Label>
              <select id="contractingModel" name="contractingModel" value={formData.contractingModel} onChange={handleInputChange} className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="prime">Prime Contractor</option>
                <option value="sub">Subcontractor</option>
                <option value="both">Both Prime & Sub</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input id="usesSubcontractors" name="usesSubcontractors" type="checkbox" checked={formData.usesSubcontractors} onChange={e => setFormData(prev => ({ ...prev, usesSubcontractors: e.target.checked }))} className="w-4 h-4" />
              <Label htmlFor="usesSubcontractors" className="cursor-pointer">Uses Subcontractors</Label>
            </div>
          </div>
        </section>

        {/* Contact & Address */}
        <section
          id="section-contact"
          ref={el => { sectionRefs.current['contact'] = el; }}
          className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-4"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Contact & Address
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Business Email <span className="text-red-500">*</span></Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="company@example.com" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="phone">Business Phone <span className="text-red-500">*</span></Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 000-0000" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://example.com" className="mt-2" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Street Address <span className="text-red-500">*</span></Label>
              <Input id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Main Street" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
              <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
              <Input id="state" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="zip">ZIP Code <span className="text-red-500">*</span></Label>
              <Input id="zip" name="zip" value={formData.zip} onChange={handleInputChange} placeholder="12345" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" value={formData.country} onChange={handleInputChange} placeholder="United States" className="mt-2" />
            </div>
            <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
              <p className="text-sm font-medium text-gray-600 mb-3">Default Point of Contact</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="defaultContactName">Contact Name</Label>
                  <Input id="defaultContactName" name="defaultContactName" value={formData.defaultContactName} onChange={handleInputChange} placeholder="Full Name" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="defaultContactEmail">Contact Email</Label>
                  <Input id="defaultContactEmail" name="defaultContactEmail" type="email" value={formData.defaultContactEmail} onChange={handleInputChange} placeholder="contact@example.com" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="defaultContactPhone">Contact Phone</Label>
                  <Input id="defaultContactPhone" name="defaultContactPhone" value={formData.defaultContactPhone} onChange={handleInputChange} placeholder="+1 (555) 000-0000" className="mt-2" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Government Registrations */}
        <section
          id="section-registrations"
          ref={el => { sectionRefs.current['registrations'] = el; }}
          className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-4"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Government Registrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="uei">UEI (Unique Entity Identifier) <span className="text-red-500">*</span></Label>
              <Input id="uei" name="uei" value={formData.uei} onChange={handleInputChange} placeholder="From SAM.gov (12 characters)" className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">Replaces the DUNS number. Required for all federal contracts.</p>
            </div>
            <div>
              <Label htmlFor="cage">CAGE Code <span className="text-red-500">*</span></Label>
              <Input id="cage" name="cage" value={formData.cage} onChange={handleInputChange} placeholder="5-character code" className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">Required for DoD contracts and many federal solicitations.</p>
            </div>
            <div>
              <Label htmlFor="samStatus">SAM.gov Registration Status <span className="text-red-500">*</span></Label>
              <select id="samStatus" name="samStatus" value={formData.samStatus} onChange={handleInputChange} className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="not_registered">Not Registered</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <Label htmlFor="samRegistrationDate">SAM Registration Date</Label>
              <Input id="samRegistrationDate" name="samRegistrationDate" type="date" value={formData.samRegistrationDate} onChange={handleInputChange} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="samExpirationDate">SAM Expiration Date <span className="text-red-500">*</span></Label>
              <Input id="samExpirationDate" name="samExpirationDate" type="date" value={formData.samExpirationDate} onChange={handleInputChange} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">Renew before expiration — expired SAM = ineligible for awards.</p>
            </div>
            <div>
              <Label htmlFor="gsaScheduleNumber">GSA Schedule Number</Label>
              <Input id="gsaScheduleNumber" name="gsaScheduleNumber" value={formData.gsaScheduleNumber} onChange={handleInputChange} placeholder="e.g., GS-35F-XXXXX" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="gsaScheduleExpiration">GSA Schedule Expiration</Label>
              <Input id="gsaScheduleExpiration" name="gsaScheduleExpiration" type="date" value={formData.gsaScheduleExpiration} onChange={handleInputChange} className="mt-2" />
            </div>
          </div>
        </section>

        {/* NAICS Codes */}
        <section
          id="section-naics"
          ref={el => { sectionRefs.current['naics'] = el; }}
          className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-4"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600" />
            NAICS Codes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="naicsPrimary">Primary NAICS Code <span className="text-red-500">*</span></Label>
              <Input id="naicsPrimary" name="naicsPrimary" value={formData.naicsPrimary} onChange={handleInputChange} placeholder="e.g., 541511" className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">Your main industry classification code.</p>
            </div>
            <div>
              <Label htmlFor="naicsSecondary">Secondary NAICS Codes (JSON array)</Label>
              <Input id="naicsSecondary" name="naicsSecondary" value={formData.naicsSecondary} onChange={handleInputChange} placeholder='[{"code":"541512","description":"Computer Systems Design"}]' className="mt-2 font-mono text-xs" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="naicsCodes">All NAICS Codes (simple list)</Label>
              <Input id="naicsCodes" name="naicsCodes" value={formData.naicsCodes} onChange={handleInputChange} placeholder="541511, 541512, 541519" className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">Comma-separated list of all your NAICS codes.</p>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section
          id="section-certifications"
          ref={el => { sectionRefs.current['certifications'] = el; }}
          className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-4"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            Certifications
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="socioeconomicCerts">Socioeconomic Certifications (JSON)</Label>
              <Textarea id="socioeconomicCerts" name="socioeconomicCerts" value={formData.socioeconomicCerts} onChange={handleInputChange} placeholder='[{"name":"8(a)","certNumber":"SBA-8A-XXXXX","expirationDate":"2026-01-01","issuingAgency":"SBA"}]' rows={3} className="mt-2 font-mono text-xs" />
              <p className="text-xs text-gray-500 mt-1">8(a), WOSB, SDVOSB, HUBZone, etc. Unlock set-aside opportunities.</p>
            </div>
            <div>
              <Label htmlFor="certifications">Other Certifications</Label>
              <Textarea id="certifications" name="certifications" value={formData.certifications} onChange={handleInputChange} placeholder="ISO 9001:2015, CMMI Level 3, etc." rows={2} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">Quality, security, and industry certifications.</p>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section
          id="section-capabilities"
          ref={el => { sectionRefs.current['capabilities'] = el; }}
          className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-4"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-teal-600" />
            Capabilities & Past Performance
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="capabilities">Capabilities Statement <span className="text-red-500">*</span></Label>
              <Textarea id="capabilities" name="capabilities" value={formData.capabilities} onChange={handleInputChange} placeholder="Describe your company's core capabilities for government contracting..." rows={4} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">Core marketing document — used in proposals and BD meetings.</p>
            </div>
            <div>
              <Label htmlFor="coreCompetencies">Core Competencies</Label>
              <Textarea id="coreCompetencies" name="coreCompetencies" value={formData.coreCompetencies} onChange={handleInputChange} placeholder="List your key technical and management competencies..." rows={3} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="keyPersonnel">Key Personnel (JSON)</Label>
              <Textarea id="keyPersonnel" name="keyPersonnel" value={formData.keyPersonnel} onChange={handleInputChange} placeholder='[{"name":"Jane Doe","title":"Program Manager","clearanceLevel":"Secret","email":"jane@example.com","phone":"555-0100"}]' rows={3} className="mt-2 font-mono text-xs" />
              <p className="text-xs text-gray-500 mt-1">Required in proposals — agencies evaluate your team's qualifications.</p>
            </div>
            <div>
              <Label htmlFor="pastPerformance">Past Performance References (JSON) <span className="text-red-500">*</span></Label>
              <Textarea id="pastPerformance" name="pastPerformance" value={formData.pastPerformance} onChange={handleInputChange} placeholder='[{"contractNumber":"N00000-00-C-0000","agency":"DoD","description":"IT Services","value":"$5M","periodOfPerformance":"2022-2024","contactName":"John Smith","contactPhone":"555-0200"}]' rows={4} className="mt-2 font-mono text-xs" />
              <p className="text-xs text-gray-500 mt-1">One of the most heavily weighted evaluation factors in federal proposals.</p>
            </div>
          </div>
        </section>

        {/* Financial Information */}
        <section
          id="section-financial"
          ref={el => { sectionRefs.current['financial'] = el; }}
          className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-4"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-red-600" />
            Banking & Financial Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bondingCapacity">Bonding Capacity</Label>
              <Input id="bondingCapacity" name="bondingCapacity" value={formData.bondingCapacity} onChange={handleInputChange} placeholder="e.g., $5M single / $10M aggregate" className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">Required for construction and some service contracts.</p>
            </div>
            <div>
              <Label htmlFor="bankingInfo">Banking Information (JSON)</Label>
              <Input id="bankingInfo" name="bankingInfo" value={formData.bankingInfo} onChange={handleInputChange} placeholder='{"bankName":"First National","accountName":"Reed Solutions LLC","routingNumber":"XXXXXXXXX"}' className="mt-2 font-mono text-xs" />
              <p className="text-xs text-gray-500 mt-1">Required for ACH/EFT payment setup.</p>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="insuranceSummary">Insurance Summary (JSON)</Label>
              <Textarea id="insuranceSummary" name="insuranceSummary" value={formData.insuranceSummary} onChange={handleInputChange} placeholder='{"generalLiability":"$1M per occurrence","professionalLiability":"$1M","workersComp":"Statutory","cyber":"$1M"}' rows={2} className="mt-2 font-mono text-xs" />
              <p className="text-xs text-gray-500 mt-1">Most federal contracts require proof of general liability and workers comp.</p>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pb-8">
          <Button variant="outline" onClick={() => navigate('/app/dashboard')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
