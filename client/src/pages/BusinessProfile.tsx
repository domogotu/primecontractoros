import { useState, useEffect, useRef } from 'react';
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
  Pencil,
  X,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  Award,
  Briefcase,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import PageGuide from "@/components/PageGuide";
import PageGuidancePanel from "@/components/PageGuidancePanel";
import GuidanceQuestionPanel from "@/components/GuidanceQuestionPanel";
import TrainingWalkthrough from "@/components/TrainingWalkthrough";
import AutosaveIndicator from "@/components/AutosaveIndicator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

// ─── Types ────────────────────────────────────────────────────────────────────
type SamStatus = 'active' | 'expired' | 'pending' | 'not_registered';
type ContractingModel = 'prime' | 'sub' | 'both';

interface KeyPerson {
  name: string;
  title: string;
  role: string;
  email: string;
  phone: string;
  clearanceLevel: string;
}

interface SocioCert {
  name: string;
  certNumber: string;
  expirationDate: string;
  issuingAgency: string;
}

interface PastPerf {
  contractNumber: string;
  agency: string;
  description: string;
  contractValue: string;
  periodOfPerformance: string;
  pocName: string;
  pocPhone: string;
}

interface BankingInfo {
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: 'Checking' | 'Savings' | '';
}

interface InsuranceSummary {
  generalLiability: string;
  workersComp: string;
  professionalLiability: string;
  cyberLiability: string;
}

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
  priority: number;
  sectionId: string;
}

const FIELD_DEFS: FieldDef[] = [
  { key: 'legalName', label: 'Legal Company Name', why: 'Required on all federal forms, proposals, and contracts.', priority: 1, sectionId: 'identity' },
  { key: 'businessStructure', label: 'Business Structure', why: 'Determines legal and tax treatment for federal contracts.', priority: 1, sectionId: 'identity' },
  { key: 'businessSize', label: 'Business Size', why: 'Required for small business set-aside eligibility.', priority: 1, sectionId: 'identity' },
  { key: 'yearFounded', label: 'Year Founded', why: 'Used in capability statements and past performance.', priority: 2, sectionId: 'identity' },
  { key: 'numberOfEmployees', label: 'Number of Employees', why: 'Required for NAICS size standard verification.', priority: 2, sectionId: 'identity' },
  { key: 'annualRevenue', label: 'Annual Revenue', why: 'Required for NAICS size standard verification.', priority: 2, sectionId: 'identity' },
  { key: 'email', label: 'Business Email', why: 'Used for all government correspondence and notifications.', priority: 1, sectionId: 'contact' },
  { key: 'phone', label: 'Business Phone', why: 'Required on most federal forms and solicitations.', priority: 1, sectionId: 'contact' },
  { key: 'address', label: 'Street Address', why: 'Required for SAM.gov registration and contract awards.', priority: 1, sectionId: 'contact' },
  { key: 'city', label: 'City', why: 'Part of your registered business address.', priority: 1, sectionId: 'contact' },
  { key: 'state', label: 'State', why: 'Part of your registered business address.', priority: 1, sectionId: 'contact' },
  { key: 'zip', label: 'ZIP Code', why: 'Part of your registered business address.', priority: 1, sectionId: 'contact' },
  { key: 'website', label: 'Website URL', why: 'Included in capability statements and proposals.', priority: 3, sectionId: 'contact' },
  { key: 'uei', label: 'UEI (Unique Entity Identifier)', why: 'Required for all SAM.gov registrations and federal proposals. Replaces DUNS number.', priority: 1, sectionId: 'registrations' },
  { key: 'cage', label: 'CAGE Code', why: 'Required for DoD contracts and many federal solicitations.', priority: 1, sectionId: 'registrations' },
  { key: 'samStatus', label: 'SAM.gov Registration Status', why: 'Active SAM registration is required to receive federal contract awards.', priority: 1, sectionId: 'registrations' },
  { key: 'samRegistrationDate', label: 'SAM Registration Date', why: 'Documents when your SAM registration was established.', priority: 2, sectionId: 'registrations' },
  { key: 'samExpirationDate', label: 'SAM Expiration Date', why: 'Track renewal deadlines — expired SAM = ineligible for awards.', priority: 1, sectionId: 'registrations' },
  { key: 'naicsPrimary', label: 'Primary NAICS Code', why: 'Determines your industry classification and size standard for federal contracts.', priority: 1, sectionId: 'naics' },
  { key: 'naicsSecondary', label: 'Secondary NAICS Codes', why: 'Additional codes expand the types of contracts you can pursue.', priority: 2, sectionId: 'naics' },
  { key: 'socioeconomicCerts', label: 'Socioeconomic Certifications', why: 'SBA certifications (8(a), WOSB, SDVOSB, HUBZone) unlock set-aside opportunities.', priority: 2, sectionId: 'certifications' },
  { key: 'certifications', label: 'Other Certifications', why: 'ISO, CMMI, and other certifications strengthen proposals and past performance.', priority: 3, sectionId: 'certifications' },
  { key: 'capabilities', label: 'Capabilities Statement', why: 'Core marketing document for federal contracting — required for most teaming and BD meetings.', priority: 1, sectionId: 'capabilities' },
  { key: 'coreCompetencies', label: 'Core Competencies', why: 'Used in proposals and capability statements to differentiate your firm.', priority: 2, sectionId: 'capabilities' },
  { key: 'keyPersonnel', label: 'Key Personnel', why: 'Required in proposals — agencies evaluate your team\'s qualifications.', priority: 2, sectionId: 'capabilities' },
  { key: 'pastPerformance', label: 'Past Performance References', why: 'One of the most heavily weighted evaluation factors in federal proposals.', priority: 1, sectionId: 'capabilities' },
  { key: 'bankingInfo', label: 'Banking Information', why: 'Required for ACH/EFT payment setup for contract payments.', priority: 2, sectionId: 'financial' },
  { key: 'bondingCapacity', label: 'Bonding Capacity', why: 'Required for construction contracts and some service contracts.', priority: 3, sectionId: 'financial' },
  { key: 'insuranceSummary', label: 'Insurance Summary', why: 'Most federal contracts require proof of general liability and workers comp insurance.', priority: 2, sectionId: 'financial' },
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
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) return false;
    // Special check for empty JSON arrays/objects
    if (trimmed === '[]' || trimmed === '{}') return false;
    return true;
  }
  return false;
}

