import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, CheckCircle, XCircle, AlertTriangle, Clock, Ban, Rocket, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, string> = {
  public_pages: "Public Pages",
  signup_login: "Signup / Login",
  checkout_billing: "Checkout / Billing",
  workspace_creation: "Workspace Creation",
  onboarding: "Onboarding",
  dashboard: "Dashboard",
  opportunities: "Opportunities",
  sam_gov_import: "SAM.gov Import",
  ai_workflows: "AI Workflows",
  proposals: "Proposals",
  contracts: "Contracts",
  contract_hub: "Contract Hub",
  files_document_control: "Files / Document Control",
  invoices_payments: "Invoices / Payments",
  finance: "Finance",
  reports: "Reports",
  closeout: "Closeout",
  customer_support: "Customer Support",
  platform_admin: "Platform Admin",
  system_health: "System Health",
  integrations: "Integrations",
  security: "Security",
  mobile_responsive: "Mobile / Responsive",
  environment_variables: "Environment Variables",
  backups_export: "Backups / Export",
  legal_pages: "Legal Pages",
  final_route_test: "Final Route Test",
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "passed": return <CheckCircle className="w-4 h-4 text-green-400" />;
    case "failed": return <XCircle className="w-4 h-4 text-red-400" />;
    case "in_progress": return <Clock className="w-4 h-4 text-yellow-400" />;
    case "blocked": return <Ban className="w-4 h-4 text-orange-400" />;
    default: return <div className="w-4 h-4 rounded-full border-2 border-slate-500" />;
  }
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    passed: "bg-green-900/50 text-green-300 border-green-700",
    failed: "bg-red-900/50 text-red-300 border-red-700",
    in_progress: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
    blocked: "bg-orange-900/50 text-orange-300 border-orange-700",
    not_started: "bg-slate-700 text-slate-400 border-slate-600",
  };
  return <Badge className={colors[status] || colors.not_started}>{status.replace(/_/g, " ")}</Badge>;
}

