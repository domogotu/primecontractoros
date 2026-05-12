import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Plus, Eye, Copy, AlertCircle, Shield, Clock, Search, MessageSquare, ArrowLeftRight } from "lucide-react";
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
                  <Button onClick={() => toast.info("View details coming soon")} size="sm" variant="outline" className="flex-1 border-slate-700 text-slate-300"><Eye className="w-4 h-4" /></Button>
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
export function PlatformBilling() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const billingQuery = trpc.platformAdmin.billing.list.useQuery();
  const statsQuery = trpc.platformAdmin.billing.stats.useQuery();

  const billing = billingQuery.data || [];
  const stats = statsQuery.data || { totalRecords: 0, activeSubscriptions: 0, activeTrials: 0, pendingPayments: 0, pastDue: 0, failedPayments: 0 };

  const filtered = billing.filter((b) => {
    const matchesSearch = b.workspaceId?.toString().includes(search) || b.status?.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    return matchesSearch && b.status === filter;
  });

  if (billingQuery.isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      <PageHeader title="Billing Management" description="Manage workspace billing, subscriptions, and payment states." />

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
          {["all", "trial", "active", "past_due", "cancelled", "expired"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-blue-900 text-white" : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-900"}`}>
              {f === "all" ? "All" : f.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <Input placeholder="Search by workspace or status..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="No billing records found." />
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Workspace</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Plan ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Cycle</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Trial Ends</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Period End</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-slate-700 hover:bg-slate-900">
                    <td className="px-4 py-3 text-white">WS #{b.workspaceId}</td>
                    <td className="px-4 py-3 text-slate-300">Plan #{b.planId}</td>
                    <td className="px-4 py-3">
                      <Badge variant={b.status === "active" ? "default" : b.status === "trial" ? "secondary" : "destructive"}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-300 capitalize">{b.billingCycle || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{b.trialEndsAt ? new Date(b.trialEndsAt).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{b.currentPeriodEnd ? new Date(b.currentPeriodEnd).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => toast.info("Billing detail view coming soon")} className="text-blue-400 hover:text-blue-300"><Eye className="w-4 h-4" /></button>
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
        <Button onClick={() => toast.info("Create override from Workspace Detail page")} className="bg-blue-900 text-white hover:bg-blue-800">
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

  const ticketsQuery = trpc.platform.support.list.useQuery();
  const updateMutation = trpc.platform.support.update.useMutation({
    onSuccess: () => { ticketsQuery.refetch(); setSelectedTicket(null); setResolution(""); toast.success("Ticket updated."); },
    onError: (err: any) => toast.error(err.message),
  });

  const tickets = ticketsQuery.data || [];
  const filtered = tickets.filter((t: any) => {
    const matchesSearch = t.subject?.toLowerCase().includes(search.toLowerCase()) || t.body?.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    return matchesSearch && t.status === filter;
  });

  if (ticketsQuery.isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      <PageHeader title="Support Tickets" description="Manage customer support requests and resolutions." />

      <div className="p-4 sm:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total" value={tickets.length} />
          <StatCard label="Open" value={tickets.filter((t: any) => t.status === "open").length} color="text-amber-400" />
          <StatCard label="In Progress" value={tickets.filter((t: any) => t.status === "in_progress").length} color="text-blue-400" />
          <StatCard label="Resolved" value={tickets.filter((t: any) => t.status === "resolved").length} color="text-green-400" />
          <StatCard label="Closed" value={tickets.filter((t: any) => t.status === "closed").length} color="text-slate-400" />
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

        {/* Ticket Detail Modal */}
        {selectedTicket && (() => {
          const ticket = tickets.find((t: any) => t.id === selectedTicket);
          if (!ticket) return null;
          return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <Card className="bg-slate-800 border-slate-700 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-2">{ticket.subject}</h3>
                <div className="flex gap-2 mb-4">
                  <Badge variant={ticket.status === "open" ? "default" : "secondary"}>{ticket.status}</Badge>
                  <Badge variant={ticket.priority === "critical" ? "destructive" : "secondary"}>{ticket.priority}</Badge>
                </div>
                <p className="text-slate-300 text-sm mb-4 whitespace-pre-wrap">{ticket.body}</p>
                <div className="text-xs text-slate-500 mb-4">
                  <p>User #{ticket.userId} | WS #{ticket.workspaceId || "N/A"}</p>
                  <p>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Update Status</label>
                    <div className="flex gap-2 flex-wrap">
                      {(["in_progress", "waiting_on_customer", "resolved", "closed"] as const).map((s) => (
                        <Button key={s} size="sm" variant="outline" className="border-slate-700 text-slate-300 text-xs"
                          onClick={() => updateMutation.mutate({ id: ticket.id, status: s, resolution: resolution || undefined })}>
                          {s.replace(/_/g, " ")}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Resolution Note</label>
                    <Input value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Add resolution note..." className="bg-slate-900 border-slate-700 text-white" />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button onClick={() => { setSelectedTicket(null); setResolution(""); }} variant="outline" className="border-slate-700 text-slate-300">Close</Button>
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
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">User</th>
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
                    <td className="px-4 py-3 text-slate-300">User #{t.userId}</td>
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

// ==================== STUB EXPORTS ====================
export function PlatformWorkspaces() {
  return <div className="p-8 text-slate-300">Workspaces Directory (implemented in PlatformAdmin.tsx)</div>;
}

export function PlatformWorkspaceSummary() {
  return <div className="p-8 text-slate-300">Workspace Summary (implemented in PlatformAdmin.tsx)</div>;
}

export function PlatformDemoWorkspaces() {
  return <div className="p-8 text-slate-300">Demo Workspaces (placeholder — coming soon)</div>;
}

export { default as PlatformTasks } from "./PlatformTasks";
