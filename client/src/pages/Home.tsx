import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation, Redirect } from "wouter";
import { ArrowRight, CheckCircle2, Zap, BarChart3, Users, FileText, DollarSign, AlertCircle } from "lucide-react";
export default function Home() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  // If admin user is logged in, redirect to platform dashboard
  if (isAuthenticated && user?.role === "admin") {
    return <Redirect to="/platform" />;
  }

  // If regular user is logged in, redirect to app dashboard
  if (isAuthenticated) {
    return <Redirect to="/app/dashboard" />;
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const features = [
    {
      icon: Zap,
      title: "Guided Dashboard",
      description: "Know where you are in the contracting lifecycle and what to do next",
    },
    {
      icon: FileText,
      title: "Opportunities & Proposals",
      description: "Track opportunities, build proposals, and manage your pipeline",
    },
    {
      icon: BarChart3,
      title: "Contract Management",
      description: "Monitor active contracts, compliance, and closeout workflows",
    },
    {
      icon: DollarSign,
      title: "Finance & Invoicing",
      description: "Manage invoices, payments, and financial reporting",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Invite team members and manage workspace access",
    },
    {
      icon: AlertCircle,
      title: "AI-Powered Insights",
      description: "Get intelligent guidance and compliance recommendations",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-blue-900">PrimeContractorOS</div>
            <div className="text-xs text-gray-600">A Reed's Solutions LLC Product</div>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/features")} className="text-gray-600 hover:text-blue-900">
              Features
            </Button>
            <Button variant="ghost" onClick={() => navigate("/pricing")} className="text-gray-600 hover:text-blue-900">
              Pricing
            </Button>
            <Button variant="ghost" onClick={() => navigate("/help")} className="text-gray-600 hover:text-blue-900">
              Help
            </Button>
            <Button variant="outline" onClick={() => navigate("/login")} className="text-blue-900 border-blue-900">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Your Guided Operating System for Government Contracting
          </h1>
          <p className="text-xl text-blue-100 mb-4">
            Move through the full contracting lifecycle—from opportunity to proposal to contract to closeout—with a system that guides you every step of the way.
          </p>
          <p className="text-sm text-blue-200 italic mb-8">
            Built by <a href="https://reedssolutionsllc.org/" target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-medium">Reed's Solutions LLC</a>
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => navigate("/get-started")} className="bg-green-600 hover:bg-green-700 text-white text-base px-6 py-3">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={() => navigate("/pricing")} className="bg-white text-blue-900 hover:bg-gray-100 text-base px-6 py-3">
              Review Plans
            </Button>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-16 md:py-24 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-blue-900 mb-12">Who This Is For</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">Prime Contractors</h3>
              <p className="text-gray-600">
                Manage your government contracting operations, track opportunities, build proposals, and oversee active contracts with built-in compliance guidance.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">Subcontractors</h3>
              <p className="text-gray-600">
                Coordinate with prime contractors, manage your own pipeline, and track subcontract performance and compliance.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">New to Government Contracting</h3>
              <p className="text-gray-600">
                Learn as you go with built-in guidance, glossary definitions, and step-by-step workflows that explain what each stage means.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">Established Contractors</h3>
              <p className="text-gray-600">
                Scale your operations with team collaboration, advanced reporting, and AI-powered insights to improve your win rate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 md:py-24 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-blue-900 mb-12">What You Can Do</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="flex gap-4 p-6 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-900/30 transition-colors">
                  <Icon className="h-6 w-6 text-blue-900 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why It Feels Different */}
      <section className="py-16 md:py-24 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-blue-900 mb-12">Why It Feels Different</h2>
          <div className="space-y-4">
            {[
              "Not just storage—a guided workflow that knows where you are in the contracting process",
              "Built for newer contractors and experienced teams alike—guidance is optional, not intrusive",
              "Workspace-first design—your company is the center, not your personal account",
              "Connected data—files, contacts, tasks, and alerts are linked to the records that matter",
              "Compliance-aware—reminders and guidance based on government contracting rules",
              "AI-powered—get intelligent recommendations and proposal review assistance",
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-900">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-900 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-blue-100 mb-8">Create your workspace and start managing your government contracting operations.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/get-started")} className="bg-green-600 hover:bg-green-700 text-white text-base px-6 py-3">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={() => navigate("/help")} className="bg-white text-blue-900 hover:bg-gray-100 text-base px-6 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div>
              <div className="text-sm font-medium text-gray-900 mb-2">PrimeContractorOS</div>
              <div className="text-xs text-gray-600">A Reed's Solutions LLC Product</div>
              <a href="https://reedssolutionsllc.org/" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-900 hover:underline mt-2 inline-block">
                Visit Reed's Solutions LLC →
              </a>
            </div>
            <div className="flex gap-6 text-sm">
              <button onClick={() => navigate("/help")} className="text-gray-600 hover:text-blue-900">Help</button>
              <button onClick={() => navigate("/help")} className="text-gray-600 hover:text-blue-900">Glossary</button>
              <button onClick={() => navigate("/help")} className="text-gray-600 hover:text-blue-900">Support</button>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 text-xs text-gray-600 text-center">
            © 2026 PrimeContractorOS by Reed's Solutions LLC. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
