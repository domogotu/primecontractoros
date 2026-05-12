// Platform Admin Pages - Wired to real tRPC data
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Trash2, Edit, Loader2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link, useRoute } from "wouter";

// ==================== WORKSPACES ====================
export function PlatformWorkspaces() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { data: workspaces = [], isLoading, refetch } = trpc.platform.workspaces.list.useQuery();
  const updateMutation = trpc.platform.workspaces.update.useMutation({
    onSuccess: () => { refetch(); toast.success("Workspace updated"); },
    onError: (e) => toast.error(e.message),
  });
  const sendWelcomeEmail = trpc.platformAdmin.sendWelcomeEmail.useMutation({
    onSuccess: () => toast.success("Welcome email sent!"),
    onError: (e: any) => toast.error(e.message),
  });
  const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleBulkSendEmail = async () => {
    if (selectedIds.length === 0) { toast.error("Select workspaces first"); return; }
    let sent = 0;
    for (const id of selectedIds) {
      try { await sendWelcomeEmail.mutateAsync({ workspaceId: id }); sent++; } catch {}
    }
    toast.success(`Welcome emails sent to ${sent} workspace(s)`);
    setSelectedIds([]);
  };

  const filtered = workspaces.filter((ws: any) =>
    ws.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ws.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-4 sm:px-4 sm:px-8 py-3 sm:py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Workspace Directory</h1>
        <p className="text-slate-300">Manage all customer workspaces</p>
      </div>
      <div className="p-8">
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search workspaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {selectedIds.length > 0 && (
            <Button size="sm" onClick={handleBulkSendEmail} disabled={sendWelcomeEmail.isPending} className="bg-green-600 hover:bg-green-700 text-white">
              {sendWelcomeEmail.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Send Welcome Email ({selectedIds.length})
            </Button>
          )}
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Workspace</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Onboarded</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Model</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No workspaces found</td></tr>
              ) : (
                filtered.map((ws: any) => (
                  <tr key={ws.id} className="hover:bg-slate-900">
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={selectedIds.includes(ws.id)} onChange={() => toggleSelect(ws.id)} className="mr-2 align-middle" /><span className="font-medium text-white">{ws.name}</span>
                      <p className="text-sm text-slate-400">ID: {ws.id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{ws.companyName || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${ws.onboardingCompleted ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                        {ws.onboardingCompleted ? "Yes" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{ws.contractingModel || "—"}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/platform/workspaces/${ws.id}`}>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== WORKSPACE SUMMARY ====================
export function PlatformWorkspaceSummary() {
  const [, params] = useRoute("/platform/workspaces/:id");
  const wsId = Number(params?.id) || 0;
  const { data: workspace, isLoading } = trpc.platform.workspaces.get.useQuery({ id: wsId });
  const updateMutation = trpc.platform.workspaces.update.useMutation({
    onSuccess: () => toast.success("Workspace updated"),
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <LoadingState />;
  if (!workspace) return <div className="p-8 text-center text-slate-400">Workspace not found</div>;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-4 sm:px-4 sm:px-8 py-3 sm:py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Workspace: {workspace.name}</h1>
        <p className="text-slate-300">ID: {workspace.id} | Owner ID: {workspace.ownerId}</p>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <p className="text-xs text-slate-300 font-medium uppercase">Onboarding</p>
            <p className={`text-2xl font-bold mt-2 ${workspace.onboardingCompleted ? "text-green-600" : "text-amber-600"}`}>
              {workspace.onboardingCompleted ? "Complete" : "Pending"}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <p className="text-xs text-slate-300 font-medium uppercase">Company</p>
            <p className="text-lg font-bold text-white mt-2">{workspace.companyName || "Not set"}</p>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <p className="text-xs text-slate-300 font-medium uppercase">Model</p>
            <p className="text-lg font-bold text-white mt-2">{workspace.contractingModel || "Not set"}</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium text-slate-300">NAICS Codes:</span> {workspace.naicsCodes || "Not set"}</div>
            <div><span className="font-medium text-slate-300">Certifications:</span> {workspace.certifications || "Not set"}</div>
            <div><span className="font-medium text-slate-300">Created:</span> {workspace.createdAt ? new Date(workspace.createdAt).toLocaleString() : "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== PLANS ====================
export function PlatformPlans() {
  const { data: plans = [], isLoading, refetch } = trpc.platform.plans.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", monthlyPrice: "", annualPrice: "", features: "", maxUsers: 0, maxContracts: 0, sortOrder: 0 });

  const createMutation = trpc.platform.plans.create.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); resetForm(); toast.success("Plan created"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.platform.plans.update.useMutation({
    onSuccess: () => { refetch(); setEditingPlan(null); resetForm(); toast.success("Plan updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.platform.plans.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Plan deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => setForm({ name: "", description: "", monthlyPrice: "", annualPrice: "", features: "", maxUsers: 0, maxContracts: 0, sortOrder: 0 });

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setForm({ name: plan.name, description: plan.description || "", monthlyPrice: plan.monthlyPrice, annualPrice: plan.annualPrice || "", features: plan.features || "", maxUsers: plan.maxUsers || 0, maxContracts: plan.maxContracts || 0, sortOrder: plan.sortOrder || 0 });
  };

  const handleSubmit = () => {
    if (!form.name || !form.monthlyPrice) { toast.error("Name and monthly price are required"); return; }
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, ...form, maxUsers: form.maxUsers || undefined, maxContracts: form.maxContracts || undefined });
    } else {
      createMutation.mutate({ ...form, maxUsers: form.maxUsers || undefined, maxContracts: form.maxContracts || undefined });
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-4 sm:px-4 sm:px-8 py-3 sm:py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Plans Management</h1>
        <p className="text-slate-300">Configure and manage subscription plans</p>
      </div>
      <div className="p-8">
        <Button onClick={() => { resetForm(); setShowForm(true); setEditingPlan(null); }} className="bg-blue-900 hover:bg-blue-800 text-white mb-6">
          <Plus className="w-4 h-4 mr-2" /> Create Plan
        </Button>

        {(showForm || editingPlan) && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingPlan ? "Edit Plan" : "New Plan"}</h3>
              <button onClick={() => { setShowForm(false); setEditingPlan(null); }}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Plan Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border border-slate-700 rounded-lg" />
              <input placeholder="Monthly Price *" value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })} className="px-3 py-2 border border-slate-700 rounded-lg" />
              <input placeholder="Annual Price" value={form.annualPrice} onChange={(e) => setForm({ ...form, annualPrice: e.target.value })} className="px-3 py-2 border border-slate-700 rounded-lg" />
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-3 py-2 border border-slate-700 rounded-lg" />
              <input placeholder="Features (comma-separated)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="px-3 py-2 border border-slate-700 rounded-lg col-span-2" />
              <input type="number" placeholder="Max Users" value={form.maxUsers || ""} onChange={(e) => setForm({ ...form, maxUsers: parseInt(e.target.value) || 0 })} className="px-3 py-2 border border-slate-700 rounded-lg" />
              <input type="number" placeholder="Sort Order" value={form.sortOrder || ""} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="px-3 py-2 border border-slate-700 rounded-lg" />
            </div>
            <Button onClick={handleSubmit} className="mt-4 bg-blue-900 hover:bg-blue-800 text-white">
              {editingPlan ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {plans.length === 0 ? (
            <div className="col-span-3 bg-slate-800 rounded-lg border border-slate-700 p-8 text-center text-slate-400">
              No plans created yet. Create your first plan above.
            </div>
          ) : (
            plans.map((plan: any) => (
              <div key={plan.id} className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(plan)} className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => { if (confirm("Delete this plan?")) deleteMutation.mutate({ id: plan.id }); }} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600 mb-2">{plan.monthlyPrice}/mo</p>
                {plan.annualPrice && <p className="text-sm text-slate-400 mb-2">{plan.annualPrice}/yr</p>}
                {plan.description && <p className="text-sm text-slate-300 mb-2">{plan.description}</p>}
                {plan.features && <p className="text-xs text-slate-400">Features: {plan.features}</p>}
                <div className="mt-3 flex gap-2 text-xs text-slate-400">
                  {plan.maxUsers && <span>Max {plan.maxUsers} users</span>}
                  <span className={`px-2 py-0.5 rounded-full ${plan.isActive ? "bg-green-100 text-green-700" : "bg-slate-700 text-slate-300"}`}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== DISCOUNTS ====================
export function PlatformDiscounts() {
  const { data: discounts = [], isLoading, refetch } = trpc.platform.discounts.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", description: "", percentOff: 0, amountOff: "", maxUses: 0 });

  const createMutation = trpc.platform.discounts.create.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); setForm({ code: "", description: "", percentOff: 0, amountOff: "", maxUses: 0 }); toast.success("Discount created"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.platform.discounts.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Discount deleted"); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-4 sm:px-4 sm:px-8 py-3 sm:py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Discounts Management</h1>
        <p className="text-slate-300">Create and manage promotional discounts</p>
      </div>
      <div className="p-8">
        <Button onClick={() => setShowForm(true)} className="bg-blue-900 hover:bg-blue-800 text-white mb-6">
          <Plus className="w-4 h-4 mr-2" /> Create Discount
        </Button>

        {showForm && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Discount</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Discount Code *" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="px-3 py-2 border border-slate-700 rounded-lg" />
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-3 py-2 border border-slate-700 rounded-lg" />
              <input type="number" placeholder="Percent Off (%)" value={form.percentOff || ""} onChange={(e) => setForm({ ...form, percentOff: parseInt(e.target.value) || 0 })} className="px-3 py-2 border border-slate-700 rounded-lg" />
              <input placeholder="Amount Off ($)" value={form.amountOff} onChange={(e) => setForm({ ...form, amountOff: e.target.value })} className="px-3 py-2 border border-slate-700 rounded-lg" />
              <input type="number" placeholder="Max Uses" value={form.maxUses || ""} onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 0 })} className="px-3 py-2 border border-slate-700 rounded-lg" />
            </div>
            <Button onClick={() => {
              if (!form.code) { toast.error("Code is required"); return; }
              createMutation.mutate({ code: form.code, description: form.description || undefined, percentOff: form.percentOff || undefined, amountOff: form.amountOff || undefined, maxUses: form.maxUses || undefined });
            }} className="mt-4 bg-blue-900 hover:bg-blue-800 text-white">
              Create Discount
            </Button>
          </div>
        )}

        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Uses</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {discounts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No discounts created yet</td></tr>
              ) : (
                discounts.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-900">
                    <td className="px-6 py-4 font-mono font-medium text-white">{d.code}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{d.description || "—"}</td>
                    <td className="px-6 py-4 text-sm">{d.percentOff ? `${d.percentOff}%` : d.amountOff ? `$${d.amountOff}` : "—"}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{d.currentUses || 0}/{d.maxUses || "∞"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${d.isActive ? "bg-green-100 text-green-700" : "bg-slate-700 text-slate-300"}`}>
                        {d.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: d.id }); }} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== BILLING ====================
export function PlatformBilling() {
  const { data: billingRecords = [], isLoading, refetch } = trpc.platform.billing.list.useQuery();
  const updateMutation = trpc.platform.billing.update.useMutation({
    onSuccess: () => { refetch(); toast.success("Billing record updated"); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <LoadingState />;

  const activeCount = billingRecords.filter((b: any) => b.status === "active").length;
  const trialCount = billingRecords.filter((b: any) => b.status === "trial").length;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-4 sm:px-4 sm:px-8 py-3 sm:py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Billing Management</h1>
        <p className="text-slate-300">View and manage workspace billing</p>
      </div>
      <div className="p-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <p className="text-xs text-slate-300 font-medium uppercase">Total Records</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-300 mt-2">{billingRecords.length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <p className="text-xs text-slate-300 font-medium uppercase">Active Subscriptions</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">{activeCount}</p>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <p className="text-xs text-slate-300 font-medium uppercase">Trials</p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-2">{trialCount}</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Workspace</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Cycle</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {billingRecords.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No billing records</td></tr>
              ) : (
                billingRecords.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-900">
                    <td className="px-6 py-4 text-sm text-slate-300">{b.id}</td>
                    <td className="px-6 py-4 text-sm text-white">WS #{b.workspaceId}</td>
                    <td className="px-6 py-4">
                      <select
                        value={b.status}
                        onChange={(e) => updateMutation.mutate({ id: b.id, status: e.target.value as any })}
                        className="px-2 py-1 border border-slate-700 rounded text-sm"
                      >
                        <option value="trial">Trial</option>
                        <option value="active">Active</option>
                        <option value="past_due">Past Due</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{b.billingCycle || "—"}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-6 py-4 text-right text-sm text-slate-400">{b.notes || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== SUPPORT ====================
export function PlatformSupport() {
  const { data: tickets = [], isLoading, refetch } = trpc.platform.support.list.useQuery();
  const updateMutation = trpc.platform.support.update.useMutation({
    onSuccess: () => { refetch(); toast.success("Ticket updated"); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <LoadingState />;

  const openCount = tickets.filter((t: any) => t.status === "open").length;
  const inProgressCount = tickets.filter((t: any) => t.status === "in_progress").length;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-4 sm:px-4 sm:px-8 py-3 sm:py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Support Inbox</h1>
        <p className="text-slate-300">Manage customer support tickets</p>
      </div>
      <div className="p-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
            <p className="text-xs text-slate-300 font-medium uppercase">Open</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-2">{openCount}</p>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
            <p className="text-xs text-slate-300 font-medium uppercase">In Progress</p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-2">{inProgressCount}</p>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
            <p className="text-xs text-slate-300 font-medium uppercase">Total</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-300 mt-2">{tickets.length}</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {tickets.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No support tickets</td></tr>
              ) : (
                tickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-900">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{t.subject}</p>
                      <p className="text-sm text-slate-400 truncate max-w-xs">{t.body}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        t.priority === "critical" ? "bg-red-100 text-red-700" :
                        t.priority === "high" ? "bg-orange-100 text-orange-700" :
                        t.priority === "medium" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-700 text-slate-300"
                      }`}>{t.priority}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={t.status}
                        onChange={(e) => updateMutation.mutate({ id: t.id, status: e.target.value as any })}
                        className="px-2 py-1 border border-slate-700 rounded text-sm"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting_on_customer">Waiting</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => updateMutation.mutate({ id: t.id, status: "resolved" })}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== OVERRIDES ====================
export function PlatformOverrides() {
  const { data: overrides = [], isLoading, refetch } = trpc.platform.overrides.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ workspaceId: 0, feature: "", value: "", reason: "" });

  const createMutation = trpc.platform.overrides.create.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); setForm({ workspaceId: 0, feature: "", value: "", reason: "" }); toast.success("Override created"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.platform.overrides.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Override deleted"); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-4 sm:px-4 sm:px-8 py-3 sm:py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Overrides Management</h1>
        <p className="text-slate-300">Configure per-workspace feature overrides</p>
      </div>
      <div className="p-8">
        <Button onClick={() => setShowForm(true)} className="bg-blue-900 hover:bg-blue-800 text-white mb-6">
          <Plus className="w-4 h-4 mr-2" /> Create Override
        </Button>

        {showForm && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Override</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Workspace ID *" value={form.workspaceId || ""} onChange={(e) => setForm({ ...form, workspaceId: parseInt(e.target.value) || 0 })} className="px-3 py-2 border border-slate-700 rounded-lg" />
              <input placeholder="Feature *" value={form.feature} onChange={(e) => setForm({ ...form, feature: e.target.value })} className="px-3 py-2 border border-slate-700 rounded-lg" />
              <input placeholder="Value *" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="px-3 py-2 border border-slate-700 rounded-lg" />
              <input placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="px-3 py-2 border border-slate-700 rounded-lg" />
            </div>
            <Button onClick={() => {
              if (!form.workspaceId || !form.feature || !form.value) { toast.error("Workspace ID, feature, and value are required"); return; }
              createMutation.mutate({ workspaceId: form.workspaceId, feature: form.feature, value: form.value, reason: form.reason || undefined });
            }} className="mt-4 bg-blue-900 hover:bg-blue-800 text-white">
              Create Override
            </Button>
          </div>
        )}

        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Workspace</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Feature</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Value</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {overrides.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No overrides configured</td></tr>
              ) : (
                overrides.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-900">
                    <td className="px-6 py-4 text-sm text-white">WS #{o.workspaceId}</td>
                    <td className="px-6 py-4 text-sm font-mono text-white">{o.feature}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{o.value}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{o.reason || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${o.isActive ? "bg-green-100 text-green-700" : "bg-slate-700 text-slate-300"}`}>
                        {o.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: o.id }); }} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== PLACEHOLDER PAGES ====================
export function PlatformPricingHistory() {
  const [filter, setFilter] = useState("all");
  const history = [
    { id: 1, date: "2026-05-01", plan: "Starter", action: "Created", oldPrice: null, newPrice: "$99/mo", changedBy: "System", reason: "Initial plan setup" },
    { id: 2, date: "2026-05-05", plan: "Growth", action: "Created", oldPrice: null, newPrice: "$249/mo", changedBy: "System", reason: "Initial plan setup" },
    { id: 3, date: "2026-05-08", plan: "Starter", action: "Price Change", oldPrice: "$99/mo", newPrice: "$89/mo", changedBy: "Admin", reason: "Early adopter promotion" },
    { id: 4, date: "2026-05-10", plan: "Advanced", action: "Created", oldPrice: null, newPrice: "$499/mo", changedBy: "System", reason: "Initial plan setup" },
    { id: 5, date: "2026-05-12", plan: "Growth", action: "Feature Update", oldPrice: "$249/mo", newPrice: "$249/mo", changedBy: "Admin", reason: "Added AI workflow credits" },
  ];
  const filtered = filter === "all" ? history : history.filter(h => h.action.toLowerCase().includes(filter));
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-8 py-3 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Pricing History</h1>
        <p className="text-slate-300">View historical pricing changes and plan modifications</p>
      </div>
      <div className="p-4 sm:p-8">
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "created", "price change", "feature update"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors \${filter === f ? "bg-blue-900 text-white" : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-900"}`}>
              {f === "all" ? "All Changes" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-slate-900 border-b text-xs font-semibold text-slate-400 uppercase">
            <div>Date</div><div>Plan</div><div>Action</div><div>Old Price</div><div>New Price</div><div>Changed By</div><div>Reason</div>
          </div>
          {filtered.map(h => (
            <div key={h.id} className="grid grid-cols-7 gap-4 px-4 py-3 border-b border-slate-700 text-sm hover:bg-slate-900">
              <div className="text-white">{h.date}</div>
              <div className="font-medium text-blue-300">{h.plan}</div>
              <div><span className={`px-2 py-0.5 rounded-full text-xs font-medium \${h.action === "Created" ? "bg-green-100 text-green-800" : h.action === "Price Change" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>{h.action}</span></div>
              <div className="text-slate-400">{h.oldPrice || "—"}</div>
              <div className="font-medium text-white">{h.newPrice}</div>
              <div className="text-slate-300">{h.changedBy}</div>
              <div className="text-slate-400 truncate">{h.reason}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4">Showing {filtered.length} of {history.length} records</p>
      </div>
    </div>
  );
}

export function PlatformOwnershipRecovery() {
  const [showDialog, setShowDialog] = useState(false);
  const requests = [
    { id: 1, workspace: "Acme Federal", requester: "john@acme.com", currentOwner: "jane@acme.com", status: "pending", requestDate: "2026-05-10", reason: "Owner left company" },
    { id: 2, workspace: "TechGov Solutions", requester: "admin@techgov.com", currentOwner: "founder@techgov.com", status: "approved", requestDate: "2026-05-08", reason: "Account consolidation" },
    { id: 3, workspace: "DefCon LLC", requester: "ops@defcon.com", currentOwner: "ceo@defcon.com", status: "denied", requestDate: "2026-05-05", reason: "Insufficient verification" },
  ];
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = { pending: "bg-amber-100 text-amber-800", approved: "bg-green-100 text-green-800", denied: "bg-red-100 text-red-800" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium \${styles[status] || "bg-slate-700 text-slate-100"}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-8 py-3 sm:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Ownership Recovery</h1>
            <p className="text-slate-300">Manage workspace ownership transfer requests</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-lg text-sm bg-amber-50 text-amber-700 font-medium">{requests.filter(r => r.status === "pending").length} Pending</span>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-8">
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-slate-900 border-b text-xs font-semibold text-slate-400 uppercase">
            <div>Workspace</div><div>Requester</div><div>Current Owner</div><div>Status</div><div>Date</div><div>Actions</div>
          </div>
          {requests.map(r => (
            <div key={r.id} className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-slate-700 text-sm hover:bg-slate-900 items-center">
              <div className="font-medium text-blue-300">{r.workspace}</div>
              <div className="text-slate-200">{r.requester}</div>
              <div className="text-slate-400">{r.currentOwner}</div>
              <div>{getStatusBadge(r.status)}</div>
              <div className="text-slate-400">{r.requestDate}</div>
              <div className="flex gap-2">
                {r.status === "pending" && (
                  <>
                    <button onClick={() => toast.success("Request approved")} className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100">Approve</button>
                    <button onClick={() => toast.error("Request denied")} className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100">Deny</button>
                  </>
                )}
                <button onClick={() => toast.success("Details viewed")} className="px-2 py-1 text-xs bg-slate-900 text-slate-300 rounded hover:bg-slate-700">View</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-300 mb-2">Recovery Process</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Requester submits ownership recovery request with verification documents</li>
            <li>Platform admin reviews request and verifies identity</li>
            <li>Current owner is notified and has 72 hours to respond</li>
            <li>Admin approves or denies based on verification and response</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export function PlatformDemoWorkspaces() {
  const demos = [
    { id: 1, name: "Demo - Small Business", plan: "Starter", created: "2026-05-01", expires: "2026-05-08", status: "active", users: 2, records: 45 },
    { id: 2, name: "Demo - Enterprise", plan: "Advanced", created: "2026-05-03", expires: "2026-05-10", status: "active", users: 5, records: 120 },
    { id: 3, name: "Demo - Sales Prospect", plan: "Growth", created: "2026-04-28", expires: "2026-05-05", status: "expired", users: 1, records: 15 },
  ];
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-8 py-3 sm:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Demo Workspaces</h1>
            <p className="text-slate-300">Create and manage demo workspaces for trials and sales</p>
          </div>
          <button onClick={() => toast.success("Demo workspace creation dialog coming soon")} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm font-medium">Create Demo</button>
        </div>
      </div>
      <div className="p-4 sm:p-8">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="text-2xl font-bold text-blue-300">{demos.filter(d => d.status === "active").length}</div>
            <div className="text-sm text-slate-400">Active Demos</div>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="text-2xl font-bold text-amber-600">{demos.filter(d => d.status === "expired").length}</div>
            <div className="text-sm text-slate-400">Expired</div>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="text-2xl font-bold text-green-600">{demos.reduce((sum, d) => sum + d.users, 0)}</div>
            <div className="text-sm text-slate-400">Total Demo Users</div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-slate-900 border-b text-xs font-semibold text-slate-400 uppercase">
            <div>Name</div><div>Plan</div><div>Created</div><div>Expires</div><div>Status</div><div>Users</div><div>Actions</div>
          </div>
          {demos.map(d => (
            <div key={d.id} className="grid grid-cols-7 gap-4 px-4 py-3 border-b border-slate-700 text-sm hover:bg-slate-900 items-center">
              <div className="font-medium text-blue-300">{d.name}</div>
              <div className="text-slate-200">{d.plan}</div>
              <div className="text-slate-400">{d.created}</div>
              <div className="text-slate-400">{d.expires}</div>
              <div><span className={`px-2 py-0.5 rounded-full text-xs font-medium \${d.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-700 text-slate-300"}`}>{d.status}</span></div>
              <div className="text-slate-200">{d.users}</div>
              <div className="flex gap-2">
                <button onClick={() => toast.success("Extending demo...")} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Extend</button>
                <button onClick={() => toast.success("Converting to paid...")} className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100">Convert</button>
                <button onClick={() => toast.error("Demo deleted")} className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PlatformTasks() {
  const [filter, setFilter] = useState("all");
  const tasks = [
    { id: 1, name: "Database backup", type: "scheduled", status: "completed", lastRun: "2026-05-12 03:00", nextRun: "2026-05-13 03:00", duration: "2m 15s" },
    { id: 2, name: "Email digest", type: "scheduled", status: "completed", lastRun: "2026-05-12 08:00", nextRun: "2026-05-13 08:00", duration: "45s" },
    { id: 3, name: "Trial expiration check", type: "scheduled", status: "running", lastRun: "2026-05-12 00:00", nextRun: "2026-05-13 00:00", duration: "—" },
    { id: 4, name: "Workspace cleanup", type: "manual", status: "pending", lastRun: "2026-05-10 14:30", nextRun: "—", duration: "—" },
    { id: 5, name: "AI usage aggregation", type: "scheduled", status: "failed", lastRun: "2026-05-11 23:00", nextRun: "2026-05-12 23:00", duration: "0s" },
    { id: 6, name: "Invoice generation", type: "scheduled", status: "completed", lastRun: "2026-05-01 00:00", nextRun: "2026-06-01 00:00", duration: "5m 30s" },
  ];
  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = { completed: "bg-green-100 text-green-800", running: "bg-blue-100 text-blue-800", pending: "bg-slate-700 text-slate-300", failed: "bg-red-100 text-red-800" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium \${styles[status] || "bg-slate-700 text-slate-100"}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-8 py-3 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Platform Tasks</h1>
        <p className="text-slate-300">Monitor and manage background tasks and scheduled jobs</p>
      </div>
      <div className="p-4 sm:p-8">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === "completed").length}</div>
            <div className="text-sm text-slate-400">Completed</div>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === "running").length}</div>
            <div className="text-sm text-slate-400">Running</div>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="text-2xl font-bold text-slate-300">{tasks.filter(t => t.status === "pending").length}</div>
            <div className="text-sm text-slate-400">Pending</div>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="text-2xl font-bold text-red-600">{tasks.filter(t => t.status === "failed").length}</div>
            <div className="text-sm text-slate-400">Failed</div>
          </div>
        </div>
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all", "completed", "running", "pending", "failed"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors \${filter === f ? "bg-blue-900 text-white" : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-900"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-slate-900 border-b text-xs font-semibold text-slate-400 uppercase">
            <div>Task</div><div>Type</div><div>Status</div><div>Last Run</div><div>Next Run</div><div>Duration</div><div>Actions</div>
          </div>
          {filtered.map(t => (
            <div key={t.id} className="grid grid-cols-7 gap-4 px-4 py-3 border-b border-slate-700 text-sm hover:bg-slate-900 items-center">
              <div className="font-medium text-white">{t.name}</div>
              <div><span className={`px-2 py-0.5 rounded-full text-xs \${t.type === "scheduled" ? "bg-purple-100 text-purple-800" : "bg-slate-700 text-slate-300"}`}>{t.type}</span></div>
              <div>{getStatusBadge(t.status)}</div>
              <div className="text-slate-400 text-xs">{t.lastRun}</div>
              <div className="text-slate-400 text-xs">{t.nextRun}</div>
              <div className="text-slate-200">{t.duration}</div>
              <div className="flex gap-2">
                {t.status === "failed" && <button onClick={() => toast.success("Retrying task...")} className="px-2 py-1 text-xs bg-amber-50 text-amber-700 rounded hover:bg-amber-100">Retry</button>}
                <button onClick={() => toast.success("Running task now...")} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Run Now</button>
                <button onClick={() => toast.success("Task logs opened")} className="px-2 py-1 text-xs bg-slate-900 text-slate-300 rounded hover:bg-slate-700">Logs</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== SHARED COMPONENTS ====================
function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-300" />
    </div>
  );
}
