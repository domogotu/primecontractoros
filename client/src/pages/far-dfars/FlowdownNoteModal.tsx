import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface FlowdownNoteModalProps {
  clause: any;
  onClose: () => void;
}

export default function FlowdownNoteModal({ clause, onClose }: FlowdownNoteModalProps) {
  const [flowdownStatus, setFlowdownStatus] = useState("not_started");
  const [notes, setNotes] = useState("");
  const [limitationWatch, setLimitationWatch] = useState(false);
  const [subcontractingPlanWatch, setSubcontractingPlanWatch] = useState(false);
  const [consentWatch, setConsentWatch] = useState(false);
  const [cybersecurityFlowdownWatch, setCybersecurityFlowdownWatch] = useState(clause.cybersecurityWatch || false);
  const [paymentFlowdownWatch, setPaymentFlowdownWatch] = useState(clause.paymentWatch || false);
  const [laborFlowdownWatch, setLaborFlowdownWatch] = useState(clause.laborWatch || false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const createFlowdownMutation = trpc.farDfars.createFlowdownReview.useMutation({
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
    createFlowdownMutation.mutate({
      clauseId: clause.id,
      flowdownStatus,
      limitationWatch,
      subcontractingPlanWatch,
      consentWatch,
      cybersecurityFlowdownWatch,
      paymentFlowdownWatch,
      laborFlowdownWatch,
      notes: notes || undefined,
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
                <ArrowRight className="w-5 h-5 text-purple-600" /> Start Flowdown Review
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Review flowdown requirements for {clause.sourceType} {clause.clauseNumber}.
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
            {clause.flowdownWatch && (
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs mt-1">Flowdown Watch Active</Badge>
            )}
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-green-700">Flowdown Review Started</p>
              <p className="text-xs text-slate-500 mt-1">
                The flowdown review has been initiated. Track progress in the clause detail view.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Info */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-purple-700">
                    Flowdown reviews track whether a clause needs to be passed down to subcontractors. This helps ensure subcontract compliance and proper clause inclusion in lower-tier agreements.
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <Label className="text-sm font-medium">Flowdown Status</Label>
                <Select value={flowdownStatus} onValueChange={setFlowdownStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="flowdown_required">Flowdown Required</SelectItem>
                    <SelectItem value="flowdown_not_required">Flowdown Not Required</SelectItem>
                    <SelectItem value="partial_flowdown">Partial Flowdown</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Watch Flags */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Watch Flags</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="limitation"
                      checked={limitationWatch}
                      onCheckedChange={(checked) => setLimitationWatch(!!checked)}
                    />
                    <label htmlFor="limitation" className="text-sm text-slate-700">Limitations on Subcontracting Watch</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="subPlan"
                      checked={subcontractingPlanWatch}
                      onCheckedChange={(checked) => setSubcontractingPlanWatch(!!checked)}
                    />
                    <label htmlFor="subPlan" className="text-sm text-slate-700">Subcontracting Plan Watch</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="consent"
                      checked={consentWatch}
                      onCheckedChange={(checked) => setConsentWatch(!!checked)}
                    />
                    <label htmlFor="consent" className="text-sm text-slate-700">Consent to Subcontract Watch</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="cyberFlow"
                      checked={cybersecurityFlowdownWatch}
                      onCheckedChange={(checked) => setCybersecurityFlowdownWatch(!!checked)}
                    />
                    <label htmlFor="cyberFlow" className="text-sm text-slate-700">Cybersecurity Flowdown Watch</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="paymentFlow"
                      checked={paymentFlowdownWatch}
                      onCheckedChange={(checked) => setPaymentFlowdownWatch(!!checked)}
                    />
                    <label htmlFor="paymentFlow" className="text-sm text-slate-700">Payment Flowdown Watch</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="laborFlow"
                      checked={laborFlowdownWatch}
                      onCheckedChange={(checked) => setLaborFlowdownWatch(!!checked)}
                    />
                    <label htmlFor="laborFlow" className="text-sm text-slate-700">Labor Flowdown Watch</label>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-sm font-medium">Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                  rows={3}
                  placeholder="Add flowdown review notes, special conditions, or subcontractor-specific concerns..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? "Saving..." : "Start Flowdown Review"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
