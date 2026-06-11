import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Plus, Eye, Copy, AlertCircle, Shield, Clock, Search, MessageSquare, ArrowLeftRight, Download, CheckSquare, Square, ChevronDown, ShieldCheck, ShieldOff, RefreshCw, CreditCard, FileText, StickyNote, XCircle } from "lucide-react";
import { useState as useStateLocal } from "react";
import { toast } from "sonner";

// ==================== SHARED COMPONENTS ====================
function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-300" />
    </div>
  );
}

function PageHeader({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-8 py-3 sm:py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">{title}</h1>
          <p className="text-slate-300">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-blue-300" }: { label: string; value: number | string; color?: string }) {
  return (
    <Card className="bg-slate-800 border-slate-700 p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="bg-slate-800 border-slate-700 p-8 text-center">
      <p className="text-slate-400">{message}</p>
    </Card>
  );
}

// ==================== PLANS MANAGEMENT ====================
export function PlatformPlans() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    monthlyPrice: "0",
    annualPrice: "0",
    features: "",
    maxUsers: 5,
    maxContracts: 10,
    isActive: true,
  });

  const plansQuery = trpc.platformAdmin.plans.list.useQuery();
  const createMutation = trpc.platformAdmin.plans.create.useMutation({
    onSuccess: () => {
      plansQuery.refetch();
      setShowForm(false);
      setFormData({ name: "", description: "", monthlyPrice: "0", annualPrice: "0", features: "", maxUsers: 5, maxContracts: 10, isActive: true });
      toast.success("Plan created successfully.");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = trpc.platformAdmin.plans.delete.useMutation({
    onSuccess: () => { plansQuery.refetch(); toast.success("Plan archived."); },
    onError: (err: any) => toast.error(err.message),
  });

  const plans = plansQuery.data || [];
  const filtered = plans.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  if (plansQuery.isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      <PageHeader title="Plans Management" description="Create and manage subscription plans.">
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-900 text-white hover:bg-blue-800">
          <Plus className="w-4 h-4 mr-2" /> New Plan
        </Button>
      </PageHeader>

      <div className="p-4 sm:p-8">
        {showForm && (
          <Card className="mb-6 bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Plan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="Plan name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-slate-900 border-slate-700 text-white" />
              <Input placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-slate-900 border-slate-700 text-white" />
              <Input placeholder="Monthly price" type="number" value={formData.monthlyPrice} onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })} className="bg-slate-900 border-slate-700 text-white" />
              <Input placeholder="Annual price" type="number" value={formData.annualPrice} onChange={(e) => setFormData({ ...formData, annualPrice: e.target.value })} className="bg-slate-900 border-slate-700 text-white" />
              <Input placeholder="Max users" type="number" value={formData.maxUsers} onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 5 })} className="bg-slate-900 border-slate-700 text-white" />
              <Input placeholder="Max contracts" type="number" value={formData.maxContracts} onChange={(e) => setFormData({ ...formData, maxContracts: parseInt(e.target.value) || 10 })} className="bg-slate-900 border-slate-700 text-white" />
            </div>
            <div className="mt-4">
              <Input placeholder="Features (comma-separated)" value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} className="bg-slate-900 border-slate-700 text-white" />
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending} className="bg-green-900 text-white hover:bg-green-800">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="border-slate-700 text-slate-300">Cancel</Button>
            </div>
          </Card>
        )}

        <div className="mb-6">
          <Input placeholder="Search plans..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="No plans found. Create your first plan to get started." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((plan) => (
              <Card key={plan.id} className="bg-slate-800 border-slate-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-500">ID: {plan.id}</p>
                  </div>
                  <Badge variant={plan.isActive ? "default" : "secondary"}>{plan.isActive ? "Active" : "Inactive"}</Badge>
                </div>
                <p className="text-sm text-slate-300 mb-4">{plan.description || "No description"}</p>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between text-slate-300"><span>Monthly:</span><span className="font-semibold text-white">${plan.monthlyPrice}</span></div>
                  <div className="flex justify-between text-slate-300"><span>Annual:</span><span className="font-semibold text-white">${plan.annualPrice || "—"}</span></div>
                  <div className="flex justify-between text-slate-300"><span>Max Users:</span><span className="font-semibold text-white">{plan.maxUsers}</span></div>
                  <div className="flex justify-between text-slate-300"><span>Max Contracts:</span><span className="font-semibold text-white">{plan.maxContracts}</span></div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => toast.info(`Plan: ${plan.name} — Monthly: $${plan.monthlyPrice}, Annual: $${plan.annualPrice || 'N/A'}, Max Users: ${plan.maxUsers}, Max Contracts: ${plan.maxContracts}, Features: ${plan.features || 'None'}, Active: ${plan.isActive ? 'Yes' : 'No'}`)} size="sm" variant="outline" className="flex-1 border-slate-700 text-slate-300"><Eye className="w-4 h-4" /></Button>
                  <Button onClick={() => deleteMutation.mutate({ id: plan.id })} size="sm" variant="outline" className="flex-1 border-red-700 text-red-400 hover:bg-red-900"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== DISCOUNTS MANAGEMENT ====================
