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
} from 'lucide-react';
import PageGuide from "@/components/PageGuide";

export default function BusinessProfile() {
  const [, navigate] = useLocation();
  const { data: settingsMap } = trpc.settings.getAll.useQuery();
  const setSetting = trpc.settings.set.useMutation();
  const utils = trpc.useUtils();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    legalName: '',
    dba: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    uei: '',
    cage: '',
    sam: '',
    primaryNaics: '',
    additionalNaics: '',
    certifications: '',
  });
  const [completeness, setCompleteness] = useState(0);

  useEffect(() => {
    if (settingsMap) {
      const fd = {
        legalName: settingsMap['bp.legalName'] || '',
        dba: settingsMap['bp.dba'] || '',
        email: settingsMap['bp.email'] || '',
        phone: settingsMap['bp.phone'] || '',
        website: settingsMap['bp.website'] || '',
        address: settingsMap['bp.address'] || '',
        uei: settingsMap['bp.uei'] || '',
        cage: settingsMap['bp.cage'] || '',
        sam: settingsMap['bp.sam'] || '',
        primaryNaics: settingsMap['bp.primaryNaics'] || '',
        additionalNaics: settingsMap['bp.additionalNaics'] || '',
        certifications: settingsMap['bp.certifications'] || '',
      };
      setFormData(fd);
      const fields = Object.values(fd);
      const filled = fields.filter(f => f.length > 0).length;
      setCompleteness(Math.round((filled / fields.length) * 100));
    }
  }, [settingsMap]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const entries: [string, string][] = Object.entries(formData).map(([k, v]) => [`bp.${k}`, v]);
      for (const [key, value] of entries) {
        await setSetting.mutateAsync({ key, value });
      }
      utils.settings.getAll.invalidate();
      toast.success('Business profile saved successfully!');
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout
      title="Business Profile"
      subtitle="Manage your company information and government registration details"
      label="Company"
      summaryCards={[
        { label: "NAICS Codes", value: formData.additionalNaics ? formData.additionalNaics.split(',').length + 1 : 1 },
        { label: "Certifications", value: formData.certifications ? formData.certifications.split(',').length : 0, color: "text-green-600" },
        { label: "Profile Complete", value: `${completeness}%`, color: "text-blue-600" },
        { label: "SAM Status", value: "Active", color: "text-green-600" },
      ]}
      actions={
        <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleSave} disabled={isSaving}>
      <PageGuide
        title="Business Profile"
        description="Your company information used across proposals, capability statements, and compliance."
        whenToUse="When setting up your workspace, updating company details, or preparing capability statements."
        whatToDoNext={["Complete all required business fields", "Add NAICS codes and certifications", "Update past performance references", "Review profile completeness score"]}
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
                  <span className="text-2xl font-bold text-blue-600">{completeness}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${completeness}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Business Identity</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Registration Info</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">NAICS Codes</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Certifications</span>
                </div>
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
                <div>
                  <Label htmlFor="legalName">Legal Business Name</Label>
                  <Input
                    id="legalName"
                    name="legalName"
                    value={formData.legalName}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="dba">DBA / Trade Name</Label>
                  <Input
                    id="dba"
                    name="dba"
                    value={formData.dba}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Business Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Registration/Entity Info Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Registration & Entity Info
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="uei">UEI</Label>
                  <Input
                    id="uei"
                    name="uei"
                    value={formData.uei}
                    onChange={handleInputChange}
                    placeholder="Unique Entity Identifier"
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">sam.gov identifier</p>
                </div>
                <div>
                  <Label htmlFor="cage">CAGE Code</Label>
                  <Input
                    id="cage"
                    name="cage"
                    value={formData.cage}
                    onChange={handleInputChange}
                    placeholder="CAGE code"
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">Commercial & Government Entity</p>
                </div>
                <div>
                  <Label htmlFor="sam">SAM Registration</Label>
                  <Input
                    id="sam"
                    name="sam"
                    value={formData.sam}
                    onChange={handleInputChange}
                    placeholder="SAM registration"
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">System for Award Management</p>
                </div>
              </div>
            </div>

            {/* NAICS & Capabilities Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">NAICS Codes & Capabilities</h2>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="primaryNaics">Primary NAICS Code</Label>
                  <Input
                    id="primaryNaics"
                    name="primaryNaics"
                    value={formData.primaryNaics}
                    onChange={handleInputChange}
                    placeholder="e.g., 541511"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="additionalNaics">Additional NAICS Codes</Label>
                  <Textarea
                    id="additionalNaics"
                    name="additionalNaics"
                    value={formData.additionalNaics}
                    onChange={handleInputChange}
                    placeholder="Enter additional NAICS codes, comma-separated"
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Certifications Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Certifications & Designations</h2>

              <div>
                <Label htmlFor="certifications">Active Certifications</Label>
                <Textarea
                  id="certifications"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleInputChange}
                  placeholder="e.g., Woman-Owned Small Business, Veteran-Owned Small Business"
                  rows={4}
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-2">List all active certifications and designations</p>
              </div>
            </div>

            {/* AI Behavior Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                AI Behavior & Recommendations
              </h2>
              <p className="text-slate-700 mb-4">
                Based on your profile, AI will:
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ Recommend opportunities matching your NAICS codes</li>
                <li>✓ Flag compliance requirements based on certifications</li>
                <li>✓ Suggest proposal frameworks for your capabilities</li>
                <li>✓ Alert you to registration updates or expiring certifications</li>
              </ul>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => navigate('/app/dashboard')}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        </div>
    </PageLayout>
  );
}
