import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  BarChart3,
  Users,
  FileText,
  DollarSign,
  AlertCircle,
  Target,
  Briefcase,
  TrendingUp,
  Shield,
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const features = [
    {
      icon: Target,
      title: "Opportunity Pipeline",
      description: "Track and evaluate government opportunities with guided review checklists",
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: FileText,
      title: "Proposal Management",
      description: "Build proposals with structured frameworks and real-time readiness tracking",
      color: "bg-cyan-50 text-cyan-600",
    },
    {
      icon: Briefcase,
      title: "Contract Operations",
      description: "Manage active contracts with health monitoring and compliance tracking",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: DollarSign,
      title: "Financial Tracking",
      description: "Invoice, payment, and financial reporting integrated with contracts",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Invite team members, manage workspace access, and track contributions",
      color: "bg-orange-50 text-orange-600",
    },
    {
      icon: AlertCircle,
      title: "AI-Powered Insights",
      description: "Get intelligent guidance, compliance recommendations, and proposal reviews",
      color: "bg-red-50 text-red-600",
    },
  ];

  const accessOptions = [
    {
      title: "7-Day Trial",
      description: "Full access to explore the platform",
      price: "Free",
      badge: "Most Popular",
      features: ["All features included", "No credit card required", "Full support"],
    },
    {
      title: "Limited Access",
      description: "Core features without time limit",
      price: "Free",
      features: ["Basic features", "Community support", "Limited storage"],
    },
    {
      title: "Paid Plans",
      description: "Starter, Growth, and Advanced plans",
      price: "Starting at $99/mo",
      features: ["All features", "Priority support", "Advanced analytics"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="text-2xl font-bold text-blue-600">PrimeContractorOS</div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/features")}>
              Features
            </Button>
            <Button variant="ghost" onClick={() => navigate("/pricing")}>
              Pricing
            </Button>
            <Button variant="ghost" onClick={() => navigate("/help")}>
              Help
            </Button>
            {isAuthenticated ? (
              <Button onClick={() => navigate("/app/dashboard")} className="bg-blue-600 hover:bg-blue-700 text-white">
                Dashboard
              </Button>
            ) : (
              <Button onClick={() => navigate("/login")} variant="outline">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 border-b border-slate-200 bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="container max-w-4xl">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                Your Guided Operating System for Government Contracting
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
                Move Through the Full Contracting Lifecycle
              </h1>
              <p className="text-xl text-slate-600">
                From opportunity discovery to proposal submission to contract closeout—with a system that guides you every step of the way.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/get-started")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/pricing")}>
                Review Plans
              </Button>
              <Button size="lg" variant="ghost" onClick={() => navigate("/help")}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 md:py-24 border-b border-slate-200">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What You Can Do</h2>
            <p className="text-lg text-slate-600">Manage every stage of government contracting with integrated tools and guidance</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="feature-card">
                  <div className={`feature-card-icon ${feature.color} rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="feature-card-title">{feature.title}</h3>
                  <p className="feature-card-description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 border-b border-slate-200 bg-slate-50">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">How It Works</h2>
          <div className="space-y-8">
            {[
              {
                number: 1,
                title: "Create Your Workspace",
                description: "Sign up with your company information and choose your access level—trial, limited, or paid.",
              },
              {
                number: 2,
                title: "Set Up Your Profile",
                description: "Add your business details, certifications, NAICS codes, and contracting model so the system can guide you.",
              },
              {
                number: 3,
                title: "Start Your Workflow",
                description: "Track opportunities, build proposals, manage contracts, and get AI-powered guidance every step of the way.",
              },
            ].map((step) => (
              <div key={step.number} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It's Different */}
      <section className="py-16 md:py-24 border-b border-slate-200">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Why It Feels Different</h2>
          <div className="space-y-4">
            {[
              "Not just storage—a guided workflow that knows where you are in the contracting process",
              "Built for newer contractors and experienced teams alike—guidance is optional, not intrusive",
              "Workspace-first design—your company is the center, not your personal account",
              "Connected data—files, contacts, tasks, and alerts are linked to the records that matter",
              "Compliance-aware—reminders and guidance based on government contracting rules",
              "AI-powered—get intelligent recommendations and proposal review assistance",
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access Options */}
      <section className="py-16 md:py-24 border-b border-slate-200 bg-slate-50">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your Access Level</h2>
            <p className="text-lg text-slate-600">Start free, upgrade when you're ready</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {accessOptions.map((option, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-lg border transition-all ${
                  option.badge
                    ? "border-blue-300 bg-white shadow-lg ring-2 ring-blue-100"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {option.badge && (
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-4">
                    {option.badge}
                  </div>
                )}
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{option.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{option.description}</p>
                <p className="text-3xl font-bold text-slate-900 mb-6">{option.price}</p>
                <ul className="space-y-2 mb-6">
                  {option.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>One 7-day trial per workspace.</strong> Trial discount available for 30 days after trial start. Limited access means no trial or trial discount. Choose paid activation for immediate full access.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container max-w-4xl text-center space-y-8">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-lg opacity-90">
            Create your workspace and start guiding your government contracting operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/get-started")}
              className="bg-white text-blue-600 hover:bg-slate-100"
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/help")}
              className="border-white text-white hover:bg-blue-700"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 bg-white">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-sm text-slate-600">© 2026 PrimeContractorOS. All rights reserved.</div>
          <div className="flex gap-6 text-sm">
            <button onClick={() => navigate("/help")} className="text-slate-600 hover:text-slate-900">
              Help
            </button>
            <button onClick={() => navigate("/help")} className="text-slate-600 hover:text-slate-900">
              Glossary
            </button>
            <button onClick={() => navigate("/help")} className="text-slate-600 hover:text-slate-900">
              Support
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
