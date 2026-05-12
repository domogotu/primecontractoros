import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  Search, HelpCircle, BookOpen, FileText, DollarSign, Users,
  Brain, Shield, Folder, ChevronDown, ChevronUp
} from "lucide-react";
import Footer from "@/components/Footer";

const glossaryTerms = [
  { term: "SAM (System for Award Management)", definition: "The official U.S. government system where entities register to do business with the federal government. Registration is required before receiving any federal contract or grant." },
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

const categories = [
  {
    icon: HelpCircle,
    title: "Getting Started",
    description: "Learn how to set up your workspace and get started with government contracting",
    articles: [
      { title: "Creating your workspace", content: "Sign up and create your workspace by providing your business information. Your workspace is the central hub for all your contracting operations." },
      { title: "Inviting team members", content: "Go to the Users page in your workspace to invite team members. Assign roles (Owner Admin, Contributor, Read Only) to control access levels." },
      { title: "Setting up your business profile", content: "Complete your business profile with legal name, UEI, CAGE code, SAM status, NAICS codes, and certifications. This data is used across the platform." },
      { title: "Choosing your access level", content: "Choose between a 7-day free trial, limited access, or a paid plan (Starter, Growth, Advanced). Trial includes full access to all features." },
    ],
  },
  {
    icon: BookOpen,
    title: "Platform Features",
    description: "Learn how to use each feature in the contracting lifecycle",
    articles: [
      { title: "Opportunity tracking & pursuit decisions", content: "Track opportunities from identification through bid/no-bid decision. Use status workflows (New → Evaluating → Pursuing → Won/Lost) to manage your pipeline." },
      { title: "Proposal development workflow", content: "Choose a proposal framework, build sections with AI assistance, track completion, and submit. Won proposals convert directly to contracts." },
      { title: "Contract Hub & live tracking", content: "The Contract Hub provides a single view of requirements, deliverables, deadlines, compliance items, finances, and health status for each contract." },
      { title: "Closeout per FAR 4.804", content: "The closeout workflow identifies blocking items (open requirements, unpaid invoices, missing files) and guides you through resolution before marking a contract closed." },
    ],
  },
  {
    icon: Shield,
    title: "Government Contracting Basics",
    description: "Learn about government contracting concepts and regulations",
    articles: [
      { title: "What is SAM registration?", content: "SAM (System for Award Management) is the official government registration system. All entities must register at SAM.gov before receiving federal contracts. Registration must be renewed annually." },
      { title: "Understanding NAICS codes", content: "NAICS codes classify businesses by industry. Government solicitations specify NAICS codes to identify the type of work. Your business profile should list all applicable codes." },
      { title: "Government contract types", content: "Common types include FFP (Firm Fixed Price), T&M (Time and Materials), CPFF (Cost Plus Fixed Fee), and IDIQ (Indefinite Delivery/Indefinite Quantity). Each has different risk and payment structures." },
      { title: "FAR/DFARS compliance", content: "The Federal Acquisition Regulation (FAR) and its supplements govern how the government buys goods and services. Compliance requirements vary by contract type and agency." },
    ],
  },
  {
    icon: DollarSign,
    title: "Finance & Invoicing",
    description: "Manage invoices, payments, and financial reporting",
    articles: [
      { title: "Creating and tracking invoices", content: "Create invoices linked to specific contracts. Track status through Draft → Submitted → Paid/Overdue. View aging reports and outstanding balances." },
      { title: "Recording and matching payments", content: "Record payments and match them to invoices. The system tracks partial payments and updates invoice status automatically." },
      { title: "Financial reports", content: "Generate contract summary, financial, win/loss, and compliance reports. Export any report as CSV for external use." },
    ],
  },
  {
    icon: Folder,
    title: "Files & Documents",
    description: "Manage files linked to contracts, proposals, and opportunities",
    articles: [
      { title: "Uploading and categorizing files", content: "Upload files to your workspace with categories like Contract, Proposal, Compliance, Financial, etc. Files are stored securely in cloud storage." },
      { title: "Linking files to records", content: "Link files to opportunities, proposals, contracts, and other records. This creates a connected document trail across your operations." },
      { title: "Governing source files", content: "Mark files as governing documents for contracts. These are used by the AI analysis system to extract requirements and compliance items." },
    ],
  },
  {
    icon: Users,
    title: "Users & Access",
    description: "Manage team members, roles, and workspace permissions",
    articles: [
      { title: "User roles explained", content: "Owner Admin has full access. Contributors can create and edit records. Read Only users can view but not modify data." },
      { title: "Adding and removing team members", content: "Invite users by email from the Users page. Remove users by changing their status to inactive." },
      { title: "Workspace settings", content: "Configure workspace-level settings including company information, notification preferences, and access controls." },
    ],
  },
  {
    icon: Brain,
    title: "AI Features",
    description: "Get help with AI-powered guidance and contract analysis",
    articles: [
      { title: "AI contract analysis", content: "Upload governing documents and run AI analysis to extract requirements, deliverables, deadlines, and compliance items. Review findings individually." },
      { title: "AI proposal assistance", content: "Generate draft text for proposal sections using AI. All AI-generated content is marked as draft and requires human review." },
      { title: "Contextual guidance", content: "Each page includes contextual guidance explaining what the page does, when to use it, and what to do next." },
    ],
  },
];

function ExpandableArticle({ article }: { article: { title: string; content: string } }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 px-2 rounded"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-sm font-medium text-gray-900">{article.title}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {expanded && (
        <div className="px-2 pb-3">
          <p className="text-sm text-gray-600">{article.content}</p>
        </div>
      )}
    </div>
  );
}

