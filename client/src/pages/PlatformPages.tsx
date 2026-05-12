import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Edit2, Plus, Download, Eye, Copy, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// ==================== PLANS MANAGEMENT ====================
export function PlatformPlans() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    internalCode: "",
    description: "",
    monthlyPrice: 0,
    annualPrice: 0,
    setupFee: 0,
    trialAllowed: true,
    discountAllowed: true,
    isActive: true,
    maxUsers: 5,
    maxOpportunities: 50,
    maxProposals: 20,
    maxContracts: 10,
    storageGb: 10,
    aiScanLimit: 100,
    supportLevel: "email",
    exportAccess: true,
    reportingLevel: "basic",
  });

  const plansQuery = trpc.platformAdmin.plans.list.useQuery();
  const createMutation = trpc.platformAdmin.plans.create.useMutation({
    onSuccess: () => {
      plansQuery.refetch();
      setShowForm(false);
      setFormData({
        name: "",
        internalCode: "",
        description: "",
        monthlyPrice: 0,
        annualPrice: 0,
        setupFee: 0,
        trialAllowed: true,
        discountAllowed: true,
        isActive: true,
        maxUsers: 5,
        maxOpportunities: 50,
        maxProposals: 20,
        maxContracts: 10,
        storageGb: 10,
        aiScanLimit: 100,
        supportLevel: "email",
        exportAccess: true,
        reportingLevel: "basic",
      });
      toast.success("Plan created successfully.");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.platformAdmin.plans.delete.useMutation({
    onSuccess: () => {
      plansQuery.refetch();
      toast.success("Plan archived.");
    },
    onError: (err) => toast.error(err.message),
  });

  const plans = plansQuery.data || [];
  const filtered = plans.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.internalCode?.toLowerCase().includes(search.toLowerCase())
  );

  if (plansQuery.isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-8 py-3 sm:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Plans Management</h1>
            <p className="text-slate-300">Create and manage subscription plans.</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-900 text-white hover:bg-blue-800"
          >
            <Plus className="w-4 h-4 mr-2" /> New Plan
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        {showForm && (
          <Card className="mb-6 bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Plan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Plan name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
              />
              <Input
                placeholder="Internal code"
                value={formData.internalCode}
                onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
              />
              <Input
                placeholder="Monthly price"
                type="number"
                value={formData.monthlyPrice}
                onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) })}
                className="bg-slate-900 border-slate-700 text-white"
              />
              <Input
                placeholder="Annual price"
                type="number"
                value={formData.annualPrice}
                onChange={(e) => setFormData({ ...formData, annualPrice: parseFloat(e.target.value) })}
                className="bg-slate-900 border-slate-700 text-white"
              />
              <Input
                placeholder="Max users"
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                className="bg-slate-900 border-slate-700 text-white"
              />
              <Input
                placeholder="Max opportunities"
                type="number"
                value={formData.maxOpportunities}
                onChange={(e) => setFormData({ ...formData, maxOpportunities: parseInt(e.target.value) })}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => createMutation.mutate(formData)}
                disabled={createMutation.isPending}
                className="bg-green-900 text-white hover:bg-green-800"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <div className="mb-6">
          <Input
            placeholder="Search plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>

        {filtered.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <p className="text-slate-400">No plans found. Create your first plan to get started.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((plan) => (
              <Card key={plan.id} className="bg-slate-800 border-slate-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    <p className="text-sm text-slate-400">{plan.internalCode}</p>
                  </div>
                  <Badge variant={plan.isActive ? "default" : "secondary"}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 mb-4">{plan.description}</p>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Monthly:</span>
                    <span className="font-semibold text-white">${plan.monthlyPrice}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Annual:</span>
                    <span className="font-semibold text-white">${plan.annualPrice}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Max Users:</span>
                    <span className="font-semibold text-white">{plan.maxUsers}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Storage:</span>
                    <span className="font-semibold text-white">{plan.storageGb} GB</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => toast.success("View details coming soon")}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-slate-700 text-slate-300"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => deleteMutation.mutate({ id: plan.id })}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-700 text-red-400 hover:bg-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
    name: "",
    description: "",
    discountType: "percent",
    value: 0,
    appliesToAllPlans: true,
    newCustomersOnly: false,
    usageLimit: 0,
    startDate: new Date().toISOString().split("T")[0],
    expirationDate: "",
    isActive: true,
  });

  const discountsQuery = trpc.platformAdmin.discounts.list.useQuery();
  const createMutation = trpc.platformAdmin.discounts.create.useMutation({
    onSuccess: () => {
      discountsQuery.refetch();
      setShowForm(false);
      toast.success("Discount created successfully.");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.platformAdmin.discounts.delete.useMutation({
    onSuccess: () => {
      discountsQuery.refetch();
      toast.success("Discount disabled.");
    },
    onError: (err) => toast.error(err.message),
  });

  const discounts = discountsQuery.data || [];
  const filtered = discounts.filter((d) =>
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    d.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (discountsQuery.isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-8 py-3 sm:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Discounts Management</h1>
            <p className="text-slate-300">Create and manage promo codes and discounts.</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-900 text-white hover:bg-blue-800"
          >
            <Plus className="w-4 h-4 mr-2" /> New Discount
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        {showForm && (
          <Card className="mb-6 bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Discount</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Discount code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="bg-slate-900 border-slate-700 text-white"
              />
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
              />
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="bg-slate-900 border border-slate-700 text-white rounded px-3 py-2"
              >
                <option value="percent">Percentage</option>
                <option value="flat">Flat Amount</option>
                <option value="free_month">Free Month</option>
                <option value="trial_extension">Trial Extension</option>
              </select>
              <Input
                placeholder="Value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                className="bg-slate-900 border-slate-700 text-white"
              />
              <Input
                placeholder="Expiration date"
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
              />
              <Input
                placeholder="Usage limit (0 = unlimited)"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => createMutation.mutate(formData)}
                disabled={createMutation.isPending}
                className="bg-green-900 text-white hover:bg-green-800"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <div className="mb-6">
          <Input
            placeholder="Search discounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>

        {filtered.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <p className="text-slate-400">No discounts found. Create your first discount to get started.</p>
          </Card>
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Value</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Expiration</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((discount) => (
                  <tr key={discount.id} className="border-b border-slate-700 hover:bg-slate-900">
                    <td className="px-4 py-3 font-mono text-blue-300">{discount.code}</td>
                    <td className="px-4 py-3 text-white">{discount.name}</td>
                    <td className="px-4 py-3 text-slate-300 capitalize">{discount.discountType}</td>
                    <td className="px-4 py-3 text-white font-semibold">
                      {discount.discountType === "percent" ? `${discount.value}%` : `$${discount.value}`}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{discount.expirationDate || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={discount.isActive ? "default" : "secondary"}>
                        {discount.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(discount.code);
                          toast.success("Code copied to clipboard.");
                        }}
                        className="text-blue-400 hover:text-blue-300 mr-2"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate({ id: discount.id })}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
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

// ==================== BILLING MANAGEMENT ====================
export function PlatformBilling() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const billingQuery = trpc.platformAdmin.billing.list.useQuery();
  const statsQuery = trpc.platformAdmin.billing.stats.useQuery();

  const billing = billingQuery.data || [];
  const stats = statsQuery.data || {
    totalRecords: 0,
    activeSubscriptions: 0,
    activeTrials: 0,
    pendingPayments: 0,
    pastDue: 0,
    failedPayments: 0,
  };

  const filtered = billing.filter((b) => {
    const matchesSearch = b.workspaceId?.toString().includes(search) || b.billingStatus?.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    return matchesSearch && b.billingStatus?.toLowerCase() === filter.toLowerCase();
  });

  if (billingQuery.isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-8 py-3 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Billing Management</h1>
        <p className="text-slate-300">Manage workspace billing, subscriptions, and payment states.</p>
      </div>

      <div className="p-4 sm:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="text-2xl font-bold text-blue-300">{stats.totalRecords}</div>
            <div className="text-xs text-slate-400">Total Records</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</div>
            <div className="text-xs text-slate-400">Active Subscriptions</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="text-2xl font-bold text-amber-600">{stats.activeTrials}</div>
            <div className="text-xs text-slate-400">Active Trials</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</div>
            <div className="text-xs text-slate-400">Pending Payments</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="text-2xl font-bold text-red-600">{stats.pastDue}</div>
            <div className="text-xs text-slate-400">Past Due</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="text-2xl font-bold text-red-700">{stats.failedPayments}</div>
            <div className="text-xs text-slate-400">Failed Payments</div>
          </Card>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          {["all", "active paid", "pending payment", "past due", "suspended"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-blue-900 text-white"
                  : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-900"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search by workspace or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>

        {filtered.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <p className="text-slate-400">No billing records found.</p>
          </Card>
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Workspace</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Plan</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Trial End</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Renewal</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-slate-700 hover:bg-slate-900">
                    <td className="px-4 py-3 text-white">WS #{b.workspaceId}</td>
                    <td className="px-4 py-3 text-slate-300">{b.planName || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          b.billingStatus === "active paid"
                            ? "default"
                            : b.billingStatus === "pending payment"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {b.billingStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{b.trialEndDate || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{b.renewalDate || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toast.success("Billing detail view coming soon")}
                        className="text-blue-400 hover:text-blue-300"
                      >
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

  const overridesQuery = trpc.platformAdmin.overrides.list.useQuery();
  const deleteMutation = trpc.platformAdmin.overrides.delete.useMutation({
    onSuccess: () => {
      overridesQuery.refetch();
      toast.success("Override deleted.");
    },
    onError: (err) => toast.error(err.message),
  });

  const overrides = overridesQuery.data || [];
  const filtered = filter === "all" ? overrides : overrides.filter((o) => o.overrideType === filter);

  if (overridesQuery.isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-8 py-3 sm:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Overrides Management</h1>
            <p className="text-slate-300">Manage platform-owner corrections and manual overrides.</p>
          </div>
          <Button className="bg-blue-900 text-white hover:bg-blue-800">
            <Plus className="w-4 h-4 mr-2" /> New Override
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "change plan", "change access", "unlock feature", "extend trial", "apply discount"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-blue-900 text-white"
                  : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-900"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <p className="text-slate-400">No overrides found.</p>
          </Card>
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Workspace</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Old Value</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">New Value</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Reason</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-slate-700 hover:bg-slate-900">
                    <td className="px-4 py-3 text-white">WS #{o.workspaceId}</td>
                    <td className="px-4 py-3 font-medium text-blue-300 capitalize">{o.overrideType}</td>
                    <td className="px-4 py-3 text-slate-400">{o.oldValue || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-white">{o.newValue}</td>
                    <td className="px-4 py-3 text-slate-400 truncate">{o.reason || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={o.isActive ? "default" : "secondary"}>
                        {o.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm("Delete this override?")) deleteMutation.mutate({ id: o.id });
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
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

// ==================== SHARED COMPONENTS ====================
function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-300" />
    </div>
  );
}


// ==================== STUB EXPORTS FOR ROUTING ====================
// These are placeholder components that will be implemented in separate files

export function PlatformWorkspaces() {
  return <div className="p-8 text-slate-300">Workspaces Directory (implemented in PlatformAdmin.tsx)</div>;
}

export function PlatformWorkspaceSummary() {
  return <div className="p-8 text-slate-300">Workspace Summary (implemented in PlatformAdmin.tsx)</div>;
}

export function PlatformSupport() {
  return <div className="p-8 text-slate-300">Support Tickets (placeholder)</div>;
}

export function PlatformPricingHistory() {
  return <div className="p-8 text-slate-300">Pricing History (placeholder)</div>;
}

export function PlatformOwnershipRecovery() {
  return <div className="p-8 text-slate-300">Ownership Recovery (placeholder)</div>;
}

export function PlatformDemoWorkspaces() {
  return <div className="p-8 text-slate-300">Demo Workspaces (placeholder)</div>;
}

export { default as PlatformTasks } from "./PlatformTasks";
