import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  CheckCircle2,
  ChevronRight,
  Zap,
  Building2,
  Globe,
  MapPin,
} from 'lucide-react';

export default function Onboarding() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contractingModel: '',
    primaryNaics: '',
    additionalNaics: '',
    certifications: '',
    preferences: '',
  });

  const completeOnboarding = trpc.workspace.completeOnboarding.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = async () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final step: complete onboarding
    if (!formData.companyName.trim()) {
      toast.error("Please enter your company name");
      return;
    }

    setLoading(true);
    try {
      await completeOnboarding.mutateAsync({
        companyName: formData.companyName,
        contractingModel: formData.contractingModel || undefined,
        naicsCodes: [formData.primaryNaics, formData.additionalNaics].filter(Boolean).join(', ') || undefined,
        certifications: formData.certifications || undefined,
      });
      toast.success("Workspace setup complete!");
      navigate('/app/dashboard', { replace: true });
    } catch (error) {
      toast.error("Failed to complete setup. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  type FieldDef = {
    label: string;
    name: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
  };

  const steps: { title: string; description: string; icon: typeof Building2; fields: FieldDef[] }[] = [
    {
      title: 'Business Basics',
      description: 'Tell us about your company so we can customize your experience',
      icon: Building2,
      fields: [
        { label: 'Company Name', name: 'companyName', type: 'text', required: true, placeholder: 'Your company or business name' },
        {
          label: 'Contracting Model',
          name: 'contractingModel',
          type: 'select',
          options: [
            { value: '', label: 'Select your model' },
            { value: 'prime', label: 'Prime Contractor' },
            { value: 'sub', label: 'Subcontractor' },
            { value: 'both', label: 'Both Prime and Sub' },
          ],
        },
      ],
    },
    {
      title: 'NAICS and Capabilities',
      description: 'Help us understand your contracting focus areas',
      icon: Globe,
      fields: [
        { label: 'Primary NAICS Code', name: 'primaryNaics', type: 'text', placeholder: 'e.g., 541512 - Computer Systems Design' },
        { label: 'Additional NAICS Codes', name: 'additionalNaics', type: 'textarea', placeholder: 'Enter additional NAICS codes, one per line' },
        { label: 'Certifications', name: 'certifications', type: 'textarea', placeholder: 'e.g., 8(a), HUBZone, WOSB, SDVOSB, ISO 9001' },
      ],
    },
    {
      title: 'Preferences',
      description: 'How would you like to use PrimeContractorOS?',
      icon: MapPin,
      fields: [
        { label: 'What are you looking to accomplish first?', name: 'preferences', type: 'textarea', placeholder: 'e.g., Track my first opportunity, manage existing contracts, build proposals...' },
      ],
    },
  ];

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="text-2xl font-bold text-slate-900">PrimeContractorOS</div>
          <div className="text-sm text-slate-500">Workspace Setup</div>
        </div>
      </nav>

      <div className="container max-w-3xl py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {steps.map((_, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    idx === currentStep
                      ? 'bg-blue-600 text-white'
                      : idx < currentStep
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-12 h-1 rounded ${idx < currentStep ? 'bg-green-600' : 'bg-slate-200'}`}></div>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500">Step {currentStep + 1} of {steps.length}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          {/* Step Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <StepIcon className="w-6 h-6 text-blue-600" />
              {currentStepData.title}
            </h1>
            <p className="text-slate-600 mt-2">{currentStepData.description}</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6 mb-8">
            {currentStepData.fields.map((field, idx) => (
              <div key={idx}>
                <Label htmlFor={field.name} className="text-sm font-medium text-slate-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleInputChange}
                    className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {(field.options || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    className="mt-2"
                    rows={3}
                  />
                ) : (
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    className="mt-2"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleContinue}
              disabled={loading}
            >
              {loading ? (
                "Completing setup..."
              ) : currentStep === steps.length - 1 ? (
                <>
                  Complete Setup
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* AI Tip */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Quick Tip
          </h3>
          <p className="text-slate-700 text-sm">
            You can always update this information later from your workspace settings. The more detail you provide now, the better we can tailor your experience and AI recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
