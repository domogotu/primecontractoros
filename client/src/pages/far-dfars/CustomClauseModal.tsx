import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { CLAUSE_CATEGORIES } from "@/data/farDfarsStarterClauses";

interface CustomClauseModalProps {
  onClose: () => void;
}

export default function CustomClauseModal({ onClose }: CustomClauseModalProps) {
  const [clauseNumber, setClauseNumber] = useState("");
  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState("FAR");
  const [farPart, setFarPart] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [plainLanguageMeaning, setPlainLanguageMeaning] = useState("");
  const [whyItMatters, setWhyItMatters] = useState("");
  const [applicabilityNote, setApplicabilityNote] = useState("");
  const [officialSourceUrl, setOfficialSourceUrl] = useState("");
  const [tags, setTags] = useState("");
  const [flowdownWatch, setFlowdownWatch] = useState(false);
  const [cybersecurityWatch, setCybersecurityWatch] = useState(false);
  const [smallBusinessWatch, setSmallBusinessWatch] = useState(false);
  const [paymentWatch, setPaymentWatch] = useState(false);
  const [subcontractingWatch, setSubcontractingWatch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const createMutation = trpc.farDfars.createCustomClause.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    },
    onError: () => {
      setSaving(false);
    }
  });

  const handleSubmit = () => {
    if (!clauseNumber.trim() || !title.trim()) return;
    setSaving(true);
    createMutation.mutate({
      clauseNumber: clauseNumber.trim(),
      title: title.trim(),
      sourceType,
      farPart: farPart || undefined,
      category: category || undefined,
      summary: summary || undefined,
      plainLanguageMeaning: plainLanguageMeaning || undefined,
      whyItMatters: whyItMatters || undefined,
      applicabilityNote: applicabilityNote || undefined,
      officialSourceUrl: officialSourceUrl || undefined,
      tags: tags || undefined,
      flowdownWatch,
      cybersecurityWatch,
      smallBusinessWatch,
      paymentWatch,
      subcontractingWatch,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" /> Add Custom Clause Reference
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Add a custom clause, agency supplement, or internal reference to your library.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-green-700">Custom Clause Added</p>
              <p className="text-xs text-slate-500 mt-1">Your custom clause reference has been added to the library.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Required fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Clause Number *</Label>
                  <Input
                    value={clauseNumber}
                    onChange={(e) => setClauseNumber(e.target.value)}
                    className="mt-1"
                    placeholder="e.g., 52.204-99 or AGENCY-001"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Source Type</Label>
                  <Select value={sourceType} onValueChange={setSourceType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FAR">FAR</SelectItem>
                      <SelectItem value="DFARS">DFARS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                  placeholder="Clause title..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">FAR Part</Label>
                  <Input
                    value={farPart}
                    onChange={(e) => setFarPart(e.target.value)}
                    className="mt-1"
                    placeholder="e.g., Part 4"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(CLAUSE_CATEGORIES).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Summary</Label>
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="mt-1"
                  rows={2}
                  placeholder="Brief summary of the clause requirement..."
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Plain Language Meaning</Label>
                <Textarea
                  value={plainLanguageMeaning}
                  onChange={(e) => setPlainLanguageMeaning(e.target.value)}
                  className="mt-1"
                  rows={2}
                  placeholder="What this means in plain language..."
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Why It Matters</Label>
                <Textarea
                  value={whyItMatters}
                  onChange={(e) => setWhyItMatters(e.target.value)}
                  className="mt-1"
                  rows={2}
                  placeholder="Why this clause matters for your organization..."
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Applicability Note</Label>
                <Textarea
                  value={applicabilityNote}
                  onChange={(e) => setApplicabilityNote(e.target.value)}
                  className="mt-1"
                  rows={2}
                  placeholder="When this clause typically applies..."
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Official Source URL</Label>
                <Input
                  value={officialSourceUrl}
                  onChange={(e) => setOfficialSourceUrl(e.target.value)}
                  className="mt-1"
                  placeholder="https://www.acquisition.gov/far/..."
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Tags (comma-separated)</Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="mt-1"
                  placeholder="e.g., cybersecurity, reporting, compliance"
                />
              </div>

              {/* Watch flags */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Watch Flags</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="flow" checked={flowdownWatch} onCheckedChange={(c) => setFlowdownWatch(!!c)} />
                    <label htmlFor="flow" className="text-sm">Flowdown Watch</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="cyber" checked={cybersecurityWatch} onCheckedChange={(c) => setCybersecurityWatch(!!c)} />
                    <label htmlFor="cyber" className="text-sm">Cybersecurity</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="sb" checked={smallBusinessWatch} onCheckedChange={(c) => setSmallBusinessWatch(!!c)} />
                    <label htmlFor="sb" className="text-sm">Small Business</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="pay" checked={paymentWatch} onCheckedChange={(c) => setPaymentWatch(!!c)} />
                    <label htmlFor="pay" className="text-sm">Payment</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="sub" checked={subcontractingWatch} onCheckedChange={(c) => setSubcontractingWatch(!!c)} />
                    <label htmlFor="sub" className="text-sm">Subcontracting</label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={saving || !clauseNumber.trim() || !title.trim()}>
                  {saving ? "Adding..." : "Add Custom Clause"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