export function PlatformDiscounts() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    percentOff: 0,
    amountOff: "",
    maxUses: 0,
    expiresAt: "",
    isActive: true,
  });

  const discountsQuery = trpc.platformAdmin.discounts.list.useQuery();
  const createMutation = trpc.platformAdmin.discounts.create.useMutation({
    onSuccess: () => {
      discountsQuery.refetch();
      setShowForm(false);
      setFormData({ code: "", description: "", percentOff: 0, amountOff: "", maxUses: 0, expiresAt: "", isActive: true });
      toast.success("Discount created successfully.");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = trpc.platformAdmin.discounts.delete.useMutation({
    onSuccess: () => { discountsQuery.refetch(); toast.success("Discount disabled."); },
    onError: (err: any) => toast.error(err.message),
  });

  const discountsList = discountsQuery.data || [];
  const filtered = discountsList.filter((d) =>
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (discountsQuery.isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      <PageHeader title="Discounts Management" description="Create and manage promo codes and discounts.">
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-900 text-white hover:bg-blue-800">
          <Plus className="w-4 h-4 mr-2" /> New Discount
        </Button>
      </PageHeader>

      <div className="p-4 sm:p-8">
        {showForm && (
          <Card className="mb-6 bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Discount</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="Discount code (e.g. SAVE20)" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="bg-slate-900 border-slate-700 text-white" />
              <Input placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-slate-900 border-slate-700 text-white" />
              <Input placeholder="Percent off (0-100)" type="number" value={formData.percentOff} onChange={(e) => setFormData({ ...formData, percentOff: parseInt(e.target.value) || 0 })} className="bg-slate-900 border-slate-700 text-white" />
              <Input placeholder="Amount off ($)" type="number" value={formData.amountOff} onChange={(e) => setFormData({ ...formData, amountOff: e.target.value })} className="bg-slate-900 border-slate-700 text-white" />
              <Input placeholder="Max uses (0 = unlimited)" type="number" value={formData.maxUses} onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })} className="bg-slate-900 border-slate-700 text-white" />
              <Input placeholder="Expiration date" type="date" value={formData.expiresAt} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} className="bg-slate-900 border-slate-700 text-white" />
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending} className="bg-green-900 text-white hover:bg-green-800">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="border-slate-700 text-slate-300">Cancel</Button>
            </div>
          </Card>
        )}

        <div className="mb-6">
          <Input placeholder="Search discounts..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="No discounts found. Create your first discount to get started." />
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Description</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Percent Off</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Amount Off</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Uses</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Expires</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b border-slate-700 hover:bg-slate-900">
                    <td className="px-4 py-3 font-mono text-blue-300">{d.code}</td>
                    <td className="px-4 py-3 text-white">{d.description || "—"}</td>
                    <td className="px-4 py-3 text-white">{d.percentOff ? `${d.percentOff}%` : "—"}</td>
                    <td className="px-4 py-3 text-white">{d.amountOff ? `$${d.amountOff}` : "—"}</td>
                    <td className="px-4 py-3 text-slate-300">{d.currentUses || 0}/{d.maxUses || "∞"}</td>
                    <td className="px-4 py-3 text-slate-400">{d.expiresAt ? new Date(d.expiresAt).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3"><Badge variant={d.isActive ? "default" : "secondary"}>{d.isActive ? "Active" : "Inactive"}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { navigator.clipboard.writeText(d.code); toast.success("Code copied."); }} className="text-blue-400 hover:text-blue-300 mr-2"><Copy className="w-4 h-4 inline" /></button>
                      <button onClick={() => deleteMutation.mutate({ id: d.id })} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4 inline" /></button>
                    </td>
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

// ==================== BILLING MANAGEMENT ====================
// ─── Access Status Badge ─────────────────────────────────────────────────────
function AccessStateBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active_paid: "bg-green-900 text-green-300 border-green-700",
    trial_active: "bg-amber-900 text-amber-300 border-amber-700",
    grace: "bg-blue-900 text-blue-300 border-blue-700",
    override: "bg-purple-900 text-purple-300 border-purple-700",
    past_due: "bg-red-900 text-red-300 border-red-700",
    pending_payment: "bg-orange-900 text-orange-300 border-orange-700",
    pending_setup: "bg-slate-700 text-slate-300 border-slate-600",
    suspended: "bg-red-950 text-red-400 border-red-800",
    canceled: "bg-slate-800 text-slate-400 border-slate-700",
    no_access: "bg-slate-800 text-slate-500 border-slate-700",
  };
  const cls = colors[status] ?? "bg-slate-800 text-slate-400 border-slate-700";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Workspace Billing Detail Modal ─────────────────────────────────────────
