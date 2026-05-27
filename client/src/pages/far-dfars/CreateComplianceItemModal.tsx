import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, ClipboardList, CheckCircle, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface CreateComplianceItemModalProps {
  clause: any;
  onClose: () => void;
}

export default function CreateComplianceItemModal({ clause, onClose }: CreateComplianceItemModalProps) {
  const [title, setTitle] = useState(`${clause.sourceType} ${clause.clauseNumber} Compliance - ${clause.title}`);
  const [description, setDescription] = useState(
    `Compliance tracking item for ${clause.sourceType} ${clause.clauseNumber} (${clause.title}).\n\nRequirement: ${clause.summary}\n\nApplicability: ${clause.applicabilityNote || "Confirm applicability against awarded contract."}\n\nStatus: Draft — Needs contract source review before activation.`
  );
  const [priority, setPriority] = useState("medium");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const createComplianceMutation = trpc.farDfars.createComplianceItemFromClause.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    },
    onError: () => {
      setSaving(false);
    }
  });

  const handleSubmit = () => {
    if (!title.trim()) return;
    setSaving(true);
    createComplianceMutation.mutate({
      clauseId: clause.id,
      title: title.trim(),
      description: description.trim(),
      priority,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" /> Create Compliance Item
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Create a compliance matrix item from {clause.sourceType} {clause.clauseNumber}.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Clause info */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4 border">
            <Badge variant="outline" className="text-xs mb-1">
              {clause.sourceType} {clause.clauseNumber}
            </Badge>
            <p className="text-sm font-medium text-slate-800">{clause.title}</p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-green-700">Compliance Item Created</p>
              <p className="text-xs text-slate-500 mt-1">
                The compliance item has been created in Draft status. It will need contract source review before activation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Compliance items created from the reference library start in Draft status. They should be reviewed against the actual contract before being marked as active compliance requirements.
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Compliance Item Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                  placeholder="Enter compliance item title..."
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  rows={6}
                  placeholder="Describe the compliance requirement..."
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={saving || !title.trim()}>
                  {saving ? "Creating..." : "Create Compliance Item"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
