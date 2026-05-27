import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  Search, FileText, Briefcase, FolderOpen, Users, Receipt,
  CheckSquare, ExternalLink, Download, Link2, Plus, Loader2,
  Sparkles, Globe, Database
} from "lucide-react";

interface SmartSearchBarProps {
  open: boolean;
  onClose: () => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  opportunity: <Briefcase className="h-4 w-4 text-blue-500" />,
  proposal: <FileText className="h-4 w-4 text-purple-500" />,
  contract: <FolderOpen className="h-4 w-4 text-green-500" />,
  file: <FileText className="h-4 w-4 text-gray-500" />,
  contact: <Users className="h-4 w-4 text-orange-500" />,
  invoice: <Receipt className="h-4 w-4 text-emerald-500" />,
  task: <CheckSquare className="h-4 w-4 text-indigo-500" />,
};

const typeRoutes: Record<string, string> = {
  opportunity: "/app/opportunities",
  proposal: "/app/proposals",
  contract: "/app/contracts",
  file: "/app/files",
  contact: "/app/contacts",
  invoice: "/app/invoices",
  task: "/app/tasks",
};

export default function SmartSearchBar({ open, onClose }: SmartSearchBarProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("internal");
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [open]);

  // Local search
  const { data: localResults, isLoading: localLoading } = trpc.search.local.useQuery(
    { query: debouncedQuery, limit: 20 },
    { enabled: debouncedQuery.length >= 2 }
  );

  // External search
  const { data: externalResults, isLoading: externalLoading } = trpc.search.external.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 3 && activeTab === "external" }
  );

  // AI interpretation
  const aiMutation = trpc.search.aiInterpret.useMutation();

  const handleAIInterpret = () => {
    if (debouncedQuery.length >= 3) {
      aiMutation.mutate({ query: debouncedQuery });
    }
  };

  const handleResultClick = (type: string, id: number) => {
    const route = typeRoutes[type];
    if (route) {
      // For types with list-only pages (no detail route), navigate to the list
      const listOnlyTypes = ["task"];
      if (listOnlyTypes.includes(type)) {
        navigate(route);
      } else {
        navigate(`${route}/${id}`);
      }
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search records, SAM.gov, NAICS codes, FAR clauses..."
            className="border-0 shadow-none focus-visible:ring-0 text-base"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Tabs */}
        {debouncedQuery.length >= 2 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="w-full justify-start rounded-none border-b px-4 h-9">
              <TabsTrigger value="internal" className="text-xs gap-1">
                <Database className="h-3 w-3" /> Internal
                {localResults?.results && (
                  <Badge variant="secondary" className="text-[10px] ml-1 h-4 px-1">
                    {localResults.results.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="external" className="text-xs gap-1">
                <Globe className="h-3 w-3" /> SAM.gov & Reference
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs gap-1" onClick={handleAIInterpret}>
                <Sparkles className="h-3 w-3" /> AI Suggestions
              </TabsTrigger>
            </TabsList>

            {/* Internal Results */}
            <TabsContent value="internal" className="max-h-[400px] overflow-y-auto m-0 p-0">
              {localLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {localResults?.results && localResults.results.length === 0 && !localLoading && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No internal records found for "{debouncedQuery}"
                </div>
              )}
              {localResults?.results?.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer border-b border-gray-50"
                  onClick={() => handleResultClick(result.type, result.id)}
                >
                  {typeIcons[result.type] || <FileText className="h-4 w-4" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {result.status && (
                      <Badge variant="outline" className="text-[10px]">{result.status}</Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px]">{result.type}</Badge>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* External Results */}
            <TabsContent value="external" className="max-h-[400px] overflow-y-auto m-0 p-0">
              {externalLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {externalResults?.results?.map((result, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 border-b border-gray-50"
                >
                  <Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    {result.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{result.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge variant="outline" className="text-[10px]">{result.source}</Badge>
                    {result.url && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                        <a href={result.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* AI Suggestions */}
            <TabsContent value="ai" className="max-h-[400px] overflow-y-auto m-0 p-4">
              {aiMutation.isPending && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">AI is interpreting...</span>
                </div>
              )}
              {aiMutation.data && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">AI Interpretation</p>
                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                          {aiMutation.data.interpretation}
                        </p>
                      </div>
                    </div>
                  </div>
                  {aiMutation.data.suggestions && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Suggested Actions</p>
                      {aiMutation.data.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                          <Plus className="h-3 w-3 text-blue-500" />
                          <span className="text-sm">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {!aiMutation.isPending && !aiMutation.data && (
                <div className="text-center py-8">
                  <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click this tab to get AI-powered interpretation of your search
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Empty state */}
        {debouncedQuery.length < 2 && (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Type at least 2 characters to search across all records, SAM.gov, and reference data
            </p>
            <div className="flex justify-center gap-2 mt-3">
              <Badge variant="outline" className="text-[10px]">Records</Badge>
              <Badge variant="outline" className="text-[10px]">SAM.gov</Badge>
              <Badge variant="outline" className="text-[10px]">NAICS</Badge>
              <Badge variant="outline" className="text-[10px]">FAR Clauses</Badge>
              <Badge variant="outline" className="text-[10px]">AI</Badge>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
