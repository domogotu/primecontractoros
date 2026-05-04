import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface OpportunityFormProps {
  workspaceId: number;
  opportunityId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function OpportunityForm({
  workspaceId,
  opportunityId,
  onSuccess,
  onCancel,
}: OpportunityFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    agency: "",
    solicitation: "",
    naics: "",
    type: "",
    sourceLink: "",
    summary: "",
    dueDate: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch existing opportunity if editing
  const { data: opportunity } = trpc.opportunities.get.useQuery(
    { id: opportunityId || 0, workspaceId },
    { enabled: !!opportunityId }
  );

  const createMutation = trpc.opportunities.create.useMutation();
  const updateMutation = trpc.opportunities.update.useMutation();

  // Populate form when opportunity loads
  if (opportunity && !formData.title) {
    setFormData({
      title: opportunity.title || "",
      agency: opportunity.agency || "",
      solicitation: opportunity.solicitation || "",
      naics: opportunity.naics || "",
      type: opportunity.type || "",
      sourceLink: opportunity.sourceLink || "",
      summary: opportunity.summary || "",
      dueDate: opportunity.dueDate
        ? new Date(opportunity.dueDate).toISOString().split("T")[0]
        : "",
    });
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
        agency: formData.agency || undefined,
        solicitation: formData.solicitation || undefined,
        naics: formData.naics || undefined,
        type: formData.type || undefined,
        sourceLink: formData.sourceLink || undefined,
        summary: formData.summary || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      };

      if (opportunityId) {
        await updateMutation.mutateAsync({
          id: opportunityId,
          workspaceId,
          ...payload,
        });
        toast.success("Opportunity updated successfully");
      } else {
        await createMutation.mutateAsync({
          workspaceId,
          ...payload,
        });
        toast.success("Opportunity created successfully");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving opportunity:", error);
      toast.error("Failed to save opportunity");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Opportunity Title *
        </label>
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., GSA Schedule Opportunity"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {errors.title}
          </p>
        )}
      </div>

      {/* Agency */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Agency
        </label>
        <Input
          name="agency"
          value={formData.agency}
          onChange={handleChange}
          placeholder="e.g., General Services Administration"
        />
      </div>

      {/* Solicitation */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Solicitation Number
        </label>
        <Input
          name="solicitation"
          value={formData.solicitation}
          onChange={handleChange}
          placeholder="e.g., GSA-2024-001"
        />
      </div>

      {/* NAICS */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          NAICS Code
        </label>
        <Input
          name="naics"
          value={formData.naics}
          onChange={handleChange}
          placeholder="e.g., 541330"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Opportunity Type
        </label>
        <Input
          name="type"
          value={formData.type}
          onChange={handleChange}
          placeholder="e.g., GSA Schedule, Set-Aside, Open Competition"
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

      {/* Source Link */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Source Link
        </label>
        <Input
          name="sourceLink"
          value={formData.sourceLink}
          onChange={handleChange}
          placeholder="https://..."
          type="url"
        />
      </div>

      {/* Summary */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Summary
        </label>
        <Textarea
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          placeholder="Brief description of the opportunity..."
          rows={4}
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
          {isLoading ? "Saving..." : opportunityId ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