export default function PlatformLaunchReadiness() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "public_pages",
    owner: "",
    notes: "",
    relatedRoute: "",
  });

  const checklistQuery = trpc.platformHealth.getLaunchChecklist.useQuery();
  const reportQuery = trpc.platformHealth.generateLaunchReport.useQuery();
  const seedMutation = trpc.platformHealth.seedLaunchChecklist.useMutation({
    onSuccess: (result) => {
      checklistQuery.refetch();
      reportQuery.refetch();
      toast.success(result.message || "Checklist seeded.");
    },
    onError: (err: any) => toast.error(err.message),
  });
  const createMutation = trpc.platformHealth.createLaunchItem.useMutation({
    onSuccess: () => {
      checklistQuery.refetch();
      reportQuery.refetch();
      resetForm();
      toast.success("Item added.");
    },
    onError: (err: any) => toast.error(err.message),
  });
  const updateMutation = trpc.platformHealth.updateLaunchItem.useMutation({
    onSuccess: () => {
      checklistQuery.refetch();
      reportQuery.refetch();
      toast.success("Item updated.");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const items = checklistQuery.data || [];
  const report = reportQuery.data;

  function resetForm() {
    setShowAddForm(false);
    setEditingItem(null);
    setFormData({ title: "", description: "", category: "public_pages", owner: "", notes: "", relatedRoute: "" });
  }

  function toggleCategory(cat: string) {
    const next = new Set(expandedCategories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setExpandedCategories(next);
  }

  function expandAll() {
    const allCats = new Set(items.map((i) => i.category));
    setExpandedCategories(allCats);
  }

  function collapseAll() {
    setExpandedCategories(new Set());
  }

  function markComplete(item: any) {
    updateMutation.mutate({ id: item.id, status: "passed" });
  }

  function markFailed(item: any) {
    updateMutation.mutate({ id: item.id, status: "failed" });
  }

  function updateStatus(item: any, status: string) {
    updateMutation.mutate({ id: item.id, status: status as any });
  }

  // Group items by category
  const grouped: Record<string, typeof items> = {};
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  if (checklistQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-8 py-3 sm:py-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Launch Readiness</h1>
            <p className="text-slate-300">Track production readiness across all platform areas.</p>
          </div>
          <div className="flex gap-2">
            {items.length === 0 && (
              <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} className="bg-green-700 text-white hover:bg-green-600">
                {seedMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Rocket className="w-4 h-4 mr-2" /> Seed Checklist
              </Button>
            )}
            <Button onClick={() => setShowAddForm(true)} className="bg-blue-900 text-white hover:bg-blue-800">
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-8 space-y-6">
        {/* Summary Report */}
        {report && report.summary.total > 0 && (
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" /> Launch Readiness Report
              </h2>
              <div className="text-sm text-slate-400">
                {Math.round((report.summary.passed / report.summary.total) * 100)}% complete
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-700 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${(report.summary.passed / report.summary.total) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-green-300">{report.summary.passed}</div>
                <div className="text-xs text-slate-400">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-300">{report.summary.failed}</div>
                <div className="text-xs text-slate-400">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-300">{report.summary.inProgress}</div>
                <div className="text-xs text-slate-400">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-300">{report.summary.blocked}</div>
                <div className="text-xs text-slate-400">Blocked</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-300">{report.summary.notStarted}</div>
                <div className="text-xs text-slate-400">Not Started</div>
              </div>
            </div>
          </Card>
        )}

        {/* Add Item Form */}
        {showAddForm && (
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add Checklist Item</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Item title"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white text-sm"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Owner</label>
                <Input
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Responsible person"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Related Route</label>
                <Input
                  value={formData.relatedRoute}
                  onChange={(e) => setFormData({ ...formData, relatedRoute: e.target.value })}
                  placeholder="/path/to/page"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <Input
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 block mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-white text-sm resize-y"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => {
                  if (!formData.title) { toast.error("Title required."); return; }
                  createMutation.mutate(formData);
                }}
                disabled={createMutation.isPending}
                className="bg-blue-900 text-white hover:bg-blue-800"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Item
              </Button>
              <Button variant="ghost" onClick={resetForm} className="text-slate-300">Cancel</Button>
            </div>
          </Card>
        )}

        {/* Expand/Collapse Controls */}
        {items.length > 0 && (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={expandAll} className="text-slate-400 hover:text-white text-xs">
              Expand All
            </Button>
            <Button size="sm" variant="ghost" onClick={collapseAll} className="text-slate-400 hover:text-white text-xs">
              Collapse All
            </Button>
          </div>
        )}

        {/* Checklist by Category */}
        {items.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <Rocket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No checklist items yet. Click "Seed Checklist" to generate the default launch readiness items.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {Object.entries(grouped).map(([category, catItems]) => {
              const isExpanded = expandedCategories.has(category);
              const passedCount = catItems.filter((i) => i.status === "passed").length;
              const totalCount = catItems.length;
              return (
                <Card key={category} className="bg-slate-800 border-slate-700">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-750 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <span className="text-sm font-semibold text-white">{CATEGORY_LABELS[category] || category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{passedCount}/{totalCount}</span>
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${(passedCount / totalCount) * 100}%` }} />
                      </div>
                    </div>
                  </button>

                  {/* Category Items */}
                  {isExpanded && (
                    <div className="border-t border-slate-700 p-4 space-y-2">
                      {catItems.map((item) => (
                        <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-start gap-3">
                          <StatusIcon status={item.status} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-white">{item.title}</span>
                              <StatusBadge status={item.status} />
                            </div>
                            {item.description && <p className="text-xs text-slate-400 mt-1">{item.description}</p>}
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                              {item.owner && <span>Owner: {item.owner}</span>}
                              {item.relatedRoute && <span>Route: {item.relatedRoute}</span>}
                              {item.lastCheckedAt && <span>Last checked: {new Date(item.lastCheckedAt).toLocaleDateString()}</span>}
                            </div>
                            {item.notes && <p className="text-xs text-slate-500 mt-1 italic">{item.notes}</p>}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <select
                              value={item.status}
                              onChange={(e) => updateStatus(item, e.target.value)}
                              className="h-7 px-2 rounded text-xs bg-slate-800 border border-slate-600 text-white"
                            >
                              <option value="not_started">Not Started</option>
                              <option value="in_progress">In Progress</option>
                              <option value="passed">Passed</option>
                              <option value="failed">Failed</option>
                              <option value="blocked">Blocked</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
