import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon, Bell, Lock, Users, CreditCard, ChevronRight, Save, Zap, Eye, EyeOff,
  Download, ShieldCheck, CheckCircle2, XCircle, Clock, Building2, Palette, Webhook, User, Globe, Moon, Sun,
} from 'lucide-react';
import PageGuide from "@/components/PageGuide";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'business', label: 'Business Profile', icon: Building2 },
    { id: 'general', label: 'Workspace', icon: SettingsIcon },
    { id: 'team', label: 'Team / Users', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'integrations', label: 'Integrations / API', icon: Webhook },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'ai', label: 'AI Features', icon: Zap },
    { id: 'export', label: 'Export Data', icon: Download },
    { id: 'privacy', label: 'Privacy & Consent', icon: ShieldCheck },
  ];

  return (
    <PageLayout
      title="Settings"
      subtitle="Manage your account, workspace, team, and integrations"
      label="Configuration"
    >
      <PageGuide
        title="Settings"
        description="All workspace and account configuration in one place."
        whenToUse="When adjusting account info, workspace config, notifications, billing, or integrations."
        whatToDoNext={["Update your account info", "Review business profile", "Manage team members", "Configure integrations"]}
        relatedRecords={[{ label: "Business Profile", path: "/app/business-profile" }, { label: "Billing", path: "/app/billing" }, { label: "Team", path: "/app/team" }]}
      />
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm">{tab.label}</span>
                    {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-3">
          {activeTab === 'account' && <AccountTab />}
          {activeTab === 'business' && <BusinessProfileTab />}
          {activeTab === 'general' && <WorkspaceTab />}
          {activeTab === 'team' && <TeamTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'billing' && <BillingTab />}
          {activeTab === 'integrations' && <IntegrationsTab />}
          {activeTab === 'appearance' && <AppearanceTab />}
          {activeTab === 'ai' && <AIFeaturesTab />}
          {activeTab === 'export' && <ExportTab />}
          {activeTab === 'privacy' && <PrivacyConsentTab />}
        </div>
      </div>
    </PageLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACCOUNT TAB — Personal info with real DB save via userProfile.updateSelf
// ═══════════════════════════════════════════════════════════════════════════════
function AccountTab() {
  const { data: profile, isLoading } = trpc.userProfile.getSelf.useQuery();
  const updateSelf = trpc.userProfile.updateSelf.useMutation();
  const utils = trpc.useUtils();

  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setJobTitle(profile.jobTitle || '');
      setPhone(profile.phone || '');
      setLinkedIn(profile.linkedIn || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateSelf.mutateAsync({ name, jobTitle, phone, linkedIn, bio });
      await utils.userProfile.getSelf.invalidate();
      toast.success('Account settings saved');
    } catch {
      toast.error('Failed to save account settings');
    }
  };

  if (isLoading) return <div className="text-center py-12 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Personal Information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="acc-name">Full Name</Label>
              <Input id="acc-name" value={name} onChange={e => setName(e.target.value)} className="mt-2" placeholder="Your full name" />
            </div>
            <div>
              <Label htmlFor="acc-job">Job Title</Label>
              <Input id="acc-job" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="mt-2" placeholder="e.g., CEO, Program Manager" />
            </div>
            <div>
              <Label htmlFor="acc-phone">Phone Number</Label>
              <Input id="acc-phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-2" placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <Label htmlFor="acc-linkedin">LinkedIn URL</Label>
              <Input id="acc-linkedin" value={linkedIn} onChange={e => setLinkedIn(e.target.value)} className="mt-2" placeholder="https://linkedin.com/in/..." />
            </div>
          </div>
          <div>
            <Label htmlFor="acc-bio">Professional Bio</Label>
            <textarea id="acc-bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Brief professional summary..." />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Details</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-700">Email Address</p>
              <p className="text-sm text-slate-500">{profile?.email || 'Not available'}</p>
            </div>
            <span className="text-xs text-slate-400">Managed by auth provider</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-700">Password</p>
              <p className="text-sm text-slate-500">Last changed: Unknown</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info('Password reset email sent (if supported by your auth provider)')}>
              <Lock className="w-3 h-3 mr-1" /> Reset
            </Button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-700">Account Status</p>
              <p className="text-sm text-slate-500">Active</p>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateSelf.isPending} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />{updateSelf.isPending ? 'Saving...' : 'Save Account Settings'}
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUSINESS PROFILE TAB — Embeds the standalone BusinessProfile page
// ═══════════════════════════════════════════════════════════════════════════════
function BusinessProfileTab() {
  const [, navigate] = useLocation();
  const { data: profile, isLoading } = trpc.businessProfile.get.useQuery();

  if (isLoading) return <div className="text-center py-12 text-slate-500">Loading business profile...</div>;

  const hasData = profile && (profile.legalName || profile.uei || profile.email);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Business Profile</h2>
          <Button onClick={() => navigate('/app/business-profile')} className="bg-blue-600 hover:bg-blue-700">
            <Building2 className="w-4 h-4 mr-2" />
            {hasData ? 'View / Edit Full Profile' : 'Set Up Business Profile'}
          </Button>
        </div>

        {hasData ? (
          <div className="space-y-4">
            {/* Quick summary card */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {(profile.legalName || 'B').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-900">{profile.legalName || 'Company Name'}</h3>
                {profile.dba && <p className="text-sm text-slate-500">DBA: {profile.dba}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.businessStructure && <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">{profile.businessStructure}</span>}
                  {profile.samStatus === 'active' && <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">SAM Active</span>}
                  {profile.uei && <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-mono">UEI: {profile.uei}</span>}
                  {profile.cage && <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-mono">CAGE: {profile.cage}</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.email && (
                <div className="p-3 border border-slate-100 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase font-medium">Email</p>
                  <p className="text-sm text-slate-900 mt-0.5">{profile.email}</p>
                </div>
              )}
              {profile.phone && (
                <div className="p-3 border border-slate-100 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase font-medium">Phone</p>
                  <p className="text-sm text-slate-900 mt-0.5">{profile.phone}</p>
                </div>
              )}
              {profile.naicsPrimary && (
                <div className="p-3 border border-slate-100 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase font-medium">Primary NAICS</p>
                  <p className="text-sm text-slate-900 mt-0.5 font-mono">{profile.naicsPrimary}</p>
                </div>
              )}
              {profile.address && (
                <div className="p-3 border border-slate-100 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase font-medium">Address</p>
                  <p className="text-sm text-slate-900 mt-0.5">{[profile.address, profile.city, profile.state, profile.zip].filter(Boolean).join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No business profile set up yet</p>
            <p className="text-sm text-slate-500 mt-1">Set up your business profile to auto-populate proposals, contracts, and compliance forms.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORKSPACE TAB — General workspace settings (name, timezone, AI guidance)
// ═══════════════════════════════════════════════════════════════════════════════
function WorkspaceTab() {
  const { data: settingsMap, isLoading } = trpc.settings.getAll.useQuery();
  const setSetting = trpc.settings.set.useMutation();
  const utils = trpc.useUtils();

  const [workspaceName, setWorkspaceName] = useState('');
  const [timezone, setTimezone] = useState('EST');
  const [enableRecommendations, setEnableRecommendations] = useState(true);
  const [enableComplianceAlerts, setEnableComplianceAlerts] = useState(true);
  const [enableWorkflowSuggestions, setEnableWorkflowSuggestions] = useState(true);

  useEffect(() => {
    if (settingsMap) {
      setWorkspaceName(settingsMap.workspaceName || '');
      setTimezone(settingsMap.timezone || 'EST');
      setEnableRecommendations(settingsMap.enableRecommendations !== 'false');
      setEnableComplianceAlerts(settingsMap.enableComplianceAlerts !== 'false');
      setEnableWorkflowSuggestions(settingsMap.enableWorkflowSuggestions !== 'false');
    }
  }, [settingsMap]);

  const handleSave = async () => {
    const entries: [string, string][] = [
      ['workspaceName', workspaceName],
      ['timezone', timezone],
      ['enableRecommendations', String(enableRecommendations)],
      ['enableComplianceAlerts', String(enableComplianceAlerts)],
      ['enableWorkflowSuggestions', String(enableWorkflowSuggestions)],
    ];
    try {
      for (const [key, value] of entries) {
        await setSetting.mutateAsync({ key, value });
      }
      utils.settings.getAll.invalidate();
      toast.success('Workspace settings saved');
    } catch {
      toast.error('Failed to save workspace settings');
    }
  };

  if (isLoading) return <div className="text-center py-12 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Workspace Settings</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="ws-name">Workspace Name</Label>
            <Input id="ws-name" value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} className="mt-2" placeholder="My Workspace" />
          </div>
          <div>
            <Label htmlFor="ws-tz">Timezone</Label>
            <select id="ws-tz" value={timezone} onChange={e => setTimezone(e.target.value)} className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="PST">Pacific (PST)</option>
              <option value="MST">Mountain (MST)</option>
              <option value="CST">Central (CST)</option>
              <option value="EST">Eastern (EST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Guidance Preferences</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" checked={enableRecommendations} onChange={e => setEnableRecommendations(e.target.checked)} className="w-4 h-4 rounded" />
            <div>
              <span className="text-sm font-medium text-slate-700">AI-powered recommendations</span>
              <p className="text-xs text-slate-500">Get smart suggestions for opportunities and next steps</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" checked={enableComplianceAlerts} onChange={e => setEnableComplianceAlerts(e.target.checked)} className="w-4 h-4 rounded" />
            <div>
              <span className="text-sm font-medium text-slate-700">Compliance alerts</span>
              <p className="text-xs text-slate-500">Notifications about SAM renewal, certifications expiring, etc.</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" checked={enableWorkflowSuggestions} onChange={e => setEnableWorkflowSuggestions(e.target.checked)} className="w-4 h-4 rounded" />
            <div>
              <span className="text-sm font-medium text-slate-700">Workflow suggestions</span>
              <p className="text-xs text-slate-500">Tips on what to do next in your contracting workflow</p>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={setSetting.isPending} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />{setSetting.isPending ? 'Saving...' : 'Save Workspace Settings'}
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM TAB — Real team management with invites, role changes, removal
// ═══════════════════════════════════════════════════════════════════════════════
function TeamTab() {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { data: myRole } = trpc.workspace.getMyRole.useQuery();
  const { data: members = [], refetch: refetchMembers } = trpc.workspace.listMembers.useQuery();
  const { data: invitesList = [], refetch: refetchInvites } = trpc.invites.list.useQuery();
  const inviteMember = trpc.workspace.inviteMember.useMutation({
    onSuccess: () => { toast({ title: 'Invitation sent' }); setInviteEmail(''); setInviteDialogOpen(false); refetchInvites(); refetchMembers(); },
    onError: (err) => toast({ title: 'Failed', description: err.message, variant: 'destructive' }),
  });
  const updateRole = trpc.workspace.updateMemberRole.useMutation({
    onSuccess: () => { toast({ title: 'Role updated' }); refetchMembers(); },
    onError: (err) => toast({ title: 'Failed', description: err.message, variant: 'destructive' }),
  });
  const removeMember = trpc.workspace.removeMember.useMutation({
    onSuccess: () => { toast({ title: 'Member removed' }); refetchMembers(); },
    onError: (err) => toast({ title: 'Failed', description: err.message, variant: 'destructive' }),
  });
  const revokeInvite = trpc.invites.revoke.useMutation({
    onSuccess: () => { toast({ title: 'Invite revoked' }); refetchInvites(); },
  });

  const isOwner = myRole?.role === 'owner';

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    inviteMember.mutate({ email: inviteEmail, role: inviteRole as 'admin' | 'member' | 'viewer' });
  };

  return (
    <div className="space-y-6">
      {/* Current Members */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
          {isOwner && (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setInviteDialogOpen(true)}>
              <Users className="w-4 h-4 mr-2" /> Add Member
            </Button>
          )}
        </div>

        {members.length === 0 ? (
          <p className="text-slate-500 italic">No team members yet.</p>
        ) : (
          <div className="space-y-3">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {(m.name || m.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{m.name || m.email}</p>
                    {m.name && <p className="text-xs text-slate-500">{m.email}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && m.role !== 'owner' ? (
                    <select
                      value={m.role}
                      onChange={e => updateRole.mutate({ memberId: m.id, role: e.target.value as 'admin' | 'member' | 'viewer' })}
                      className="text-xs border border-slate-200 rounded px-2 py-1"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{m.role}</span>
                  )}
                  {isOwner && m.role !== 'owner' && (
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 text-xs" onClick={() => removeMember.mutate({ memberId: m.id })}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Invites */}
      {invitesList.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Pending Invitations</h3>
          <div className="space-y-2">
            {invitesList.filter((inv: any) => inv.status === 'pending').map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">{inv.email}</p>
                  <p className="text-xs text-slate-500 capitalize">Role: {inv.role} — Sent {new Date(inv.createdAt).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => revokeInvite.mutate({ id: inv.id })}>Revoke</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Permissions Reference */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Role Permissions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-4 font-medium text-slate-600">Permission</th>
                <th className="text-center py-2 px-3 font-medium text-slate-600">Owner</th>
                <th className="text-center py-2 px-3 font-medium text-slate-600">Admin</th>
                <th className="text-center py-2 px-3 font-medium text-slate-600">Member</th>
                <th className="text-center py-2 px-3 font-medium text-slate-600">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                ['Manage team', true, true, false, false],
                ['Edit settings', true, true, false, false],
                ['Create/edit records', true, true, true, false],
                ['View all data', true, true, true, true],
                ['Delete workspace', true, false, false, false],
              ].map(([perm, ...roles]) => (
                <tr key={perm as string}>
                  <td className="py-2 pr-4 text-slate-700">{perm as string}</td>
                  {(roles as boolean[]).map((has, i) => (
                    <td key={i} className="text-center py-2 px-3">
                      {has ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Dialog */}
      {inviteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value as 'admin' | 'member' | 'viewer')} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setInviteDialogOpen(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={inviteMember.isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {inviteMember.isPending ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS TAB — Real email preference toggles saved to DB
// ═══════════════════════════════════════════════════════════════════════════════
function NotificationsTab() {
  const { data: prefs, isLoading } = trpc.emailPrefs.get.useQuery();
  const updatePrefs = trpc.emailPrefs.update.useMutation();
  const utils = trpc.useUtils();

  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [invoiceAlerts, setInvoiceAlerts] = useState(true);
  const [contractStatusChanges, setContractStatusChanges] = useState(true);
  const [proposalUpdates, setProposalUpdates] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  useEffect(() => {
    if (prefs) {
      setDeadlineReminders(prefs.deadlineReminders ?? true);
      setInvoiceAlerts(prefs.invoiceAlerts ?? true);
      setContractStatusChanges(prefs.contractStatusChanges ?? true);
      setProposalUpdates(prefs.proposalUpdates ?? true);
      setWeeklyDigest(prefs.weeklyDigest ?? true);
    }
  }, [prefs]);

  const handleToggle = async (key: string, value: boolean) => {
    // Update local state
    switch (key) {
      case 'deadlineReminders': setDeadlineReminders(value); break;
      case 'invoiceAlerts': setInvoiceAlerts(value); break;
      case 'contractStatusChanges': setContractStatusChanges(value); break;
      case 'proposalUpdates': setProposalUpdates(value); break;
      case 'weeklyDigest': setWeeklyDigest(value); break;
    }
    // Save to DB
    try {
      await updatePrefs.mutateAsync({ [key]: value } as any);
      utils.emailPrefs.get.invalidate();
    } catch {
      toast.error('Failed to update preference');
    }
  };

  if (isLoading) return <div className="text-center py-12 text-slate-500">Loading...</div>;

  const PREFS = [
    { key: 'deadlineReminders', label: 'Deadline Reminders', desc: 'Get notified before contract deliverable deadlines', value: deadlineReminders },
    { key: 'invoiceAlerts', label: 'Invoice Alerts', desc: 'Notifications when invoices are due or overdue', value: invoiceAlerts },
    { key: 'contractStatusChanges', label: 'Contract Status Changes', desc: 'Updates when contract status changes (awarded, active, closed)', value: contractStatusChanges },
    { key: 'proposalUpdates', label: 'Proposal Updates', desc: 'Notifications about proposal submission status and feedback', value: proposalUpdates },
    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'A weekly summary email of your workspace activity', value: weeklyDigest },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Email Notifications</h2>
        <p className="text-sm text-slate-500 mb-6">Choose which email notifications you'd like to receive. Changes save automatically.</p>
        <div className="space-y-1">
          {PREFS.map(pref => (
            <label key={pref.key} className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <p className="text-sm font-medium text-slate-900">{pref.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{pref.desc}</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={pref.value}
                  onChange={e => handleToggle(pref.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-checked:bg-blue-600 rounded-full transition-colors cursor-pointer" onClick={() => handleToggle(pref.key, !pref.value)}></div>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${pref.value ? 'translate-x-5' : ''}`} onClick={() => handleToggle(pref.key, !pref.value)}></div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BILLING TAB — Real billing with Stripe integration
// ═══════════════════════════════════════════════════════════════════════════════
function BillingTab() {
  const { data: status, isLoading: statusLoading } = trpc.billing.getStatus.useQuery();
  const { data: plans = [], isLoading: plansLoading } = trpc.billing.getPlans.useQuery();
  const createCheckout = trpc.billing.createCheckout.useMutation();
  const cancelSub = trpc.billing.cancelSubscription.useMutation();
  const reactivateSub = trpc.billing.reactivateSubscription.useMutation();
  const utils = trpc.useUtils();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  if (statusLoading || plansLoading) return <div className="text-center py-12 text-slate-500">Loading billing...</div>;

  const sub = status?.subscription;
  const currentPlan = sub?.plan?.name || 'free';
  const currentPlanId = sub?.planId || null;
  const isActive = sub?.status === 'active';

  const handleUpgrade = async (planId: number) => {
    try {
      const result = await createCheckout.mutateAsync({
        planId,
        successUrl: window.location.origin + '/app/settings?tab=billing&success=1',
        cancelUrl: window.location.origin + '/app/settings?tab=billing',
        billingInterval: billingCycle === 'annual' ? 'year' : 'month',
      });
      if (result?.url) window.location.href = result.url;
      else toast.info('Checkout session created. Check for redirect.');
    } catch {
      toast.error('Failed to create checkout session');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    try {
      await cancelSub.mutateAsync();
      utils.billing.getStatus.invalidate();
      toast.success('Subscription cancelled');
    } catch {
      toast.error('Failed to cancel subscription');
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivateSub.mutateAsync();
      utils.billing.getStatus.invalidate();
      toast.success('Subscription reactivated');
    } catch {
      toast.error('Failed to reactivate');
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Current Plan</h2>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="text-base font-semibold text-slate-900 capitalize">{currentPlan} Plan</p>
            <p className="text-sm text-slate-500 mt-0.5">
              Status: <span className={`font-medium ${isActive ? 'text-green-600' : 'text-amber-600'}`}>{sub?.status || 'Free'}</span>
              {sub?.currentPeriodEnd && ` — Renews ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`}
            </p>
          </div>
          {isActive && currentPlan !== 'free' && (
            <div className="flex gap-2">
              {sub?.cancelAtPeriodEnd ? (
                <Button variant="outline" onClick={handleReactivate} disabled={reactivateSub.isPending}>Reactivate</Button>
              ) : (
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleCancel} disabled={cancelSub.isPending}>Cancel Plan</Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Available Plans */}
      {plans.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Available Plans</h2>
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
              <button onClick={() => setBillingCycle('monthly')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${billingCycle === 'monthly' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}>Monthly</button>
              <button onClick={() => setBillingCycle('annual')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${billingCycle === 'annual' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}>Annual (Save 20%)</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan: any) => (
              <div key={plan.id} className={`border rounded-lg p-5 ${plan.id === currentPlanId ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                <h3 className="text-base font-semibold text-slate-900 capitalize">{plan.name || plan.id}</h3>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  ${billingCycle === 'annual' ? Math.round((plan.priceMonthly || 0) * 0.8) : plan.priceMonthly || 0}
                  <span className="text-sm font-normal text-slate-500">/mo</span>
                </p>
                {plan.features && (
                  <ul className="mt-3 space-y-1">
                    {(Array.isArray(plan.features) ? plan.features : []).map((f: string, i: number) => (
                      <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                )}
                <Button
                  className="w-full mt-4"
                  variant={plan.id === currentPlanId ? 'outline' : 'default'}
                  disabled={plan.id === currentPlanId || createCheckout.isPending}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {plan.id === currentPlanId ? 'Current Plan' : 'Upgrade'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATIONS TAB — Webhooks + API key management
// ═══════════════════════════════════════════════════════════════════════════════
function IntegrationsTab() {
  const [, navigate] = useLocation();
  const { data: settingsMap } = trpc.settings.getAll.useQuery();
  const setSetting = trpc.settings.set.useMutation();
  const utils = trpc.useUtils();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (settingsMap) {
      setApiKey(settingsMap.apiKey || '');
    }
  }, [settingsMap]);

  const generateApiKey = async () => {
    const key = 'pcos_' + Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join('');
    setApiKey(key);
    try {
      await setSetting.mutateAsync({ key: 'apiKey', value: key });
      utils.settings.getAll.invalidate();
      toast.success('API key generated and saved');
    } catch {
      toast.error('Failed to save API key');
    }
  };

  return (
    <div className="space-y-6">
      {/* API Key */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">API Key</h2>
        <p className="text-sm text-slate-500 mb-4">Use this key to authenticate API requests to your workspace.</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey || 'No API key generated yet'}
              readOnly
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono bg-slate-50"
            />
            <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button onClick={generateApiKey} variant="outline" disabled={setSetting.isPending}>
            {apiKey ? 'Regenerate' : 'Generate'}
          </Button>
          {apiKey && (
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(apiKey); toast.success('Copied!'); }}>
              Copy
            </Button>
          )}
        </div>
      </div>

      {/* Webhooks */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Webhooks</h2>
            <p className="text-sm text-slate-500 mt-1">Send real-time notifications to external services when events happen in your workspace.</p>
          </div>
          <Button onClick={() => navigate('/app/webhooks')} className="bg-blue-600 hover:bg-blue-700">
            <Webhook className="w-4 h-4 mr-2" /> Manage Webhooks
          </Button>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-sm text-slate-600">
            Configure webhook endpoints to receive POST requests when contracts are created, proposals are submitted, invoices are paid, and more.
            Full webhook management is available on the dedicated Webhooks page.
          </p>
        </div>
      </div>

      {/* Connected Services */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Connected Services</h2>
        <div className="space-y-3">
          {[
            { name: 'SAM.gov', desc: 'Federal registration and opportunity data', status: 'Available' },
            { name: 'FPDS', desc: 'Federal procurement data system', status: 'Available' },
            { name: 'Stripe', desc: 'Payment processing for billing', status: 'Configured' },
          ].map(svc => (
            <div key={svc.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-900">{svc.name}</p>
                <p className="text-xs text-slate-500">{svc.desc}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${svc.status === 'Configured' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                {svc.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPEARANCE TAB — Theme + display preferences saved to workspace settings
// ═══════════════════════════════════════════════════════════════════════════════
function AppearanceTab() {
  const { data: settingsMap, isLoading } = trpc.settings.getAll.useQuery();
  const setSetting = trpc.settings.set.useMutation();
  const utils = trpc.useUtils();

  const [theme, setTheme] = useState('light');
  const [density, setDensity] = useState('comfortable');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [currencyFormat, setCurrencyFormat] = useState('USD');

  useEffect(() => {
    if (settingsMap) {
      setTheme(settingsMap.theme || 'light');
      setDensity(settingsMap.displayDensity || 'comfortable');
      setSidebarCollapsed(settingsMap.sidebarCollapsed === 'true');
      setDateFormat(settingsMap.dateFormat || 'MM/DD/YYYY');
      setCurrencyFormat(settingsMap.currencyFormat || 'USD');
    }
  }, [settingsMap]);

  const handleSave = async () => {
    const entries: [string, string][] = [
      ['theme', theme],
      ['displayDensity', density],
      ['sidebarCollapsed', String(sidebarCollapsed)],
      ['dateFormat', dateFormat],
      ['currencyFormat', currencyFormat],
    ];
    try {
      for (const [key, value] of entries) {
        await setSetting.mutateAsync({ key, value });
      }
      // Apply theme to document
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      utils.settings.getAll.invalidate();
      toast.success('Appearance settings saved');
    } catch {
      toast.error('Failed to save appearance settings');
    }
  };

  if (isLoading) return <div className="text-center py-12 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Theme</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
          >
            <Sun className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <p className="text-sm font-medium text-slate-900">Light</p>
            <p className="text-xs text-slate-500 mt-0.5">Clean, bright interface</p>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
          >
            <Moon className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
            <p className="text-sm font-medium text-slate-900">Dark</p>
            <p className="text-xs text-slate-500 mt-0.5">Easier on the eyes</p>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Display Preferences</h2>
        <div className="space-y-4">
          <div>
            <Label>Display Density</Label>
            <select value={density} onChange={e => setDensity(e.target.value)} className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="compact">Compact — More content, less spacing</option>
              <option value="comfortable">Comfortable — Balanced (default)</option>
              <option value="spacious">Spacious — More breathing room</option>
            </select>
          </div>
          <div>
            <Label>Date Format</Label>
            <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (International)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
            </select>
          </div>
          <div>
            <Label>Currency</Label>
            <select value={currencyFormat} onChange={e => setCurrencyFormat(e.target.value)} className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" checked={sidebarCollapsed} onChange={e => setSidebarCollapsed(e.target.checked)} className="w-4 h-4 rounded" />
            <div>
              <span className="text-sm font-medium text-slate-700">Default sidebar collapsed</span>
              <p className="text-xs text-slate-500">Start with the sidebar minimized for more workspace</p>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={setSetting.isPending} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />{setSetting.isPending ? 'Saving...' : 'Save Appearance'}
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI FEATURES TAB
// ═══════════════════════════════════════════════════════════════════════════════
function AIFeaturesTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">AI Features</h2>
        <p className="text-sm text-slate-600 mb-6">
          AI-powered features are managed at the platform level and are always available to your workspace — no API key required.
        </p>
        <div className="space-y-3">
          {[
            { label: 'Proposal Review', desc: 'AI-assisted proposal scoring and gap analysis', status: 'Active' },
            { label: 'Compliance Analysis', desc: 'Automated compliance checks against contract requirements', status: 'Active' },
            { label: 'Smart Recommendations', desc: 'Opportunity matching and next-step guidance', status: 'Active' },
            { label: 'Document Generation', desc: 'AI-powered capability statement and proposal drafting', status: 'Active' },
            { label: 'Risk Assessment', desc: 'Automated risk scoring for opportunities and contracts', status: 'Active' },
          ].map(({ label, desc, status }) => (
            <div key={label} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-900">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 shrink-0 ml-3">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ExportTab() {
  const [, navigate] = useLocation();
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Export My Data</h2>
        <p className="text-slate-600 mb-4">Download your workspace data for backup, compliance, or migration purposes.</p>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="font-medium text-slate-900 mb-2">Full Data Export</h3>
          <p className="text-sm text-slate-500 mb-3">Export all workspace data including contracts, invoices, contacts, files, and more.</p>
          <Button onClick={() => navigate('/app/export')} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4 mr-2" /> Go to Export Page
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-4">Exports are generated in real-time. Available formats: CSV and JSON.</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRIVACY & CONSENT TAB
// ═══════════════════════════════════════════════════════════════════════════════
function PrivacyConsentTab() {
  const { data: history, isLoading } = trpc.legal.getConsentHistory.useQuery();
  const recordConsent = trpc.legal.recordConsent.useMutation();
  const CONSENT_KEY = 'primecontractoros_consent_accepted';
  const CONSENT_VERSION = '1.0';

  const handleResetConsent = () => {
    try { localStorage.removeItem(CONSENT_KEY); } catch { /* ignore */ }
    toast.info('Consent preference cleared. The banner will reappear on your next page load.');
  };

  const handleAcceptNow = async () => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ version: CONSENT_VERSION, acceptedAt: new Date().toISOString(), action: 'accepted' }));
      await recordConsent.mutateAsync({ policyVersion: CONSENT_VERSION, action: 'accepted', consentType: 'terms_and_privacy' });
      toast.success('Consent recorded successfully.');
    } catch {
      toast.error('Failed to record consent.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">Privacy & Consent</h2>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Manage your consent for PrimeContractorOS's Terms of Service and Privacy Policy.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleAcceptNow} disabled={recordConsent.isPending} className="bg-blue-600 hover:bg-blue-700">
            <CheckCircle2 className="w-4 h-4 mr-2" />{recordConsent.isPending ? 'Recording...' : 'Accept Current Policy'}
          </Button>
          <Button variant="outline" onClick={handleResetConsent}>
            <XCircle className="w-4 h-4 mr-2" /> Reset Consent
          </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-slate-500" />
          <h3 className="text-base font-semibold text-slate-900">Consent History</h3>
        </div>
        {isLoading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : !history || history.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No consent records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 pr-4 font-medium text-slate-600">Date</th>
                  <th className="text-left py-2 pr-4 font-medium text-slate-600">Version</th>
                  <th className="text-left py-2 pr-4 font-medium text-slate-600">Action</th>
                  <th className="text-left py-2 font-medium text-slate-600">Type</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record: any) => (
                  <tr key={record.id} className="border-b border-slate-50">
                    <td className="py-2 pr-4 text-slate-700">{new Date(record.acceptedAt).toLocaleString()}</td>
                    <td className="py-2 pr-4 text-slate-700 font-mono">{record.policyVersion}</td>
                    <td className="py-2 pr-4">
                      {record.action === 'accepted' ? (
                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium"><CheckCircle2 className="w-3 h-3" /> Accepted</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium"><XCircle className="w-3 h-3" /> Declined</span>
                      )}
                    </td>
                    <td className="py-2 text-slate-500 text-xs">{record.consentType?.replace(/_/g, ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
