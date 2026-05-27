import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { NAICS_CODES, OPPORTUNITY_SOURCES, CONTRACT_TYPES } from "@shared/govContracting";
import FieldHelp from "@/components/FieldHelp";

interface OpportunityFormProps {
  opportunityId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function OpportunityForm({
  
  opportunityId,
  onSuccess,
  onCancel,
}: OpportunityFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    agency: "",
    solicitation: "",
    naics: "",
    setAside: "",
    type: "",
    sourceLink: "",
    summary: "",
    dueDate: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: opportunity } = trpc.opportunities.get.useQuery(
    { id: opportunityId! },
    { enabled: !!opportunityId }
  );

  const utils = trpc.useUtils();
  const createMutation = trpc.opportunities.create.useMutation({
    onSuccess: () => {
      utils.opportunities.list.invalidate();
    },
  });
  const updateMutation = trpc.opportunities.update.useMutation({
    onSuccess: () => {
      utils.opportunities.list.invalidate();
      utils.opportunities.get.invalidate();
    },
  });

  useEffect(() => {
    if (opportunity && opportunityId) {
      setFormData({
        title: opportunity.title || "",
        agency: opportunity.agency || "",
        solicitation: opportunity.solicitation || "",
        naics: opportunity.naics || "",
        setAside: (opportunity as any).setAside || "",
        type: opportunity.type || "",
        sourceLink: opportunity.sourceLink || "",
        summary: opportunity.summary || "",
        dueDate: opportunity.dueDate
          ? new Date(opportunity.dueDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [opportunity, opportunityId]);

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
        setAside: formData.setAside || undefined,
        type: formData.type || undefined,
        sourceLink: formData.sourceLink || undefined,
        summary: formData.summary || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      };

      if (opportunityId) {
        await updateMutation.mutateAsync({
          id: opportunityId,
          
          ...payload,
        });
        toast.success("Opportunity updated successfully");
      } else {
        await createMutation.mutateAsync({
          
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
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center">
          Opportunity Title * <FieldHelp field="title" />
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

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center">
          Agency <FieldHelp field="agency" />
        </label>
        <Input
          name="agency"
          value={formData.agency}
          onChange={handleChange}
          placeholder="e.g., General Services Administration"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center">
          Solicitation Number <FieldHelp field="solicitation" />
        </label>
        <Input
          name="solicitation"
          value={formData.solicitation}
          onChange={handleChange}
          placeholder="e.g., GSA-2024-001"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center">
          NAICS Code <FieldHelp field="naics" />
        </label>
        <select
          name="naics"
          value={formData.naics}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, naics: e.target.value }));
            if (errors.naics) {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.naics;
                return newErrors;
              });
            }
          }}
          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select NAICS Code...</option>
          {NAICS_CODES.map((code) => (
            <option key={code.code} value={code.code}>
              {code.code} - {code.label} (SBA Size: {code.sbaSize})
            </option>
          ))}
        </select>
        {errors.naics && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {errors.naics}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Set-Aside Type
        </label>
        <select
          name="setAside"
          value={formData.setAside}
          onChange={(e) => setFormData((prev) => ({ ...prev, setAside: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Full & Open Competition</option>
          <option value="8(a)">8(a) Small Business</option>
          <option value="HUBZone">HUBZone</option>
          <option value="SDVOSB">Service-Disabled Veteran-Owned SB (SDVOSB)</option>
          <option value="WOSB">Women-Owned Small Business (WOSB)</option>
          <option value="EDWOSB">Economically Disadvantaged WOSB (EDWOSB)</option>
          <option value="Small Business">Small Business Set-Aside</option>
          <option value="Sole Source">Sole Source</option>
          <option value="Partial SB">Partial Small Business Set-Aside</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Contract Type
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, type: e.target.value }));
            if (errors.type) {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.type;
                return newErrors;
              });
            }
          }}
          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select Contract Type...</option>
          {CONTRACT_TYPES.map((type) => (
            <option key={type.code} value={type.code}>
              {type.label} ({type.farReference})
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {errors.type}
          </p>
        )}
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

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
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

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
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
          {isLoading ? "Saving..." : opportunityId ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
