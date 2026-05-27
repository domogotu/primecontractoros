import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Bell,
  Save,
  Shield,
  Globe,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

export default function UserProfile() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { data: profileData, isLoading, refetch } = trpc.userProfile.getSelf.useQuery();
  const updateSelf = trpc.userProfile.updateSelf.useMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'preferences' | 'notifications' | 'security'>('personal');

  const [formData, setFormData] = useState({
    name: '',
    loginEmail: '',
    jobTitle: '',
    phone: '',
    bio: '',
    linkedIn: '',
    role: 'user',
    accountStatus: 'active',
    createdAt: null as string | null,
    guidancePreference: 'detailed',
    reminderPreference: 'daily',
    timezone: 'America/New_York',
    notifyOpportunities: true,
    notifyDeadlines: true,
    notifyCompliance: true,
    notifyMarketing: false,
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        loginEmail: profileData.email || '',
        jobTitle: profileData.jobTitle || '',
        phone: profileData.phone || '',
        bio: profileData.bio || '',
        linkedIn: profileData.linkedIn || '',
        role: profileData.role || 'user',
        accountStatus: profileData.accountStatus || 'active',
        createdAt: profileData.createdAt ? String(profileData.createdAt) : null,
        guidancePreference: profileData.guidancePreference || 'detailed',
        reminderPreference: profileData.reminderPreference || 'daily',
        timezone: profileData.timezone || 'America/New_York',
        notifyOpportunities: profileData.notifyOpportunities !== false,
        notifyDeadlines: profileData.notifyDeadlines !== false,
        notifyCompliance: profileData.notifyCompliance !== false,
        notifyMarketing: profileData.notifyMarketing === true,
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        loginEmail: user.email || '',
        role: user.role || 'user',
      }));
    }
  }, [profileData, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSelf.mutateAsync({
        name: formData.name,
        jobTitle: formData.jobTitle,
        phone: formData.phone,
        bio: formData.bio,
        linkedIn: formData.linkedIn,
        guidancePreference: formData.guidancePreference as 'minimal' | 'standard' | 'detailed',
        reminderPreference: formData.reminderPreference as 'never' | 'weekly' | 'daily' | 'realtime',
        timezone: formData.timezone,
        notifyOpportunities: formData.notifyOpportunities,
        notifyDeadlines: formData.notifyDeadlines,
        notifyCompliance: formData.notifyCompliance,
        notifyMarketing: formData.notifyMarketing,
      });
      await refetch();
      toast.success('Profile saved successfully!');
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = formData.name
    ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : formData.loginEmail?.[0]?.toUpperCase() || 'U';

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ] as const;

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

  return (
    <PageLayout
      title="Account Settings"
      subtitle="Manage your personal information, preferences, and notifications"
      label="ACCOUNT"
      actions={
        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-lg p-6 sticky top-4">
            {/* Avatar */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold shadow-md">
                {initials}
              </div>
              <h2 className="text-base font-semibold text-slate-900">{formData.name || 'Your Name'}</h2>
              <p className="text-sm text-slate-500">{formData.jobTitle || 'No title set'}</p>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                  formData.accountStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  <CheckCircle2 className="h-3 w-3" />
                  {formData.accountStatus === 'active' ? 'Active' : formData.accountStatus}
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 capitalize">
                  {formData.role}
                </span>
              </div>
            </div>

            {/* Quick info */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-600 break-all">{formData.loginEmail}</span>
              </div>
              {formData.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-600">{formData.phone}</span>
                </div>
              )}
              {formData.createdAt && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-500 text-xs">
                    Member since {new Date(formData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>

            {/* Tab navigation */}
            <nav className="mt-6 space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ── RIGHT CONTENT ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">

          {/* ── PERSONAL INFO TAB ──────────────────────────────────────────── */}
          {activeTab === 'personal' && (
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">This name appears across proposals, contracts, and correspondence.</p>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="loginEmail">Login Email</Label>
                  <div className="relative mt-2">
                    <Input
                      id="loginEmail"
                      name="loginEmail"
                      type="email"
                      value={formData.loginEmail}
                      disabled
                      className="pr-10 bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                    <Mail className="h-4 w-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Email address cannot be changed here. Contact support if needed.</p>
                </div>

                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <div className="relative mt-2">
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="e.g., Program Manager"
                    />
                    <Briefcase className="h-4 w-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative mt-2">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                    />
                    <Phone className="h-4 w-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="linkedIn">LinkedIn Profile URL</Label>
                  <div className="relative mt-2">
                    <Input
                      id="linkedIn"
                      name="linkedIn"
                      value={formData.linkedIn}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/yourname"
                    />
                    <Globe className="h-4 w-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Brief professional background relevant to government contracting..."
                    rows={4}
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">Used in proposals and teaming documents.</p>
                </div>

                {/* Role (read-only) */}
                <div>
                  <Label>Your Role</Label>
                  <div className="mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 capitalize">
                    {formData.role === 'admin' ? 'Admin (Workspace Owner)' : formData.role === 'viewer' ? 'Read-Only Viewer' : 'Standard User'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Contact your workspace owner to change your role.</p>
                </div>

                <div>
                  <Label>Account Status</Label>
                  <div className={`mt-2 px-3 py-2 border rounded-lg text-sm flex items-center gap-2 ${
                    formData.accountStatus === 'active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    {formData.accountStatus === 'active' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <span className="capitalize">{formData.accountStatus}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}

          {/* ── PREFERENCES TAB ────────────────────────────────────────────── */}
          {activeTab === 'preferences' && (
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Platform Preferences
              </h2>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="guidancePreference">AI Guidance Level</Label>
                  <select
                    id="guidancePreference"
                    name="guidancePreference"
                    value={formData.guidancePreference}
                    onChange={handleInputChange}
                    className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="minimal">Minimal — Only critical alerts</option>
                    <option value="standard">Standard — Recommended guidance</option>
                    <option value="detailed">Detailed — Full AI assistance</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Controls how much AI guidance and suggestions you see throughout the platform.</p>
                </div>

                <div>
                  <Label htmlFor="reminderPreference">Reminder Frequency</Label>
                  <select
                    id="reminderPreference"
                    name="reminderPreference"
                    value={formData.reminderPreference}
                    onChange={handleInputChange}
                    className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="never">Never</option>
                    <option value="weekly">Weekly Digest</option>
                    <option value="daily">Daily Summary</option>
                    <option value="realtime">Real-time</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">How often you receive reminder notifications about deadlines and tasks.</p>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Anchorage">Alaska Time (AKT)</option>
                    <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Used for deadline calculations and notification scheduling.</p>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ──────────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Notification Settings
              </h2>
              <p className="text-sm text-slate-500 mb-6">Choose which notifications you receive. Changes are saved to your profile.</p>

              <div className="space-y-4">
                <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="notifyOpportunities"
                    checked={formData.notifyOpportunities}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 mt-0.5 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">New Opportunity Alerts</p>
                    <p className="text-xs text-slate-500">Notifications when new matching opportunities are found on SAM.gov</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="notifyDeadlines"
                    checked={formData.notifyDeadlines}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 mt-0.5 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Proposal & Contract Deadline Reminders</p>
                    <p className="text-xs text-slate-500">Alerts before proposal due dates, SAM expiration, and contract milestones</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="notifyCompliance"
                    checked={formData.notifyCompliance}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 mt-0.5 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Compliance & AI Alerts</p>
                    <p className="text-xs text-slate-500">Notifications about compliance issues, AI findings, and required actions</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="notifyMarketing"
                    checked={formData.notifyMarketing}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 mt-0.5 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Product Updates & Tips</p>
                    <p className="text-xs text-slate-500">Occasional emails about new features, tips, and platform improvements</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Notifications'}
                </Button>
              </div>
            </div>
          )}

          {/* ── SECURITY TAB ───────────────────────────────────────────────── */}
          {activeTab === 'security' && (
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Security
              </h2>

              <div className="space-y-6">
                {/* Account info */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Account Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Login Email</span>
                      <span className="text-slate-900 font-medium">{formData.loginEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Status</span>
                      <span className={`font-medium capitalize ${formData.accountStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {formData.accountStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Role</span>
                      <span className="text-slate-900 font-medium capitalize">{formData.role}</span>
                    </div>
                    {formData.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Member Since</span>
                        <span className="text-slate-900">
                          {new Date(formData.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-700 mb-1">Password</h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Password management is handled through the authentication provider. Use the link below to reset your password.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://manus.im/settings', '_blank')}
                  >
                    Reset Password via Auth Provider
                  </Button>
                </div>

                {/* Active sessions info */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-700 mb-1">Session Security</h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Your session is secured with JWT tokens. Sessions expire automatically after inactivity.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Current session is active and secure</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
