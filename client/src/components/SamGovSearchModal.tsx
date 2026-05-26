import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Search, Loader2, ExternalLink, Download, ChevronLeft, ChevronRight } from "lucide-react";

interface SamGovSearchModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (opportunity: Record<string, unknown>) => void;
}

export default function SamGovSearchModal({ open, onClose, onImport }: SamGovSearchModalProps) {
  const [keyword, setKeyword] = useState("");
  const [naicsCode, setNaicsCode] = useState("");
  const [setAside, setSetAside] = useState("");
  const [status, setStatus] = useState("active");
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const { data: results, isLoading, refetch } = trpc.sam.searchOpportunities.useQuery(
    {
      keyword: keyword || undefined,
      naicsCode: naicsCode || undefined,
      setAside: setAside || undefined,
      status: status || undefined,
      limit,
      offset,
    },
    { enabled: false }
  );

  const handleSearch = () => {
    setOffset(0);
    refetch();
  };

  const handleNextPage = () => {
    setOffset(prev => prev + limit);
    setTimeout(() => refetch(), 0);
  };

  const handlePrevPage = () => {
    setOffset(prev => Math.max(0, prev - limit));
    setTimeout(() => refetch(), 0);
  };

  const handleImport = (opp: Record<string, unknown>) => {
    onImport({
      title: opp.title || opp.solicitationNumber || "Imported Opportunity",
      agency: opp.department || opp.agency || opp.fullParentPathName,
      solicitation: opp.solicitationNumber,
      naics: opp.naicsCode,
      setAside: opp.typeOfSetAside || opp.typeOfSetAsideDescription,
      dueDate: opp.responseDeadLine || opp.archiveDate,
      type: opp.type || opp.baseType,
      sourceLink: opp.uiLink || `https://sam.gov/opp/${opp.noticeId}`,
      summary: opp.description,
      noticeId: opp.noticeId,
    });
  };

  const opportunities = (results as any)?.opportunitiesData || (results as any)?.data || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SAM.gov Opportunity Search
          </DialogTitle>
        </DialogHeader>

        {/* Search Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="col-span-2">
            <Label className="text-xs">Keyword</Label>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search keywords..."
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div>
            <Label className="text-xs">NAICS Code</Label>
            <Input
              value={naicsCode}
              onChange={(e) => setNaicsCode(e.target.value)}
              placeholder="e.g., 541512"
            />
          </div>
          <div>
            <Label className="text-xs">Set-Aside</Label>
            <Select value={setAside} onValueChange={setSetAside}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="SBA">Small Business</SelectItem>
                <SelectItem value="8A">8(a)</SelectItem>
                <SelectItem value="HZC">HUBZone</SelectItem>
                <SelectItem value="SDVOSBC">SDVOSB</SelectItem>
                <SelectItem value="WOSB">WOSB</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Search SAM.gov
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-3 mt-4">
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Searching SAM.gov...</p>
            </div>
          )}

          {!isLoading && Array.isArray(opportunities) && opportunities.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No results found. Try different search terms.</p>
            </div>
          )}

          {Array.isArray(opportunities) && opportunities.map((opp: any, idx: number) => (
            <Card key={idx} className="hover:border-blue-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">{opp.title || opp.solicitationNumber}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {opp.department && (
                        <Badge variant="outline" className="text-[10px]">{opp.department}</Badge>
                      )}
                      {opp.naicsCode && (
                        <Badge variant="secondary" className="text-[10px]">NAICS: {opp.naicsCode}</Badge>
                      )}
                      {opp.typeOfSetAsideDescription && (
                        <Badge className="text-[10px] bg-green-100 text-green-800">{opp.typeOfSetAsideDescription}</Badge>
                      )}
                      {opp.responseDeadLine && (
                        <Badge variant="outline" className="text-[10px]">Due: {new Date(opp.responseDeadLine).toLocaleDateString()}</Badge>
                      )}
                    </div>
                    {opp.solicitationNumber && (
                      <p className="text-xs text-muted-foreground mt-1">Sol: {opp.solicitationNumber}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {opp.uiLink && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={opp.uiLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button size="sm" onClick={() => handleImport(opp)}>
                      <Download className="h-4 w-4 mr-1" /> Import
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {Array.isArray(opportunities) && opportunities.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={offset === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Showing {offset + 1} - {offset + opportunities.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={opportunities.length < limit}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
