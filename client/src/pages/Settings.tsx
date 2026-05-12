import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon, Bell, Lock, Users, CreditCard, ChevronRight, Save, Zap, Eye, EyeOff, Download
} from 'lucide-react';
import PageGuide from "@/components/PageGuide";

export default function Settings() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKey, setShowApiKey] = useState(false);

  // Fetch workspace settings from DB
  const { data: settingsMap, isLoading } = trpc.settings.getAll.useQuery();
  const setSetting = trpc.settings.set.useMutation();
  const utils = trpc.useUtils();

  // Local form state
  const [workspaceName, setWorkspaceName] = useState('');
  const [timezone, setTimezone] = useState('EST');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [enableRecommendations, setEnableRecommendations] = useState(true);
  const [enableComplianceAlerts, setEnableComplianceAlerts] = useState(true);
  const [enableWorkflowSuggestions, setEnableWorkflowSuggestions] = useState(true);

  // Populate form when data loads
  useEffect(() => {
    if (settingsMap) {
      setWorkspaceName(settingsMap.workspaceName || '');
      setTimezone(settingsMap.timezone || 'EST');
      setAiEnabled(settingsMap.aiEnabled === 'true');
      setOpenaiApiKey(settingsMap.openaiApiKey || '');
      setEnableRecommendations(settingsMap.enableRecommendations !== 'false');
      setEnableComplianceAlerts(settingsMap.enableComplianceAlerts !== 'false');
      setEnableWorkflowSuggestions(settingsMap.enableWorkflowSuggestions !== 'false');
    }
  }, [settingsMap]);

  const handleSave = async () => {
    const entries: [string, string][] = [
      ['workspaceName', workspaceName],
      ['timezone', timezone],
      ['aiEnabled', String(aiEnabled)],
      ['openaiApiKey', openaiApiKey],
      ['enableRecommendations', String(enableRecommendations)],
      ['enableComplianceAlerts', String(enableComplianceAlerts)],
      ['enableWorkflowSuggestions', String(enableWorkflowSuggestions)],
    ];
    try {
      for (const [key, value] of entries) {
        await setSetting.mutateAsync({ key, value });
      }
      utils.settings.getAll.invalidate();
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'ai', label: 'AI Features', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'export', label: 'Export Data', icon: Download },
  ];

  return (
    <PageLayout
      title="Settings"
      subtitle="Manage workspace settings, preferences, and integrations"
      label="Configuration"
    >
      <PageGuide
        title="Workspace Settings"
        description="Configure your workspace preferences, notifications, and integrations."
        whenToUse="When adjusting workspace configuration, notification preferences, or team settings."
        whatToDoNext={["Review notification preferences", "Configure workspace defaults", "Check integration settings", "Update workspace branding"]}
        relatedRecords={[{ label: "Business Profile", path: "/app/business-profile" }, { label: "Users", path: "/app/users" }, { label: "Plan Features", path: "/app/plan-features" }]}
      />
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading settings...</div>
      ) : (
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
                        activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
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
                      <Input id="workspaceName" value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <select id="timezone" value={timezone} onChange={e => setTimezone(e.target.value)}
                        className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                      <input type="checkbox" checked={enableRecommendations} onChange={e => setEnableRecommendations(e.target.checked)} className="w-4 h-4 rounded" />
                      <span className="text-slate-700">Enable AI-powered recommendations</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={enableComplianceAlerts} onChange={e => setEnableComplianceAlerts(e.target.checked)} className="w-4 h-4 rounded" />
                      <span className="text-slate-700">Show compliance alerts</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={enableWorkflowSuggestions} onChange={e => setEnableWorkflowSuggestions(e.target.checked)} className="w-4 h-4 rounded" />
                      <span className="text-slate-700">Show workflow suggestions</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* AI Features */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">AI Features</h2>
                  <p className="text-sm text-slate-600 mb-6">
                    AI-powered features are managed at the platform level and are always available to your workspace — no API key required.
                  </p>
                  <div className="space-y-3">
                    {[
                      { label: 'Proposal Review', desc: 'AI-assisted proposal scoring and gap analysis' },
                      { label: 'Compliance Analysis', desc: 'Automated compliance checks against contract requirements' },
                      { label: 'Smart Recommendations', desc: 'Opportunity matching and next-step guidance' },
                    ].map(({ label, desc }) => (
                      <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 shrink-0 ml-3">Active</span>
                      </div>
                    ))}
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
                </div>
              </div>
            )}

            {/* Team Management */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => toast.info('Team invitations coming soon')}>
                      Invite Team Member
                    </Button>
                  </div>
                  <p className="text-slate-500 italic">Team management will be available in a future update.</p>
                </div>
              </div>
            )}

            {/* Billing */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-6">Billing Information</h2>
                  <p className="text-slate-500 italic">Billing management will be available in a future update.</p>
                </div>
              </div>
            )}

            {/* Export Data */}
            {activeTab === 'export' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-6">Export My Data</h2>
                  <p className="text-slate-600 mb-4">
                    Download your workspace data for backup, compliance, or migration purposes. All exports are scoped to your workspace only.
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h3 className="font-medium text-slate-900 mb-2">Full Data Export</h3>
                      <p className="text-sm text-slate-500 mb-3">
                        Export all your workspace data including contracts, invoices, contacts, files, and more.
                      </p>
                      <Button onClick={() => navigate('/app/export')} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Go to Export Page
                      </Button>
                    </div>
                    <div className="text-xs text-slate-400">
                      Exports are generated in real-time from your current data. Available formats: CSV (spreadsheet) and JSON (developer).
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex gap-3 justify-end mt-8">
              <Button variant="outline" onClick={() => navigate('/app/dashboard')}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={setSetting.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {setSetting.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
