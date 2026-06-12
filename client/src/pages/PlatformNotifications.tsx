import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Edit, Trash2, Eye, Send, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";

const TEMPLATE_TYPES = [
  { value: "welcome", label: "Welcome / Signup" },
  { value: "billing_success", label: "Billing Success" },
  { value: "billing_failure", label: "Billing Failure" },
  { value: "support_ticket_update", label: "Support Ticket Update" },
  { value: "invite_member", label: "Invite Member" },
  { value: "deadline_reminder", label: "Deadline Reminder" },
  { value: "invoice_reminder", label: "Invoice Reminder" },
  { value: "contract_alert", label: "Contract Alert" },
  { value: "closeout_alert", label: "Closeout Alert" },
];

export default function PlatformNotifications() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "welcome",
    subject: "",
    body: "",
    active: true,
  });

  const templatesQuery = trpc.platformHealth.getNotificationTemplates.useQuery();
  const createMutation = trpc.platformHealth.createNotificationTemplate.useMutation({
    onSuccess: () => {
      templatesQuery.refetch();
      resetForm();
      toast.success("Template created.");
    },
    onError: (err: any) => toast.error(err.message),
  });
  const updateMutation = trpc.platformHealth.updateNotificationTemplate.useMutation({
    onSuccess: () => {
      templatesQuery.refetch();
      resetForm();
      toast.success("Template updated.");
    },
    onError: (err: any) => toast.error(err.message),
  });
  const deleteMutation = trpc.platformHealth.deleteNotificationTemplate.useMutation({
    onSuccess: () => {
      templatesQuery.refetch();
      toast.success("Template deleted.");
    },
    onError: (err: any) => toast.error(err.message),
  });
  const sendTestMutation = trpc.platformHealth.sendTestNotification.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || "Failed to send test notification.");
      }
    },
    onError: (err: any) => toast.error(err.message),
  });

  const templates = templatesQuery.data || [];

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", type: "welcome", subject: "", body: "", active: true });
  }

  function startEdit(template: any) {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      body: template.body,
      active: template.active,
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.body) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  }

  function toggleActive(template: any) {
    updateMutation.mutate({ id: template.id, active: !template.active });
  }

  if (templatesQuery.isLoading) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">Notifications</h1>
            <p className="text-slate-300">Manage notification and email templates.</p>
          </div>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-900 text-white hover:bg-blue-800">
            <Plus className="w-4 h-4 mr-2" /> New Template
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-8 space-y-6">
        {/* Create/Edit Form */}
        {showForm && (
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingId ? "Edit Template" : "Create New Template"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Template Name *</label>
                  <Input
                    placeholder="e.g. Welcome Email"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white text-sm"
                  >
                    {TEMPLATE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Subject *</label>
                <Input
                  placeholder="Email subject line"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Body (HTML or text) *</label>
                <textarea
                  placeholder="Template body content..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-white text-sm resize-y"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded"
                  />
                  Active
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-blue-900 text-white hover:bg-blue-800">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingId ? "Update Template" : "Create Template"}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm} className="text-slate-300">Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Template List */}
        {templates.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <p className="text-slate-400">No notification templates yet. Create one to get started.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <Card key={template.id} className="bg-slate-800 border-slate-700 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">{template.name}</h3>
                      <Badge className={template.active ? "bg-green-900/50 text-green-300 border-green-700" : "bg-slate-700 text-slate-400"}>
                        {template.active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge className="bg-blue-900/50 text-blue-300 border-blue-700">
                        {TEMPLATE_TYPES.find((t) => t.value === template.type)?.label || template.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">Subject: {template.subject}</p>
                    <p className="text-xs text-slate-500 mt-1">Updated: {new Date(template.updatedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => setPreviewTemplate(template)} className="text-slate-400 hover:text-white" title="Preview">
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleActive(template)} className="text-slate-400 hover:text-white" title={template.active ? "Deactivate" : "Activate"}>
                      {template.active ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => sendTestMutation.mutate({ templateId: template.id })} className="text-slate-400 hover:text-blue-300" title="Send Test">
                      <Send className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => startEdit(template)} className="text-slate-400 hover:text-white" title="Edit">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete this template?")) deleteMutation.mutate({ id: template.id }); }} className="text-slate-400 hover:text-red-300" title="Delete">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-2">Template Preview</h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400">Name:</span>
                <p className="text-sm text-white">{previewTemplate.name}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Type:</span>
                <p className="text-sm text-white">{TEMPLATE_TYPES.find((t) => t.value === previewTemplate.type)?.label || previewTemplate.type}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Subject:</span>
                <p className="text-sm text-white">{previewTemplate.subject}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Body:</span>
                <div className="mt-1 bg-white text-black p-4 rounded text-sm" dangerouslySetInnerHTML={{ __html: previewTemplate.body }} />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button size="sm" variant="ghost" onClick={() => setPreviewTemplate(null)} className="text-slate-300">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
