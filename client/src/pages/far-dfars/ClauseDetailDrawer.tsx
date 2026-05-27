import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  X, Star, StarOff, ExternalLink, Link2, ClipboardList, ListChecks,
  ArrowRight, Shield, Users, FileText, AlertTriangle, BookOpen, Clock,
  CheckCircle, Info
} from "lucide-react";
import { CLAUSE_CATEGORIES } from "@/data/farDfarsStarterClauses";
import { trpc } from "@/lib/trpc";

interface ClauseDetailDrawerProps {
  clause: any;
  isBookmarked: boolean;
  onClose: () => void;
  onBookmark: () => void;
  onLinkToContract: () => void;
  onCreateTask: () => void;
  onCreateCompliance: () => void;
  onStartFlowdown: () => void;
}

export default function ClauseDetailDrawer({
  clause, isBookmarked, onClose, onBookmark,
  onLinkToContract, onCreateTask, onCreateCompliance, onStartFlowdown
}: ClauseDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "links" | "notes" | "history">("overview");
  
  const linksQuery = trpc.farDfars.listClauseLinks.useQuery(
    { clauseId: clause.id },
    { retry: false, refetchOnWindowFocus: false }
  );
  const notesQuery = trpc.farDfars.listNotes.useQuery(
    { clauseId: clause.id },
    { retry: false, refetchOnWindowFocus: false }
  );
  const eventsQuery = trpc.farDfars.listReviewEvents.useQuery(
    { clauseId: clause.id },
    { retry: false, refetchOnWindowFocus: false }
  );

  const tags = (clause.tags || "").split(",").filter(Boolean).map((t: string) => t.trim());

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b z-10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className={clause.sourceType === "DFARS" ? "border-purple-300 text-purple-700" : "border-blue-300 text-blue-700"}>
                  {clause.sourceType} {clause.clauseNumber}
                </Badge>
                {clause.category && CLAUSE_CATEGORIES[clause.category] && (
                  <Badge variant="outline" className={`text-xs ${CLAUSE_CATEGORIES[clause.category].color}`}>
                    {clause.category}
                  </Badge>
                )}
                {clause.isCustom && (
                  <Badge variant="outline" className="text-xs border-green-200 text-green-600">Custom</Badge>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900">{clause.title}</h2>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={onBookmark} title={isBookmarked ? "Remove bookmark" : "Bookmark"}>
                {isBookmarked ? <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> : <StarOff className="w-5 h-5 text-slate-400" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-3">
            {(["overview", "links", "notes", "history"] as const).map(tab => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                size="sm"
                className="text-xs capitalize"
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {activeTab === "overview" && (
            <>
              {/* Watch badges */}
              <div className="flex flex-wrap gap-1.5">
                {clause.flowdownWatch && <Badge className="bg-purple-100 text-purple-700 border-purple-200">Flowdown Watch</Badge>}
                {clause.cybersecurityWatch && <Badge className="bg-red-100 text-red-700 border-red-200">Cybersecurity</Badge>}
                {clause.smallBusinessWatch && <Badge className="bg-blue-100 text-blue-700 border-blue-200">Small Business</Badge>}
                {clause.paymentWatch && <Badge className="bg-amber-100 text-amber-700 border-amber-200">Payment</Badge>}
                {clause.subcontractingWatch && <Badge className="bg-purple-100 text-purple-700 border-purple-200">Subcontracting</Badge>}
                {clause.laborWatch && <Badge className="bg-orange-100 text-orange-700 border-orange-200">Labor</Badge>}
                {clause.closeoutWatch && <Badge className="bg-gray-100 text-gray-700 border-gray-200">Closeout</Badge>}
              </div>

              {/* Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" /> Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">{clause.summary}</p>
                </CardContent>
              </Card>

              {/* Plain Language */}
              {clause.plainLanguageMeaning && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Info className="w-4 h-4 text-green-600" /> Plain Language Meaning
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700">{clause.plainLanguageMeaning}</p>
                  </CardContent>
                </Card>
              )}

              {/* Why It Matters */}
              {clause.whyItMatters && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Why It Matters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700">{clause.whyItMatters}</p>
                  </CardContent>
                </Card>
              )}

              {/* Applicability */}
              {clause.applicabilityNote && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" /> Applicability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700">{clause.applicabilityNote}</p>
                  </CardContent>
                </Card>
              )}

              {/* Common Records Affected */}
              {clause.commonRecordsAffected && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" /> Common Records Affected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {clause.commonRecordsAffected.split(",").map((record: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{record.trim()}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Official Source */}
              {clause.officialSourceUrl && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Official Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={clause.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> {clause.officialSourceUrl}
                    </a>
                  </CardContent>
                </Card>
              )}

              {/* Reference Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700">
                  <strong>Reference Notice:</strong> This is a reference summary only. Clause applicability must be confirmed against the actual awarded contract, modifications, and contracting officer direction.
                </p>
              </div>

              {/* Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={onLinkToContract} className="justify-start">
                      <Link2 className="w-4 h-4 mr-2" /> Link to Contract
                    </Button>
                    <Button variant="outline" size="sm" onClick={onCreateCompliance} className="justify-start">
                      <ClipboardList className="w-4 h-4 mr-2" /> Create Compliance Item
                    </Button>
                    <Button variant="outline" size="sm" onClick={onCreateTask} className="justify-start">
                      <ListChecks className="w-4 h-4 mr-2" /> Create Task
                    </Button>
                    <Button variant="outline" size="sm" onClick={onStartFlowdown} className="justify-start">
                      <ArrowRight className="w-4 h-4 mr-2" /> Start Flowdown Review
                    </Button>
                    {clause.officialSourceUrl && (
                      <Button variant="outline" size="sm" onClick={() => window.open(clause.officialSourceUrl, "_blank")} className="justify-start">
                        <ExternalLink className="w-4 h-4 mr-2" /> View Official Source
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "links" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Linked Records</CardTitle>
              </CardHeader>
              <CardContent>
                {linksQuery.data && linksQuery.data.length > 0 ? (
                  <div className="space-y-2">
                    {linksQuery.data.map((link: any) => (
                      <div key={link.id} className="border rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs capitalize">{link.linkedRecordType}</Badge>
                          <Badge variant="outline" className="text-xs">{link.reviewStatus || "pending"}</Badge>
                          {link.relevanceStatus && (
                            <Badge variant="outline" className="text-xs">{link.relevanceStatus}</Badge>
                          )}
                        </div>
                        {link.note && <p className="text-xs text-slate-600 mt-1">{link.note}</p>}
                        <p className="text-xs text-slate-400 mt-1">Created: {new Date(link.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Link2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No linked records yet</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={onLinkToContract}>
                      <Link2 className="w-3 h-3 mr-1" /> Link to Contract
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "notes" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {notesQuery.data && notesQuery.data.length > 0 ? (
                  <div className="space-y-2">
                    {notesQuery.data.map((note: any) => (
                      <div key={note.id} className="border rounded-lg p-3 text-sm">
                        <Badge variant="outline" className="text-xs capitalize mb-1">{note.noteType}</Badge>
                        <p className="text-sm text-slate-700">{note.noteText}</p>
                        <p className="text-xs text-slate-400 mt-1">Created: {new Date(note.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No notes yet</p>
                    <p className="text-xs text-slate-400 mt-1">Notes can be added through the flowdown review or compliance item workflows.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "history" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Review History</CardTitle>
              </CardHeader>
              <CardContent>
                {eventsQuery.data && eventsQuery.data.length > 0 ? (
                  <div className="space-y-2">
                    {eventsQuery.data.map((event: any) => (
                      <div key={event.id} className="border rounded-lg p-3 text-sm flex items-start gap-3">
                        <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-slate-700 capitalize">{event.action?.replace(/_/g, " ")}</p>
                          {event.newStatus && <Badge variant="outline" className="text-xs mt-1">{event.newStatus}</Badge>}
                          <p className="text-xs text-slate-400 mt-1">{new Date(event.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No review history yet</p>
                    <p className="text-xs text-slate-400 mt-1">Actions taken on this clause will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
