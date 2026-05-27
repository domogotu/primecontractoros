import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, ListChecks, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface CreateTaskModalProps {
  clause: any;
  onClose: () => void;
}

export default function CreateTaskModal({ clause, onClose }: CreateTaskModalProps) {
  const [title, setTitle] = useState(`Review ${clause.sourceType} ${clause.clauseNumber} - ${clause.title}`);
  const [description, setDescription] = useState(
    `Review and confirm applicability of ${clause.sourceType} ${clause.clauseNumber} (${clause.title}) to the contract.\n\nSummary: ${clause.summary}\n\nApplicability: ${clause.applicabilityNote || "Check contract for applicability."}`
  );
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const createTaskMutation = trpc.farDfars.createTaskFromClause.useMutation({
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
    createTaskMutation.mutate({
      clauseId: clause.id,
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || undefined,
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
                <ListChecks className="w-5 h-5 text-blue-600" /> Create Task from Clause
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Create a task linked to {clause.sourceType} {clause.clauseNumber}.
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
              <p className="text-sm font-semibold text-green-700">Task Created Successfully</p>
              <p className="text-xs text-slate-500 mt-1">The task has been created and linked to this clause.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Task Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                  placeholder="Enter task title..."
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  rows={5}
                  placeholder="Describe what needs to be done..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <Label className="text-sm font-medium">Due Date (optional)</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={saving || !title.trim()}>
                  {saving ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
