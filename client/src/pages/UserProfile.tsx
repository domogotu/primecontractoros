import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Bell,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function UserProfile() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { data: settingsMap } = trpc.settings.getAll.useQuery();
  const setSetting = trpc.settings.set.useMutation();
  const utils = trpc.useUtils();
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    loginEmail: '',
    jobTitle: '',
    phone: '',
    role: 'user',
    guidancePreference: 'detailed',
    reminderPreference: 'daily',
  });

  useEffect(() => {
    if (settingsMap || user) {
      setFormData({
        fullName: settingsMap?.['up.fullName'] || user?.name || '',
        loginEmail: user?.email || '',
        jobTitle: settingsMap?.['up.jobTitle'] || '',
        phone: settingsMap?.['up.phone'] || '',
        role: user?.role || 'user',
        guidancePreference: settingsMap?.['up.guidancePreference'] || 'detailed',
        reminderPreference: settingsMap?.['up.reminderPreference'] || 'daily',
      });
    }
  }, [settingsMap, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const entries: [string, string][] = [
        ['up.fullName', formData.fullName],
        ['up.jobTitle', formData.jobTitle],
        ['up.phone', formData.phone],
        ['up.guidancePreference', formData.guidancePreference],
        ['up.reminderPreference', formData.reminderPreference],
      ];
      for (const [key, value] of entries) {
        await setSetting.mutateAsync({ key, value });
      }
      utils.settings.getAll.invalidate();
      toast.success('Profile saved successfully!');
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout title="User Profile" subtitle="Manage your personal account settings" label="Account">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="text-blue-600 hover:text-blue-700 mb-4 text-sm"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Profile</h1>
          <p className="text-slate-600">Manage your personal information and preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Quick Info */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">{formData.fullName}</h2>
                <p className="text-sm text-slate-600">{formData.jobTitle}</p>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-200">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Email</p>
                  <p className="text-sm text-slate-900 break-all">{formData.loginEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Phone</p>
                  <p className="text-sm text-slate-900">{formData.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Role</p>
                  <p className="text-sm text-slate-900 capitalize">{formData.role}</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-6"
                onClick={() => alert('Password change functionality coming soon')}
              >
                Change Password
              </Button>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </h2>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="loginEmail">Login Email</Label>
                  <div className="relative mt-2">
                    <Input
                      id="loginEmail"
                      name="loginEmail"
                      type="email"
                      value={formData.loginEmail}
                      onChange={handleInputChange}
                      disabled
                      className="pr-10"
                    />
                    <Mail className="w-5 h-5 text-slate-400 absolute right-3 top-2.5" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed here. Contact support to update.</p>
                </div>

                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative mt-2">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pr-10"
                    />
                    <Phone className="w-5 h-5 text-slate-400 absolute right-3 top-2.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Role & Permissions Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Role & Permissions
              </h2>

              <div>
                <Label htmlFor="role">Your Role</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                >
                  <option value="admin">Admin (Workspace Owner)</option>
                  <option value="user">Standard User</option>
                  <option value="viewer">Read-Only Viewer</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Role cannot be changed here. Contact workspace owner to update.</p>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Preferences
              </h2>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="guidancePreference">AI Guidance Level</Label>
                  <select
                    id="guidancePreference"
                    name="guidancePreference"
                    value={formData.guidancePreference}
                    onChange={handleInputChange}
                    className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="minimal">Minimal - Only critical alerts</option>
                    <option value="standard">Standard - Recommended guidance</option>
                    <option value="detailed">Detailed - Full AI assistance</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">How much AI guidance you want to see</p>
                </div>

                <div>
                  <Label htmlFor="reminderPreference">Reminder Frequency</Label>
                  <select
                    id="reminderPreference"
                    name="reminderPreference"
                    value={formData.reminderPreference}
                    onChange={handleInputChange}
                    className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="never">Never</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                    <option value="realtime">Real-time</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">How often you want to receive reminders</p>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Notification Settings</h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-slate-700">Email notifications for new opportunities</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-slate-700">Proposal deadline reminders</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-slate-700">Contract compliance alerts</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-slate-700">Marketing and product updates</span>
                </label>
              </div>
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
      </div>
    </PageLayout>
  );
}
