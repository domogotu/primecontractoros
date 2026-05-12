import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  ArrowRight, BarChart3, Zap, FileText, Users, DollarSign,
  AlertCircle, CheckCircle2, Compass, Briefcase, TrendingUp,
  BookOpen, Settings, ChevronDown, ChevronUp, Shield, Folder,
  MessageSquare, Target, Clock
} from "lucide-react";

const featureGroups = [
  {
    title: "Opportunity Management",
    description: "Track and manage government opportunities from identification through pursuit decision",
    features: [
      {
        icon: Compass,
        title: "Opportunity Tracking",
        description: "Identify, track, and evaluate government opportunities with built-in guidance",
        details: [
          "Track opportunities from identification through bid/no-bid decision",
          "Capture solicitation details, agency info, NAICS codes, and set-aside requirements",
          "Status workflow: New → Evaluating → Pursuing → Won/Lost/No-Bid",
          "Link files, contacts, and notes directly to each opportunity",
          "Convert winning opportunities directly to proposals with data carry-forward",
        ],
      },
      {
        icon: BarChart3,
        title: "Pipeline Dashboard",
        description: "Visualize your opportunity pipeline and contracting lifecycle",
        details: [
          "Real-time pipeline view from opportunities through contracts",
          "Summary cards showing counts at each lifecycle stage",
          "Quick access to all workspace areas from the dashboard",
          "Win/loss analysis and proposal success metrics",
        ],
      },
      {
        icon: AlertCircle,
        title: "Alerts & Reminders",
        description: "Never miss a deadline with smart notifications and task tracking",
        details: [
          "Automatic alerts for approaching deadlines and overdue items",
          "Task management linked to opportunities, proposals, and contracts",
          "Priority-based Next Best Steps recommendations on the dashboard",
          "SAM registration renewal reminders and compliance alerts",
        ],
      },
    ],
  },
  {
    title: "Proposal & Contract Workflow",
    description: "Build, manage, and track proposals and contracts through the full lifecycle",
    features: [
      {
        icon: FileText,
        title: "Proposal Framework",
        description: "Guided proposal building with templates and AI assistance",
        details: [
          "Choose from 5 proposal frameworks: Standard, Technical, Subcontract, Simple, Blank",
          "Section-by-section editing with completion tracking",
          "AI-powered draft text generation for each section",
          "Readiness review before submission",
          "Won proposals convert directly to contracts with selective carry-forward",
          "Loss review with debrief capture and AI analysis",
        ],
      },
      {
        icon: Briefcase,
        title: "Contract Management",
        description: "Track contract status, compliance, and closeout workflows",
        details: [
          "Contract Hub with executive summary, requirements, deliverables, deadlines",
          "AI Confirmation Workspace for analyzing governing documents",
          "Contract modifications tracking with impact assessment",
          "Compliance items and obligation tracking",
          "Closeout workflow with blocker identification and resolution",
          "Health status tracking (Green/Yellow/Red) per contract",
        ],
      },
      {
        icon: TrendingUp,
        title: "Performance Tracking",
        description: "Monitor contract performance and key metrics",
        details: [
          "Deliverable tracking with submission and acceptance status",
          "Deadline monitoring with upcoming items highlighted",
          "Financial performance per contract (invoiced vs. paid vs. outstanding)",
          "Lessons learned capture for continuous improvement",
        ],
      },
    ],
  },
  {
    title: "Finance & Operations",
    description: "Manage invoicing, payments, and financial reporting across all contracts",
    features: [
      {
        icon: DollarSign,
        title: "Invoicing & Payments",
        description: "Create, track, and manage invoices and payments with matching",
        details: [
          "Full invoice lifecycle: Draft → Submitted → Paid/Overdue",
          "Payment tracking with invoice matching workflow",
          "Invoice aging reports and overdue notifications",
          "Status history tracking for audit trails",
          "Link invoices and payments to specific contracts",
        ],
      },
      {
        icon: BarChart3,
        title: "Financial Reports",
        description: "Generate reports on revenue, outstanding amounts, and contract financials",
        details: [
          "Contract summary reports with financial totals",
          "Revenue breakdown by contract",
          "Win/loss analysis with proposal metrics",
          "Compliance status reports",
          "CSV export for all report types",
        ],
      },
      {
        icon: Shield,
        title: "Compliance Tracking",
        description: "Stay compliant with government contracting regulations",
        details: [
          "Compliance items linked to specific contracts",
          "AI-powered compliance requirement extraction from contract documents",
          "Obligation tracking with status monitoring",
          "SAM registration status and renewal tracking",
          "Business profile completeness scoring",
        ],
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
        details: [
          "Workspace-based team management with role assignments",
          "Shared access to all workspace records and files",
          "Contact management with record linking",
          "Message tracking linked to contacts and records",
        ],
      },
      {
        icon: BookOpen,
        title: "Lessons Learned",
        description: "Capture and share lessons from completed contracts and proposals",
        details: [
          "Capture lessons from contract closeout and proposal loss reviews",
          "AI-assisted analysis of debrief information",
          "Link lessons to specific proposals, contracts, and templates",
          "Apply lessons to improve future proposal templates",
        ],
      },
      {
        icon: Folder,
        title: "File & Document Management",
        description: "Organize and link files across your contracting operations",
        details: [
          "Upload and categorize files with S3 storage",
          "Link files to opportunities, proposals, contracts, and other records",
          "Version history tracking for document revisions",
          "Governing document designation for contracts",
          "AI analysis of uploaded contract documents",
        ],
      },
    ],
  },
  {
    title: "Intelligence & Guidance",
    description: "Get AI-powered insights and expert guidance throughout the process",
    features: [
      {
        icon: Zap,
        title: "AI Workspace Intelligence",
        description: "Get intelligent recommendations and document analysis",
        details: [
          "AI-powered contract document analysis with finding extraction",
          "Per-finding review workflow: Approve, Hold, Edit, Manual Review",
          "AI draft text generation for proposal sections",
          "Compliance requirement identification from governing documents",
          "Contextual guidance on every page of the application",
        ],
      },
      {
        icon: Target,
        title: "Capability Statement Builder",
        description: "Build professional capability statements from your business profile",
        details: [
          "Auto-populate from your business profile data",
          "Create tailored versions for specific agencies or audiences",
          "Export capability statements as downloadable documents",
          "Missing data warnings when profile is incomplete",
        ],
      },
      {
        icon: Settings,
        title: "Templates & Reusable Content",
        description: "Build a library of templates for proposals, contracts, and reports",
        details: [
          "Default templates for common document types",
          "Custom template creation and versioning",
          "Apply templates to new proposals and documents",
          "Template library shared across the workspace",
        ],
      },
    ],
  },
];

