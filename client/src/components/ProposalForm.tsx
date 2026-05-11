import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { EVALUATION_CRITERIA } from "@shared/govContracting";

interface ProposalFormProps {
  proposalId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProposalForm({
  
  proposalId,
  onSuccess,
  onCancel,
}: ProposalFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    opportunityId: "",
    framework: "",
    dueDate: "",
    evaluationCriteria: [] as string[],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const proposalFrameworks = [
    { code: 'STANDARD', label: 'Standard Proposal (Technical, Past Performance, Price)' },
    { code: 'TECHNICAL_ONLY', label: 'Technical Only' },
    { code: 'COST_PLUS_TECHNICAL', label: 'Cost Plus Technical' },
    { code: 'PAST_PERFORMANCE', label: 'Past Performance Focused' },
    { code: 'SMALL_BUSINESS', label: 'Small Business Emphasis' },
  ];

  // Fetch existing proposal if editing
  const { data: proposal } = trpc.proposals.get.useQuery(
    { id: proposalId! },
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
      evaluationCriteria: [],
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "evaluationCriteria") return; // Skip evaluation criteria
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleEvaluationCriteriaChange = (criteriaCode: string) => {
    setFormData((prev) => {
      const current = prev.evaluationCriteria || [];
      if (current.includes(criteriaCode)) {
        return { ...prev, evaluationCriteria: current.filter((c) => c !== criteriaCode) };
      } else {
        return { ...prev, evaluationCriteria: [...current, criteriaCode] };
      }
    });
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
        evaluationCriteria: formData.evaluationCriteria?.join(',') || undefined,
      };

      if (proposalId) {
        await updateMutation.mutateAsync({
          id: proposalId,
          
          ...payload,
        });
        toast.success("Proposal updated successfully");
      } else {
        await createMutation.mutateAsync({
          
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
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Proposal Title *
        </label>
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Proposal for IT Services Contract"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {errors.title}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Linked Opportunity
        </label>
        <Input
          name="opportunityId"
          type="number"
          value={formData.opportunityId}
          onChange={handleChange}
          placeholder="Opportunity ID (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Proposal Framework
        </label>
        <select
          name="framework"
          value={formData.framework}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select Framework...</option>
          {proposalFrameworks.map((fw) => (
            <option key={fw.code} value={fw.code}>
              {fw.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Per FAR Part 15 - Contracting by Negotiation
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Evaluation Criteria (Select all that apply)
        </label>
        <div className="space-y-2">
          {EVALUATION_CRITERIA.map((criteria) => (
            <label key={criteria.code} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.evaluationCriteria?.includes(criteria.code) || false}
                onChange={() => handleEvaluationCriteriaChange(criteria.code)}
                className="mt-1 w-4 h-4 rounded border-gray-200 focus:ring-2 focus:ring-primary"
              />
              <div>
                <p className="font-medium text-sm">{criteria.label}</p>
                <p className="text-xs text-gray-500">{criteria.description} ({criteria.weight})</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Due Date
        </label>
        <Input
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? "Saving..." : proposalId ? "Update Proposal" : "Create Proposal"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
