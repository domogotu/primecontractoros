import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Link2, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface LinkToContractModalProps {
  clause: any;
  onClose: () => void;
}

export default function LinkToContractModal({ clause, onClose }: LinkToContractModalProps) {
  const [linkedRecordType, setLinkedRecordType] = useState("contract");
  const [relevanceStatus, setRelevanceStatus] = useState("needs_review");
  const [sourceStrength, setSourceStrength] = useState("reference_only");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const createLinkMutation = trpc.farDfars.createClauseLink.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    },
    onError: () => {
      setSaving(false);
    }
  });

  const handleSubmit = () => {
    setSaving(true);
    createLinkMutation.mutate({
      clauseId: clause.id,
      linkedRecordType,
      relevanceStatus,
      sourceStrength,
      note: note || undefined,
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
                <Link2 className="w-5 h-5 text-blue-600" /> Link Clause to Record
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Link {clause.sourceType} {clause.clauseNumber} to a contract or other record.
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
                <Link2 className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-green-700">Link Created Successfully</p>
              <p className="text-xs text-slate-500 mt-1">The clause has been linked. You can manage links from the clause detail view.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Record Type */}
              <div>
                <Label className="text-sm font-medium">Link To</Label>
                <Select value={linkedRecordType} onValueChange={setLinkedRecordType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="compliance">Compliance Item</SelectItem>
                    <SelectItem value="requirement">Requirement</SelectItem>
                    <SelectItem value="deliverable">Deliverable</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="subcontractor">Subcontractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Relevance Status */}
              <div>
                <Label className="text-sm font-medium">Relevance Status</Label>
                <Select value={relevanceStatus} onValueChange={setRelevanceStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="needs_review">Needs Review</SelectItem>
                    <SelectItem value="confirmed_applicable">Confirmed Applicable</SelectItem>
                    <SelectItem value="reference_only">Reference Only</SelectItem>
                    <SelectItem value="not_applicable">Not Applicable</SelectItem>
                    <SelectItem value="superseded">Superseded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Source Strength */}
              <div>
                <Label className="text-sm font-medium">Source Strength</Label>
                <Select value={sourceStrength} onValueChange={setSourceStrength}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed_in_contract">Confirmed in Contract</SelectItem>
                    <SelectItem value="referenced_in_solicitation">Referenced in Solicitation</SelectItem>
                    <SelectItem value="likely_applicable">Likely Applicable</SelectItem>
                    <SelectItem value="reference_only">Reference Only</SelectItem>
                    <SelectItem value="user_added">User Added</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Note */}
              <div>
                <Label className="text-sm font-medium">Note (optional)</Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add context about this link (e.g., section reference, modification number, special conditions)..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Linking a clause does not confirm applicability. The awarded contract and contracting officer direction remain the governing source. This link is for awareness and workflow support.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? "Saving..." : "Create Link"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
