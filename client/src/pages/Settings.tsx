import { useState } from 'react';
import { useLocation } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Settings as SettingsIcon,
  Bell,
  Lock,
  Users,
  CreditCard,
  ChevronRight,
  Save,
} from 'lucide-react';

export default function Settings() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <PageLayout
      title="Settings"
      subtitle="Manage workspace settings, preferences, and integrations"
      label="Configuration"
      summaryCards={[
        { label: "Team Members", value: 2 },
        { label: "Active Integrations", value: 0, color: "text-blue-600" },
        { label: "Security Score", value: "Good", color: "text-green-600" },
        { label: "Plan", value: "Growth", color: "text-purple-600" },
      ]}
    >

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Tab Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-lg p-4 sticky top-8">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                      {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-3">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-6">Workspace Settings</h2>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="workspaceName">Workspace Name</Label>
                      <Input
                        id="workspaceName"
                        defaultValue="Acme Government Solutions"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="workspaceUrl">Workspace URL</Label>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-slate-600">primecontractor.manus.space/</span>
                        <Input
                          id="workspaceUrl"
                          defaultValue="acme-solutions"
                          disabled
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Cannot be changed after creation</p>
                    </div>

                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <select
                        id="timezone"
                        defaultValue="EST"
                        className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="PST">Pacific (PST)</option>
                        <option value="MST">Mountain (MST)</option>
                        <option value="CST">Central (CST)</option>
                        <option value="EST">Eastern (EST)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-6">Guidance Preferences</h2>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      <span className="text-slate-700">Enable AI-powered recommendations</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      <span className="text-slate-700">Show compliance alerts</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      <span className="text-slate-700">Show workflow suggestions</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Notification Preferences</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-slate-900 mb-3">Opportunities</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                        <span className="text-slate-700">New opportunities matching your criteria</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                        <span className="text-slate-700">Opportunity deadline reminders</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-medium text-slate-900 mb-3">Proposals</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                        <span className="text-slate-700">Proposal submission reminders</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                        <span className="text-slate-700">Proposal feedback from team</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-medium text-slate-900 mb-3">Contracts</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                        <span className="text-slate-700">Contract compliance alerts</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                        <span className="text-slate-700">Upcoming deliverable reminders</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-medium text-slate-900 mb-3">System</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                        <span className="text-slate-700">Account updates and announcements</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 rounded" />
                        <span className="text-slate-700">Marketing and product updates</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Management */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Invite Team Member
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">John Smith</p>
                        <p className="text-sm text-slate-600">john.smith@acmegov.com</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        Admin
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">Sarah Johnson</p>
                        <p className="text-sm text-slate-600">sarah.johnson@acmegov.com</p>
                      </div>
                      <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm font-medium">
                        User
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Role Permissions</h2>
                  <p className="text-slate-600 text-sm mb-4">
                    Admin can manage all workspace features. Users can create and edit records. Viewers can only read.
                  </p>
                  <Button variant="outline">View Detailed Permissions</Button>
                </div>
              </div>
            )}

            {/* Billing */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-6">Billing Information</h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-slate-900 mb-1">Current Plan</p>
                      <p className="text-lg font-semibold text-blue-600">Growth Plan</p>
                      <p className="text-xs text-slate-600 mt-1">$299/month • Renews on June 1, 2026</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-900 mb-2">Payment Method</p>
                      <p className="text-slate-700">Visa ending in 4242</p>
                      <Button variant="outline" className="mt-3">
                        Update Payment Method
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Billing Actions</h2>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      View Invoices
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Change Plan
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600">
                      Cancel Subscription
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex gap-3 justify-end mt-8">
              <Button variant="outline" onClick={() => navigate('/app/dashboard')}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
    </PageLayout>
  );
}
