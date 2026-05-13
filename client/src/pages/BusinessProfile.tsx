import React, { useState, useEffect } from 'react';
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
    businessStructure: '',
    stateOfIncorporation: '',
    businessSize: '',
    yearFounded: '',
    numberOfEmployees: '',
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
    samStatus: 'not_registered' as 'active' | 'expired' | 'pending' | 'not_registered',
    samExpirationDate: '',
    samRegistrationDate: '',
    gsaScheduleNumber: '',
    gsaScheduleExpiration: '',
    naicsPrimary: '',
    naicsSecondary: '',
    socioeconomicCerts: '',
    keyPersonnel: '',
    capabilities: '',
    coreCompetencies: '',
    pastPerformance: '',
    bankingInfo: '',
    bondingCapacity: '',
    insuranceSummary: '',
    annualRevenue: '',
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
        businessStructure: profile.businessStructure || '',
        stateOfIncorporation: profile.stateOfIncorporation || '',
        businessSize: profile.businessSize || '',
        yearFounded: profile.yearFounded || '',
        numberOfEmployees: profile.numberOfEmployees || '',
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
        samStatus: (profile.samStatus as any) || 'not_registered',
        samExpirationDate: profile.samExpirationDate ? new Date(profile.samExpirationDate).toISOString().split('T')[0] : '',
        samRegistrationDate: profile.samRegistrationDate ? new Date(profile.samRegistrationDate).toISOString().split('T')[0] : '',
        gsaScheduleNumber: profile.gsaScheduleNumber || '',
        gsaScheduleExpiration: profile.gsaScheduleExpiration ? new Date(profile.gsaScheduleExpiration).toISOString().split('T')[0] : '',
        naicsPrimary: profile.naicsPrimary || '',
        naicsSecondary: profile.naicsSecondary || '',
        socioeconomicCerts: profile.socioeconomicCerts || '',
        keyPersonnel: profile.keyPersonnel || '',
        capabilities: profile.capabilities || '',
        coreCompetencies: profile.coreCompetencies || '',
        pastPerformance: profile.pastPerformance || '',
        bankingInfo: profile.bankingInfo || '',
        bondingCapacity: profile.bondingCapacity || '',
        insuranceSummary: profile.insuranceSummary || '',
        annualRevenue: profile.annualRevenue || '',
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
      await upsertMutation.mutateAsync(formData as any);
      await utils.businessProfile.get.invalidate();
      toast.success('Business profile saved successfully');
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8">Loading profile...</div>;

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
        { label: 'Completeness', value: `${completeness}%`, color: 'text-blue-600' },
        { label: 'Status', value: profile?.samStatus === 'active' ? 'SAM Active' : 'SAM Inactive', color: profile?.samStatus === 'active' ? 'text-green-600' : 'text-amber-600' },
      ]}
    >
      <PageGuide
        title="Business Profile"
        description="Your profile auto-populates across proposals, contracts, and compliance forms."
        whenToUse="Complete this profile once, and it flows everywhere in the system."
        whatToDoNext={[
          'Fill in your company legal name and business structure',
          'Add your UEI and CAGE code from SAM.gov',
          'List your NAICS codes and certifications',
          'Add key personnel and banking information',
          'Save to auto-populate across the app'
        ]}
        alerts={completeness < 50 ? [{ message: 'Profile is incomplete. Fill in critical fields to enable full functionality.', type: 'warning' }] : []}
      />

      <div className="space-y-8">
        {/* Company Identity */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Company Identity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="legalName">Legal Company Name *</Label>
              <Input
                id="legalName"
                name="legalName"
                value={formData.legalName}
                onChange={handleInputChange}
                placeholder="Your company's legal name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="dba">DBA (Doing Business As)</Label>
              <Input
                id="dba"
                name="dba"
                value={formData.dba}
                onChange={handleInputChange}
                placeholder="If different from legal name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="businessStructure">Business Structure</Label>
              <select
                id="businessStructure"
                name="businessStructure"
                value={formData.businessStructure}
                onChange={handleInputChange}
                className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="LLC">LLC</option>
                <option value="S-Corp">S-Corp</option>
                <option value="C-Corp">C-Corp</option>
                <option value="Sole Proprietor">Sole Proprietor</option>
                <option value="Partnership">Partnership</option>
              </select>
            </div>
            <div>
              <Label htmlFor="stateOfIncorporation">State of Incorporation</Label>
              <Input
                id="stateOfIncorporation"
                name="stateOfIncorporation"
                value={formData.stateOfIncorporation}
                onChange={handleInputChange}
                placeholder="e.g., Delaware"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="businessSize">Business Size</Label>
              <select
                id="businessSize"
                name="businessSize"
                value={formData.businessSize}
                onChange={handleInputChange}
                className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="small">Small Business</option>
                <option value="large">Large Business</option>
                <option value="other_than_small">Other Than Small</option>
              </select>
            </div>
            <div>
              <Label htmlFor="yearFounded">Year Founded</Label>
              <Input
                id="yearFounded"
                name="yearFounded"
                value={formData.yearFounded}
                onChange={handleInputChange}
                placeholder="YYYY"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="numberOfEmployees">Number of Employees</Label>
              <Input
                id="numberOfEmployees"
                name="numberOfEmployees"
                value={formData.numberOfEmployees}
                onChange={handleInputChange}
                placeholder="e.g., 25"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="annualRevenue">Annual Revenue</Label>
              <Input
                id="annualRevenue"
                name="annualRevenue"
                value={formData.annualRevenue}
                onChange={handleInputChange}
                placeholder="e.g., $5M - $10M"
                className="mt-2"
              />
            </div>
          </div>
        </section>

        {/* Contact & Address */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Contact & Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="company@example.com"
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
                placeholder="+1 (555) 000-0000"
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
                placeholder="https://example.com"
                className="mt-2"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main Street"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="State"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
                placeholder="12345"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="United States"
                className="mt-2"
              />
            </div>
          </div>
        </section>

        {/* Government Registrations */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Government Registrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="uei">UEI (Unique Entity Identifier) *</Label>
              <Input
                id="uei"
                name="uei"
                value={formData.uei}
                onChange={handleInputChange}
                placeholder="From SAM.gov"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Formerly DUNS number</p>
            </div>
            <div>
              <Label htmlFor="cage">CAGE Code</Label>
              <Input
                id="cage"
                name="cage"
                value={formData.cage}
                onChange={handleInputChange}
                placeholder="From SAM.gov"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Commercial and Government Entity</p>
            </div>
            <div>
              <Label htmlFor="samStatus">SAM Registration Status</Label>
              <select
                id="samStatus"
                name="samStatus"
                value={formData.samStatus}
                onChange={handleInputChange}
                className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="not_registered">Not Registered</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <Label htmlFor="samExpirationDate">SAM Expiration Date</Label>
              <Input
                id="samExpirationDate"
                name="samExpirationDate"
                type="date"
                value={formData.samExpirationDate}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="gsaScheduleNumber">GSA Schedule Number</Label>
              <Input
                id="gsaScheduleNumber"
                name="gsaScheduleNumber"
                value={formData.gsaScheduleNumber}
                onChange={handleInputChange}
                placeholder="If applicable"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="gsaScheduleExpiration">GSA Schedule Expiration</Label>
              <Input
                id="gsaScheduleExpiration"
                name="gsaScheduleExpiration"
                type="date"
                value={formData.gsaScheduleExpiration}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>
          </div>
        </section>

        {/* NAICS & Certifications */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">NAICS Codes & Certifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="naicsPrimary">Primary NAICS Code</Label>
              <Input
                id="naicsPrimary"
                name="naicsPrimary"
                value={formData.naicsPrimary}
                onChange={handleInputChange}
                placeholder="e.g., 541512"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="naicsSecondary">Secondary NAICS Codes</Label>
              <Textarea
                id="naicsSecondary"
                name="naicsSecondary"
                value={formData.naicsSecondary}
                onChange={handleInputChange}
                placeholder="e.g., 541519, 541512 (comma-separated)"
                rows={2}
                className="mt-2"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="socioeconomicCerts">Socioeconomic Certifications</Label>
              <Textarea
                id="socioeconomicCerts"
                name="socioeconomicCerts"
                value={formData.socioeconomicCerts}
                onChange={handleInputChange}
                placeholder="e.g., 8(a), HUBZone, SDVOSB, WOSB (comma-separated)"
                rows={2}
                className="mt-2"
              />
            </div>
          </div>
        </section>

        {/* Capabilities & Personnel */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            Capabilities & Personnel
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="coreCompetencies">Core Competencies</Label>
              <Textarea
                id="coreCompetencies"
                name="coreCompetencies"
                value={formData.coreCompetencies}
                onChange={handleInputChange}
                placeholder="Describe your core competencies..."
                rows={3}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="capabilities">Capabilities Statement</Label>
              <Textarea
                id="capabilities"
                name="capabilities"
                value={formData.capabilities}
                onChange={handleInputChange}
                placeholder="Your capabilities summary..."
                rows={3}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="keyPersonnel">Key Personnel (JSON)</Label>
              <Textarea
                id="keyPersonnel"
                name="keyPersonnel"
                value={formData.keyPersonnel}
                onChange={handleInputChange}
                placeholder='[{"name":"John Doe","title":"CEO","email":"john@example.com"}]'
                rows={3}
                className="mt-2 font-mono text-xs"
              />
            </div>
          </div>
        </section>

        {/* Financial Information */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Financial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bondingCapacity">Bonding Capacity</Label>
              <Input
                id="bondingCapacity"
                name="bondingCapacity"
                value={formData.bondingCapacity}
                onChange={handleInputChange}
                placeholder="e.g., $5M"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="bankingInfo">Banking Info (JSON)</Label>
              <Input
                id="bankingInfo"
                name="bankingInfo"
                value={formData.bankingInfo}
                onChange={handleInputChange}
                placeholder='{"bankName":"Bank","accountName":"Acct"}'
                className="mt-2 font-mono text-xs"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="insuranceSummary">Insurance Summary (JSON)</Label>
              <Textarea
                id="insuranceSummary"
                name="insuranceSummary"
                value={formData.insuranceSummary}
                onChange={handleInputChange}
                placeholder='{"generalLiability":"$1M","workersComp":"$2M"}'
                rows={2}
                className="mt-2 font-mono text-xs"
              />
            </div>
          </div>
        </section>

        {/* Past Performance */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Past Performance</h2>
          <div>
            <Label htmlFor="pastPerformance">Past Performance References (JSON)</Label>
            <Textarea
              id="pastPerformance"
              name="pastPerformance"
              value={formData.pastPerformance}
              onChange={handleInputChange}
              placeholder='[{"contractNumber":"N00000-00-C-0000","agency":"DoD","description":"IT Services","value":"$5M"}]'
              rows={4}
              className="mt-2 font-mono text-xs"
            />
          </div>
        </section>

        {/* Contracting Model */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Contracting Model</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractingModel">Contracting Model</Label>
              <select
                id="contractingModel"
                name="contractingModel"
                value={formData.contractingModel}
                onChange={handleInputChange}
                className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="prime">Prime Contractor</option>
                <option value="sub">Subcontractor</option>
                <option value="both">Both Prime & Sub</option>
              </select>
            </div>
            <div>
              <Label htmlFor="usesSubcontractors" className="flex items-center gap-2">
                <input
                  id="usesSubcontractors"
                  name="usesSubcontractors"
                  type="checkbox"
                  checked={formData.usesSubcontractors}
                  onChange={(e) => setFormData(prev => ({ ...prev, usesSubcontractors: e.target.checked }))}
                  className="w-4 h-4"
                />
                Uses Subcontractors
              </Label>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
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
