import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Edit2, AlertTriangle } from "lucide-react";

interface ImportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  data: Record<string, unknown>;
  recordType: "opportunity" | "contract";
  onConfirm: (data: Record<string, unknown>) => void;
  duplicateWarning?: string;
}

export default function ImportPreviewModal({
  open,
  onClose,
  data,
  recordType,
  onConfirm,
  duplicateWarning,
}: ImportPreviewModalProps) {
  const [editableData, setEditableData] = useState<Record<string, unknown>>(data);
  const [editingField, setEditingField] = useState<string | null>(null);

  const fieldLabels: Record<string, string> = {
    title: "Title",
    agency: "Agency",
    solicitation: "Solicitation #",
    contractNumber: "Contract Number",
    naics: "NAICS Code",
    setAside: "Set-Aside",
    dueDate: "Due Date",
    startDate: "Start Date",
    endDate: "End Date",
    type: "Type",
    sourceLink: "Source Link",
    summary: "Summary",
    value: "Value",
    noticeId: "Notice ID",
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditableData(prev => ({ ...prev, [field]: value }));
  };

  const displayFields = Object.entries(editableData).filter(
    ([key]) => key !== "proposalId" && fieldLabels[key]
  );

  const filledCount = displayFields.filter(([, value]) => value && String(value).trim()).length;
  const totalCount = displayFields.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Review Import - {recordType === "opportunity" ? "Opportunity" : "Contract"}
          </DialogTitle>
        </DialogHeader>

        {/* Completeness indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(filledCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{filledCount}/{totalCount} fields</span>
        </div>

        {/* Duplicate warning */}
        {duplicateWarning && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span className="text-sm text-amber-800">{duplicateWarning}</span>
          </div>
        )}

        {/* Fields */}
        <div className="space-y-3">
          {displayFields.map(([field, value]) => (
            <div key={field} className="flex items-start gap-2">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">{fieldLabels[field] || field}</Label>
                {editingField === field ? (
                  <Input
                    value={String(value || "")}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
                    autoFocus
                    className="mt-0.5"
                  />
                ) : (
                  <div
                    className="flex items-center gap-1 mt-0.5 cursor-pointer group"
                    onClick={() => setEditingField(field)}
                  >
                    <p className="text-sm">
                      {value ? String(value) : <span className="text-muted-foreground italic">Not provided</span>}
                    </p>
                    <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
              {value && String(value).trim() ? (
                <Badge variant="outline" className="text-[10px] mt-5 bg-green-50 text-green-700">✓</Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] mt-5 bg-gray-50 text-gray-500">—</Badge>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onConfirm(editableData)}>
            Confirm & Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
