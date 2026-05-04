import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

interface ProposalFormProps {
  workspaceId: number;
  proposalId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProposalForm({
  workspaceId,
  proposalId,
  onSuccess,
  onCancel,
}: ProposalFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    opportunityId: "",
    framework: "",
    dueDate: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch existing proposal if editing
  const { data: proposal } = trpc.proposals.get.useQuery(
    { id: proposalId || 0, workspaceId },
    { enabled: !!proposalId }
  );

  const createMutation = trpc.proposals.create.useMutation();
  const updateMutation = trpc.proposals.update.useMutation();

  // Populate form when proposal loads
  if (proposal && !formData.title) {
    setFormData({
      title: proposal.title || "",
      opportunityId: proposal.opportunityId?.toString() || "",
      framework: proposal.framework || "",
      dueDate: proposal.dueDate
        ? new Date(proposal.dueDate).toISOString().split("T")[0]
        : "",
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        title: formData.title,
        opportunityId: formData.opportunityId
          ? parseInt(formData.opportunityId)
          : undefined,
        framework: formData.framework || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      };

      if (proposalId) {
        await updateMutation.mutateAsync({
          id: proposalId,
          workspaceId,
          ...payload,
        });
        toast.success("Proposal updated successfully");
      } else {
        await createMutation.mutateAsync({
          workspaceId,
          ...payload,
        });
        toast.success("Proposal created successfully");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving proposal:", error);
      toast.error("Failed to save proposal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Proposal Title *
        </label>
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., GSA Schedule Proposal"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {errors.title}
          </p>
        )}
      </div>

      {/* Opportunity ID */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Opportunity ID
        </label>
        <Input
          name="opportunityId"
          type="number"
          value={formData.opportunityId}
          onChange={handleChange}
          placeholder="Link to an opportunity (optional)"
        />
      </div>

      {/* Framework */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Proposal Framework
        </label>
        <Input
          name="framework"
          value={formData.framework}
          onChange={handleChange}
          placeholder="e.g., Standard Structured, Capability Statement"
        />
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Due Date
        </label>
        <Input
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? "Saving..." : proposalId ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
