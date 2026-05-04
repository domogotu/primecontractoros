import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight, CheckCircle2, Zap, BarChart3, Users, FileText, DollarSign, AlertCircle } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    navigate("/app/dashboard");
    return null;
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
          <div className="text-2xl font-bold text-blue-900">PrimeContractorOS</div>
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
            <Button onClick={() => navigate("/login")} className="bg-blue-900 hover:bg-blue-800 text-white">
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
          <p className="text-xl text-blue-100 mb-8">
            Move through the full contracting lifecycle—from opportunity to proposal to contract to closeout—with a system that guides you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => navigate("/get-started")} className="bg-green-600 hover:bg-green-700 text-white text-base px-6 py-3">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={() => navigate("/pricing")} className="bg-white text-blue-900 hover:bg-gray-100 text-base px-6 py-3">
              Review Plans
            </Button>
            <Button onClick={() => navigate("/help")} className="bg-blue-800 hover:bg-blue-700 text-white text-base px-6 py-3 border border-white">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">What You Can Do</h2>
          <p className="text-gray-600 mb-12">Manage every stage of government contracting with integrated tools and guidance</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <Icon className="h-8 w-8 text-blue-900 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-blue-900 mb-12">How It Works</h2>
          <div className="space-y-8">
            {[
              { num: 1, title: "Create Your Workspace", desc: "Sign up with your company information and choose your access level." },
              { num: 2, title: "Set Up Your Profile", desc: "Add your business details, certifications, and contracting model." },
              { num: 3, title: "Start Your Workflow", desc: "Track opportunities, build proposals, manage contracts, and get AI guidance." },
            ].map((step) => (
              <div key={step.num} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-lg">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Different */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-blue-900 mb-12">Why It Feels Different</h2>
          <div className="space-y-4">
            {[
              "Not just storage—a guided workflow that knows where you are",
              "Built for newer and experienced contractors alike",
              "Workspace-first design—your company is the center",
              "Connected data—files, contacts, tasks are linked to what matters",
              "Compliance-aware—reminders based on government rules",
              "AI-powered—intelligent recommendations and review assistance",
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
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-sm text-gray-600">© 2026 PrimeContractorOS. All rights reserved.</div>
          <div className="flex gap-6 text-sm">
            <button onClick={() => navigate("/help")} className="text-gray-600 hover:text-blue-900">Help</button>
            <button onClick={() => navigate("/help")} className="text-gray-600 hover:text-blue-900">Glossary</button>
            <button onClick={() => navigate("/help")} className="text-gray-600 hover:text-blue-900">Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
