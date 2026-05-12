import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  Search, BookOpen, FileText, DollarSign, Users,
  Brain, Shield, Folder, ChevronRight, ChevronDown,
  HelpCircle, Zap, AlertCircle, CheckCircle2, ExternalLink,
  Building2, BarChart3, ArrowRight
} from "lucide-react";
import Footer from "@/components/Footer";

// ─── Glossary ────────────────────────────────────────────────────────────────

const glossaryTerms = [
  { term: "SAM (System for Award Management)", definition: "The official U.S. government system where entities register to do business with the federal government. Registration is required before receiving any federal contract or grant. Renew annually at SAM.gov." },
  { term: "NAICS Code", definition: "North American Industry Classification System code. A 6-digit code that classifies businesses by industry. Used in government contracting to identify the type of work being solicited." },
  { term: "UEI (Unique Entity Identifier)", definition: "A 12-character alphanumeric identifier assigned to entities registered in SAM.gov. Replaced the DUNS number in 2022." },
  { term: "CAGE Code", definition: "Commercial and Government Entity code. A 5-character identifier assigned to suppliers of government agencies worldwide." },
  { term: "FAR (Federal Acquisition Regulation)", definition: "The primary regulation governing the acquisition process by which the federal government purchases goods and services." },
  { term: "DFARS", definition: "Defense Federal Acquisition Regulation Supplement. Additional acquisition regulations specific to the Department of Defense." },
  { term: "FFP (Firm Fixed Price)", definition: "A contract type where the price is not subject to adjustment. The contractor bears full responsibility for costs and profit/loss." },
  { term: "T&M (Time and Materials)", definition: "A contract type where payment is based on actual hours worked at specified rates plus actual cost of materials." },
  { term: "CPFF (Cost Plus Fixed Fee)", definition: "A contract type where the contractor is reimbursed for allowable costs plus a fixed fee (profit)." },
  { term: "IDIQ (Indefinite Delivery/Indefinite Quantity)", definition: "A contract type that provides for an indefinite quantity of supplies or services during a fixed period." },
  { term: "8(a) Program", definition: "SBA program for small disadvantaged businesses. Provides business development assistance and access to sole-source contracts." },
  { term: "HUBZone", definition: "Historically Underutilized Business Zone. SBA program that provides contracting preferences to businesses in designated areas." },
  { term: "SDVOSB", definition: "Service-Disabled Veteran-Owned Small Business. A set-aside category for businesses owned by service-disabled veterans." },
  { term: "WOSB", definition: "Women-Owned Small Business. A set-aside category for businesses owned and controlled by women." },
  { term: "Prime Contractor", definition: "The entity that holds the direct contract with the government agency. Responsible for overall contract performance." },
  { term: "Subcontractor", definition: "An entity that performs work under a prime contractor. Does not have a direct contractual relationship with the government." },
  { term: "Teaming Agreement", definition: "A formal agreement between two or more companies to work together on a government contract opportunity." },
  { term: "CDRL (Contract Data Requirements List)", definition: "A list of deliverable documents required under a government contract, specifying format, frequency, and distribution." },
  { term: "SOW (Statement of Work)", definition: "A document that describes the work to be performed, deliverables, and performance standards for a contract." },
  { term: "PWS (Performance Work Statement)", definition: "Similar to SOW but focuses on measurable outcomes rather than specific tasks. Used in performance-based contracts." },
  { term: "Closeout", definition: "The process of completing all administrative actions after a contract's physical completion, per FAR 4.804." },
  { term: "Modification (Mod)", definition: "A written change to the terms of a contract. Can be unilateral (by the government) or bilateral (agreed by both parties)." },
  { term: "Option Year", definition: "An additional period of performance that the government may exercise at its discretion, typically at pre-negotiated terms." },
  { term: "Past Performance", definition: "A contractor's record of previous contract performance, used as an evaluation factor in source selection." },
  { term: "Source Selection", definition: "The process by which the government evaluates proposals and selects a contractor for award." },
];

// ─── Help Sections ───────────────────────────────────────────────────────────

