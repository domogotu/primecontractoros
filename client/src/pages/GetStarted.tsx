import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * Get Started / Signup Page
 * 
 * Design: Professional Minimalism
 * - Multi-step form
 * - Workspace and user fields
 * - Guided questions
 * - Access choice selection
 */
export default function GetStarted() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Workspace
    legalBusinessName: "",
    dba: "",
    businessEmail: "",
    phone: "",
    website: "",
    state: "",
    entityType: "",
    // User
    fullName: "",
    loginEmail: "",
    password: "",
    jobTitle: "",
    userPhone: "",
    // Questions
    newToContracting: null as boolean | null,
    isRegistered: null as boolean | null,
    hasOpportunities: null as boolean | null,
    hasContracts: null as boolean | null,
    isSolo: null as boolean | null,
    needsSetupHelp: null as boolean | null,
    // Access choice
    accessChoice: "trial" as "trial" | "limited" | "paid",
  });

  const signupMutation = trpc.auth.signup.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (field: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAccessChoice = (choice: "trial" | "limited" | "paid") => {
    setFormData((prev) => ({ ...prev, accessChoice: choice }));
  };

  const handleSubmit = async () => {
    if (step < 4) {
      setStep(step + 1);
      return;
    }

    // Validate required fields
    if (!formData.legalBusinessName || !formData.businessEmail || !formData.fullName || !formData.loginEmail || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const result = await signupMutation.mutateAsync({
        legalBusinessName: formData.legalBusinessName,
        dba: formData.dba || undefined,
        businessEmail: formData.businessEmail,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        state: formData.state || undefined,
        entityType: formData.entityType || undefined,
        fullName: formData.fullName,
        loginEmail: formData.loginEmail,
        password: formData.password,
        jobTitle: formData.jobTitle || undefined,
        userPhone: formData.userPhone || undefined,
        accessChoice: formData.accessChoice,
      });

      if (result.success) {
        toast.success("Workspace created successfully!");
        navigate("/app/dashboard");
      } else {
        toast.error("Signup failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="text-2xl font-bold text-primary">PrimeContractorOS</div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button variant="outline" onClick={() => navigate("/login")}>
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container max-w-2xl py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Step {step} of 4</p>
        </div>

        {/* Step 1: Company Information */}
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tell us about your company</h1>
              <p className="text-muted-foreground">
                We'll use this information to set up your workspace and provide relevant guidance.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Legal Business Name *</label>
                <input
                  type="text"
                  name="legalBusinessName"
                  placeholder="Your company's legal name"
                  value={formData.legalBusinessName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">DBA (Doing Business As)</label>
                <input
                  type="text"
                  name="dba"
                  placeholder="If different from legal name"
                  value={formData.dba}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Business Email *</label>
                <input
                  type="email"
                  name="businessEmail"
                  placeholder="company@example.com"
                  value={formData.businessEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="CA"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Entity Type</label>
                <select
                  name="entityType"
                  value={formData.entityType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select entity type</option>
                  <option value="sole_proprietor">Sole Proprietor</option>
                  <option value="llc">LLC</option>
                  <option value="s_corp">S-Corp</option>
                  <option value="c_corp">C-Corp</option>
                  <option value="partnership">Partnership</option>
                  <option value="non_profit">Non-Profit</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: User Account */}
        {step === 2 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Create your account</h1>
              <p className="text-muted-foreground">
                You'll be the workspace owner and can invite team members later.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Login Email *</label>
                <input
                  type="email"
                  name="loginEmail"
                  placeholder="your@email.com"
                  value={formData.loginEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    placeholder="e.g., Director of Sales"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="userPhone"
                    placeholder="(555) 123-4567"
                    value={formData.userPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Experience Questions */}
        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tell us about your experience</h1>
              <p className="text-muted-foreground">
                This helps us provide relevant guidance and recommendations.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { field: "newToContracting", label: "Are you brand new to government contracting?" },
                { field: "isRegistered", label: "Are you registered with SAM gov?" },
                { field: "hasOpportunities", label: "Do you have active opportunities?" },
                { field: "hasContracts", label: "Do you have awarded contracts?" },
                { field: "isSolo", label: "Are you solo or adding team users?" },
                { field: "needsSetupHelp", label: "Do you need setup help?" },
              ].map(({ field, label }) => (
                <div key={field}>
                  <p className="text-sm font-medium mb-3">{label}</p>
                  <div className="flex gap-3">
                    <Button
                      variant={formData[field as keyof typeof formData] === true ? "default" : "outline"}
                      onClick={() => handleQuestionChange(field, true)}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={formData[field as keyof typeof formData] === false ? "default" : "outline"}
                      onClick={() => handleQuestionChange(field, false)}
                    >
                      No
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Access Choice */}
        {step === 4 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Choose your access level</h1>
              <p className="text-muted-foreground">
                You can change this anytime. All plans include a 7-day trial.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { value: "trial", title: "7-Day Trial", desc: "Full access for 7 days, then choose a plan", price: "Free" },
                { value: "limited", title: "Limited Access", desc: "Core features with no time limit", price: "Free" },
                { value: "paid", title: "Paid Plan", desc: "Full access starting at $99/month", price: "From $99/mo" },
              ].map(({ value, title, desc, price }) => (
                <button
                  key={value}
                  onClick={() => handleAccessChoice(value as "trial" | "limited" | "paid")}
                  className={`w-full p-6 rounded-lg border-2 transition-colors text-left ${
                    formData.accessChoice === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{title}</h3>
                    {formData.accessChoice === value && <Check className="h-5 w-5 text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{desc}</p>
                  <p className="font-semibold text-primary">{price}</p>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <p className="text-sm">
                <strong>One 7-day trial per workspace.</strong> Trial discount available for 30 days after trial start. Limited access means no trial or trial discount. Choose paid activation for immediate full access.
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 mt-12">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={loading}>
              Back
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1"
          >
            {step === 4 ? "Create Workspace" : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} className="text-primary hover:underline">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
