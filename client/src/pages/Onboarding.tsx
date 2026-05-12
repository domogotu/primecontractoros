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
  ChevronLeft,
  Zap,
  Building2,
  Globe,
  Target,
  FileText,
  BarChart3,
} from 'lucide-react';
import PageGuide from "@/components/PageGuide";

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
    uei: '',
  });

  const completeOnboarding = trpc.workspace.completeOnboarding.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleComplete = async () => {
    if (!formData.companyName.trim()) {
      toast.error("Please enter your company name in Step 1");
      setCurrentStep(0);
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
      toast.success("Welcome to PrimeContractorOS! Your workspace is ready.");
      navigate('/app/dashboard', { replace: true });
    } catch (error) {
      toast.error("Failed to complete setup. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 0 && !formData.companyName.trim()) {
      toast.error("Please enter your company name to continue");
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const steps = [
    {
      title: 'Set Up Your Workspace',
      description: "Let's create your contracting workspace. This is where all your opportunities, proposals, and contracts will live.",
      icon: Building2,
      content: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="companyName" className="text-sm font-medium text-slate-700">
              Company Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Your company or business name"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="contractingModel" className="text-sm font-medium text-slate-700">
              How do you contract?
            </Label>
            <select
              id="contractingModel"
              name="contractingModel"
              value={formData.contractingModel}
              onChange={handleInputChange}
              className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select your model</option>
              <option value="prime">Prime Contractor</option>
              <option value="sub">Subcontractor</option>
              <option value="both">Both Prime and Sub</option>
            </select>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Why this matters:</strong> Your contracting model helps us tailor the dashboard, compliance checks, and AI recommendations to your specific workflow.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Business Profile Basics',
      description: 'Add your key identifiers. These help match you with relevant opportunities and ensure compliance.',
      icon: Globe,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryNaics" className="text-sm font-medium text-slate-700">Primary NAICS Code</Label>
              <Input
                id="primaryNaics"
                name="primaryNaics"
                value={formData.primaryNaics}
                onChange={handleInputChange}
                placeholder="e.g., 541512"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="uei" className="text-sm font-medium text-slate-700">UEI Number</Label>
              <Input
                id="uei"
                name="uei"
                value={formData.uei}
                onChange={handleInputChange}
                placeholder="Unique Entity Identifier"
                className="mt-2"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="certifications" className="text-sm font-medium text-slate-700">Certifications</Label>
            <Textarea
              id="certifications"
              name="certifications"
              value={formData.certifications}
              onChange={handleInputChange}
              placeholder="e.g., 8(a), HUBZone, WOSB, SDVOSB, ISO 9001"
              className="mt-2"
              rows={3}
            />
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Tip:</strong> You can always update these later in Settings. The more you fill in now, the better your AI recommendations will be.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'How to Track Opportunities',
      description: "Here's how PrimeContractorOS helps you find and manage government contracting opportunities.",
      icon: Target,
      content: (
        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Add Opportunities</h4>
              <p className="text-sm text-slate-600 mt-1">Add opportunities from SAM.gov, GovWin, or other sources. Include the solicitation number, agency, NAICS code, and due date.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Evaluate & Decide</h4>
              <p className="text-sm text-slate-600 mt-1">Move opportunities through stages: New, In Review, Pursue, or No-Pursue. AI can help analyze fit based on your profile.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Convert to Proposal</h4>
              <p className="text-sm text-slate-600 mt-1">When you decide to pursue, convert the opportunity into a proposal. All data carries forward automatically.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'The Contract Lifecycle',
      description: 'Understand how records flow through the system: Opportunity to Proposal to Contract to Closeout.',
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            {['Opportunity', 'Proposal', 'Contract', 'Closeout'].map((stage, idx) => (
              <div key={stage} className="flex items-center">
                <div className={`px-4 py-3 rounded-lg text-center ${
                  idx === 0 ? 'bg-blue-100 border-2 border-blue-300' :
                  idx === 1 ? 'bg-purple-100 border-2 border-purple-300' :
                  idx === 2 ? 'bg-green-100 border-2 border-green-300' :
                  'bg-gray-100 border-2 border-gray-300'
                }`}>
                  <span className="text-xs font-semibold">{stage}</span>
                </div>
                {idx < 3 && <ChevronRight className="w-5 h-5 text-slate-400 mx-1" />}
              </div>
            ))}
          </div>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="p-3 bg-slate-50 rounded-lg">
              <strong>Linked Records:</strong> Each proposal links back to its opportunity. Each contract links to its proposal. This creates a full audit trail.
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <strong>Automatic Tracking:</strong> When a proposal is awarded, it becomes a contract. Status changes propagate through the chain.
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <strong>Compliance:</strong> Each stage has its own compliance checks, deadlines, and deliverables that the system tracks for you.
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Your Dashboard',
      description: "Here's what you'll see when you land on your dashboard every day.",
      icon: BarChart3,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" /> Pipeline Overview
              </h4>
              <p className="text-sm text-slate-600">See all your opportunities, proposals, and contracts at a glance with status indicators.</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" /> AI Insights
              </h4>
              <p className="text-sm text-slate-600">Get intelligent recommendations, compliance alerts, and opportunity matches based on your profile.</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" /> Tasks & Deadlines
              </h4>
              <p className="text-sm text-slate-600">Never miss a deadline. See upcoming due dates, required actions, and compliance milestones.</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" /> Financial Summary
              </h4>
              <p className="text-sm text-slate-600">Track invoices, payments, and outstanding balances across all your contracts.</p>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>You are all set!</strong> Click "Complete Setup" to enter your workspace. You can explore all features and come back to Settings anytime to update your profile.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      <PageGuide
        title="Onboarding Wizard"
        description="Step-by-step setup to get your workspace ready for government contracting."
        whenToUse="When first setting up your workspace or completing missing setup steps."
        whatToDoNext={["Complete your business profile", "Add NAICS codes and certifications", "Set up your contracting model", "Add your first opportunity or contract"]}
        relatedRecords={[{ label: "Business Profile", path: "/app/business-profile" }, { label: "Dashboard", path: "/app/dashboard" }, { label: "Settings", path: "/app/settings" }]}
      />
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="text-2xl font-bold text-slate-900">PrimeContractorOS</div>
          <div className="text-sm text-slate-500">Workspace Setup &bull; Step {currentStep + 1} of {steps.length}</div>
        </div>
      </nav>

      <div className="container max-w-3xl py-12 pb-32">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-1">
            {steps.map((_, idx) => (
              <div key={idx} className="flex items-center">
                <button
                  onClick={() => { if (idx <= currentStep) setCurrentStep(idx); }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    idx === currentStep
                      ? 'bg-blue-600 text-white'
                      : idx < currentStep
                        ? 'bg-green-600 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </button>
                {idx < steps.length - 1 && (
                  <div className={`w-8 h-1 rounded mx-1 ${idx < currentStep ? 'bg-green-600' : 'bg-slate-200'}`}></div>
                )}
              </div>
            ))}
          </div>
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

          {/* Step Content */}
          <div className="mb-8">
            {currentStepData.content}
          </div>

          {/* Legal Agreement */}
          {currentStep === steps.length - 1 && (
            <p className="text-xs text-slate-400 text-center pt-4">
              By completing setup, you confirm you have read and agree to the{" "}
              <a href="/terms" target="_blank" className="text-blue-500 hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" target="_blank" className="text-blue-500 hover:underline">Privacy Policy</a>.
            </p>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                "Setting up workspace..."
              ) : currentStep === steps.length - 1 ? (
                <>
                  Complete Setup
                  <CheckCircle2 className="w-4 h-4 ml-2" />
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
      </div>
    </div>
  );
}
