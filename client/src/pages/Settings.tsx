import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon, Bell, Lock, Users, CreditCard, ChevronRight, Save, Zap, Eye, EyeOff
} from 'lucide-react';

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
    { id: 'ai', label: 'AI Configuration', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <PageLayout
      title="Settings"
      subtitle="Manage workspace settings, preferences, and integrations"
      label="Configuration"
    >
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

            {/* AI Configuration */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">AI Configuration</h2>
                  <p className="text-sm text-slate-600 mb-6">
                    Configure your OpenAI API key to enable AI-powered features like proposal review, compliance analysis, and intelligent recommendations.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center gap-3 mb-4">
                        <input type="checkbox" checked={aiEnabled} onChange={e => setAiEnabled(e.target.checked)} className="w-4 h-4 rounded" />
                        <span className="font-medium text-slate-900">Enable AI Features</span>
                      </label>
                    </div>

                    {aiEnabled && (
                      <div>
                        <Label htmlFor="openaiKey">OpenAI API Key</Label>
                        <div className="mt-2 flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id="openaiKey"
                              type={showApiKey ? 'text' : 'password'}
                              value={openaiApiKey}
                              onChange={e => setOpenaiApiKey(e.target.value)}
                              placeholder="sk-..."
                            />
                          </div>
                          <Button variant="outline" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Your API key is stored encrypted and only used server-side for AI features.
                        </p>
                      </div>
                    )}

                    {!aiEnabled && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                          <strong>AI Disabled:</strong> AI-powered features like proposal review, compliance analysis, and intelligent recommendations are currently disabled. Enable AI and provide an API key to activate these features.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {aiEnabled && (
                  <div className="bg-white border border-slate-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">AI Features Status</h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">Proposal Review</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${openaiApiKey ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                          {openaiApiKey ? 'Enabled' : 'Needs API Key'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">Compliance Analysis</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${openaiApiKey ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                          {openaiApiKey ? 'Enabled' : 'Needs API Key'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">Smart Recommendations</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${openaiApiKey ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                          {openaiApiKey ? 'Enabled' : 'Needs API Key'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
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
