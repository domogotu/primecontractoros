// @ts-nocheck
import React, { useState } from "react";
import { Search, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, FileText, ExternalLink, Plus } from "lucide-react";
import PageGuide from "@/components/PageGuide";
import PageLayout from "@/components/PageLayout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const HANDBOOK_SECTIONS = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: "Welcome to government contracting. This section covers the fundamental steps required to begin bidding on federal contracts, including understanding the marketplace and assessing your business readiness.",
    links: [{ title: "SBA Contracting Guide", url: "#" }]
  },
  {
    id: "sam-registration",
    title: "SAM Registration",
    content: "The System for Award Management (SAM) is the official U.S. government system that consolidates the capabilities of CCR/FedReg, ORCA, and EPLS. You must be registered in SAM to do business with the federal government.",
    links: [{ title: "SAM.gov", url: "#" }, { title: "UEI Guide", url: "#" }]
  },
  {
    id: "naics-codes",
    title: "NAICS Codes",
    content: "The North American Industry Classification System (NAICS) is the standard used by Federal statistical agencies in classifying business establishments. Identifying your correct NAICS codes is crucial for finding relevant opportunities.",
    links: [{ title: "NAICS Search", url: "#" }]
  },
  {
    id: "capability-statements",
    title: "Capability Statements",
    content: "A capability statement is a concise, one-page document of your business competencies. Think of it as your business's resume. It should include your core competencies, past performance, differentiators, and corporate data.",
    links: [{ title: "Capability Statement Template", url: "#" }]
  },
  {
    id: "proposal-writing",
    title: "Proposal Writing",
    content: "Writing a winning proposal requires careful reading of the solicitation (RFP/RFQ), strict adherence to instructions, and a clear articulation of your value proposition and technical approach.",
    links: [{ title: "Proposal Best Practices", url: "#" }]
  },
  {
    id: "contract-types",
    title: "Contract Types",
    content: "Federal contracts come in various types, primarily Fixed-Price (FP) and Cost-Reimbursement (CR). Understanding the risks and requirements of each type is essential for successful contract execution.",
    links: [{ title: "FAR Part 16", url: "#" }]
  },
  {
    id: "compliance-basics",
    title: "Compliance Basics",
    content: "Government contractors must adhere to strict compliance requirements, including accounting system standards, cybersecurity (CMMC/NIST), and labor laws (Service Contract Act, Davis-Bacon Act).",
    links: [{ title: "DCAA Compliance", url: "#" }]
  },
  {
    id: "far-overview",
    title: "FAR Overview",
    content: "The Federal Acquisition Regulation (FAR) is the primary regulation for use by all Federal Executive agencies in their acquisition of supplies and services with appropriated funds.",
    links: [{ title: "Acquisition.gov", url: "#" }]
  },
  {
    id: "invoicing-guide",
    title: "Invoicing Guide",
    content: "Proper invoicing is critical for timely payment. Most federal agencies use the Wide Area Workflow (WAWF) or the Invoice Processing Platform (IPP) for electronic invoicing.",
    links: [{ title: "WAWF Training", url: "#" }]
  },
  {
    id: "closeout-process",
    title: "Closeout Process",
    content: "Contract closeout occurs when the contract has met all terms of the contract and all administrative actions have been completed, all disputes settled, and final payment has been made.",
    links: [{ title: "Closeout Checklist", url: "#" }]
  }
];

export default function Handbook() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [bookmarkedSections, setBookmarkedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBookmarkedSections(prev => {
      const newState = { ...prev, [id]: !prev[id] };
      if (newState[id]) {
        toast({ title: "Section bookmarked" });
      } else {
        toast({ title: "Bookmark removed" });
      }
      return newState;
    });
  };

  const handleGenerateSection = () => {
    toast({
      title: "Feature coming soon",
      description: "AI section generation is not yet implemented."
    });
  };

  const filteredSections = HANDBOOK_SECTIONS.filter(section => 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout>
      <PageGuide
        title="Contractor Handbook"
        description="Searchable reference guide for government contracting topics, regulations, and best practices."
        whenToUse="Use this handbook to look up definitions, processes, and guidelines related to federal contracting."
        whatToDoNext="Search for a specific topic or browse the sections below to expand your knowledge."
        relatedRecords={[
          { label: "Templates", path: "/app/templates" },
          { label: "FAR Reference", path: "/app/far" },
          { label: "Compliance", path: "/app/compliance" }
        ]}
        alerts={[]}
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search handbook topics..."
              className="pl-9 bg-card text-foreground border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleGenerateSection} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Generate Section
          </Button>
        </div>

        <div className="space-y-4">
          {filteredSections.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-8 text-center text-muted-foreground">
                No sections found matching "{searchQuery}".
              </CardContent>
            </Card>
          ) : (
            filteredSections.map((section) => {
              const isExpanded = expandedSections[section.id];
              const isBookmarked = bookmarkedSections[section.id];

              return (
                <Card key={section.id} className="bg-card border-border overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-md text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-lg text-foreground">{section.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => toggleBookmark(e, section.id)}
                        className={isBookmarked ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground"}
                      >
                        {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <CardContent className="pt-0 pb-4 px-4 sm:px-16">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-muted-foreground leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                      
                      {section.links && section.links.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <h4 className="text-sm font-medium text-foreground mb-2">Related Resources</h4>
                          <div className="flex flex-wrap gap-2">
                            {section.links.map((link, idx) => (
                              <a 
                                key={idx} 
                                href={link.url}
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-primary/5 px-2 py-1 rounded-md"
                                onClick={(e) => {
                                  e.preventDefault();
                                  toast({ title: "Feature coming soon", description: "External links are disabled in demo." });
                                }}
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
