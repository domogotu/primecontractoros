import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

interface ContractFormProps {
  contractId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ContractForm({
  
  contractId,
  onSuccess,
  onCancel,
}: ContractFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    contractNumber: "",
    agency: "",
    value: "",
    startDate: "",
    endDate: "",
    proposalId: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch existing contract if editing
  const { data: contract } = trpc.contracts.get.useQuery(
    { id: contractId! },
    { enabled: !!contractId }
  );

  const createMutation = trpc.contracts.create.useMutation();
  const updateMutation = trpc.contracts.update.useMutation();

  // Populate form when contract loads
  if (contract && !formData.title) {
    setFormData({
      title: contract.title || "",
      contractNumber: contract.contractNumber || "",
      agency: contract.agency || "",
      value: contract.value?.toString() || "",
      startDate: contract.startDate
        ? new Date(contract.startDate).toISOString().split("T")[0]
        : "",
      endDate: contract.endDate
        ? new Date(contract.endDate).toISOString().split("T")[0]
        : "",
      proposalId: contract.proposalId?.toString() || "",
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
        contractNumber: formData.contractNumber || undefined,
        agency: formData.agency || undefined,
        value: formData.value ? parseFloat(formData.value) : undefined,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        proposalId: formData.proposalId
          ? parseInt(formData.proposalId)
          : undefined,
      };

      if (contractId) {
        await updateMutation.mutateAsync({
          id: contractId,
          
          ...payload,
        });
        toast.success("Contract updated successfully");
      } else {
        await createMutation.mutateAsync({
          
          ...payload,
        });
        toast.success("Contract created successfully");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving contract:", error);
      toast.error("Failed to save contract");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Contract Title *
        </label>
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., GSA Schedule Contract"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {errors.title}
          </p>
        )}
      </div>

      {/* Contract Number */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Contract Number
        </label>
        <Input
          name="contractNumber"
          value={formData.contractNumber}
          onChange={handleChange}
          placeholder="e.g., GS-07F-0123K"
        />
      </div>

      {/* Agency */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Agency
        </label>
        <Input
          name="agency"
          value={formData.agency}
          onChange={handleChange}
          placeholder="e.g., General Services Administration"
        />
      </div>

      {/* Value */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Contract Value
        </label>
        <Input
          name="value"
          type="number"
          value={formData.value}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
        />
      </div>

      {/* Start Date */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Start Date
        </label>
        <Input
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
        />
      </div>

      {/* End Date */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          End Date
        </label>
        <Input
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleChange}
        />
      </div>

      {/* Proposal ID */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Proposal ID
        </label>
        <Input
          name="proposalId"
          type="number"
          value={formData.proposalId}
          onChange={handleChange}
          placeholder="Link to a proposal (optional)"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
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
          {isLoading ? "Saving..." : contractId ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
