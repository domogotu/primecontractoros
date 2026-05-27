import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X, Send, AlertTriangle, Loader2 } from "lucide-react";

interface AIClausePanelProps {
  selectedClause: any | null;
  onClose: () => void;
}

export default function AIClausePanel({ selectedClause, onClose }: AIClausePanelProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    const userMessage = query.trim();
    setQuery("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    // AI integration placeholder - uses the existing AI infrastructure
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a FAR/DFARS clause research assistant for PrimeContractorOS. Help users understand federal acquisition regulation clauses, their applicability, compliance requirements, and practical implications. Always note that your responses are for reference only and do not replace legal counsel or contracting officer direction.${selectedClause ? `\n\nCurrently selected clause: ${selectedClause.sourceType} ${selectedClause.clauseNumber} - ${selectedClause.title}\nSummary: ${selectedClause.summary}\nApplicability: ${selectedClause.applicabilityNote}` : ""}`
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.content || data.message || "I can help you research FAR/DFARS clauses. Please note that this is for reference only and does not replace legal counsel." }]);
      } else {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "AI Clause Assistance is available when the AI integration is configured. In the meantime, you can:\n\n• Search the clause library by number, title, or keyword\n• Review clause details including plain language meaning and applicability\n• Link clauses to contracts and create compliance items\n• Start flowdown reviews for subcontractor-relevant clauses\n\nFor specific clause interpretation, consult your contracting officer or legal counsel."
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "AI Clause Assistance is available when the AI integration is configured. In the meantime, you can use the search and filter tools to find relevant clauses, review their details, and create linked compliance items or tasks.\n\nFor specific clause interpretation questions, consult your contracting officer or legal counsel."
      }]);
    }
    setLoading(false);
  };

  return (
    <Card className="mb-4 border-purple-200 bg-purple-50/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            AI Clause Assistance
            <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">Beta</Badge>
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              AI responses are for reference only. Always verify against the actual contract, modifications, and contracting officer direction.
            </p>
          </div>
        </div>

        {/* Selected clause context */}
        {selectedClause && (
          <div className="bg-white border rounded-lg p-2 mb-3">
            <p className="text-xs text-slate-500">Context:</p>
            <p className="text-xs font-medium text-slate-700">
              {selectedClause.sourceType} {selectedClause.clauseNumber} — {selectedClause.title}
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`rounded-lg p-2 text-xs ${msg.role === "user" ? "bg-blue-50 border border-blue-100 ml-8" : "bg-white border mr-8"}`}>
                <p className="text-xs font-medium text-slate-500 mb-0.5">{msg.role === "user" ? "You" : "AI Assistant"}</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {loading && (
              <div className="bg-white border rounded-lg p-2 mr-8">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={selectedClause
              ? `Ask about ${selectedClause.sourceType} ${selectedClause.clauseNumber}...`
              : "Ask about FAR/DFARS clauses, applicability, compliance..."
            }
            className="text-sm"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
          />
          <Button size="sm" onClick={handleAsk} disabled={!query.trim() || loading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick prompts */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[
              "What clauses require flowdown to subcontractors?",
              "Explain CMMC requirements",
              "What are common cybersecurity clauses?",
              "When is a subcontracting plan required?",
            ].map((prompt, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs h-6"
                onClick={() => { setQuery(prompt); }}
              >
                {prompt}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