function calcSectionScore(fields: FieldDef[], formData: FormData): number {
  if (fields.length === 0) return 100;
  const filled = fields.filter(f => isFilled(formData[f.key])).length;
  return Math.round((filled / fields.length) * 100);
}

function calcOverallScore(formData: FormData): number {
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

// ─── AI Guidance Component ───────────────────────────────────────────────────
function AIGuidanceButton({ 
  fieldName, 
  fieldDescription, 
  currentValue, 
  companyName,
  onUseSuggestion 
}: { 
  fieldName: string; 
  fieldDescription: string; 
  currentValue?: string;
  companyName?: string;
  onUseSuggestion: (val: string) => void;
}) {
  const [showGuidance, setShowGuidance] = useState(false);
  const [guidance, setGuidance] = useState<string | null>(null);
  
  const getGuidanceMutation = trpc.aiWorkflow.getFieldGuidance.useMutation({
    onSuccess: (data) => {
      setGuidance(data.guidance);
    },
    onError: () => {
      toast.error("Failed to get AI guidance");
    }
  });

  const handleToggle = () => {
    if (!showGuidance && !guidance && !getGuidanceMutation.isPending) {
      getGuidanceMutation.mutate({
        fieldName,
        fieldDescription,
        currentValue,
        companyName,
      });
    }
    setShowGuidance(!showGuidance);
  };

  return (
    <div className="mt-1">
      <button 
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
      >
        <Sparkles className="h-3 w-3" />
        {showGuidance ? "Hide AI Guidance" : "Get AI Guidance"}
      </button>

      {showGuidance && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900 shadow-sm animate-in fade-in slide-in-from-top-1">
          {getGuidanceMutation.isPending ? (
            <div className="flex items-center gap-2 py-1">
              <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
              <span>Consulting contracting expert...</span>
            </div>
          ) : guidance ? (
            <div className="space-y-2">
              <p className="leading-relaxed whitespace-pre-wrap">{guidance}</p>
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 px-2 text-[10px] bg-white border-blue-200 text-blue-700 hover:bg-blue-100"
                  onClick={() => {
                    // Try to extract a suggestion from the text if it looks like one, or just provide a starting point
                    const lines = guidance.split('\n');
                    const suggestionLine = lines.find(l => l.toLowerCase().includes('suggestion:') || l.toLowerCase().includes('example:'));
                    const cleanSuggestion = suggestionLine ? suggestionLine.split(':')[1]?.trim() : guidance.substring(0, 100) + "...";
                    onUseSuggestion(cleanSuggestion);
                  }}
                >
                  Use as Draft
                </Button>
              </div>
            </div>
          ) : (
            <p>No guidance available.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── VIEW MODE COMPONENT ─────────────────────────────────────────────────────
function ProfileViewMode({ formData, onEdit }: { formData: FormData; onEdit: () => void }) {
  const samStatusLabel: Record<SamStatus, { text: string; color: string }> = {
    active: { text: 'Active', color: 'bg-green-100 text-green-800' },
    expired: { text: 'Expired', color: 'bg-red-100 text-red-800' },
    pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    not_registered: { text: 'Not Registered', color: 'bg-gray-100 text-gray-600' },
  };

  const contractModelLabel: Record<ContractingModel, string> = {
    prime: 'Prime Contractor',
    sub: 'Subcontractor',
    both: 'Both Prime & Sub',
  };

  const parseJson = (str: string, fallback: any = []) => {
    try {
      return str ? JSON.parse(str) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  const DisplayField = ({ label, value, icon: Icon, mono }: { label: string; value: string; icon?: any; mono?: boolean }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-2">
        {Icon && <Icon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />}
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className={`text-sm text-slate-900 mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</p>
        </div>
      </div>
    );
  };

  const samInfo = samStatusLabel[formData.samStatus] || samStatusLabel.not_registered;
  const keyPersonnel = parseJson(formData.keyPersonnel) as KeyPerson[];
  const socioeconomicCerts = parseJson(formData.socioeconomicCerts) as SocioCert[];
  const pastPerformance = parseJson(formData.pastPerformance) as PastPerf[];
  const bankingInfo = parseJson(formData.bankingInfo, {}) as BankingInfo;
  const insuranceSummary = parseJson(formData.insuranceSummary, {}) as InsuranceSummary;
  const secondaryNaics = formData.naicsSecondary ? (formData.naicsSecondary.startsWith('[') ? parseJson(formData.naicsSecondary) : formData.naicsSecondary.split(',').map(s => s.trim())) : [];

  return (
    <div className="space-y-6">
      {/* ── Company Header Card ─────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0">
              {formData.legalName ? formData.legalName.charAt(0).toUpperCase() : 'B'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{formData.legalName || 'Company Name Not Set'}</h2>
              {formData.dba && <p className="text-sm text-slate-500 mt-0.5">DBA: {formData.dba}</p>}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {formData.businessStructure && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                    {formData.businessStructure}
                  </Badge>
                )}
                {formData.businessSize && (
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100 capitalize">
                    {formData.businessSize === 'small' ? 'Small Business' : formData.businessSize === 'large' ? 'Large Business' : 'Other Than Small'}
                  </Badge>
                )}
                <Badge className={samInfo.color.replace('text-', 'text-').replace('bg-', 'bg-')}>
                  SAM: {samInfo.text}
                </Badge>
                {formData.contractingModel && (
                  <Badge variant="outline" className="text-slate-600 border-slate-200">
                    {contractModelLabel[formData.contractingModel]}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Sections */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" /> Company Identity & Contact
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <DisplayField label="State of Incorporation" value={formData.stateOfIncorporation} icon={MapPin} />
              <DisplayField label="Entity Type" value={formData.entityType} icon={Building2} />
              <DisplayField label="Business Email" value={formData.email} icon={Mail} />
              <DisplayField label="Business Phone" value={formData.phone} icon={Phone} />
              <DisplayField label="Website" value={formData.website} icon={Globe} />
              <div className="md:col-span-2">
                <DisplayField label="Address" value={[formData.address, formData.city, formData.state, formData.zip, formData.country].filter(Boolean).join(', ')} icon={MapPin} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" /> Registrations & NAICS
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <DisplayField label="UEI" value={formData.uei} icon={Hash} mono />
                <DisplayField label="CAGE Code" value={formData.cage} icon={Hash} mono />
                <DisplayField label="Primary NAICS" value={formData.naicsPrimary} icon={FileText} />
                <div className="md:col-span-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Secondary NAICS</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(secondaryNaics) && secondaryNaics.length > 0 ? (
                      secondaryNaics.map((code: any, i: number) => (
                        <Badge key={i} variant="outline" className="font-mono">
                          {typeof code === 'object' ? code.code : code}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 italic">None specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-600" /> Key Personnel
              </h3>
            </div>
            <div className="p-6">
              {keyPersonnel.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keyPersonnel.map((person, i) => (
                    <Card key={i} className="border-slate-100 shadow-none">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-slate-900">{person.name}</p>
                            <p className="text-xs text-slate-500">{person.title}</p>
                          </div>
                          {person.clearanceLevel && (
                            <Badge variant="outline" className="text-[10px] uppercase">
                              {person.clearanceLevel}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-xs text-slate-600">
                          {person.role && <p className="flex items-center gap-1.5"><Briefcase className="h-3 w-3" /> {person.role}</p>}
                          {person.email && <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {person.email}</p>}
                          {person.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {person.phone}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic text-center py-4">No key personnel listed</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" /> Past Performance
              </h3>
            </div>
            <div className="p-6">
              {pastPerformance.length > 0 ? (
                <div className="space-y-4">
                  {pastPerformance.map((perf, i) => (
                    <div key={i} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-900">{perf.agency || 'Unknown Agency'}</h4>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-100">{perf.contractValue}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">Contract #: {perf.contractNumber} | Period: {perf.periodOfPerformance}</p>
                      <p className="text-sm text-slate-700 line-clamp-2">{perf.description}</p>
                      {perf.pocName && (
                        <p className="text-xs text-slate-500 mt-2">POC: {perf.pocName} {perf.pocPhone && `(${perf.pocPhone})`}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic text-center py-4">No past performance records</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-600" /> Certifications
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Socioeconomic</p>
                <div className="flex flex-wrap gap-2">
                  {socioeconomicCerts.length > 0 ? (
                    socioeconomicCerts.map((cert, i) => (
                      <Badge key={i} className="bg-yellow-50 text-yellow-800 border-yellow-200">
                        {cert.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Other Certs</p>
                <p className="text-sm text-slate-700">{formData.certifications || 'None listed'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-red-600" /> Financial & Insurance
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Banking</p>
                {bankingInfo.bankName ? (
                  <div className="text-sm">
                    <p className="font-medium text-slate-900">{bankingInfo.bankName}</p>
                    <p className="text-slate-500 font-mono text-xs">
                      Acct: ****{bankingInfo.accountNumber?.slice(-4) || '****'}
                    </p>
                  </div>
                ) : <p className="text-xs text-slate-400 italic">No banking info</p>}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Insurance Coverage</p>
                <ul className="space-y-2">
                  {Object.entries(insuranceSummary).map(([key, val]) => (
                    val && (
                      <li key={key} className="flex justify-between text-xs">
                        <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-medium text-slate-900">{val}</span>
                      </li>
                    )
                  ))}
                  {Object.values(insuranceSummary).every(v => !v) && (
                    <p className="text-xs text-slate-400 italic">No insurance details</p>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Bonding</p>
                <p className="text-sm text-slate-700">{formData.bondingCapacity || 'None specified'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function BusinessProfile() {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCompleteness, setShowCompleteness] = useState(true);
  const [skippedSections, setSkippedSections] = useState<Record<string, boolean>>({});
  
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const utils = trpc.useContext();

  const profileQuery = trpc.businessProfile.get.useQuery(undefined);

  useEffect(() => {
    if (profileQuery.data) {
      setFormData(profileQuery.data as any);
      setIsLoading(false);
    } else if (profileQuery.isSuccess && !(profileQuery as any).data) {
      setFormData({
        legalName: '', dba: '', businessStructure: '', stateOfIncorporation: '',
        businessSize: '', yearFounded: '', numberOfEmployees: '', annualRevenue: '',
        email: '', phone: '', website: '', address: '', city: '', state: '', zip: '', country: '',
        uei: '', cage: '', entityType: '', samStatus: 'not_registered',
        samExpirationDate: '', samRegistrationDate: '', gsaScheduleNumber: '', gsaScheduleExpiration: '',
        naicsPrimary: '', naicsSecondary: '[]', naicsCodes: '', socioeconomicCerts: '[]',
        certifications: '', keyPersonnel: '[]', capabilities: '', coreCompetencies: '',
        pastPerformance: '[]', bankingInfo: '{}', bondingCapacity: '', insuranceSummary: '{}',
        contractingModel: 'prime', usesSubcontractors: false,
        defaultContactName: '', defaultContactEmail: '', defaultContactPhone: ''
      });
      setIsLoading(false);
    }
  }, [profileQuery.data, profileQuery.isSuccess]);

  const upsertMutation = trpc.businessProfile.upsert.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    setHasUnsavedChanges(true);
  };

  const updateJsonField = (name: keyof FormData, value: any) => {
    setFormData(prev => prev ? ({ ...prev, [name]: JSON.stringify(value) }) : null);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    setHasUnsavedChanges(false);
    try {
      await upsertMutation.mutateAsync(formData as any);
      await utils.businessProfile.get.invalidate();
      setLastSaved(new Date());
      toast.success('Business profile saved successfully');
      setMode('view');
    } catch (err) {
      toast.error('Failed to save profile');
      setHasUnsavedChanges(true);
    } finally {
      setIsSaving(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const el = sectionRefs.current[sectionId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToField = (fieldKey: string, sectionId: string) => {
    if (mode !== 'edit') setMode('edit');
    setTimeout(() => {
      scrollToSection(sectionId);
      setTimeout(() => {
        const el = document.getElementById(fieldKey);
        if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      }, 400);
    }, 100);
  };

  const toggleSectionSkip = (sectionId: string) => {
    setSkippedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const parseJson = (str: string, fallback: any = []) => {
    try {
      return str ? JSON.parse(str) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  if (isLoading || !formData) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  const overallScore = calcOverallScore(formData);
  const criticalMissing = FIELD_DEFS.filter(f => f.priority === 1 && !isFilled(formData[f.key]));

  // ─── Sub-form Renderers ────────────────────────────────────────────────────
  
  const KeyPersonnelForm = () => {
    const personnel = parseJson(formData.keyPersonnel) as KeyPerson[];
    
    const addPerson = () => {
      const newList = [...personnel, { name: '', title: '', role: '', email: '', phone: '', clearanceLevel: '' }];
      updateJsonField('keyPersonnel', newList);
    };

    const removePerson = (index: number) => {
      const newList = personnel.filter((_, i) => i !== index);
      updateJsonField('keyPersonnel', newList);
    };

    const updatePerson = (index: number, field: keyof KeyPerson, value: string) => {
      const newList = [...personnel];
      newList[index] = { ...newList[index], [field]: value };
      updateJsonField('keyPersonnel', newList);
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Key Personnel</Label>
          <Button type="button" size="sm" variant="outline" onClick={addPerson} className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" /> Add Personnel
          </Button>
        </div>
        {personnel.length === 0 && <p className="text-xs text-gray-400 italic">No personnel added yet.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personnel.map((person, i) => (
            <Card key={i} className="border-gray-200 shadow-none">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase">Person #{i + 1}</span>
                  <button onClick={() => removePerson(i)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Name" value={person.name} onChange={e => updatePerson(i, 'name', e.target.value)} className="text-xs h-8" />
                  <Input placeholder="Title" value={person.title} onChange={e => updatePerson(i, 'title', e.target.value)} className="text-xs h-8" />
                  <Input placeholder="Role" value={person.role} onChange={e => updatePerson(i, 'role', e.target.value)} className="text-xs h-8" />
                  <Input placeholder="Clearance" value={person.clearanceLevel} onChange={e => updatePerson(i, 'clearanceLevel', e.target.value)} className="text-xs h-8" />
                  <Input placeholder="Email" value={person.email} onChange={e => updatePerson(i, 'email', e.target.value)} className="text-xs h-8 col-span-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <AIGuidanceButton 
          fieldName="Key Personnel" 
          fieldDescription="List of key staff members, their roles, and security clearances."
          companyName={formData.legalName}
          onUseSuggestion={(val) => {
            const newList = [...personnel, { name: 'AI Suggested', title: 'Role', role: val, email: '', phone: '', clearanceLevel: '' }];
            updateJsonField('keyPersonnel', newList);
          }}
        />
      </div>
    );
  };

  const SocioeconomicCertsForm = () => {
    const certs = parseJson(formData.socioeconomicCerts) as SocioCert[];
    const options = ["8(a)", "WOSB", "EDWOSB", "SDVOSB", "HUBZone", "Small Business Joint Venture", "Self Certified Small Disadvantaged Business"];

    const addCert = () => {
      const newList = [...certs, { name: '', certNumber: '', expirationDate: '', issuingAgency: '' }];
      updateJsonField('socioeconomicCerts', newList);
    };

    const removeCert = (index: number) => {
      const newList = certs.filter((_, i) => i !== index);
      updateJsonField('socioeconomicCerts', newList);
    };

    const updateCert = (index: number, field: keyof SocioCert, value: string) => {
      const newList = [...certs];
      newList[index] = { ...newList[index], [field]: value };
      updateJsonField('socioeconomicCerts', newList);
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Socioeconomic Certifications</Label>
          <Button type="button" size="sm" variant="outline" onClick={addCert} className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" /> Add Certification
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map((cert, i) => (
            <Card key={i} className="border-gray-200 shadow-none">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <select 
                    value={cert.name} 
                    onChange={e => updateCert(i, 'name', e.target.value)}
                    className="text-xs font-bold bg-transparent border-none focus:ring-0 p-0"
                  >
                    <option value="">Select Cert...</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <button onClick={() => removeCert(i)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Cert Number" value={cert.certNumber} onChange={e => updateCert(i, 'certNumber', e.target.value)} className="text-xs h-8" />
                  <Input type="date" value={cert.expirationDate} onChange={e => updateCert(i, 'expirationDate', e.target.value)} className="text-xs h-8" />
                  <Input placeholder="Issuing Agency" value={cert.issuingAgency} onChange={e => updateCert(i, 'issuingAgency', e.target.value)} className="text-xs h-8 col-span-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const PastPerformanceForm = () => {
    const items = parseJson(formData.pastPerformance) as PastPerf[];
    
    const addItem = () => {
      const newList = [...items, { contractNumber: '', agency: '', description: '', contractValue: '', periodOfPerformance: '', pocName: '', pocPhone: '' }];
      updateJsonField('pastPerformance', newList);
    };

    const removeItem = (index: number) => {
      const newList = items.filter((_, i) => i !== index);
      updateJsonField('pastPerformance', newList);
    };

    const updateItem = (index: number, field: keyof PastPerf, value: string) => {
      const newList = [...items];
      newList[index] = { ...newList[index], [field]: value };
      updateJsonField('pastPerformance', newList);
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Label>Past Performance</Label>
            <Switch checked={skippedSections['pastPerformance']} onCheckedChange={() => toggleSectionSkip('pastPerformance')} id="skip-pastPerf" />
            <label htmlFor="skip-pastPerf" className="text-[10px] text-gray-500 cursor-pointer">I'll add this later</label>
          </div>
          {!skippedSections['pastPerformance'] && (
            <Button type="button" size="sm" variant="outline" onClick={addItem} className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" /> Add Record
            </Button>
          )}
        </div>
        
        {skippedSections['pastPerformance'] ? (
          <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center">
            <p className="text-xs text-gray-500">Section skipped. You can come back and fill this in anytime.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, i) => (
              <Card key={i} className="border-gray-200 shadow-none">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase">Contract Record #{i + 1}</span>
                    <button onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px]">Agency</Label>
                      <Input value={item.agency} onChange={e => updateItem(i, 'agency', e.target.value)} className="text-xs h-8" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Contract Number</Label>
                      <Input value={item.contractNumber} onChange={e => updateItem(i, 'contractNumber', e.target.value)} className="text-xs h-8" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-[10px]">Description of Work</Label>
                      <Textarea value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className="text-xs" rows={2} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Value</Label>
                      <Input value={item.contractValue} onChange={e => updateItem(i, 'contractValue', e.target.value)} placeholder="$0.00" className="text-xs h-8" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Period of Performance</Label>
                      <Input value={item.periodOfPerformance} onChange={e => updateItem(i, 'periodOfPerformance', e.target.value)} placeholder="e.g. 2022-2023" className="text-xs h-8" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">POC Name</Label>
                      <Input value={item.pocName} onChange={e => updateItem(i, 'pocName', e.target.value)} className="text-xs h-8" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">POC Phone</Label>
                      <Input value={item.pocPhone} onChange={e => updateItem(i, 'pocPhone', e.target.value)} className="text-xs h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <AIGuidanceButton 
              fieldName="Past Performance" 
              fieldDescription="Records of previous contracts and projects completed by the company."
              companyName={formData.legalName}
              onUseSuggestion={(val) => {
                const newList = [...items, { contractNumber: 'TBD', agency: 'Federal Agency', description: val, contractValue: '$0', periodOfPerformance: '', pocName: '', pocPhone: '' }];
                updateJsonField('pastPerformance', newList);
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const BankingInfoForm = () => {
    const info = parseJson(formData.bankingInfo, {}) as BankingInfo;
    
    const update = (field: keyof BankingInfo, value: string) => {
      updateJsonField('bankingInfo', { ...info, [field]: value });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label>Banking Information</Label>
          <Switch checked={skippedSections['bankingInfo']} onCheckedChange={() => toggleSectionSkip('bankingInfo')} id="skip-banking" />
          <label htmlFor="skip-banking" className="text-[10px] text-gray-500 cursor-pointer">I'll add this later</label>
        </div>
        
        {skippedSections['bankingInfo'] ? (
          <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center">
            <p className="text-xs text-gray-500">Section skipped. You can come back and fill this in anytime.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px]">Bank Name</Label>
              <Input value={info.bankName || ''} onChange={e => update('bankName', e.target.value)} className="text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Routing Number (9 digits)</Label>
              <Input value={info.routingNumber || ''} onChange={e => update('routingNumber', e.target.value)} maxLength={9} className="text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Account Number</Label>
              <Input value={info.accountNumber || ''} onChange={e => update('accountNumber', e.target.value)} className="text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Account Type</Label>
              <select 
                value={info.accountType || ''} 
                onChange={e => update('accountType', e.target.value as any)}
                className="w-full h-8 px-2 border border-gray-200 rounded text-xs"
              >
                <option value="">Select...</option>
                <option value="Checking">Checking</option>
                <option value="Savings">Savings</option>
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  const InsuranceSummaryForm = () => {
    const info = parseJson(formData.insuranceSummary, {}) as InsuranceSummary;
    
    const update = (field: keyof InsuranceSummary, value: string) => {
      updateJsonField('insuranceSummary', { ...info, [field]: value });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label>Insurance Summary</Label>
          <Switch checked={skippedSections['insurance']} onCheckedChange={() => toggleSectionSkip('insurance')} id="skip-insurance" />
          <label htmlFor="skip-insurance" className="text-[10px] text-gray-500 cursor-pointer">I'll add this later</label>
        </div>
        
        {skippedSections['insurance'] ? (
          <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center">
            <p className="text-xs text-gray-500">Section skipped. You can come back and fill this in anytime.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px]">General Liability Amount</Label>
              <Input value={info.generalLiability || ''} onChange={e => update('generalLiability', e.target.value)} placeholder="$1,000,000" className="text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Workers Comp Coverage</Label>
              <Input value={info.workersComp || ''} onChange={e => update('workersComp', e.target.value)} className="text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Professional Liability</Label>
              <Input value={info.professionalLiability || ''} onChange={e => update('professionalLiability', e.target.value)} className="text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Cyber Liability</Label>
              <Input value={info.cyberLiability || ''} onChange={e => update('cyberLiability', e.target.value)} className="text-xs h-8" />
            </div>
          </div>
        )}
      </div>
    );
  };

  const SecondaryNaicsForm = () => {
    const rawValue = formData.naicsSecondary || '[]';
    const codes = parseJson(rawValue, []) as string[];
    const [newCode, setNewCode] = useState('');

    const addCode = () => {
      if (newCode && !codes.includes(newCode)) {
        updateJsonField('naicsSecondary', [...codes, newCode]);
        setNewCode('');
      }
    };

    const removeCode = (code: string) => {
      updateJsonField('naicsSecondary', codes.filter(c => c !== code));
    };

    return (
      <div className="space-y-3">
        <Label htmlFor="naicsSecondary">Secondary NAICS Codes</Label>
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg min-h-[44px]">
          {codes.map(code => (
            <Badge key={code} variant="secondary" className="pl-2 pr-1 py-1 gap-1 bg-white border-slate-200 text-slate-700">
              {code}
              <button onClick={() => removeCode(code)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
            </Badge>
          ))}
          {codes.length === 0 && <span className="text-xs text-slate-400 italic">No codes added</span>}
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="Add NAICS code (e.g. 541512)" 
            value={newCode} 
            onChange={e => setNewCode(e.target.value)}
            className="text-xs h-8"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCode())}
          />
          <Button type="button" size="sm" onClick={addCode} className="h-8">Add</Button>
        </div>
      </div>
    );
  };

  return (
    <PageLayout
      title="Business Profile"
      subtitle={mode === 'view' ? 'Your company information for government contracting' : 'Edit your company information'}
      label="SETUP"
      actions={
        mode === 'view' ? (
          <Button onClick={() => setMode('edit')} className="bg-blue-600 hover:bg-blue-700">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setMode('view')} className="border-white/30 text-white hover:bg-white/10">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <div className="flex items-center gap-3">
              <AutosaveIndicator isSaving={isSaving} hasUnsavedChanges={hasUnsavedChanges} lastSaved={lastSaved} />
              <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        )
      }
      summaryCards={[
        { label: 'Completeness', value: `${overallScore}%`, color: overallScore >= 80 ? 'text-green-600' : overallScore >= 50 ? 'text-amber-600' : 'text-red-600' },
        { label: 'SAM Status', value: formData.samStatus === 'active' ? 'Active' : formData.samStatus === 'expired' ? 'Expired' : formData.samStatus === 'pending' ? 'Pending' : 'Inactive', color: formData.samStatus === 'active' ? 'text-green-600' : 'text-amber-600' },
        { label: 'Critical Missing', value: String(criticalMissing.length), color: criticalMissing.length === 0 ? 'text-green-600' : 'text-red-600' },
        { label: 'Mode', value: mode === 'view' ? 'Viewing' : 'Editing', color: mode === 'view' ? 'text-blue-600' : 'text-amber-600' },
      ]}
    >
      <PageGuide
        title="Business Profile"
        description="Your profile auto-populates across proposals, contracts, and compliance forms. Complete it once and it flows everywhere."
        whenToUse="Fill this out before creating proposals or contracts."
        whatToDoNext={mode === 'view' ? ['Click "Edit Profile" to update your information', 'Review the completeness panel below for missing fields'] : ['Fill in all critical fields marked with *', 'Click "Save Profile" when done — you\'ll return to view mode']}
        alerts={criticalMissing.length > 0 ? [{ message: `${criticalMissing.length} critical field(s) missing. Complete them to unlock full functionality.`, type: 'warning' }] : []}
      />

      <GuidanceQuestionPanel pageContext="business-profile" />
      <TrainingWalkthrough pageContext="business-profile" />

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
                {criticalMissing.length === 0 ? 'All critical fields are filled!' : `${criticalMissing.length} critical field${criticalMissing.length !== 1 ? 's' : ''} still needed`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block w-48 bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all duration-500 ${overallScore >= 80 ? 'bg-green-500' : overallScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${overallScore}%` }} />
            </div>
            {showCompleteness ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          </div>
        </button>

        {showCompleteness && (
          <div className="border-t border-gray-100 p-6">
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
                      <span className={`text-sm font-bold ${score === 100 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                      <div className={`h-1.5 rounded-full ${score === 100 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
                    </div>
                    {missing.length > 0 ? (
                      <div className="space-y-1">
                        {missing.slice(0, 3).map(f => (
                          <button key={f.key} onClick={() => scrollToField(f.key, f.sectionId)} className="w-full flex items-center gap-2 text-xs text-left text-gray-600 hover:text-blue-600 group" title={f.why}>
                            <AlertCircle className="h-3 w-3 text-amber-400 flex-shrink-0" />
                            <span className="group-hover:underline truncate">{f.label}</span>
                            <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 flex-shrink-0" />
                          </button>
                        ))}
                        {missing.length > 3 && <p className="text-xs text-gray-400 pl-5">+{missing.length - 3} more</p>}
                        <button onClick={() => scrollToField(missing[0].key, section.id)} className="mt-2 w-full text-xs text-blue-600 hover:text-blue-700 font-medium text-left flex items-center gap-1">
                          Complete Now <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> All fields complete</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">All Fields — Priority Order</h3>
              <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                {[...FIELD_DEFS].sort((a, b) => a.priority - b.priority).map(field => {
                  const filled = isFilled(formData[field.key]);
                  return (
                    <div key={field.key} className={`flex items-start gap-3 p-2 rounded-lg ${filled ? 'bg-green-50' : 'bg-red-50 hover:bg-red-100 cursor-pointer'} transition-colors`} onClick={() => !filled && scrollToField(field.key, field.sectionId)}>
                      {filled ? <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${filled ? 'text-green-700' : 'text-red-700'}`}>{field.label}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${field.priority === 1 ? 'bg-red-100 text-red-700' : field.priority === 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                            {field.priority === 1 ? 'Critical' : field.priority === 2 ? 'Important' : 'Optional'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-start gap-1"><Info className="h-3 w-3 mt-0.5 flex-shrink-0" />{field.why}</p>
                      </div>
                      {!filled && <ArrowRight className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── VIEW MODE ──────────────────────────────────────────────────────── */}
      {mode === 'view' && <ProfileViewMode formData={formData} onEdit={() => setMode('edit')} />}

      {/* ── EDIT MODE ──────────────────────────────────────────────────────── */}
      {mode === 'edit' && (
        <div className="space-y-6">
          {/* Company Identity */}
          <section id="section-identity" ref={el => { sectionRefs.current['identity'] = el; }} className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-600" />Company Identity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="legalName">Legal Company Name <span className="text-red-500">*</span></Label>
                <Input id="legalName" name="legalName" value={formData.legalName} onChange={handleInputChange} placeholder="Your company's legal name" />
                <AIGuidanceButton 
                  fieldName="Legal Company Name" 
                  fieldDescription="The exact name of your business as registered with the Secretary of State or other governing body."
                  onUseSuggestion={(val) => setFormData(prev => prev ? ({ ...prev, legalName: val }) : null)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dba">DBA (Doing Business As)</Label>
                <Input id="dba" name="dba" value={formData.dba} onChange={handleInputChange} placeholder="If different from legal name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="businessStructure">Business Structure</Label>
                <select id="businessStructure" name="businessStructure" value={formData.businessStructure} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select...</option>
                  <option value="LLC">LLC</option>
                  <option value="S-Corp">S-Corp</option>
                  <option value="C-Corp">C-Corp</option>
                  <option value="Sole Proprietor">Sole Proprietor</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Nonprofit">Nonprofit</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="stateOfIncorporation">State of Incorporation</Label>
                <Input id="stateOfIncorporation" name="stateOfIncorporation" value={formData.stateOfIncorporation} onChange={handleInputChange} placeholder="e.g., Delaware" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="businessSize">Business Size <span className="text-red-500">*</span></Label>
                <select id="businessSize" name="businessSize" value={formData.businessSize} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select...</option>
                  <option value="small">Small Business</option>
                  <option value="large">Large Business</option>
                  <option value="other_than_small">Other Than Small</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="entityType">Entity Type</Label>
                <Input id="entityType" name="entityType" value={formData.entityType} onChange={handleInputChange} placeholder="e.g., For-Profit" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="yearFounded">Year Founded</Label>
                <Input id="yearFounded" name="yearFounded" value={formData.yearFounded} onChange={handleInputChange} placeholder="YYYY" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="numberOfEmployees">Number of Employees</Label>
                <Input id="numberOfEmployees" name="numberOfEmployees" value={formData.numberOfEmployees} onChange={handleInputChange} placeholder="e.g., 25" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="annualRevenue">Annual Revenue</Label>
                <Input id="annualRevenue" name="annualRevenue" value={formData.annualRevenue} onChange={handleInputChange} placeholder="e.g., $5M - $10M" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="contractingModel">Contracting Model</Label>
                <select id="contractingModel" name="contractingModel" value={formData.contractingModel} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="prime">Prime Contractor</option>
                  <option value="sub">Subcontractor</option>
                  <option value="both">Both Prime & Sub</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input id="usesSubcontractors" name="usesSubcontractors" type="checkbox" checked={formData.usesSubcontractors} onChange={e => setFormData(prev => prev ? ({ ...prev, usesSubcontractors: e.target.checked }) : null)} className="w-4 h-4" />
                <Label htmlFor="usesSubcontractors">We use subcontractors</Label>
              </div>
            </div>
          </section>

          {/* Contact & Address */}
          <section id="section-contact" ref={el => { sectionRefs.current['contact'] = el; }} className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-purple-600" />Contact & Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="email">Business Email <span className="text-red-500">*</span></Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="company@example.com" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Business Phone <span className="text-red-500">*</span></Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://example.com" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label htmlFor="address">Street Address <span className="text-red-500">*</span></Label>
                <Input id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Main Street" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                <Input id="state" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="zip">ZIP Code <span className="text-red-500">*</span></Label>
                <Input id="zip" name="zip" value={formData.zip} onChange={handleInputChange} placeholder="12345" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" value={formData.country} onChange={handleInputChange} placeholder="United States" />
              </div>
              <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                <p className="text-sm font-medium text-gray-600 mb-3">Default Point of Contact</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1"><Label htmlFor="defaultContactName">Contact Name</Label><Input id="defaultContactName" name="defaultContactName" value={formData.defaultContactName} onChange={handleInputChange} placeholder="Full Name" /></div>
                  <div className="space-y-1"><Label htmlFor="defaultContactEmail">Contact Email</Label><Input id="defaultContactEmail" name="defaultContactEmail" type="email" value={formData.defaultContactEmail} onChange={handleInputChange} placeholder="contact@example.com" /></div>
                  <div className="space-y-1"><Label htmlFor="defaultContactPhone">Contact Phone</Label><Input id="defaultContactPhone" name="defaultContactPhone" value={formData.defaultContactPhone} onChange={handleInputChange} placeholder="+1 (555) 000-0000" /></div>
                </div>
              </div>
            </div>
          </section>

          {/* Government Registrations */}
          <section id="section-registrations" ref={el => { sectionRefs.current['registrations'] = el; }} className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-green-600" />Government Registrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="uei">UEI <span className="text-red-500">*</span></Label>
                <Input id="uei" name="uei" value={formData.uei} onChange={handleInputChange} placeholder="12-character from SAM.gov" />
                <p className="text-[10px] text-gray-500">Replaces DUNS. Required for all federal contracts.</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="cage">CAGE Code <span className="text-red-500">*</span></Label>
                <Input id="cage" name="cage" value={formData.cage} onChange={handleInputChange} placeholder="5-character code" />
                <p className="text-[10px] text-gray-500">Required for DoD and many federal solicitations.</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="samStatus">SAM Status <span className="text-red-500">*</span></Label>
                <select id="samStatus" name="samStatus" value={formData.samStatus} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="not_registered">Not Registered</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="samRegistrationDate">SAM Registration Date</Label>
                <Input id="samRegistrationDate" name="samRegistrationDate" type="date" value={formData.samRegistrationDate} onChange={handleInputChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="samExpirationDate">SAM Expiration Date <span className="text-red-500">*</span></Label>
                <Input id="samExpirationDate" name="samExpirationDate" type="date" value={formData.samExpirationDate} onChange={handleInputChange} />
                <p className="text-[10px] text-gray-500">Expired SAM = ineligible for awards.</p>
              </div>
              
              <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm font-medium text-gray-600">GSA Schedule</p>
                  <Switch checked={skippedSections['gsa']} onCheckedChange={() => toggleSectionSkip('gsa')} id="skip-gsa" />
                  <label htmlFor="skip-gsa" className="text-[10px] text-gray-500 cursor-pointer">I'll add this later</label>
                </div>
                {!skippedSections['gsa'] ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1"><Label htmlFor="gsaScheduleNumber">GSA Schedule Number</Label><Input id="gsaScheduleNumber" name="gsaScheduleNumber" value={formData.gsaScheduleNumber} onChange={handleInputChange} placeholder="e.g., GS-35F-XXXXX" /></div>
                    <div className="space-y-1"><Label htmlFor="gsaScheduleExpiration">GSA Schedule Expiration</Label><Input id="gsaScheduleExpiration" name="gsaScheduleExpiration" type="date" value={formData.gsaScheduleExpiration} onChange={handleInputChange} /></div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-500">
                    Section skipped. You can come back and fill this in anytime.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* NAICS Codes */}
          <section id="section-naics" ref={el => { sectionRefs.current['naics'] = el; }} className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText className="h-5 w-5 text-orange-600" />NAICS Codes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label htmlFor="naicsPrimary">Primary NAICS Code <span className="text-red-500">*</span></Label>
                <Input id="naicsPrimary" name="naicsPrimary" value={formData.naicsPrimary} onChange={handleInputChange} placeholder="e.g., 541511" />
                <p className="text-[10px] text-gray-500">Your main industry classification.</p>
              </div>
              <SecondaryNaicsForm />
              <div className="md:col-span-2 space-y-1">
                <Label htmlFor="naicsCodes">All NAICS Codes (comma-separated)</Label>
                <Input id="naicsCodes" name="naicsCodes" value={formData.naicsCodes} onChange={handleInputChange} placeholder="541511, 541512, 541519" />
              </div>
            </div>
          </section>

          {/* Certifications */}
          <section id="section-certifications" ref={el => { sectionRefs.current['certifications'] = el; }} className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Star className="h-5 w-5 text-yellow-600" />Certifications</h2>
            <div className="space-y-6">
              <SocioeconomicCertsForm />
              <div className="space-y-1">
                <Label htmlFor="certifications">Other Certifications</Label>
                <Textarea id="certifications" name="certifications" value={formData.certifications} onChange={handleInputChange} placeholder="ISO 9001:2015, CMMI Level 3, etc." rows={2} />
              </div>
            </div>
          </section>

          {/* Capabilities */}
          <section id="section-capabilities" ref={el => { sectionRefs.current['capabilities'] = el; }} className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-teal-600" />Capabilities & Past Performance</h2>
            <div className="space-y-6">
              <div className="space-y-1">
                <Label htmlFor="capabilities">Capabilities Statement <span className="text-red-500">*</span></Label>
                <Textarea id="capabilities" name="capabilities" value={formData.capabilities} onChange={handleInputChange} placeholder="Describe your company's core capabilities..." rows={4} />
                <AIGuidanceButton 
                  fieldName="Capabilities Statement" 
                  fieldDescription="A concise summary of your company's skills, experience, and value proposition for government clients."
                  companyName={formData.legalName}
                  onUseSuggestion={(val) => setFormData(prev => prev ? ({ ...prev, capabilities: val }) : null)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="coreCompetencies">Core Competencies</Label>
                <Textarea id="coreCompetencies" name="coreCompetencies" value={formData.coreCompetencies} onChange={handleInputChange} placeholder="List key competencies..." rows={3} />
              </div>
              <KeyPersonnelForm />
              <PastPerformanceForm />
            </div>
          </section>

          {/* Financial */}
          <section id="section-financial" ref={el => { sectionRefs.current['financial'] = el; }} className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><DollarSign className="h-5 w-5 text-red-600" />Banking & Financial</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Label htmlFor="bondingCapacity">Bonding Capacity</Label>
                    <Switch checked={skippedSections['bonding']} onCheckedChange={() => toggleSectionSkip('bonding')} id="skip-bonding" />
                    <label htmlFor="skip-bonding" className="text-[10px] text-gray-500 cursor-pointer">I'll add this later</label>
                  </div>
                  {!skippedSections['bonding'] ? (
                    <Input id="bondingCapacity" name="bondingCapacity" value={formData.bondingCapacity} onChange={handleInputChange} placeholder="e.g., $5M single / $10M aggregate" />
                  ) : (
                    <div className="p-2 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-500">Skipped</div>
                  )}
                </div>
              </div>
              <BankingInfoForm />
              <InsuranceSummaryForm />
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pb-8">
            <Button variant="outline" onClick={() => setMode('view')}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              <Save className="mr-2 h-4 w-4" />{isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      )}
          <PageGuidancePanel
        pageKey="business-profile"
        title="Business Profile Help"
        description="Your workspace business identity. Maintain UEI, CAGE, SAM status, NAICS codes, certifications, and capabilities. This data auto-fills into capability statements and proposals."
        whatToDoNext={["Enter your UEI and CAGE code", "Confirm SAM registration status", "Set primary NAICS codes", "Add certifications and set-aside eligibility"]}
        helpArticleSlug="what-is-sam"
        glossaryTerms={["uei", "cage", "sam", "naics"]}
      />
    </PageLayout>
  );
}
