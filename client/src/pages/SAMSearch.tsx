import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Globe, ExternalLink, Plus, Calendar, DollarSign, Building2, Loader2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { toast } from "sonner";

export default function SAMSearch() {
  const [keyword, setKeyword] = useState("");
  const [naics, setNaics] = useState("");
  const [setAside, setSetAside] = useState("");
  const [postedFrom, setPostedFrom] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [queryParams, setQueryParams] = useState<any>(null);
  const searchQuery = trpc.sam.searchOpportunities.useQuery(queryParams, {
    enabled: !!queryParams,
    retry: false,
  });

  // Handle search results
  if (searchQuery.data && searching) {
    setResults((searchQuery.data as any)?.opportunitiesData || (searchQuery.data as any)?.opportunities || []);
    setSearching(false);
    setHasSearched(true);
    const count = ((searchQuery.data as any)?.opportunitiesData || (searchQuery.data as any)?.opportunities || []).length;
    if (count === 0) toast.info("No opportunities found matching your criteria");
    else toast.success(`Found ${count} opportunities`);
  }
  if (searchQuery.error && searching) {
    setSearching(false);
    setHasSearched(true);
    toast.error(searchQuery.error.message || "Search failed");
  }

  const importMutation = trpc.sam.importOpportunity.useMutation({
    onSuccess: () => {
      toast.success("Opportunity imported to your pipeline!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Import failed");
    },
  });

  const handleSearch = () => {
    if (!keyword.trim()) { toast.error("Enter a keyword to search"); return; }
    setSearching(true);
    setResults([]);
    setQueryParams({
      keyword: keyword.trim(),
      naicsCode: naics || undefined,
      setAside: setAside === "all" ? undefined : setAside || undefined,
      postedFrom: postedFrom || undefined,
      limit: 25,
    });
  };

  const handleImport = (opp: any) => {
    importMutation.mutate({
      noticeId: opp.noticeId || opp.solicitationNumber || "unknown",
      title: opp.title,
      agency: opp.department || opp.subtier || "",
      solicitationNumber: opp.solicitationNumber || "",
      naicsCode: opp.naicsCode || "",
      setAside: opp.typeOfSetAside || "",
      responseDeadline: opp.responseDeadLine || undefined,
      sourceLink: opp.uiLink || "",
      description: opp.description?.substring(0, 500) || "",
      type: opp.type || "solicitation",
    });
  };

  return (
    <PageLayout
      title="SAM.gov Opportunity Search"
      subtitle="Search federal contracting opportunities from SAM.gov and import them to your pipeline"
      label="Workflow"
      summaryCards={[
        { label: "Results", value: results.length },
        { label: "Active Search", value: hasSearched ? "Yes" : "No" },
      ]}
    >
      {/* Search Form */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-blue-600" />
            Search SAM.gov Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Keyword *</Label>
              <Input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g., IT services, cybersecurity, construction" onKeyDown={e => e.key === "Enter" && handleSearch()} />
            </div>
            <div>
              <Label>NAICS Code</Label>
              <Input value={naics} onChange={e => setNaics(e.target.value)} placeholder="e.g., 541512" />
            </div>
            <div>
              <Label>Set-Aside</Label>
              <Select value={setAside} onValueChange={setSetAside}>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="SBA">Small Business (SBA)</SelectItem>
                  <SelectItem value="SBP">Small Business Set-Aside</SelectItem>
                  <SelectItem value="8A">8(a)</SelectItem>
                  <SelectItem value="HZC">HUBZone</SelectItem>
                  <SelectItem value="SDVOSBC">SDVOSB</SelectItem>
                  <SelectItem value="WOSB">WOSB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Posted After</Label>
              <Input type="date" value={postedFrom} onChange={e => setPostedFrom(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSearch} disabled={searching} className="bg-blue-600 hover:bg-blue-700">
            {searching ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...</> : <><Search className="w-4 h-4 mr-2" /> Search SAM.gov</>}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-3 mt-4">
          {results.length === 0 ? (
            <Card className="p-8 text-center">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No opportunities found. Try different search terms or broader criteria.</p>
            </Card>
          ) : (
            results.map((opp: any, idx: number) => (
              <Card key={idx} className="bg-white border border-gray-200 hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">{opp.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {opp.department && <Badge variant="outline" className="text-xs"><Building2 className="w-3 h-3 mr-1" />{opp.department}</Badge>}
                        {opp.naicsCode && <Badge variant="secondary" className="text-xs">NAICS: {opp.naicsCode}</Badge>}
                        {opp.typeOfSetAside && <Badge className="text-xs bg-purple-100 text-purple-800">{opp.typeOfSetAside}</Badge>}
                        {opp.type && <Badge variant="outline" className="text-xs">{opp.type}</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {opp.solicitationNumber && <span>Sol#: {opp.solicitationNumber}</span>}
                        {opp.responseDeadLine && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due: {new Date(opp.responseDeadLine).toLocaleDateString()}</span>}
                        {opp.postedDate && <span>Posted: {new Date(opp.postedDate).toLocaleDateString()}</span>}
                      </div>
                      {opp.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{opp.description}</p>}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button size="sm" onClick={() => handleImport(opp)} disabled={importMutation.isPending}>
                        <Plus className="w-3 h-3 mr-1" /> Import
                      </Button>
                      {opp.uiLink && (
                        <a href={opp.uiLink} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="w-full">
                            <ExternalLink className="w-3 h-3 mr-1" /> View
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </PageLayout>
  );
}
