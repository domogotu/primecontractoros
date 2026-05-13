import { useState, useMemo } from "react";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, ExternalLink, Star, StarOff } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const farClauses = [
  { id: "52.204-21", title: "Basic Safeguarding of Covered Contractor Information Systems", part: "FAR", category: "cybersecurity", applicability: "All contracts with CUI", summary: "Requires 15 basic safeguarding requirements for covered contractor information systems." },
  { id: "52.219-8", title: "Utilization of Small Business Concerns", part: "FAR", category: "small_business", applicability: "Contracts > $750K", summary: "Requires good faith effort to use small business subcontractors." },
  { id: "52.222-26", title: "Equal Opportunity", part: "FAR", category: "labor", applicability: "Contracts > $10K", summary: "Prohibits discrimination based on race, color, religion, sex, sexual orientation, gender identity, or national origin." },
  { id: "52.222-35", title: "Equal Opportunity for Veterans", part: "FAR", category: "labor", applicability: "Contracts > $150K", summary: "Requires affirmative action to employ and advance qualified veterans." },
  { id: "52.222-36", title: "Equal Opportunity for Workers with Disabilities", part: "FAR", category: "labor", applicability: "Contracts > $15K", summary: "Requires affirmative action for individuals with disabilities." },
  { id: "52.223-6", title: "Drug-Free Workplace", part: "FAR", category: "workplace", applicability: "All contracts", summary: "Requires maintaining a drug-free workplace and employee awareness programs." },
  { id: "52.225-1", title: "Buy American - Supplies", part: "FAR", category: "trade", applicability: "Supply contracts", summary: "Requires delivery of domestic end products unless exceptions apply." },
  { id: "52.232-33", title: "Payment by Electronic Funds Transfer", part: "FAR", category: "payment", applicability: "All contracts", summary: "Requires payment via EFT through the System for Award Management (SAM)." },
  { id: "52.244-6", title: "Subcontracts for Commercial Products and Services", part: "FAR", category: "subcontracting", applicability: "Contracts with subcontracting", summary: "Allows use of commercial terms in subcontracts for commercial items." },
  { id: "252.204-7012", title: "Safeguarding Covered Defense Information and Cyber Incident Reporting", part: "DFARS", category: "cybersecurity", applicability: "DoD contracts with CDI", summary: "Requires NIST SP 800-171 compliance and 72-hour cyber incident reporting." },
  { id: "252.204-7020", title: "NIST SP 800-171 DoD Assessment Requirements", part: "DFARS", category: "cybersecurity", applicability: "DoD contracts requiring NIST 800-171", summary: "Requires NIST SP 800-171 self-assessment or DIBCAC assessment." },
  { id: "252.204-7021", title: "Cybersecurity Maturity Model Certification Requirements", part: "DFARS", category: "cybersecurity", applicability: "DoD contracts (phased rollout)", summary: "Requires CMMC certification at specified level." },
  { id: "252.225-7001", title: "Buy American and Balance of Payments Program", part: "DFARS", category: "trade", applicability: "DoD supply contracts", summary: "DoD implementation of Buy American Act with qualifying country exceptions." },
  { id: "252.227-7013", title: "Rights in Technical Data - Noncommercial Items", part: "DFARS", category: "ip_rights", applicability: "DoD contracts for noncommercial items", summary: "Defines government rights in technical data for noncommercial items." },
  { id: "252.227-7014", title: "Rights in Other Than Commercial Computer Software", part: "DFARS", category: "ip_rights", applicability: "DoD contracts with software", summary: "Defines government rights in noncommercial computer software." },
  { id: "252.232-7003", title: "Electronic Submission of Payment Requests", part: "DFARS", category: "payment", applicability: "DoD contracts", summary: "Requires use of WAWF or equivalent for invoice submission." },
  { id: "252.239-7010", title: "Cloud Computing Services", part: "DFARS", category: "cybersecurity", applicability: "DoD cloud contracts", summary: "Requirements for cloud service providers handling DoD data." },
  { id: "252.242-7005", title: "Contractor Business Systems", part: "DFARS", category: "business_systems", applicability: "CAS-covered contracts", summary: "Defines requirements for six contractor business systems." },
  { id: "252.245-7001", title: "Tagging, Labeling, and Marking of Government-Furnished Property", part: "DFARS", category: "property", applicability: "Contracts with GFP", summary: "Requirements for identification and tracking of government property." },
];

const categories: Record<string, string> = {
  cybersecurity: "Cybersecurity",
  small_business: "Small Business",
  labor: "Labor & Employment",
  workplace: "Workplace",
  trade: "Trade & Buy American",
  payment: "Payment",
  subcontracting: "Subcontracting",
  ip_rights: "IP & Data Rights",
  business_systems: "Business Systems",
  property: "Property",
};

export default function FarReference() {
  const [search, setSearch] = useState("");
  const [partFilter, setPartFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return farClauses.filter((clause) => {
      const matchesSearch = !search ||
        clause.id.toLowerCase().includes(search.toLowerCase()) ||
        clause.title.toLowerCase().includes(search.toLowerCase()) ||
        clause.summary.toLowerCase().includes(search.toLowerCase());
      const matchesPart = partFilter === "all" || clause.part === partFilter;
      const matchesCategory = categoryFilter === "all" || clause.category === categoryFilter;
      return matchesSearch && matchesPart && matchesCategory;
    });
  }, [search, partFilter, categoryFilter]);

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  return (
    <PageLayout
        label="Compliance"
        title="FAR Reference"
        subtitle="Browse and search Federal Acquisition Regulation clauses and provisions."
        summaryCards={[{ label: "Total Clauses", value: filtered.length }, { label: "Bookmarked", value: bookmarked.length, color: "text-amber-600" }]}
      >
      <PageGuide
        title="FAR/DFARS Clause Reference"
        description="Searchable library of Federal Acquisition Regulation and Defense FAR Supplement clauses relevant to your contracts."
        whenToUse="Use this page when reviewing contract clauses, checking compliance requirements, or researching which regulations apply to your work."
        whatToDoNext={[
          "Search for clauses referenced in your contract",
          "Bookmark frequently-used clauses for quick access",
          "Link clauses to your compliance matrix items",
          "Check applicability thresholds for your contract value",
        ]}
        relatedRecords={[
          { label: "Compliance Matrix", path: "/app/compliance" },
          { label: "Requirements", path: "/app/requirements" },
          { label: "Contracts", path: "/app/contracts" },
          { label: "Flowdown Review", path: "/app/flowdown-review" },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">FAR/DFARS Reference</h1>
          <p className="text-sm text-slate-500 mt-1">
            {farClauses.length} clauses indexed | {bookmarked.length} bookmarked
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by clause number, title, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={partFilter} onValueChange={setPartFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Part" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Parts</SelectItem>
            <SelectItem value="FAR">FAR</SelectItem>
            <SelectItem value="DFARS">DFARS</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categories).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Clauses Found</h3>
              <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((clause) => (
            <Card key={clause.id} className="hover:border-blue-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className={clause.part === "DFARS" ? "border-purple-300 text-purple-700" : "border-blue-300 text-blue-700"}>
                        {clause.part} {clause.id}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {categories[clause.category]}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm mt-2">{clause.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{clause.summary}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      <span className="font-medium">Applicability:</span> {clause.applicability}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleBookmark(clause.id)}
                      className="h-8 w-8"
                    >
                      {bookmarked.includes(clause.id) ? (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ) : (
                        <StarOff className="w-4 h-4 text-slate-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(`https://www.acquisition.gov/far/${clause.id}`, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    
      </PageLayout>
  );
}
