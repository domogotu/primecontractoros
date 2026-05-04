import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Search, HelpCircle, BookOpen, MessageSquare, Mail } from "lucide-react";
import { useState } from "react";

/**
 * Help Center Page
 * 
 * Design: Professional Minimalism
 * - Help categories
 * - Search functionality
 * - Support contact options
 */
export default function Help() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    {
      icon: HelpCircle,
      title: "Getting Started",
      description: "Learn how to set up your workspace and get started",
      articles: [
        "Creating your workspace",
        "Inviting team members",
        "Setting up your business profile",
        "Choosing your access level",
      ],
    },
    {
      icon: BookOpen,
      title: "Platform Features",
      description: "Learn how to use each feature",
      articles: [
        "Opportunity tracking",
        "Proposal management",
        "Contract management",
        "Financial reporting",
      ],
    },
    {
      icon: BookOpen,
      title: "Government Contracting",
      description: "Learn about government contracting concepts",
      articles: [
        "What is SAM registration?",
        "Understanding NAICS codes",
        "Government contract types",
        "Compliance requirements",
      ],
    },
    {
      icon: BookOpen,
      title: "Finance",
      description: "Manage invoices, payments, and reporting",
      articles: [
        "Creating invoices",
        "Recording payments",
        "Financial reports",
        "Tax documentation",
      ],
    },
    {
      icon: BookOpen,
      title: "Files & Documents",
      description: "Manage files and documents",
      articles: [
        "Uploading files",
        "Organizing files",
        "Sharing files with team",
        "File permissions",
      ],
    },
    {
      icon: BookOpen,
      title: "Users & Access",
      description: "Manage team members and permissions",
      articles: [
        "User roles and permissions",
        "Adding team members",
        "Removing users",
        "Workspace settings",
      ],
    },
    {
      icon: BookOpen,
      title: "Billing & Activation",
      description: "Manage your subscription and billing",
      articles: [
        "Choosing a plan",
        "Upgrading or downgrading",
        "Using promo codes",
        "Billing support",
      ],
    },
    {
      icon: BookOpen,
      title: "AI Features",
      description: "Get help with AI-powered features",
      articles: [
        "AI proposal review",
        "Compliance recommendations",
        "AI-generated insights",
        "Best practices",
      ],
    },
  ];

  const filteredCategories = categories.filter(
    (cat) =>
      cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.articles.some((article) =>
        article.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

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
            <Button variant="ghost" onClick={() => navigate("/features")}>
              Features
            </Button>
            <Button variant="ghost" onClick={() => navigate("/pricing")}>
              Pricing
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Help Center</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers to common questions and learn how to use PrimeContractorOS.
          </p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results found. Try a different search term.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {filteredCategories.map((category, idx) => {
                const Icon = category.icon;
                return (
                  <div
                    key={idx}
                    className="p-8 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                  >
                    <Icon className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                    <p className="text-sm text-muted-foreground mb-6">{category.description}</p>
                    <ul className="space-y-2 mb-6">
                      {category.articles.map((article, aidx) => (
                        <li key={aidx} className="text-sm text-foreground">
                          • {article}
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 border-t border-border bg-card">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "What is PrimeContractorOS?",
                a: "PrimeContractorOS is a guided operating system for government contracting. It helps you manage opportunities, proposals, contracts, files, finances, and team collaboration in one connected system.",
              },
              {
                q: "Do I need experience with government contracting?",
                a: "No. PrimeContractorOS is designed for both new and experienced contractors. The platform includes built-in guidance, definitions, and step-by-step workflows.",
              },
              {
                q: "Can I try PrimeContractorOS for free?",
                a: "Yes. All new workspaces get a 7-day free trial with full access to any plan. No credit card required.",
              },
              {
                q: "How do I invite team members?",
                a: "Go to Settings > User Management and click 'Invite User'. Enter their email and select their role. They'll receive an invitation to join your workspace.",
              },
              {
                q: "Can I export my data?",
                a: "Yes. You can export your data in CSV format from the Reports section. Contact support for bulk exports.",
              },
              {
                q: "What happens when my trial ends?",
                a: "You'll be prompted to choose a plan or continue with limited access. Your data is never deleted—you can always upgrade later.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="p-6 rounded-lg bg-background border border-border">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-muted-foreground text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold mb-12">Still need help?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-lg bg-card border border-border">
              <MessageSquare className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chat Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Chat with our support team during business hours.
              </p>
              <Button variant="outline" size="sm">
                Start Chat
              </Button>
            </div>
            <div className="p-8 rounded-lg bg-card border border-border">
              <Mail className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Email us anytime. We'll respond within 24 hours.
              </p>
              <Button variant="outline" size="sm">
                Send Email
              </Button>
            </div>
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
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
              Home
            </button>
            <button onClick={() => navigate("/features")} className="text-muted-foreground hover:text-foreground">
              Features
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