const sections = [
  {
    id: "getting-started",
    icon: Zap,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    title: "Getting Started",
    description: "Set up your workspace and get oriented in the platform.",
    articles: [
      {
        title: "1. Create Your Workspace",
        steps: [
          "Sign up using the Get Started button on the home page.",
          "Enter your business name, email, and create a password.",
          "Your workspace is created automatically — it is the central hub for all your contracting operations.",
          "You will receive a 7-day free trial with full access to all features.",
        ],
        tip: "One workspace per business entity. If you operate multiple companies, create separate workspaces for each.",
      },
      {
        title: "2. Complete Your Business Profile",
        steps: [
          "Navigate to Business Profile from the sidebar.",
          "Enter your legal company name, UEI, CAGE code, and SAM registration status.",
          "Add your NAICS codes, certifications (8(a), HUBZone, SDVOSB, WOSB), and core capabilities.",
          "This data is used across the platform to populate proposals, capability statements, and reports.",
        ],
        tip: "A complete business profile improves AI-generated content quality significantly.",
      },
      {
        title: "3. Invite Team Members",
        steps: [
          "Go to the Users page in your workspace sidebar.",
          "Click Invite User and enter the team member's email address.",
          "Assign a role: Owner Admin (full access), Contributor (create/edit), or Read Only (view only).",
          "The invited user will receive an email with a link to join your workspace.",
        ],
        tip: "You can change roles at any time from the Users page.",
      },
      {
        title: "4. Choose Your Access Level",
        steps: [
          "After your 7-day trial, you will be prompted to choose a plan.",
          "Starter, Growth, and Advanced plans are available with different feature limits.",
          "You may also continue with limited access at no cost.",
          "Upgrade at any time from the Billing page in your workspace.",
        ],
        tip: "Trial discount codes are available for 30 days after your trial starts.",
      },
    ],
  },
  {
    id: "opportunities",
    icon: BarChart3,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    title: "Opportunities & Proposals",
    description: "Track opportunities and build winning proposals.",
    articles: [
      {
        title: "Tracking Opportunities",
        steps: [
          "Go to Opportunities in the sidebar.",
          "Click New Opportunity and enter the solicitation number, agency, title, and due date.",
          "Use status workflows: New → Evaluating → Pursuing → Proposal Submitted → Won / Lost.",
          "Attach relevant files and notes to each opportunity record.",
        ],
        tip: "Set a bid/no-bid decision date to keep your pipeline from getting cluttered with stale opportunities.",
      },
      {
        title: "Building Proposals",
        steps: [
          "From an opportunity, click Create Proposal.",
          "Choose a proposal framework (Technical, Management, Past Performance, Price).",
          "Build each section using the text editor or AI-assisted drafting.",
          "Track completion percentage and mark sections as complete.",
          "When won, convert the proposal directly to a contract.",
        ],
        tip: "AI-generated proposal content is always marked as draft. Review and edit before submitting.",
      },
    ],
  },
  {
    id: "contracts",
    icon: FileText,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    title: "Contract Management",
    description: "Monitor active contracts from award through closeout.",
    articles: [
      {
        title: "The Contract Hub",
        steps: [
          "Open any contract to access the Contract Hub.",
          "The Hub provides tabs for: Overview, Requirements, Deliverables, Deadlines, Compliance, Finances, Files, and Health.",
          "Each tab shows the current status and what action is needed.",
          "The Health tab gives an overall contract health score based on open items.",
        ],
        tip: "Use the Compliance tab to track FAR/DFARS clause requirements and mark them as addressed.",
      },
      {
        title: "Contract Closeout (FAR 4.804)",
        steps: [
          "When physical work is complete, open the contract and click Begin Closeout.",
          "The system identifies blocking items: open requirements, unpaid invoices, missing deliverables.",
          "Resolve each blocking item and mark it complete.",
          "Once all items are cleared, mark the contract as Closed.",
        ],
        tip: "Closeout must be completed within 6 months of physical completion for most contract types per FAR 4.804.",
      },
    ],
  },
  {
    id: "finance",
    icon: DollarSign,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    title: "Finance & Invoicing",
    description: "Manage invoices, payments, and financial reporting.",
    articles: [
      {
        title: "Creating Invoices",
        steps: [
          "Go to Invoices in the sidebar.",
          "Click New Invoice and link it to a contract.",
          "Enter line items, amounts, and the invoice date.",
          "Set status to Draft while preparing, then Submitted when sent to the agency.",
        ],
        tip: "Government invoices often require specific formatting. Check your contract's billing instructions before submitting.",
      },
      {
        title: "Recording Payments",
        steps: [
          "Go to Payments in the sidebar.",
          "Click Record Payment and link it to the corresponding invoice.",
          "Enter the payment amount and date received.",
          "The system automatically updates invoice status to Paid or Partially Paid.",
        ],
        tip: "Use the Reports page to generate aging reports and identify overdue invoices.",
      },
    ],
  },
  {
    id: "files",
    icon: Folder,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
    title: "Files & Documents",
    description: "Upload, categorize, and link documents to your records.",
    articles: [
      {
        title: "Uploading Files",
        steps: [
          "Go to Files in the sidebar.",
          "Click Upload File and select a file from your device.",
          "Choose a category: Contract, Proposal, Compliance, Financial, or Other.",
          "Files are stored securely in cloud storage.",
        ],
        tip: "Mark contract governing documents as Governing Source to enable AI contract analysis.",
      },
      {
        title: "Linking Files to Records",
        steps: [
          "From any contract, proposal, or opportunity, open the Files tab.",
          "Click Attach File and select from your uploaded files.",
          "Linked files appear in the record's file list for quick access.",
        ],
        tip: "Keeping files linked to records ensures nothing gets lost when team members change.",
      },
    ],
  },
  {
    id: "users",
    icon: Users,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
    title: "Users & Access",
    description: "Manage team members, roles, and workspace permissions.",
    articles: [
      {
        title: "User Roles",
        steps: [
          "Owner Admin — Full access to all features, settings, and billing.",
          "Contributor — Can create, edit, and delete records. Cannot access billing or workspace settings.",
          "Read Only — Can view all records but cannot make changes.",
        ],
        tip: "Assign the minimum role needed. Promote to Contributor only when the user needs to create or edit records.",
      },
      {
        title: "Managing Team Members",
        steps: [
          "Go to Users in the sidebar.",
          "Click Invite User to add a new team member by email.",
          "To change a role, click the user's name and select a new role.",
          "To remove access, set the user's status to Inactive.",
        ],
        tip: "Inactive users cannot log in but their records remain intact for audit purposes.",
      },
    ],
  },
  {
    id: "ai",
    icon: Brain,
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-100",
    title: "AI Features",
    description: "Get intelligent guidance and AI-powered contract analysis.",
    articles: [
      {
        title: "AI Contract Analysis",
        steps: [
          "Upload the contract's governing documents (PWS, SOW, or CDRL) to the Files section.",
          "Mark the file as a Governing Source.",
          "Open the contract and click Run AI Analysis.",
          "Review the extracted requirements, deliverables, and compliance items.",
          "Accept or dismiss each finding individually.",
        ],
        tip: "AI analysis works best with clean PDF or Word documents. Scanned images may produce lower accuracy.",
      },
      {
        title: "AI Proposal Assistance",
        steps: [
          "Open a proposal and navigate to any section.",
          "Click Generate Draft to have AI produce initial text based on your business profile and opportunity details.",
          "Review, edit, and finalize the draft before including it in your submission.",
        ],
        tip: "All AI-generated content is clearly marked as AI Draft. Never submit AI content without human review.",
      },
      {
        title: "Contextual Guidance",
        steps: [
          "Every page in the platform includes a blue guidance panel at the top.",
          "The panel explains what the page does, when to use it, and what to do next.",
          "Click the panel to expand or collapse it.",
        ],
        tip: "Guidance panels are especially useful when you are new to a workflow or returning after a break.",
      },
    ],
  },
  {
    id: "compliance",
    icon: Shield,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
    title: "Government Contracting Basics",
    description: "Essential concepts and regulations for federal contractors.",
    articles: [
      {
        title: "SAM Registration",
        steps: [
          "All entities must register at SAM.gov before receiving federal contracts.",
          "Registration requires your UEI, CAGE code, and business information.",
          "Registration must be renewed annually — set a calendar reminder.",
          "Lapsed SAM registration can prevent contract award and payment.",
        ],
        tip: "SAM registration is free. Be cautious of third-party services that charge fees for SAM registration assistance.",
      },
      {
        title: "Understanding NAICS Codes",
        steps: [
          "NAICS codes classify your business by industry type.",
          "Government solicitations specify NAICS codes to identify the type of work.",
          "Your business profile should list all applicable NAICS codes.",
          "Size standards (small business thresholds) are tied to specific NAICS codes.",
        ],
        tip: "You can have multiple NAICS codes. Add all that apply to your services.",
      },
      {
        title: "Contract Types Overview",
        steps: [
          "FFP (Firm Fixed Price) — Fixed price regardless of actual costs. Most common.",
          "T&M (Time and Materials) — Pay for actual hours and materials. Used when scope is uncertain.",
          "CPFF (Cost Plus Fixed Fee) — Reimburse costs plus a fixed profit. Used for R&D.",
          "IDIQ — Indefinite quantity over a fixed period. Requires task orders to activate work.",
        ],
        tip: "FFP contracts put cost risk on the contractor. T&M contracts put risk on the government. Know which you are signing.",
      },
    ],
  },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const faqs = [
  { q: "What is PrimeContractorOS?", a: "A guided operating system for government contracting. It helps you manage opportunities, proposals, contracts, files, finances, and team collaboration in one connected system — with built-in guidance at every step." },
  { q: "Do I need experience with government contracting?", a: "No. The platform includes built-in guidance, definitions, and step-by-step workflows for both new and experienced contractors." },
  { q: "Can I try it for free?", a: "Yes. All new workspaces receive a 7-day free trial with full access to all features. No credit card is required to start." },
  { q: "How do I invite team members?", a: "Go to the Users page in your workspace sidebar and click Invite User. Enter their email address and select their role." },
  { q: "Can I export my data?", a: "Yes. Reports can be exported as CSV from the Reports section. Capability statements can be downloaded as PDF. Contract and finance summaries are also exportable." },
  { q: "What happens when my trial ends?", a: "You will be prompted to choose a paid plan or continue with limited access. Your data is never deleted." },
  { q: "Is my data secure?", a: "Yes. All data is stored in encrypted cloud storage. Files are served via signed URLs that expire after a short window. Access is controlled by workspace roles." },
  { q: "Can I use the platform on mobile?", a: "Yes. The platform is fully responsive and works on phones and tablets. The sidebar collapses to a hamburger menu on smaller screens." },
];

// ─── Components ──────────────────────────────────────────────────────────────

function ArticleCard({ article }: { article: { title: string; steps: string[]; tip: string } }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-sm font-semibold text-gray-900">{article.title}</span>
        {expanded
          ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {expanded && (
        <div className="px-5 pb-5 bg-white border-t border-gray-100">
          <ol className="mt-4 space-y-2">
            {article.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800"><span className="font-semibold">Tip: </span>{article.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Help() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"guide" | "glossary" | "faq">("guide");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const filteredSections = useMemo(() => {
    if (!searchTerm) return sections;
    const term = searchTerm.toLowerCase();
    return sections
      .map((s) => ({
        ...s,
        articles: s.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(term) ||
            a.steps.some((step) => step.toLowerCase().includes(term)) ||
            a.tip.toLowerCase().includes(term)
        ),
      }))
      .filter(
        (s) =>
          s.articles.length > 0 ||
          s.title.toLowerCase().includes(term) ||
          s.description.toLowerCase().includes(term)
      );
  }, [searchTerm]);

  const filteredGlossary = useMemo(() => {
    if (!searchTerm) return glossaryTerms;
    const term = searchTerm.toLowerCase();
    return glossaryTerms.filter(
      (g) => g.term.toLowerCase().includes(term) || g.definition.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const filteredFaqs = useMemo(() => {
    if (!searchTerm) return faqs;
    const term = searchTerm.toLowerCase();
    return faqs.filter(
      (f) => f.q.toLowerCase().includes(term) || f.a.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const displayedSection = activeSection
    ? filteredSections.find((s) => s.id === activeSection)
    : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Navigation ── */}
      <nav className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="container flex items-center justify-between py-4">
          <button
            onClick={() => navigate("/")}
            className="text-xl font-bold text-blue-900 tracking-tight"
          >
            PrimeContractorOS
          </button>
          <div className="hidden md:flex gap-2 items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>Home</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/features")}>Features</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/pricing")}>Pricing</Button>
            <Button size="sm" onClick={() => navigate("/login")}>Sign In</Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16 md:py-20">
        <div className="container max-w-5xl">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-4">
            <BookOpen className="w-4 h-4" />
            <span>User Guide &amp; Help Center</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            PrimeContractorOS<br className="hidden md:block" /> User Guide
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mb-8">
            Step-by-step instructions, government contracting terminology, and answers to common questions — all in one place.
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
            <input
              type="text"
              placeholder="Search the user guide..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition-all"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 flex-wrap">
            {(["guide", "glossary", "faq"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setActiveSection(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-white text-blue-900"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {tab === "guide" ? "User Guide" : tab === "glossary" ? "Glossary" : "FAQ"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="flex-1 py-12 md:py-16">
        <div className="container max-w-5xl">

          {/* ── USER GUIDE TAB ── */}
          {activeTab === "guide" && (
            <>
              {/* Section detail view */}
              {displayedSection ? (
                <div>
                  <button
                    onClick={() => setActiveSection(null)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-6 font-medium"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back to all sections
                  </button>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-xl ${displayedSection.bg} flex items-center justify-center`}>
                      <displayedSection.icon className={`w-5 h-5 ${displayedSection.color}`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{displayedSection.title}</h2>
                      <p className="text-sm text-gray-500">{displayedSection.description}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {displayedSection.articles.map((article, i) => (
                      <ArticleCard key={i} article={article} />
                    ))}
                  </div>
                </div>
              ) : (
                /* Section grid */
                filteredSections.length === 0 ? (
                  <div className="text-center py-16">
                    <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No results found for "{searchTerm}". Try a different search term or browse the Glossary.</p>
                  </div>
                ) : (
                  <div>
                    {/* Quick start banner */}
                    {!searchTerm && (
                      <div className="mb-8 p-5 rounded-xl bg-blue-50 border border-blue-100 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <h2 className="font-semibold text-blue-900 text-base">New to PrimeContractorOS?</h2>
                          <p className="text-sm text-blue-700 mt-1">Start with the Getting Started section to set up your workspace, complete your business profile, and invite your team.</p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-blue-700 hover:bg-blue-800 text-white shrink-0"
                          onClick={() => setActiveSection("getting-started")}
                        >
                          Start Here <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      {filteredSections.map((section) => {
                        const Icon = section.icon;
                        return (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`text-left p-5 rounded-xl border ${section.border} ${section.bg} hover:shadow-sm transition-all group`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center shrink-0 shadow-sm">
                                <Icon className={`w-5 h-5 ${section.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-gray-900 text-sm">{section.title}</h3>
                                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 shrink-0" />
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{section.description}</p>
                                <p className="text-xs text-gray-400 mt-2">{section.articles.length} article{section.articles.length !== 1 ? "s" : ""}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </>
          )}

          {/* ── GLOSSARY TAB ── */}
          {activeTab === "glossary" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Government Contracting Glossary</h2>
                <span className="text-sm text-gray-500">{filteredGlossary.length} terms</span>
              </div>
              {filteredGlossary.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-sm">No terms found for "{searchTerm}".</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredGlossary.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-200 transition-colors">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{item.term}</h4>
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.definition}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── FAQ TAB ── */}
          {activeTab === "faq" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h2>
                <span className="text-sm text-gray-500">{filteredFaqs.length} questions</span>
              </div>
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-sm">No FAQs found for "{searchTerm}".</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFaqs.map((faq, idx) => (
                    <FaqCard key={idx} faq={faq} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Support CTA ── */}
      <section className="py-12 border-t border-gray-200 bg-gray-50">
        <div className="container max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Still need help?</h2>
              <p className="text-sm text-gray-500 mt-1">Submit a support ticket or email our team directly.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => navigate("/support")}>
                Submit Support Ticket
              </Button>
              <a href="mailto:support@reedssolutionsllc.org">
                <Button size="sm" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Email Support
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FaqCard({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</span>
        {open
          ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 bg-white border-t border-gray-100">
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">{faq.a}</p>
        </div>
      )}
    </div>
  );
}