function FeatureCard({ feature }: { feature: typeof featureGroups[0]["features"][0] }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = feature.icon;

  return (
    <div
      className={`p-6 rounded-lg bg-white border transition-all cursor-pointer ${
        expanded ? "border-blue-300 shadow-md" : "border-gray-200 hover:border-blue-200 hover:shadow-sm"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Icon className="h-7 w-7 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
      {expanded && feature.details && (
        <div className="mt-4 pl-10 space-y-2">
          {feature.details.map((detail, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">{detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Features() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="container flex items-center justify-between py-4">
          <button onClick={() => navigate("/")} className="text-2xl font-bold text-blue-900">
            PrimeContractorOS
          </button>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>Home</Button>
            <Button variant="ghost" onClick={() => navigate("/pricing")}>Pricing</Button>
            <Button variant="ghost" onClick={() => navigate("/help")}>Help</Button>
            <Button variant="outline" onClick={() => navigate("/login")}>Sign In</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 md:py-24 border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Everything You Need to Manage Government Contracting
          </h1>
          <p className="text-xl text-gray-500">
            From opportunity identification through contract closeout, PrimeContractorOS provides guided workflows, AI assistance, and compliance tracking. Click any feature to see details.
          </p>
        </div>
      </section>

      {/* Feature Groups */}
      {featureGroups.map((group, groupIdx) => (
        <section key={groupIdx} className={`py-16 md:py-20 border-b border-gray-200 ${groupIdx % 2 === 1 ? "bg-gray-50" : "bg-white"}`}>
          <div className="container max-w-5xl">
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-2 text-gray-900">{group.title}</h2>
              <p className="text-lg text-gray-500">{group.description}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {group.features.map((feature, idx) => (
                <FeatureCard key={idx} feature={feature} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-16 md:py-24 bg-blue-900 text-white">
        <div className="container max-w-4xl text-center space-y-8">
          <h2 className="text-3xl font-bold">Ready to explore all features?</h2>
          <p className="text-lg text-blue-200">Start your free trial and see how PrimeContractorOS can streamline your operations.</p>
          <Button size="lg" onClick={() => navigate("/get-started")} className="bg-white text-blue-900 hover:bg-blue-50">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-white">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-sm text-gray-500">© 2026 PrimeContractorOS. All rights reserved.</div>
          <div className="flex gap-6 text-sm">
            <button onClick={() => navigate("/")} className="text-gray-500 hover:text-gray-900">Home</button>
            <button onClick={() => navigate("/help")} className="text-gray-500 hover:text-gray-900">Help</button>
            <button onClick={() => navigate("/support")} className="text-gray-500 hover:text-gray-900">Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