export default function Help() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"articles" | "glossary">("articles");

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    const term = searchTerm.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        articles: cat.articles.filter(
          (a) => a.title.toLowerCase().includes(term) || a.content.toLowerCase().includes(term)
        ),
      }))
      .filter((cat) => cat.articles.length > 0 || cat.title.toLowerCase().includes(term) || cat.description.toLowerCase().includes(term));
  }, [searchTerm]);

  const filteredGlossary = useMemo(() => {
    if (!searchTerm) return glossaryTerms;
    const term = searchTerm.toLowerCase();
    return glossaryTerms.filter(
      (g) => g.term.toLowerCase().includes(term) || g.definition.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="container flex items-center justify-between py-4">
          <button onClick={() => navigate("/")} className="text-2xl font-bold text-blue-900">PrimeContractorOS</button>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>Home</Button>
            <Button variant="ghost" onClick={() => navigate("/features")}>Features</Button>
            <Button variant="ghost" onClick={() => navigate("/pricing")}>Pricing</Button>
            <Button variant="outline" onClick={() => navigate("/login")}>Sign In</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 md:py-20 border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Help Center</h1>
          <p className="text-xl text-gray-500 mb-8">
            Find answers, learn platform features, and explore government contracting terminology.
          </p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles and glossary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "articles" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              onClick={() => setActiveTab("articles")}
            >
              Help Articles
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "glossary" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              onClick={() => setActiveTab("glossary")}
            >
              Glossary ({filteredGlossary.length} terms)
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 flex-1">
        <div className="container max-w-6xl">
          {activeTab === "articles" ? (
            filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No articles found. Try a different search term or check the glossary.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredCategories.map((category, idx) => {
                  const Icon = category.icon;
                  return (
                    <div key={idx} className="p-6 rounded-lg bg-white border border-gray-200 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <Icon className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">{category.title}</h3>
                          <p className="text-xs text-gray-500">{category.description}</p>
                        </div>
                      </div>
                      <div>
                        {category.articles.map((article, aidx) => (
                          <ExpandableArticle key={aidx} article={article} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Glossary */
            <div>
              {filteredGlossary.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No glossary terms found. Try a different search term.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredGlossary.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-white border border-gray-200">
                      <h4 className="font-semibold text-gray-900 text-sm">{item.term}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.definition}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-16 border-t border-gray-200 bg-gray-50">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "What is PrimeContractorOS?", a: "A guided operating system for government contracting. It helps you manage opportunities, proposals, contracts, files, finances, and team collaboration in one connected system." },
              { q: "Do I need experience with government contracting?", a: "No. The platform includes built-in guidance, definitions, and step-by-step workflows for both new and experienced contractors." },
              { q: "Can I try it for free?", a: "Yes. All new workspaces get a 7-day free trial with full access. No credit card required." },
              { q: "How do I invite team members?", a: "Go to your workspace Users page and click Invite User. Enter their email and select their role." },
              { q: "Can I export my data?", a: "Yes. Export reports as CSV from the Reports section. Capability statements can be exported as text files." },
              { q: "What happens when my trial ends?", a: "You will be prompted to choose a plan or continue with limited access. Your data is never deleted." },
            ].map((faq, idx) => (
              <div key={idx} className="p-5 rounded-lg bg-white border border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm">{faq.q}</h3>
                <p className="text-gray-500 text-sm mt-1">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-12 border-t border-gray-200">
        <div className="container max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Still need help?</h2>
          <p className="text-gray-500 mb-6">Contact our support team or submit a support ticket.</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate("/support")}>Submit Support Ticket</Button>
            <a href="mailto:support@reedssolutionsllc.org"><Button>Email Support</Button></a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
