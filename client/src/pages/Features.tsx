import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight, BarChart3, Zap, FileText, Users, DollarSign, AlertCircle, CheckCircle2, Compass, Briefcase, TrendingUp, BookOpen, Settings } from "lucide-react";

/**
 * Features Page
 * 
 * Design: Professional Minimalism
 * - Feature cards for all major capabilities
 * - Organized by workflow stage
 * - Clear value proposition for each feature
 */
export default function Features() {
  const [, navigate] = useLocation();

  const featureGroups = [
    {
      title: "Opportunity Management",
      description: "Track and manage government opportunities",
      features: [
        {
          icon: Compass,
          title: "Opportunity Tracking",
          description: "Identify, track, and evaluate government opportunities with built-in guidance",
        },
        {
          icon: BarChart3,
          title: "Pipeline Dashboard",
          description: "Visualize your opportunity pipeline and win probability",
        },
        {
          icon: AlertCircle,
          title: "Alerts & Reminders",
          description: "Never miss a deadline with smart notifications",
        },
      ],
    },
    {
      title: "Proposal & Contract Workflow",
      description: "Build, manage, and track proposals and contracts",
      features: [
        {
          icon: FileText,
          title: "Proposal Framework",
          description: "Guided proposal building with templates and AI assistance",
        },
        {
          icon: Briefcase,
          title: "Contract Management",
          description: "Track contract status, compliance, and closeout workflows",
        },
        {
          icon: TrendingUp,
          title: "Performance Tracking",
          description: "Monitor contract performance and key metrics",
        },
      ],
    },
    {
      title: "Finance & Operations",
      description: "Manage invoicing, payments, and financial reporting",
      features: [
        {
          icon: DollarSign,
          title: "Invoicing & Payments",
          description: "Create, track, and manage invoices and payments",
        },
        {
          icon: BarChart3,
          title: "Financial Reports",
          description: "Generate reports on revenue, expenses, and profitability",
        },
        {
          icon: CheckCircle2,
          title: "Compliance Tracking",
          description: "Stay compliant with government contracting regulations",
        },
      ],
    },
    {
      title: "Collaboration & Knowledge",
      description: "Work together and build institutional knowledge",
      features: [
        {
          icon: Users,
          title: "Team Collaboration",
          description: "Invite team members and manage workspace access",
        },
        {
          icon: BookOpen,
          title: "Lessons Learned",
          description: "Capture and share lessons from completed contracts",
        },
        {
          icon: Settings,
          title: "Templates & Reusable Content",
          description: "Build a library of templates and reusable proposal content",
        },
      ],
    },
    {
      title: "Intelligence & Guidance",
      description: "Get AI-powered insights and expert guidance",
      features: [
        {
          icon: Zap,
          title: "AI Workspace Intelligence",
          description: "Get intelligent recommendations and proposal review assistance",
        },
        {
          icon: AlertCircle,
          title: "Compliance Guidance",
          description: "Receive alerts and guidance on compliance requirements",
        },
        {
          icon: BookOpen,
          title: "Help & Glossary",
          description: "Learn contracting concepts and platform features",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container flex items-center justify-between py-4">
          <button onClick={() => navigate("/")} className="text-2xl font-bold text-primary">
            PrimeContractorOS
          </button>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              Home
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

      {/* Hero */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to Manage Government Contracting
          </h1>
          <p className="text-xl text-muted-foreground">
            From opportunity identification through contract closeout, PrimeContractorOS provides guided workflows, AI assistance, and compliance tracking.
          </p>
        </div>
      </section>

      {/* Feature Groups */}
      {featureGroups.map((group, groupIdx) => (
        <section key={groupIdx} className="py-16 md:py-24 border-b border-border">
          <div className="container max-w-4xl">
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-2">{group.title}</h2>
              <p className="text-lg text-muted-foreground">{group.description}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {group.features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="p-6 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors">
                    <Icon className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center space-y-8">
          <h2 className="text-3xl font-bold">Ready to explore all features?</h2>
          <Button
            size="lg"
            onClick={() => navigate("/get-started")}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-sm text-muted-foreground">
            © 2026 PrimeContractorOS. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
              Home
            </button>
            <button onClick={() => navigate("/help")} className="text-muted-foreground hover:text-foreground">
              Help
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