function WorkspaceBillingModal({ workspaceId, onClose }: { workspaceId: number; onClose: () => void }) {
  const [activeTab, setActiveTab] = useStateLocal<"overview" | "events" | "notes">("overview");
  const [graceDays, setGraceDays] = useStateLocal("14");
  const [graceReason, setGraceReason] = useStateLocal("");
  const [suspendReason, setSuspendReason] = useStateLocal("");
  const [restoreReason, setRestoreReason] = useStateLocal("");
  const [noteText, setNoteText] = useStateLocal("");
  const [overrideReason, setOverrideReason] = useStateLocal("");

  const detailQuery = trpc.platformAdmin.billing.getWorkspaceBilling.useQuery({ workspaceId });
  const eventsQuery = trpc.platformAdmin.billing.getBillingEvents.useQuery({ workspaceId });
  const plansQuery = trpc.platformAdmin.billing.list.useQuery();
  const allPlansQuery = trpc.billing.getPlans.useQuery();

  const grantGraceMutation = trpc.platformAdmin.billing.grantGracePeriod.useMutation({
    onSuccess: () => { toast.success("Grace period granted."); detailQuery.refetch(); setGraceReason(""); },
    onError: (e: any) => toast.error(e.message),
  });
  const suspendMutation = trpc.platformAdmin.billing.suspendAccess.useMutation({
    onSuccess: () => { toast.success("Access suspended."); detailQuery.refetch(); setSuspendReason(""); },
    onError: (e: any) => toast.error(e.message),
  });
  const restoreMutation = trpc.platformAdmin.billing.restoreAccess.useMutation({
    onSuccess: () => { toast.success("Access restored."); detailQuery.refetch(); setRestoreReason(""); },
    onError: (e: any) => toast.error(e.message),
  });
  const overrideMutation = trpc.platformAdmin.billing.setOverride.useMutation({
    onSuccess: () => { toast.success("Override set."); detailQuery.refetch(); setOverrideReason(""); },
    onError: (e: any) => toast.error(e.message),
  });
  const noteMutation = trpc.platformAdmin.billing.addBillingNote.useMutation({
    onSuccess: () => { toast.success("Note added."); detailQuery.refetch(); setNoteText(""); },
    onError: (e: any) => toast.error(e.message),
  });

  const d = detailQuery.data;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">Workspace #{workspaceId} — Billing</h2>
            {d?.workspace && <p className="text-slate-400 text-sm mt-0.5">{d.workspace.name} · {d.owner?.email}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><XCircle className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {(["overview", "events", "notes"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${activeTab === t ? "text-blue-300 border-b-2 border-blue-400" : "text-slate-400 hover:text-slate-200"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {detailQuery.isLoading && <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-300" /></div>}

          {activeTab === "overview" && d && (
            <>
              {/* Current State */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Access State</p>
                  {d.accessState ? <AccessStateBadge status={d.accessState.state} /> : <span className="text-slate-500 text-sm">None</span>}
                  {d.accessState?.reason && <p className="text-xs text-slate-500 mt-1">{d.accessState.reason}</p>}
                  {d.accessState?.changedAt && <p className="text-xs text-amber-400 mt-1">Changed: {new Date(d.accessState.changedAt).toLocaleDateString()}</p>}
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Subscription</p>
                  {d.subscription ? (
                    <>
                      <p className="text-white font-medium">{d.plan?.name ?? `Plan #${d.subscription.planId}`}</p>
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">{d.subscription.status}</p>
                      {d.subscription.currentPeriodEnd && <p className="text-xs text-slate-500 mt-0.5">Renews: {new Date(d.subscription.currentPeriodEnd).toLocaleDateString()}</p>}
                    </>
                  ) : <span className="text-slate-500 text-sm">No subscription</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Management Actions</h3>

                {/* Grant Grace Period */}
                <div className="bg-slate-900 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-white">Grant Grace Period</span>
                  </div>
                  <div className="flex gap-2">
                    <Input type="number" min={1} max={365} value={graceDays} onChange={(e) => setGraceDays(e.target.value)}
                      placeholder="Days" className="w-24 bg-slate-800 border-slate-600 text-white text-sm" />
                    <Input value={graceReason} onChange={(e) => setGraceReason(e.target.value)}
                      placeholder="Reason (required)" className="flex-1 bg-slate-800 border-slate-600 text-white text-sm" />
                    <Button size="sm" onClick={() => grantGraceMutation.mutate({ workspaceId, daysUntilExpiry: parseInt(graceDays) || 14, reason: graceReason })}
                      disabled={!graceReason || grantGraceMutation.isPending} className="bg-amber-700 hover:bg-amber-600 text-white">
                      {grantGraceMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Grant"}
                    </Button>
                  </div>
                </div>

                {/* Suspend / Restore */}
                <div className="bg-slate-900 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldOff className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-white">Suspend / Restore Access</span>
                  </div>
                  <div className="flex gap-2">
                    <Input value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)}
                      placeholder="Reason for suspension" className="flex-1 bg-slate-800 border-slate-600 text-white text-sm" />
                    <Button size="sm" variant="destructive" onClick={() => suspendMutation.mutate({ workspaceId, reason: suspendReason })}
                      disabled={!suspendReason || suspendMutation.isPending}>
                      {suspendMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Suspend"}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input value={restoreReason} onChange={(e) => setRestoreReason(e.target.value)}
                      placeholder="Reason for restoration" className="flex-1 bg-slate-800 border-slate-600 text-white text-sm" />
                    <Button size="sm" onClick={() => restoreMutation.mutate({ workspaceId, reason: restoreReason, newStatus: "active_paid" })}
                      disabled={!restoreReason || restoreMutation.isPending} className="bg-green-700 hover:bg-green-600 text-white">
                      {restoreMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Restore"}
                    </Button>
                  </div>
                </div>

                {/* Platform Override */}
                <div className="bg-slate-900 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Platform Override (bypasses billing)</span>
                  </div>
                  <div className="flex gap-2">
                    <Input value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="Reason for override" className="flex-1 bg-slate-800 border-slate-600 text-white text-sm" />
                    <Button size="sm" onClick={() => overrideMutation.mutate({ workspaceId, reason: overrideReason })}
                      disabled={!overrideReason || overrideMutation.isPending} className="bg-purple-700 hover:bg-purple-600 text-white">
                      {overrideMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Set Override"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "events" && (
            <>
              {eventsQuery.isLoading && <div className="flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-blue-300" /></div>}
              {!eventsQuery.isLoading && (!eventsQuery.data || eventsQuery.data.length === 0) && (
                <EmptyState message="No billing events recorded." />
              )}
              {eventsQuery.data && eventsQuery.data.length > 0 && (
                <div className="space-y-2">
                  {eventsQuery.data.map((ev: any) => (
                    <div key={ev.id} className="bg-slate-900 rounded-lg p-3 flex items-start gap-3">
                      <CreditCard className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-white">{ev.eventType?.replace(/_/g, " ")}</span>
                          {ev.newState && <AccessStateBadge status={ev.newState} />}
                        </div>
                        {ev.reason && <p className="text-xs text-slate-400 mt-0.5 truncate">{ev.reason}</p>}
                        <p className="text-xs text-slate-500 mt-0.5">{ev.createdAt ? new Date(ev.createdAt).toLocaleString() : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "notes" && (
            <>
              <div className="flex gap-2">
                <Input value={noteText} onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add an internal note..." className="flex-1 bg-slate-800 border-slate-600 text-white text-sm" />
                <Button size="sm" onClick={() => noteMutation.mutate({ workspaceId, note: noteText })}
                  disabled={!noteText || noteMutation.isPending} className="bg-blue-700 hover:bg-blue-600 text-white">
                  {noteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <StickyNote className="w-4 h-4" />}
                </Button>
              </div>
              {d?.notes && d.notes.length > 0 ? (
                <div className="space-y-2">
                  {d.notes.map((n: any) => (
                    <div key={n.id} className="bg-slate-900 rounded-lg p-3">
                      <p className="text-sm text-slate-200">{n.note}</p>
                      <p className="text-xs text-slate-500 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</p>
                    </div>
                  ))}
                </div>
              ) : <EmptyState message="No notes yet." />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function PlatformBilling() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useStateLocal<number | null>(null);

  const accessStatesQuery = trpc.platformAdmin.billing.listAccessStates.useQuery();
  const statsQuery = trpc.platformAdmin.billing.stats.useQuery();

  const rows = accessStatesQuery.data || [];
  const stats = statsQuery.data || { totalRecords: 0, activeSubscriptions: 0, activeTrials: 0, pendingPayments: 0, pastDue: 0, failedPayments: 0 };

  const filtered = rows.filter((r) => {
    const matchesSearch =
      r.workspaceName?.toLowerCase().includes(search.toLowerCase()) ||
      r.workspaceOwner?.toLowerCase().includes(search.toLowerCase()) ||
      r.workspaceId?.toString().includes(search) ||
      r.status?.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    return matchesSearch && r.status === filter;
  });

  if (accessStatesQuery.isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      {selectedWorkspaceId !== null && (
        <WorkspaceBillingModal workspaceId={selectedWorkspaceId} onClose={() => setSelectedWorkspaceId(null)} />
      )}

      <PageHeader title="Billing Management" description="Manage workspace access states, subscriptions, and billing events." />

      <div className="p-4 sm:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard label="Total Records" value={stats.totalRecords ?? 0} />
          <StatCard label="Active" value={stats.activeSubscriptions ?? 0} color="text-green-400" />
          <StatCard label="Trials" value={stats.activeTrials ?? 0} color="text-amber-400" />
          <StatCard label="Expired" value={stats.pendingPayments ?? 0} color="text-orange-400" />
          <StatCard label="Past Due" value={stats.pastDue ?? 0} color="text-red-400" />
          <StatCard label="Cancelled" value={stats.failedPayments ?? 0} color="text-red-600" />
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          {["all", "active_paid", "trial_active", "grace", "override", "past_due", "suspended", "canceled", "pending_setup"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? "bg-blue-900 text-white" : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-900"
              }`}>
              {f === "all" ? "All" : f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <Input placeholder="Search by workspace name, owner email, or status..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="No access state records found. Workspaces will appear here once they complete signup." />
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Workspace</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Owner</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Access State</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Plan</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Sub Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Expires</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Updated</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-700 hover:bg-slate-900">
                    <td className="px-4 py-3 text-white font-medium">{r.workspaceName ?? `WS #${r.workspaceId}`}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{r.workspaceOwner ?? "\u2014"}</td>
                    <td className="px-4 py-3"><AccessStateBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{r.planName ?? "\u2014"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs capitalize">{r.subscriptionStatus ?? "\u2014"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{r.expiresAt ? new Date(r.expiresAt).toLocaleDateString() : "\u2014"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : "\u2014"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelectedWorkspaceId(r.workspaceId)}
                        className="text-blue-400 hover:text-blue-300" title="Manage billing">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
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

// ==================== OVERRIDES MANAGEMENT ====================
export function PlatformOverrides() {
  const [filter, setFilter] = useState("all");

  // Use platform.overrides (from platformRouter) which has list/create/update/delete
  const overridesQuery = trpc.platform.overrides.list.useQuery();
  const deleteMutation = trpc.platform.overrides.delete.useMutation({
    onSuccess: () => { overridesQuery.refetch(); toast.success("Override deleted."); },
    onError: (err: any) => toast.error(err.message),
  });

  const overrides = overridesQuery.data || [];
  const filtered = filter === "all" ? overrides : overrides.filter((o: any) => o.feature === filter);

  if (overridesQuery.isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      <PageHeader title="Overrides Management" description="Manage platform-owner corrections and manual overrides.">
        <Button onClick={() => toast.info("To create an override, navigate to a specific Workspace Detail page.")} className="bg-blue-900 text-white hover:bg-blue-800">
          <Plus className="w-4 h-4 mr-2" /> New Override
        </Button>
      </PageHeader>

      <div className="p-4 sm:p-8">
        {overrides.length === 0 ? (
          <EmptyState message="No overrides found. Create overrides from individual workspace detail pages." />
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Workspace</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Feature</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Value</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Reason</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Expires</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o: any) => (
                  <tr key={o.id} className="border-b border-slate-700 hover:bg-slate-900">
                    <td className="px-4 py-3 text-white">WS #{o.workspaceId}</td>
                    <td className="px-4 py-3 font-medium text-blue-300">{o.feature}</td>
                    <td className="px-4 py-3 font-semibold text-white">{o.value}</td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-[200px]">{o.reason || "—"}</td>
                    <td className="px-4 py-3"><Badge variant={o.isActive ? "default" : "secondary"}>{o.isActive ? "Active" : "Inactive"}</Badge></td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{o.expiresAt ? new Date(o.expiresAt).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { if (confirm("Delete this override?")) deleteMutation.mutate({ id: o.id }); }} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                    </td>
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

// ==================== SUPPORT TICKETS ====================
export function PlatformSupport() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [resolution, setResolution] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);

  const ticketsQuery = trpc.customerSupport.adminList.useQuery({});
  const updateMutation = trpc.customerSupport.adminUpdate.useMutation({
    onSuccess: () => { ticketsQuery.refetch(); messagesQuery.refetch(); setResolution(""); toast.success("Ticket updated."); },
    onError: (err: any) => toast.error(err.message),
  });
  const replyMutation = trpc.customerSupport.adminReply.useMutation({
    onSuccess: () => { messagesQuery.refetch(); setReplyContent(""); setIsInternalNote(false); toast.success("Reply sent."); },
    onError: (err: any) => toast.error(err.message),
  });

  const messagesQuery = trpc.customerSupport.adminGetMessages.useQuery(
    { ticketId: selectedTicket! },
    { enabled: !!selectedTicket }
  );

  const tickets = ticketsQuery.data || [];
  const filtered = tickets.filter((t: any) => {
    const matchesSearch = t.subject?.toLowerCase().includes(search.toLowerCase()) || t.body?.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    return matchesSearch && t.status === filter;
  });

  if (ticketsQuery.isLoading) return <LoadingState />;

  const messages = messagesQuery.data || [];

  return (
    <div className="min-h-screen bg-slate-900">
      <PageHeader title="Support Tickets" description="Manage customer support requests and resolutions across all workspaces." />

      <div className="p-4 sm:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total" value={tickets.length} />
          <StatCard label="Open" value={tickets.filter((t: any) => t.status === "open").length} color="text-amber-400" />
          <StatCard label="In Progress" value={tickets.filter((t: any) => t.status === "in_progress").length} color="text-blue-400" />
          <StatCard label="Waiting" value={tickets.filter((t: any) => t.status === "waiting_on_customer").length} color="text-purple-400" />
          <StatCard label="Resolved" value={tickets.filter((t: any) => t.status === "resolved").length} color="text-green-400" />
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {["all", "open", "in_progress", "waiting_on_customer", "resolved", "closed"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-blue-900 text-white" : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-900"}`}>
              {f === "all" ? "All" : f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
        </div>

        {/* Ticket Detail Modal with Messages */}
        {selectedTicket && (() => {
          const ticket = tickets.find((t: any) => t.id === selectedTicket);
          if (!ticket) return null;
          return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <Card className="bg-slate-800 border-slate-700 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{ticket.subject}</h3>
                    <div className="flex gap-2 mb-2">
                      <Badge variant={ticket.status === "open" ? "default" : "secondary"}>{ticket.status?.replace(/_/g, " ")}</Badge>
                      <Badge variant={ticket.priority === "critical" ? "destructive" : "secondary"}>{ticket.priority}</Badge>
                      {ticket.category && <Badge variant="outline" className="border-slate-600 text-slate-300">{ticket.category}</Badge>}
                    </div>
                    <div className="text-xs text-slate-500">
                      <p>User #{ticket.userId} | Workspace #{ticket.workspaceId || "N/A"} | Created: {new Date(ticket.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <Button onClick={() => { setSelectedTicket(null); setResolution(""); setReplyContent(""); }} variant="outline" size="sm" className="border-slate-700 text-slate-300">✕</Button>
                </div>

                {/* Status Actions */}
                <div className="mb-4 p-3 rounded-lg bg-slate-900 border border-slate-700">
                  <label className="text-xs text-slate-400 block mb-2">Update Status</label>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {(["open", "in_progress", "waiting_on_customer", "resolved", "closed"] as const).map((s) => (
                      <Button key={s} size="sm" variant={ticket.status === s ? "default" : "outline"}
                        className={ticket.status === s ? "bg-blue-600" : "border-slate-700 text-slate-300 text-xs"}
                        onClick={() => updateMutation.mutate({ id: ticket.id, status: s, resolution: resolution || undefined })}>
                        {s.replace(/_/g, " ")}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Resolution note (optional)..." className="bg-slate-800 border-slate-700 text-white flex-1" />
                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-300" onClick={() => updateMutation.mutate({ id: ticket.id, resolution })} disabled={!resolution.trim()}>Save Note</Button>
                  </div>
                </div>

                {/* Message Thread */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" /> Messages ({messages.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {messages.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No messages yet.</p>
                    ) : (
                      messages.map((msg: any) => (
                        <div key={msg.id} className={`p-3 rounded-lg text-sm ${
                          msg.isInternalNote
                            ? "bg-amber-900/20 border border-amber-800"
                            : msg.senderType === "admin"
                            ? "bg-blue-900/20 border border-blue-800"
                            : "bg-slate-900 border border-slate-700"
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${
                              msg.isInternalNote ? "text-amber-400" : msg.senderType === "admin" ? "text-blue-400" : "text-slate-300"
                            }`}>
                              {msg.isInternalNote ? "🔒 Internal Note" : msg.senderType === "admin" ? "Support Team" : msg.senderName || "Customer"}
                            </span>
                            <span className="text-xs text-slate-500 ml-auto">{new Date(msg.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-300 whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Reply Form */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <label className="text-xs text-slate-400">Reply</label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input type="checkbox" checked={isInternalNote} onChange={(e) => setIsInternalNote(e.target.checked)} className="rounded border-slate-600" />
                      <span className={isInternalNote ? "text-amber-400 font-medium" : "text-slate-400"}>Internal Note (hidden from customer)</span>
                    </label>
                  </div>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={3}
                    placeholder={isInternalNote ? "Add internal note (not visible to customer)..." : "Reply to customer..."}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm mb-2"
                  />
                  <div className="flex justify-end">
                    <Button size="sm" disabled={!replyContent.trim() || replyMutation.isPending}
                      className={isInternalNote ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"}
                      onClick={() => replyMutation.mutate({ ticketId: selectedTicket!, content: replyContent.trim(), isInternalNote })}>
                      {replyMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                      {isInternalNote ? "Add Internal Note" : "Send Reply"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          );
        })()}

        {filtered.length === 0 ? (
          <EmptyState message="No support tickets found." />
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Subject</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Priority</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Workspace</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Created</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t: any) => (
                  <tr key={t.id} className="border-b border-slate-700 hover:bg-slate-900 cursor-pointer" onClick={() => setSelectedTicket(t.id)}>
                    <td className="px-4 py-3 text-white font-medium">{t.subject}</td>
                    <td className="px-4 py-3">
                      <Badge variant={t.priority === "critical" || t.priority === "high" ? "destructive" : "secondary"}>
                        {t.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={t.status === "open" ? "default" : t.status === "resolved" ? "secondary" : "outline"}>
                        {t.status?.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">WS #{t.workspaceId || "N/A"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-blue-400 hover:text-blue-300"><MessageSquare className="w-4 h-4" /></button>
                    </td>
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

// ==================== PRICING HISTORY ====================
export function PlatformPricingHistory() {
  const versionsQuery = trpc.platformBusiness.planVersions.list.useQuery({ planId: 0 });
  const billingEventsQuery = trpc.platformBusiness.billingEvents.list.useQuery({});
  const plansQuery = trpc.platformAdmin.plans.list.useQuery();

  const versions = versionsQuery.data || [];
  const events = billingEventsQuery.data || [];
  const plans = plansQuery.data || [];

  if (versionsQuery.isLoading || billingEventsQuery.isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      <PageHeader title="Pricing History" description="View plan version history and billing events audit trail." />

      <div className="p-4 sm:p-8">
        {/* Plan Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {plans.map((plan) => (
            <Card key={plan.id} className="bg-slate-800 border-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{plan.name}</h3>
                <Badge variant={plan.isActive ? "default" : "secondary"}>{plan.isActive ? "Active" : "Archived"}</Badge>
              </div>
              <div className="text-sm text-slate-300">
                <p>Monthly: <span className="font-semibold text-white">${plan.monthlyPrice}</span></p>
                <p>Annual: <span className="font-semibold text-white">${plan.annualPrice || "—"}</span></p>
              </div>
            </Card>
          ))}
        </div>

        {/* Plan Version History */}
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-300" /> Plan Change History</h2>
        {versions.length === 0 ? (
          <EmptyState message="No plan version history recorded yet." />
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Plan</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Change Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Changed Fields</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v: any) => (
                  <tr key={v.id} className="border-b border-slate-700 hover:bg-slate-900">
                    <td className="px-4 py-3 text-white">Plan #{v.planId}</td>
                    <td className="px-4 py-3"><Badge variant="secondary">{v.changeType}</Badge></td>
                    <td className="px-4 py-3 text-slate-300 text-xs truncate max-w-[200px]">{v.changedFields || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(v.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Billing Events */}
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-amber-400" /> Billing Events</h2>
        {events.length === 0 ? (
          <EmptyState message="No billing events recorded yet." />
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Workspace</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Event Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Old State</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">New State</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Reason</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e: any) => (
                  <tr key={e.id} className="border-b border-slate-700 hover:bg-slate-900">
                    <td className="px-4 py-3 text-white">WS #{e.workspaceId}</td>
                    <td className="px-4 py-3"><Badge variant="secondary">{e.eventType}</Badge></td>
                    <td className="px-4 py-3 text-slate-400">{e.oldState || "—"}</td>
                    <td className="px-4 py-3 text-white font-semibold">{e.newState || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-[200px]">{e.reason || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(e.createdAt).toLocaleString()}</td>
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

// ==================== OWNERSHIP RECOVERY ====================
export function PlatformOwnershipRecovery() {
  const [workspaceId, setWorkspaceId] = useState("");
  const [newOwnerId, setNewOwnerId] = useState("");
  const [reason, setReason] = useState("");

  const workspacesQuery = trpc.platformAdmin.workspaces.list.useQuery();
  const transferMutation = trpc.platformAdmin.overrides.transferOwnership.useMutation({
    onSuccess: () => { toast.success("Ownership transferred successfully."); setWorkspaceId(""); setNewOwnerId(""); setReason(""); workspacesQuery.refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  const resetTrialMutation = trpc.platformAdmin.overrides.resetTrial.useMutation({
    onSuccess: () => { toast.success("Trial reset successfully."); workspacesQuery.refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  const resetOnboardingMutation = trpc.platformAdmin.overrides.resetOnboarding.useMutation({
    onSuccess: () => { toast.success("Onboarding reset successfully."); workspacesQuery.refetch(); },
    onError: (err: any) => toast.error(err.message),
  });

  const workspaces = workspacesQuery.data || [];

  if (workspacesQuery.isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      <PageHeader title="Ownership Recovery" description="Transfer workspace ownership and perform admin recovery actions." />

      <div className="p-4 sm:p-8">
        {/* Transfer Ownership Form */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-blue-300" /> Transfer Workspace Ownership
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Workspace ID</label>
              <Input value={workspaceId} onChange={(e) => setWorkspaceId(e.target.value)} placeholder="Enter workspace ID" type="number" className="bg-slate-900 border-slate-700 text-white" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">New Owner User ID</label>
              <Input value={newOwnerId} onChange={(e) => setNewOwnerId(e.target.value)} placeholder="Enter new owner user ID" type="number" className="bg-slate-900 border-slate-700 text-white" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Reason</label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for transfer" className="bg-slate-900 border-slate-700 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => {
                if (!workspaceId || !newOwnerId || !reason) { toast.error("All fields are required."); return; }
                if (confirm(`Transfer workspace #${workspaceId} to user #${newOwnerId}?`)) {
                  transferMutation.mutate({ workspaceId: parseInt(workspaceId), newOwnerId: parseInt(newOwnerId), reason });
                }
              }}
              disabled={transferMutation.isPending}
              className="bg-amber-900 text-white hover:bg-amber-800"
            >
              {transferMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Transfer Ownership"}
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-blue-300" /> Quick Recovery Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h4 className="font-semibold text-white mb-2">Reset Trial</h4>
            <p className="text-sm text-slate-400 mb-4">Reset the trial flag for a workspace so they can start a new trial period.</p>
            <div className="flex gap-2">
              <Input id="reset-trial-ws" placeholder="Workspace ID" type="number" className="bg-slate-900 border-slate-700 text-white" />
              <Button
                onClick={() => {
                  const wsId = parseInt((document.getElementById("reset-trial-ws") as HTMLInputElement)?.value);
                  if (!wsId) { toast.error("Enter a workspace ID"); return; }
                  const r = prompt("Reason for trial reset:");
                  if (r) resetTrialMutation.mutate({ workspaceId: wsId, reason: r });
                }}
                className="bg-blue-900 text-white hover:bg-blue-800 whitespace-nowrap"
              >
                Reset Trial
              </Button>
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h4 className="font-semibold text-white mb-2">Reset Onboarding</h4>
            <p className="text-sm text-slate-400 mb-4">Reset onboarding completion flag so the workspace sees the setup wizard again.</p>
            <div className="flex gap-2">
              <Input id="reset-onboarding-ws" placeholder="Workspace ID" type="number" className="bg-slate-900 border-slate-700 text-white" />
              <Button
                onClick={() => {
                  const wsId = parseInt((document.getElementById("reset-onboarding-ws") as HTMLInputElement)?.value);
                  if (!wsId) { toast.error("Enter a workspace ID"); return; }
                  const r = prompt("Reason for onboarding reset:");
                  if (r) resetOnboardingMutation.mutate({ workspaceId: wsId, reason: r });
                }}
                className="bg-blue-900 text-white hover:bg-blue-800 whitespace-nowrap"
              >
                Reset Onboarding
              </Button>
            </div>
          </Card>
        </div>

        {/* Workspace Directory */}
        <h2 className="text-xl font-bold text-white mb-4">Workspace Directory</h2>
        {workspaces.length === 0 ? (
          <EmptyState message="No workspaces found." />
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Owner</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {workspaces.map((ws: any) => (
                  <tr key={ws.id} className="border-b border-slate-700 hover:bg-slate-900">
                    <td className="px-4 py-3 text-blue-300 font-mono">#{ws.id}</td>
                    <td className="px-4 py-3 text-white">{ws.name || ws.companyName || "Unnamed"}</td>
                    <td className="px-4 py-3 text-slate-300">{ws.ownerName || `User #${ws.ownerId}`}</td>
                    <td className="px-4 py-3"><Badge variant={ws.isActive !== false ? "default" : "destructive"}>{ws.isActive !== false ? "Active" : "Suspended"}</Badge></td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : "—"}</td>
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

// ==================== WORKSPACES DIRECTORY ====================
export function PlatformWorkspaces() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [suspendReason, setSuspendReason] = React.useState("");
  const [suspendTarget, setSuspendTarget] = React.useState<number | null>(null);
  const [reactivateTarget, setReactivateTarget] = React.useState<number | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [showBulkSuspendDialog, setShowBulkSuspendDialog] = React.useState(false);
  const [bulkSuspendReason, setBulkSuspendReason] = React.useState("");
  const [showBulkReactivateDialog, setShowBulkReactivateDialog] = React.useState(false);
  const [bulkReactivateReason, setBulkReactivateReason] = React.useState("");
  const [showColumnPicker, setShowColumnPicker] = React.useState(false);
  const ALL_COLUMNS = [
    { key: "id", label: "ID" },
    { key: "name", label: "Workspace Name" },
    { key: "companyName", label: "Company Name" },
    { key: "status", label: "Status" },
    { key: "plan", label: "Plan" },
    { key: "ownerName", label: "Owner Name" },
    { key: "ownerEmail", label: "Owner Email" },
    { key: "contractingModel", label: "Contracting Model" },
    { key: "onboardingCompleted", label: "Onboarding Completed" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
  ] as const;
  const [selectedColumns, setSelectedColumns] = React.useState<Set<string>>(
    new Set(["name", "companyName", "status", "ownerName", "ownerEmail", "plan", "createdAt"])
  );
  const toggleColumn = (key: string) => {
    setSelectedColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); } else next.add(key);
      return next;
    });
  };

  const { data: workspaces = [], isLoading, refetch } = trpc.platformAdmin.workspaces.list.useQuery();
  const { data: metrics } = trpc.platformAdmin.dashboardMetrics.useQuery();
  const suspendMut = trpc.platformAdmin.workspaces.suspend.useMutation({ onSuccess: () => { refetch(); setSuspendTarget(null); setSuspendReason(""); toast.success("Workspace suspended"); } });
  const reactivateMut = trpc.platformAdmin.workspaces.reactivate.useMutation({ onSuccess: () => { refetch(); setReactivateTarget(null); toast.success("Workspace reactivated"); } });
  const bulkSuspendMut = trpc.platformAdmin.workspaces.bulkSuspend.useMutation({
    onSuccess: (data) => {
      refetch();
      setSelectedIds(new Set());
      setShowBulkSuspendDialog(false);
      setBulkSuspendReason("");
      toast.success(`${data.count} workspace(s) suspended.`);
    },
    onError: (e) => toast.error(e.message),
  });
  const bulkReactivateMut = trpc.platformAdmin.workspaces.bulkReactivate.useMutation({
    onSuccess: (data) => {
      refetch();
      setSelectedIds(new Set());
      setShowBulkReactivateDialog(false);
      setBulkReactivateReason("");
      toast.success(`${data.count} workspace(s) reactivated.`);
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(ws => ws.id)));
    }
  };

  const exportCsv = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    params.set("columns", Array.from(selectedColumns).join(","));
    window.open(`/api/export/admin/workspaces?${params.toString()}`, "_blank");
    setShowColumnPicker(false);
  };

  const filtered = workspaces.filter(ws => {
    const matchSearch = !search ||
      ws.name.toLowerCase().includes(search.toLowerCase()) ||
      (ws.ownerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (ws.ownerEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      (ws.companyName || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || ws.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColor = (s: string) => {
    if (s === "active") return "bg-green-900/40 text-green-300 border border-green-700";
    if (s === "suspended") return "bg-red-900/40 text-red-300 border border-red-700";
    if (s === "deactivated") return "bg-slate-700/40 text-slate-400 border border-slate-600";
    return "bg-slate-700/40 text-slate-400 border border-slate-600";
  };

  const billingColor = (s: string) => {
    if (s === "active") return "text-green-400";
    if (s === "trial") return "text-cyan-400";
    if (s === "past_due") return "text-yellow-400";
    if (s === "none") return "text-slate-500";
    return "text-slate-400";
  };

  if (isLoading) return <LoadingState />;

  const summaryCards = [
    { label: "Total Workspaces", value: metrics?.totalWorkspaces ?? workspaces.length, color: "text-blue-300" },
    { label: "Active Paid", value: metrics?.paidWorkspaces ?? 0, color: "text-green-400" },
    { label: "Trial", value: metrics?.trialWorkspaces ?? 0, color: "text-cyan-400" },
    { label: "Suspended", value: metrics?.suspendedWorkspaces ?? 0, color: "text-red-400" },
    { label: "Open Tickets", value: metrics?.openTickets ?? 0, color: "text-yellow-400" },
    { label: "New (30d)", value: metrics?.newWorkspacesThisMonth ?? 0, color: "text-purple-400" },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Workspace Directory" description="All customer workspaces — search, filter, and manage access." />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {summaryCards.map(c => (
          <div key={c.label} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Search, Filter & Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, owner, company, or email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deactivated">Deactivated</option>
        </select>
        <div className="relative shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowColumnPicker(v => !v)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Download className="w-4 h-4 mr-1" /> Export CSV <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          {showColumnPicker && (
            <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-3">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Columns to export</p>
              <div className="space-y-1 mb-3">
                {ALL_COLUMNS.map(col => (
                  <label key={col.key} className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50 px-2 py-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedColumns.has(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      className="accent-blue-500"
                    />
                    <span className="text-sm text-slate-200">{col.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-blue-700 hover:bg-blue-600 text-white" onClick={exportCsv}>
                  <Download className="w-3 h-3 mr-1" /> Download
                </Button>
                <Button size="sm" variant="ghost" className="text-slate-400" onClick={() => setShowColumnPicker(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (() => {
        const selectedWorkspaces = filtered.filter(ws => selectedIds.has(ws.id));
        const statusCounts = { active: 0, suspended: 0, deactivated: 0 };
        selectedWorkspaces.forEach(ws => {
          const st = ws.status as keyof typeof statusCounts;
          if (st in statusCounts) statusCounts[st]++;
        });
        const breakdown = Object.entries(statusCounts).filter(([_, c]) => c > 0).map(([st, c]) => `${c} ${st}`).join(', ');
        return (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
          <span className="text-sm text-blue-300 font-medium">{selectedIds.size} workspace{selectedIds.size !== 1 ? 's' : ''} selected ({breakdown})</span>
          <Button
            size="sm"
            variant="outline"
            className="border-red-700 text-red-400 hover:bg-red-900/30 ml-auto"
            onClick={() => setShowBulkSuspendDialog(true)}
          >
            Suspend Selected
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-green-700 text-green-400 hover:bg-green-900/30"
            onClick={() => setShowBulkReactivateDialog(true)}
          >
            Reactivate Selected
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-slate-400"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </Button>
        </div>
        );
      })()}

      {/* Workspace Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">No workspaces found</p>
          <p className="text-sm mt-1">{search || statusFilter !== "all" ? "Try adjusting your search or filter." : "No workspaces have been created yet."}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                <th className="px-4 py-3 w-8">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white transition-colors">
                    {selectedIds.size === filtered.length && filtered.length > 0
                      ? <CheckSquare className="w-4 h-4 text-blue-400" />
                      : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Workspace</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Owner</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden lg:table-cell">Plan</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden lg:table-cell">Billing</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden xl:table-cell">Created</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filtered.map(ws => (
                <tr key={ws.id} className={`bg-slate-900 hover:bg-slate-800/60 transition-colors ${selectedIds.has(ws.id) ? 'bg-blue-900/20' : ''}`}>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(ws.id)} className="text-slate-400 hover:text-white transition-colors">
                      {selectedIds.has(ws.id)
                        ? <CheckSquare className="w-4 h-4 text-blue-400" />
                        : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{ws.name}</p>
                      {ws.companyName && <p className="text-xs text-slate-400">{ws.companyName}</p>}
                      <p className="text-xs text-slate-500 md:hidden">{ws.ownerEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div>
                      <p className="text-white">{ws.ownerName}</p>
                      <p className="text-xs text-slate-400">{ws.ownerEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-slate-300">{ws.planName || "No Plan"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(ws.status)}`}>{ws.status}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs font-medium ${billingColor(ws.billingStatus || "none")}`}>{ws.billingStatus || "none"}</span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-slate-400 text-xs">{ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={() => window.location.href = `/platform/workspaces/${ws.id}`}
                      >
                        <Eye className="w-3 h-3 mr-1" /> View
                      </Button>
                      {ws.status === "active" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-red-800 text-red-400 hover:bg-red-900/30"
                          onClick={() => setSuspendTarget(ws.id)}
                        >
                          Suspend
                        </Button>
                      ) : ws.status === "suspended" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-green-800 text-green-400 hover:bg-green-900/30"
                          onClick={() => setReactivateTarget(ws.id)}
                        >
                          Reactivate
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Suspend Dialog */}
      {suspendTarget !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-white">Suspend Workspace</h3>
            <p className="text-sm text-slate-400">This will immediately block all access for this workspace. Provide a reason for the audit log.</p>
            <textarea
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              placeholder="Reason for suspension (required)..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 min-h-[80px]"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" className="text-slate-400" onClick={() => { setSuspendTarget(null); setSuspendReason(""); }}>Cancel</Button>
              <Button
                className="bg-red-700 hover:bg-red-600 text-white"
                disabled={!suspendReason.trim() || suspendMut.isPending}
                onClick={() => suspendMut.mutate({ id: suspendTarget, reason: suspendReason })}
              >
                {suspendMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Suspend Workspace"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Dialog */}
      {reactivateTarget !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-white">Reactivate Workspace</h3>
            <p className="text-sm text-slate-400">This will restore full access for this workspace.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" className="text-slate-400" onClick={() => setReactivateTarget(null)}>Cancel</Button>
              <Button
                className="bg-green-700 hover:bg-green-600 text-white"
                disabled={reactivateMut.isPending}
                onClick={() => reactivateMut.mutate({ id: reactivateTarget, reason: "Manually reactivated by platform admin" })}
              >
                {reactivateMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reactivate"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Suspend Dialog */}
      {showBulkSuspendDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-white">Suspend {selectedIds.size} Workspace{selectedIds.size !== 1 ? 's' : ''}</h3>
            <p className="text-sm text-slate-400">This will immediately block access for all selected workspaces. Provide a reason for the audit log.</p>
            <textarea
              value={bulkSuspendReason}
              onChange={e => setBulkSuspendReason(e.target.value)}
              placeholder="Reason for bulk suspension (required)..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 min-h-[80px]"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" className="text-slate-400" onClick={() => { setShowBulkSuspendDialog(false); setBulkSuspendReason(""); }}>Cancel</Button>
              <Button
                className="bg-red-700 hover:bg-red-600 text-white"
                disabled={!bulkSuspendReason.trim() || bulkSuspendMut.isPending}
                onClick={() => bulkSuspendMut.mutate({ ids: Array.from(selectedIds), reason: bulkSuspendReason })}
              >
                {bulkSuspendMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : `Suspend ${selectedIds.size} Workspace${selectedIds.size !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Reactivate Dialog */}
      {showBulkReactivateDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-white">Reactivate {selectedIds.size} Workspace{selectedIds.size !== 1 ? 's' : ''}</h3>
            <p className="text-sm text-slate-400">This will restore full access for all selected workspaces. Provide a reason for the audit log.</p>
            <textarea
              value={bulkReactivateReason}
              onChange={e => setBulkReactivateReason(e.target.value)}
              placeholder="Reason for bulk reactivation (required)..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-600 min-h-[80px]"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" className="text-slate-400" onClick={() => { setShowBulkReactivateDialog(false); setBulkReactivateReason(""); }}>Cancel</Button>
              <Button
                className="bg-green-700 hover:bg-green-600 text-white"
                disabled={!bulkReactivateReason.trim() || bulkReactivateMut.isPending}
                onClick={() => bulkReactivateMut.mutate({ ids: Array.from(selectedIds), reason: bulkReactivateReason })}
              >
                {bulkReactivateMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : `Reactivate ${selectedIds.size} Workspace${selectedIds.size !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PlatformWorkspaceSummary() {
  return <PlatformWorkspaces />;
}

export function PlatformDemoWorkspaces() {
  return (
    <div className="p-8">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Demo Workspaces</h3>
        <p className="text-slate-400 text-sm mb-4">Demo workspaces allow you to showcase PrimeContractorOS features without affecting production data. This feature requires configuration.</p>
        <p className="text-xs text-slate-500">Status: Setup Required</p>
      </div>
    </div>
  );
}

export { default as PlatformTasks } from "./PlatformTasks";
