import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Search, HelpCircle, BookOpen, FileText, DollarSign, Users, Brain, Shield, Folder } from "lucide-react";
import { useState } from "react";
import Footer from "@/components/Footer";

export default function Help() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    {
      icon: HelpCircle,
      title: "Getting Started",
      description: "Learn how to set up your workspace and get started with government contracting",
      articles: [
        { title: "Creating your workspace", link: "/documentation" },
        { title: "Inviting team members", link: "/documentation" },
        { title: "Setting up your business profile", link: "/documentation" },
        { title: "Choosing your access level", link: "/pricing" },
      ],
    },
    {
      icon: BookOpen,
      title: "Platform Features",
      description: "Learn how to use each feature in the contracting lifecycle",
      articles: [
        { title: "Opportunity tracking & pursuit decisions", link: "/documentation" },
        { title: "Proposal development workflow", link: "/documentation" },
        { title: "Contract Hub & live tracking", link: "/documentation" },
        { title: "Closeout per FAR 4.804", link: "/documentation" },
      ],
    },
    {
      icon: Shield,
      title: "Government Contracting",
      description: "Learn about government contracting concepts and regulations",
      articles: [
        { title: "What is SAM registration?", link: "/glossary" },
        { title: "Understanding NAICS codes", link: "/glossary" },
        { title: "Government contract types (FFP, T&M, CPFF)", link: "/glossary" },
        { title: "FAR/DFARS compliance requirements", link: "/platform-compliance" },
      ],
    },
    {
      icon: DollarSign,
      title: "Finance & Invoicing",
      description: "Manage invoices, payments, and financial reporting",
      articles: [
        { title: "Creating and tracking invoices", link: "/documentation" },
        { title: "Recording and matching payments", link: "/documentation" },
        { title: "Finance summary & outstanding balances", link: "/documentation" },
        { title: "Contract financial health", link: "/documentation" },
      ],
    },
    {
      icon: Folder,
      title: "Files & Documents",
      description: "Manage files linked to contracts, proposals, and opportunities",
      articles: [
        { title: "Uploading and categorizing files", link: "/documentation" },
        { title: "Linking files to records", link: "/documentation" },
        { title: "Governing source files", link: "/documentation" },
        { title: "File retention for closeout", link: "/documentation" },
      ],
    },
    {
      icon: Users,
      title: "Users & Access",
      description: "Manage team members, roles, and workspace permissions",
      articles: [
        { title: "User roles: Owner Admin to Read Only", link: "/documentation" },
        { title: "Adding and removing team members", link: "/documentation" },
        { title: "Permission levels explained", link: "/documentation" },
        { title: "Workspace settings", link: "/documentation" },
      ],
    },
    {
      icon: FileText,
      title: "Billing & Plans",
      description: "Manage your subscription, trials, and billing",
      articles: [
        { title: "Starter, Growth, and Advanced plans", link: "/pricing" },
        { title: "7-day trial and trial discounts", link: "/pricing" },
        { title: "Upgrading or downgrading", link: "/documentation" },
        { title: "Billing support", link: "/contact" },
      ],
    },
    {
      icon: Brain,
      title: "AI Features",
      description: "Get help with AI-powered guidance and contract analysis",
      articles: [
        { title: "AI suggestions and findings", link: "/documentation" },
        { title: "Contract confirmation workflow", link: "/documentation" },
        { title: "Review states (New, Reviewed, Approved, Held, Rejected)", link: "/documentation" },
        { title: "AI graceful degradation", link: "/documentation" },
      ],
    },
  ];

  const filteredCategories = categories.filter(
    (cat) =>
      cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.articles.some((article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container flex items-center justify-between py-4">
          <button onClick={() => navigate("/")} className="text-2xl font-bold text-primary">
            PrimeContractorOS
          </button>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>Home</Button>
            <Button variant="ghost" onClick={() => navigate("/features")}>Features</Button>
            <Button variant="ghost" onClick={() => navigate("/pricing")}>Pricing</Button>
            <Button variant="outline" onClick={() => navigate("/login")}>Sign In</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Help Center</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers to common questions and learn how to use PrimeContractorOS for government contracting.
          </p>
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
      <section className="py-16 md:py-24 flex-1">
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
                        <li key={aidx}>
                          <Link href={article.link}>
                            <span className="text-sm text-foreground hover:text-primary cursor-pointer">
                              &bull; {article.title}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href="/documentation">
                      <Button variant="outline" size="sm">Learn More</Button>
                    </Link>
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
                a: "Go to your workspace Users page and click Invite User. Enter their email and select their role. They will receive an invitation to join your workspace.",
              },
              {
                q: "Can I export my data?",
                a: "Yes. You can export your data in CSV format from the Reports section. Contact support for bulk exports.",
              },
              {
                q: "What happens when my trial ends?",
                a: "You will be prompted to choose a plan or continue with limited access. Your data is never deleted. You can always upgrade later.",
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
              <h3 className="text-lg font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Email us anytime at support@reedssolutionsllc.org. We respond within 1-2 business days.
              </p>
              <a href="mailto:support@reedssolutionsllc.org">
                <Button variant="outline" size="sm">Send Email</Button>
              </a>
            </div>
            <div className="p-8 rounded-lg bg-card border border-border">
              <h3 className="text-lg font-semibold mb-2">Documentation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Browse our full documentation for detailed guides on every feature.
              </p>
              <Link href="/documentation">
                <Button variant="outline" size="sm">View Documentation</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
