import React, { useState } from "react";
import { Search, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, FileText, ExternalLink } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import LifecycleProgress from "@/components/LifecycleProgress";

const HANDBOOK_SECTIONS = [
  {
    id: "getting-started",
    title: "Getting Started with Government Contracting",
    content: "Federal government contracting is a structured process where businesses compete for and perform work under contracts with U.S. government agencies. To begin, you need to register your business in SAM.gov, obtain a UEI number, identify your NAICS codes, and develop a capability statement. The process follows a lifecycle: Opportunity → Proposal → Award → Performance → Closeout.",
    links: [
      { title: "SBA Contracting Guide", url: "https://www.sba.gov/federal-contracting/contracting-guide" },
      { title: "GSA Getting Started", url: "https://www.gsa.gov/small-business/register-your-business" },
    ]
  },
  {
    id: "sam-registration",
    title: "SAM.gov Registration",
    content: "The System for Award Management (SAM.gov) is the official U.S. government system for entity registration. All businesses must be registered in SAM to receive federal contracts or grants. Registration is free and must be renewed annually. You will need your UEI (Unique Entity Identifier), taxpayer information, banking details for EFT, and NAICS codes. Allow 7-10 business days for initial registration processing.",
    links: [
      { title: "SAM.gov Registration", url: "https://sam.gov/content/entity-registration" },
      { title: "UEI Information", url: "https://sam.gov/content/duns-uei" },
      { title: "SAM Status Check", url: "https://sam.gov/content/status-tracker" },
    ]
  },
  {
    id: "naics-codes",
    title: "NAICS Codes",
    content: "The North American Industry Classification System (NAICS) codes classify businesses by industry type. Federal agencies use NAICS codes to identify small business size standards and set aside contracts. Your primary NAICS code determines your small business size standard (based on revenue or employee count). You can have multiple NAICS codes but should identify the ones most relevant to your capabilities.",
    links: [
      { title: "NAICS Code Search", url: "https://www.census.gov/naics/" },
      { title: "SBA Size Standards", url: "https://www.sba.gov/federal-contracting/contracting-guide/size-standards" },
    ]
  },
  {
    id: "capability-statements",
    title: "Capability Statements",
    content: "A capability statement is a one-page marketing document that summarizes your company's core competencies, past performance, differentiators, and corporate data (CAGE, UEI, NAICS, certifications). It is the single most important marketing tool for government contractors. Use it when meeting contracting officers, attending industry days, and responding to sources sought notices.",
    links: [
      { title: "SBA Capability Statement Guide", url: "https://www.sba.gov/blog/how-write-effective-capability-statement" },
    ]
  },
  {
    id: "proposal-writing",
    title: "Proposal Writing",
    content: "Government proposals must strictly follow the solicitation instructions (Section L) and will be evaluated against stated criteria (Section M). Key elements include: Technical Approach, Management Plan, Past Performance, and Cost/Price Volume. Use a compliance matrix to ensure every requirement is addressed. Proposals are typically scored by evaluation teams using color/adjectival ratings (Blue/Outstanding, Green/Acceptable, Yellow/Marginal, Red/Unacceptable).",
    links: [
      { title: "FAR Part 15 - Contracting by Negotiation", url: "https://www.acquisition.gov/far/part-15" },
      { title: "Beta.SAM.gov Contract Opportunities", url: "https://sam.gov/content/opportunities" },
    ]
  },
  {
    id: "contract-types",
    title: "Contract Types",
    content: "Federal contracts are primarily categorized as Fixed-Price (FFP, FPI, FP-EPA) or Cost-Reimbursement (CPFF, CPIF, CPAF). Fixed-Price contracts place cost risk on the contractor but offer higher profit potential. Cost-Reimbursement contracts require an adequate accounting system and shift more risk to the government. Time-and-Materials (T&M) and Labor-Hour (LH) contracts are used when scope is uncertain. Understanding contract type determines your pricing strategy and risk management approach.",
    links: [
      { title: "FAR Part 16 - Contract Types", url: "https://www.acquisition.gov/far/part-16" },
    ]
  },
  {
    id: "compliance-basics",
    title: "Compliance Requirements",
    content: "Government contractors must maintain compliance with numerous regulations including: FAR/DFARS clauses, CAS (Cost Accounting Standards), DCAA-compliant accounting systems, cybersecurity requirements (CMMC for DoD, NIST 800-171), labor laws (Service Contract Act, Davis-Bacon Act for construction), and reporting requirements (FFATA, FSRS for subcontracting). Non-compliance can result in contract termination, suspension, or debarment.",
    links: [
      { title: "DCAA Guidebook", url: "https://www.dcaa.mil/Guidance/Audit-Process-Overview/" },
      { title: "CMMC Information", url: "https://dodcio.defense.gov/CMMC/" },
      { title: "NIST 800-171", url: "https://csrc.nist.gov/publications/detail/sp/800-171/rev-2/final" },
    ]
  },
  {
    id: "far-overview",
    title: "Federal Acquisition Regulation (FAR)",
    content: "The FAR is the primary regulation governing federal acquisitions. It is organized into 53 parts covering everything from definitions (Part 2) to contract clauses (Part 52). Key parts for contractors: Part 12 (Commercial Items), Part 15 (Negotiated Acquisitions), Part 19 (Small Business Programs), Part 31 (Cost Principles), Part 32 (Contract Financing), and Part 49 (Termination). Agency supplements like DFARS (Defense) add additional requirements.",
    links: [
      { title: "FAR Full Text", url: "https://www.acquisition.gov/far" },
      { title: "DFARS", url: "https://www.acquisition.gov/dfars" },
    ]
  },
  {
    id: "invoicing-guide",
    title: "Government Invoicing",
    content: "Federal invoicing typically uses the Invoice Processing Platform (IPP) or Wide Area Workflow (WAWF) for DoD contracts. Invoices must reference the contract number, CLIN/SLIN, period of performance, and include proper documentation. Payment terms are governed by the Prompt Payment Act (typically Net 30). For cost-reimbursement contracts, you must submit incurred cost proposals annually. Proper invoicing prevents payment delays and audit findings.",
    links: [
      { title: "IPP (Invoice Processing Platform)", url: "https://www.ipp.gov/" },
      { title: "WAWF", url: "https://wawf.eb.mil/" },
      { title: "Prompt Payment Act", url: "https://www.acquisition.gov/far/part-32#FAR_Subpart_32_9" },
    ]
  },
  {
    id: "closeout-process",
    title: "Contract Closeout",
    content: "Contract closeout begins when all deliverables are accepted, all administrative actions are complete, and final payment is made. The closeout process includes: verifying all deliverables are accepted, settling subcontracts, submitting final invoices, completing property disposition, submitting final patent/royalty reports, and resolving any outstanding claims. Closeout timelines vary: 6 months for FFP, 36 months for cost-type contracts. Proper closeout protects your past performance record.",
    links: [
      { title: "FAR Part 4.804 - Closeout", url: "https://www.acquisition.gov/far/part-4#FAR_4_804" },
    ]
  },
  {
    id: "small-business-programs",
    title: "Small Business Set-Aside Programs",
    content: "The federal government sets aside contracts for small businesses through several programs: 8(a) Business Development (for disadvantaged businesses), HUBZone (Historically Underutilized Business Zones), SDVOSB (Service-Disabled Veteran-Owned), WOSB/EDWOSB (Women-Owned), and general small business set-asides. Each program has specific eligibility requirements and certification processes. These programs provide access to sole-source and competitive set-aside contracts.",
    links: [
      { title: "SBA Certifications", url: "https://www.sba.gov/federal-contracting/contracting-assistance-programs" },
      { title: "8(a) Program", url: "https://www.sba.gov/federal-contracting/contracting-assistance-programs/8a-business-development-program" },
      { title: "HUBZone Program", url: "https://www.sba.gov/federal-contracting/contracting-assistance-programs/hubzone-program" },
    ]
  },
];

