import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight, CheckCircle2, Zap, BarChart3, Users, FileText, DollarSign, AlertCircle } from "lucide-react";

/**
 * Home / Landing Page
 * 
 * Design: Professional Minimalism
 * - Hero section with clear value proposition
 * - Feature overview cards
 * - Access model explanation
 * - Call-to-action buttons
 */
export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [, navigate] = useLocation();

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

  const accessOptions = [
    {
      title: "7-Day Trial",
      description: "Full access to explore the platform",
      price: "Free",
    },
    {
      title: "Limited Access",
      description: "Core features without time limit",
      price: "Free",
    },
    {
      title: "Paid Plans",
      description: "Starter, Growth, and Advanced plans",
      price: "Starting at $99/mo",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="text-2xl font-bold text-primary">PrimeContractorOS</div>
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
            <Button variant="outline" onClick={() => navigate("/login")}>
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 border-b border-border">
        <div className="container max-w-4xl">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Your Guided Operating System for Government Contracting
              </h1>
              <p className="text-xl text-muted-foreground">
                Move through the full contracting lifecycle—from opportunity to proposal to contract to closeout—with a system that guides you every step of the way.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/get-started")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/pricing")}
              >
                Review Plans
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate("/help")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What This Is For */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold mb-12">Who This Is For</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Prime Contractors</h3>
              <p className="text-muted-foreground">
                Manage your government contracting operations, track opportunities, build proposals, and oversee active contracts with built-in compliance guidance.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Subcontractors</h3>
              <p className="text-muted-foreground">
                Coordinate with prime contractors, manage your own pipeline, and track subcontract performance and compliance.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">New to Government Contracting</h3>
              <p className="text-muted-foreground">
                Learn as you go with built-in guidance, glossary definitions, and step-by-step workflows that explain what each stage means.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Established Contractors</h3>
              <p className="text-muted-foreground">
                Scale your operations with team collaboration, advanced reporting, and AI-powered insights to improve your win rate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold mb-12">What You Can Do</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="flex gap-4 p-6 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors">
                  <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold">Create Your Workspace</h3>
                <p className="text-muted-foreground mt-2">
                  Sign up with your company information and choose your access level—trial, limited, or paid.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold">Set Up Your Profile</h3>
                <p className="text-muted-foreground mt-2">
                  Add your business details, certifications, NAICS codes, and contracting model so the system can guide you.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold">Start Your Workflow</h3>
                <p className="text-muted-foreground mt-2">
                  Track opportunities, build proposals, manage contracts, and get AI-powered guidance every step of the way.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Access Options */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold mb-12">Choose Your Access Level</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {accessOptions.map((option, idx) => (
              <div key={idx} className="p-8 rounded-lg bg-card border border-border">
                <h3 className="text-lg font-semibold">{option.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{option.description}</p>
                <p className="text-2xl font-bold text-primary mt-4">{option.price}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 p-6 rounded-lg bg-secondary/50 border border-border">
            <p className="text-sm text-foreground">
              <strong>One 7-day trial per workspace.</strong> Trial discount available for 30 days after trial start. Limited access means no trial or trial discount. Choose paid activation for immediate full access.
            </p>
          </div>
        </div>
      </section>

      {/* Why It Feels Different */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold mb-12">Why It Feels Different</h2>
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
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center space-y-8">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-lg opacity-90">
            Create your workspace and start guiding your government contracting operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/get-started")}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/help")}
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-sm text-muted-foreground">
            © 2026 PrimeContractorOS. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <button onClick={() => navigate("/help")} className="text-muted-foreground hover:text-foreground">
              Help
            </button>
            <button onClick={() => navigate("/help")} className="text-muted-foreground hover:text-foreground">
              Glossary
            </button>
            <button onClick={() => navigate("/help")} className="text-muted-foreground hover:text-foreground">
              Support
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
