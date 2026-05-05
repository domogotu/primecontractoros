import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen, Rocket, Shield, Users, FileText, DollarSign, Brain, HelpCircle } from "lucide-react";
import Footer from "@/components/Footer";

export default function Documentation() {
  const sections = [
    {
      icon: Rocket,
      title: "Getting Started",
      description: "Create your workspace, complete onboarding, and set up your business profile.",
      topics: ["Account creation", "4-step onboarding", "Business profile setup", "NAICS codes & certifications"],
    },
    {
      icon: FileText,
      title: "Opportunity Management",
      description: "Track government contracting opportunities from discovery through pursue/no-pursue decisions.",
      topics: ["Adding opportunities", "Status workflow", "Review checklists", "Converting to proposals"],
    },
    {
      icon: BookOpen,
      title: "Proposal Development",
      description: "Build proposals with structured sections, linked files, and team collaboration.",
      topics: ["Proposal frameworks", "Section management", "File attachments", "Submission tracking"],
    },
    {
      icon: Shield,
      title: "Contract Management",
      description: "Manage awarded contracts through the full performance lifecycle to closeout.",
      topics: ["Contract Hub", "Deliverables tracking", "Compliance monitoring", "Modifications & changes"],
    },
    {
      icon: DollarSign,
      title: "Finance & Invoicing",
      description: "Track invoices, payments, and financial health across all your contracts.",
      topics: ["Invoice creation", "Payment matching", "Finance summary", "Outstanding balances"],
    },
    {
      icon: Users,
      title: "Team & Workspace",
      description: "Invite team members, assign roles, and manage workspace access.",
      topics: ["User roles", "Invitations", "Permissions", "Workspace settings"],
    },
    {
      icon: Brain,
      title: "AI Features",
      description: "Get AI-powered guidance, suggestions, and contract analysis.",
      topics: ["AI suggestions", "Contract findings", "Review workflow", "Guidance panel"],
    },
    {
      icon: HelpCircle,
      title: "FAR/DFARS Reference",
      description: "Built-in compliance guidance based on federal acquisition regulations.",
      topics: ["FAR Part 4 (Admin)", "FAR Part 15 (Negotiation)", "FAR Part 49 (Termination)", "DFARS supplements"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-blue-900 text-white px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <nav className="mb-8">
            <Link href="/">
              <span className="text-blue-200 hover:text-white text-sm cursor-pointer">&larr; Back to Home</span>
            </Link>
          </nav>
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-blue-100 text-lg">Learn how to use PrimeContractorOS to manage your government contracting operations.</p>
        </div>
      </div>

      <div className="flex-1 px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quick Start */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Quick Start</h2>
            <p className="text-gray-700 mb-4">New to PrimeContractorOS? Follow these steps to get started:</p>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>Create your account at <Link href="/get-started"><span className="text-blue-600 hover:underline cursor-pointer">Get Started</span></Link></li>
              <li>Complete the 4-step onboarding to set up your workspace</li>
              <li>Add your first opportunity from the Opportunities page</li>
              <li>Follow the guided workflow: Opportunity → Proposal → Contract → Operations</li>
            </ol>
          </div>

          {/* Documentation Sections */}
          <div className="grid md:grid-cols-2 gap-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.title} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <Icon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                  <ul className="space-y-1">
                    {section.topics.map((topic) => (
                      <li key={topic} className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Help CTA */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Need More Help?</h2>
            <p className="text-gray-600 mb-6">Check our glossary for government contracting terminology or contact our support team.</p>
            <div className="flex gap-4 justify-center">
              <Link href="/glossary">
                <Button variant="outline">View Glossary</Button>
              </Link>
              <Link href="/contact">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Contact Support</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