export default function Handbook() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [bookmarkedSections, setBookmarkedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBookmarkedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSections = HANDBOOK_SECTIONS.filter(section => 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bookmarkedCount = Object.values(bookmarkedSections).filter(Boolean).length;

  return (
    <PageLayout
      label="Reference"
      title="Contractor Handbook"
      subtitle="Comprehensive reference guide for government contracting topics, regulations, and best practices."
      summaryCards={[
        { label: "Topics", value: HANDBOOK_SECTIONS.length },
        { label: "Bookmarked", value: bookmarkedCount },
      ]}
    >
      <LifecycleProgress currentPhase="opportunity" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search handbook topics..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredSections.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No sections found matching "{searchQuery}".
              </CardContent>
            </Card>
          ) : (
            filteredSections.map((section) => {
              const isExpanded = expandedSections[section.id];
              const isBookmarked = bookmarkedSections[section.id];

              return (
                <Card key={section.id} className="overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-blue-50 rounded-md text-blue-700 flex-shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900 truncate">{section.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => toggleBookmark(e, section.id)}
                        className={isBookmarked ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400"}
                      >
                        {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <CardContent className="pt-0 pb-4 px-4 sm:px-16">
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {section.content}
                      </p>
                      
                      {section.links && section.links.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Related Resources</h4>
                          <div className="flex flex-wrap gap-2">
                            {section.links.map((link, idx) => (
                              <a 
                                key={idx} 
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline bg-blue-50 px-2 py-1 rounded-md"
                              >
                                {link.title}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </PageLayout>
  );
}
