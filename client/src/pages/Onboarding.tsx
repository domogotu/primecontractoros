import { useState } from 'react';
import { useLocation } from 'wouter';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Zap,
  Building2,
  Globe,
  MapPin,
} from 'lucide-react';

export default function Onboarding() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    legalBusinessName: '',
    dba: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    entityType: 'LLC',
    primaryNaics: '',
    additionalNaics: '',
    govReadiness: '',
    preferences: '',
  });

  const setupItems = [
    { label: 'Complete your profile', completed: true },
    { label: 'Add team members', completed: false },
    { label: 'Register with SAM.gov', completed: true },
    { label: 'Add business certifications', completed: false },
    { label: 'Set up payment method', completed: true },
    { label: 'Review compliance settings', completed: false },
  ];

  const completedCount = setupItems.filter((item) => item.completed).length;
  const progressPercent = (completedCount / setupItems.length) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/app/dashboard');
    }
  };

  const steps = [
    {
      title: 'Business Basics',
      description: 'Tell us about your company',
      fields: [
        { label: 'Legal Business Name', name: 'legalBusinessName', type: 'text', required: true },
        { label: 'DBA / Trade Name', name: 'dba', type: 'text' },
        { label: 'Business Email', name: 'email', type: 'email', required: true },
        { label: 'Phone', name: 'phone', type: 'tel' },
        { label: 'Website', name: 'website', type: 'url' },
        { label: 'Address', name: 'address', type: 'text' },
        {
          label: 'Entity Type',
          name: 'entityType',
          type: 'select',
          options: ['LLC', 'Corporation', 'Sole Proprietor', 'Partnership', 'Other'],
        },
      ],
    },
    {
      title: 'Business Context',
      description: 'NAICS codes and capabilities',
      fields: [
        { label: 'Primary NAICS Code', name: 'primaryNaics', type: 'text' },
        { label: 'Additional NAICS Codes', name: 'additionalNaics', type: 'textarea' },
      ],
    },
    {
      title: 'Government Readiness',
      description: 'Compliance and registration',
      fields: [
        { label: 'Government Readiness Status', name: 'govReadiness', type: 'textarea' },
      ],
    },
    {
      title: 'Preferences',
      description: 'How you want to use PrimeContractorOS',
      fields: [
        { label: 'Your Preferences', name: 'preferences', type: 'textarea' },
      ],
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <WorkspaceLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Set Up Your Workspace the Right Way</h1>
          <p className="text-slate-600">
            This setup flow helps organize your company workspace so the rest of the platform can work correctly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Setup Status */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-lg p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Setup Status</h2>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Completion</span>
                  <span className="text-sm font-semibold text-slate-900">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {setupItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={item.completed ? 'text-slate-600 line-through' : 'text-slate-700'}>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-500 mb-2">Current Access</p>
                <p className="text-sm font-semibold text-slate-900">7-Day Trial</p>
                <p className="text-xs text-slate-600 mt-1">5 days remaining</p>
              </div>
            </div>
          </div>

          {/* Right Column: Form Steps */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-lg p-8">
              {/* Step Indicator */}
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
                        <div
                          className={`w-8 h-1 ${
                            idx < currentStep ? 'bg-green-600' : 'bg-slate-200'
                          }`}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-600">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>

              {/* Step Content */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  {currentStep === 0 && <Building2 className="w-6 h-6 text-blue-600" />}
                  {currentStep === 1 && <Globe className="w-6 h-6 text-blue-600" />}
                  {currentStep === 2 && <MapPin className="w-6 h-6 text-blue-600" />}
                  {currentStep === 3 && <Zap className="w-6 h-6 text-blue-600" />}
                  {currentStepData.title}
                </h2>
                <p className="text-slate-600">{currentStepData.description}</p>
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
                        className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {(field.options || []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleInputChange}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="mt-2"
                        rows={4}
                      />
                    ) : (
                      <Input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleInputChange}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="mt-2"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 justify-between">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/app/dashboard')}
                  >
                    Save and Continue Later
                  </Button>
                </div>
                <div className="flex gap-3">
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
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        Finish Setup
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
            </div>

            {/* AI Guided Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                AI-Guided Summary
              </h3>
              <p className="text-slate-700 mb-4">
                Based on your setup, here's what we recommend next:
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ Add your team members to collaborate on opportunities</li>
                <li>✓ Upload your capability statement for quick reference</li>
                <li>✓ Set up your first opportunity to start tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
