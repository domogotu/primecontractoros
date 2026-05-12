import { useState, useEffect } from 'react';
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
  Zap,
  CheckCircle2,
  AlertCircle,
  Save,
  Users,
} from 'lucide-react';
import PageGuide from "@/components/PageGuide";

export default function BusinessProfile() {
  const [, navigate] = useLocation();
  const { data: profile, isLoading } = trpc.businessProfile.get.useQuery();
  const upsertMutation = trpc.businessProfile.upsert.useMutation();
  const utils = trpc.useUtils();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    legalName: '',
    dba: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    entityType: '',
    uei: '',
    cage: '',
    samStatus: 'not_registered' as 'active' | 'expired' | 'pending' | 'not_registered',
    samRenewalDate: '',
    naicsCodes: '',
    certifications: '',
    capabilities: '',
    contractingModel: 'prime' as 'prime' | 'sub' | 'both',
    usesSubcontractors: false,
    defaultContactName: '',
    defaultContactEmail: '',
    defaultContactPhone: '',
  });
  const [completeness, setCompleteness] = useState(0);

  useEffect(() => {
    if (profile) {
      const fd = {
        legalName: profile.legalName || '',
        dba: profile.dba || '',
        email: profile.email || '',
        phone: profile.phone || '',
        website: profile.website || '',
        address: profile.address || '',
        entityType: profile.entityType || '',
        uei: profile.uei || '',
        cage: profile.cage || '',
        samStatus: (profile.samStatus as any) || 'not_registered',
        samRenewalDate: profile.samRenewalDate ? new Date(profile.samRenewalDate).toISOString().split('T')[0] : '',
        naicsCodes: profile.naicsCodes || '',
        certifications: profile.certifications || '',
        capabilities: profile.capabilities || '',
        contractingModel: (profile.contractingModel as any) || 'prime',
        usesSubcontractors: profile.usesSubcontractors || false,
        defaultContactName: profile.defaultContactName || '',
        defaultContactEmail: profile.defaultContactEmail || '',
        defaultContactPhone: profile.defaultContactPhone || '',
      };
      setFormData(fd);
      setCompleteness(profile.profileCompletenessScore || 0);
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await upsertMutation.mutateAsync(formData);
      setCompleteness(result.completenessScore);
      utils.businessProfile.get.invalidate();
      toast.success('Business profile saved successfully!');
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const fields = [formData.legalName, formData.email, formData.phone, formData.address, formData.uei, formData.cage, formData.naicsCodes, formData.certifications, formData.capabilities, formData.contractingModel, formData.defaultContactName, formData.defaultContactEmail];
  const localCompleteness = Math.round((fields.filter(f => f && f.length > 0).length / fields.length) * 100);

  return (
    <PageLayout
      title="Business Profile"
      subtitle="Manage your company information and government registration details"
      label="Company"
      summaryCards={[
        { label: "NAICS Codes", value: formData.naicsCodes ? formData.naicsCodes.split(',').length : 0 },
        { label: "Certifications", value: formData.certifications ? formData.certifications.split(',').length : 0, color: "text-green-600" },
        { label: "Profile Complete", value: `${localCompleteness}%`, color: "text-blue-600" },
        { label: "SAM Status", value: formData.samStatus === 'active' ? 'Active' : formData.samStatus === 'expired' ? 'Expired' : formData.samStatus === 'pending' ? 'Pending' : 'Not Registered', color: formData.samStatus === 'active' ? "text-green-600" : "text-yellow-600" },
      ]}
      actions={
        <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleSave} disabled={isSaving}>
      <PageGuide
        title="Business Profile"
        description="Your company information used across proposals, capability statements, and compliance."
        whenToUse="When setting up your workspace, updating company details, or preparing capability statements."
        whatToDoNext={["Complete all required business fields", "Add NAICS codes and certifications", "Set your contracting model (prime/sub/both)", "Add default contact information"]}
        relatedRecords={[{ label: "Capability Statements", path: "/app/capability-statements" }, { label: "Settings", path: "/app/settings" }, { label: "Onboarding", path: "/app/onboarding" }]}
      />
          <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Profile'}
        </Button>
      }
    >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Completeness */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-lg p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile Completeness</h2>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Overall</span>
                  <span className="text-2xl font-bold text-blue-600">{localCompleteness}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${localCompleteness}%` }}></div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Business Identity", done: !!(formData.legalName && formData.email) },
                  { label: "Registration Info", done: !!(formData.uei && formData.cage) },
                  { label: "NAICS Codes", done: !!formData.naicsCodes },
                  { label: "Certifications", done: !!formData.certifications },
                  { label: "Capabilities", done: !!formData.capabilities },
                  { label: "Default Contact", done: !!(formData.defaultContactName && formData.defaultContactEmail) },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    {item.done ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />}
                    <span className="text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Identity Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Business Identity
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><Label htmlFor="legalName">Legal Business Name</Label><Input id="legalName" name="legalName" value={formData.legalName} onChange={handleInputChange} className="mt-2" /></div>
                <div><Label htmlFor="dba">DBA / Trade Name</Label><Input id="dba" name="dba" value={formData.dba} onChange={handleInputChange} className="mt-2" /></div>
                <div><Label htmlFor="email">Business Email</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="mt-2" /></div>
                <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-2" /></div>
                <div><Label htmlFor="website">Website</Label><Input id="website" name="website" value={formData.website} onChange={handleInputChange} className="mt-2" /></div>
                <div><Label htmlFor="entityType">Entity Type</Label>
                  <select id="entityType" name="entityType" value={formData.entityType} onChange={handleInputChange} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                    <option value="">Select...</option>
                    <option value="LLC">LLC</option>
                    <option value="Corporation">Corporation</option>
                    <option value="S-Corp">S-Corp</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Non-Profit">Non-Profit</option>
                  </select>
                </div>
                <div className="md:col-span-2"><Label htmlFor="address">Address</Label><Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} rows={2} className="mt-2" /></div>
              </div>
            </div>

            {/* Registration/Entity Info Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Government Registration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><Label htmlFor="uei">UEI</Label><Input id="uei" name="uei" value={formData.uei} onChange={handleInputChange} placeholder="Unique Entity Identifier" className="mt-2" /><p className="text-xs text-slate-500 mt-1">sam.gov identifier</p></div>
                <div><Label htmlFor="cage">CAGE Code</Label><Input id="cage" name="cage" value={formData.cage} onChange={handleInputChange} placeholder="CAGE code" className="mt-2" /><p className="text-xs text-slate-500 mt-1">Commercial & Government Entity</p></div>
                <div><Label htmlFor="samStatus">SAM Status</Label>
                  <select id="samStatus" name="samStatus" value={formData.samStatus} onChange={handleInputChange} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="pending">Pending</option>
                    <option value="not_registered">Not Registered</option>
                  </select>
                </div>
                <div><Label htmlFor="samRenewalDate">SAM Renewal Date</Label><Input id="samRenewalDate" name="samRenewalDate" type="date" value={formData.samRenewalDate} onChange={handleInputChange} className="mt-2" /></div>
              </div>
            </div>

            {/* Contracting Model Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Contracting Model
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><Label htmlFor="contractingModel">Primary Role</Label>
                  <select id="contractingModel" name="contractingModel" value={formData.contractingModel} onChange={handleInputChange} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                    <option value="prime">Prime Contractor</option>
                    <option value="sub">Subcontractor</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="usesSubcontractors" checked={formData.usesSubcontractors} onChange={(e) => setFormData(prev => ({ ...prev, usesSubcontractors: e.target.checked }))} className="rounded border-slate-300" />
                  <Label htmlFor="usesSubcontractors">Uses Subcontractors</Label>
                </div>
              </div>
            </div>

            {/* NAICS & Capabilities Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">NAICS Codes & Capabilities</h2>
              <div className="space-y-6">
                <div><Label htmlFor="naicsCodes">NAICS Codes</Label><Textarea id="naicsCodes" name="naicsCodes" value={formData.naicsCodes} onChange={handleInputChange} placeholder="e.g., 541511, 541512, 541519" rows={2} className="mt-2" /><p className="text-xs text-slate-500 mt-1">Comma-separated NAICS codes</p></div>
                <div><Label htmlFor="capabilities">Capabilities Statement</Label><Textarea id="capabilities" name="capabilities" value={formData.capabilities} onChange={handleInputChange} placeholder="Describe your core competencies and capabilities..." rows={4} className="mt-2" /></div>
              </div>
            </div>

            {/* Certifications Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Certifications & Designations</h2>
              <div><Label htmlFor="certifications">Active Certifications</Label><Textarea id="certifications" name="certifications" value={formData.certifications} onChange={handleInputChange} placeholder="e.g., Woman-Owned Small Business, Veteran-Owned Small Business, 8(a), HUBZone" rows={4} className="mt-2" /><p className="text-xs text-slate-500 mt-2">Comma-separated list of all active certifications and designations</p></div>
            </div>

            {/* Default Contact Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Default Contact
              </h2>
              <p className="text-sm text-slate-500 mb-4">Used as the default point of contact on proposals and contracts.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><Label htmlFor="defaultContactName">Name</Label><Input id="defaultContactName" name="defaultContactName" value={formData.defaultContactName} onChange={handleInputChange} className="mt-2" /></div>
                <div><Label htmlFor="defaultContactEmail">Email</Label><Input id="defaultContactEmail" name="defaultContactEmail" type="email" value={formData.defaultContactEmail} onChange={handleInputChange} className="mt-2" /></div>
                <div><Label htmlFor="defaultContactPhone">Phone</Label><Input id="defaultContactPhone" name="defaultContactPhone" value={formData.defaultContactPhone} onChange={handleInputChange} className="mt-2" /></div>
              </div>
            </div>

            {/* AI Behavior Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                AI Behavior & Recommendations
              </h2>
              <p className="text-slate-700 mb-4">Based on your profile, AI will:</p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ Recommend opportunities matching your NAICS codes</li>
                <li>✓ Flag compliance requirements based on certifications</li>
                <li>✓ Suggest proposal frameworks for your capabilities</li>
                <li>✓ Alert you to registration updates or expiring certifications</li>
              </ul>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => navigate('/app/dashboard')}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />{isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        </div>
    </PageLayout>
  );
}
