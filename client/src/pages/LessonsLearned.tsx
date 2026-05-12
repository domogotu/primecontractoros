import { useState } from "react";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Lightbulb, ThumbsUp, ThumbsDown, BookOpen } from "lucide-react";

const mockLessons = [
  { id: 1, title: "Early subcontractor engagement improves proposal quality", category: "proposal", type: "success", contract: "IT Services", description: "Engaging subcontractors during the proposal phase led to more accurate cost estimates and stronger technical approaches.", impact: "high", date: "2026-04-10" },
  { id: 2, title: "CMMC compliance timeline underestimated", category: "compliance", type: "challenge", contract: "IT Services", description: "Initial estimate of 3 months for CMMC Level 2 compliance was insufficient. Actual timeline was 6 months due to documentation requirements.", impact: "high", date: "2026-03-15" },
  { id: 3, title: "Automated invoice tracking reduced payment delays", category: "finance", type: "success", contract: "Engineering Support", description: "Implementing automated invoice tracking reduced average payment cycle from 45 to 28 days.", impact: "medium", date: "2026-02-20" },
  { id: 4, title: "Key personnel changes require earlier notification", category: "personnel", type: "challenge", contract: "Engineering Support", description: "Late notification of key personnel departure caused 2-week gap in project management coverage.", impact: "medium", date: "2026-01-30" },
  { id: 5, title: "Weekly status calls prevent scope creep", category: "operations", type: "success", contract: "IT Services", description: "Regular weekly calls with the COR helped identify and address scope creep before it became a formal change order.", impact: "medium", date: "2026-01-15" },
];

export default function LessonsLearned() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const filtered = mockLessons.filter((l) => {
    const matchesSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || l.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageGuide
        title="Lessons Learned"
        description="Capture and review lessons from past and current contracts to improve future performance."
        whenToUse="Use during contract closeout, after significant milestones, or when reviewing past performance for new proposals."
        whatToDoNext={[
          "Document lessons from recently completed contracts",
          "Review past lessons when starting new proposals",
          "Share relevant lessons with team members",
          "Tag lessons by category for easy retrieval",
        ]}
        relatedRecords={[
          { label: "Closeout", path: "/app/closeout" },
          { label: "Contracts", path: "/app/contracts" },
          { label: "Proposals", path: "/app/proposals" },
          { label: "Reports", path: "/app/reports" },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lessons Learned</h1>
          <p className="text-sm text-slate-500 mt-1">{mockLessons.length} lessons documented</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <Input placeholder="Lesson title..." />
            <Textarea placeholder="Describe the lesson, what happened, and what should be done differently..." className="min-h-[100px]" />
            <div className="flex gap-3">
              <Select defaultValue="success">
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="challenge">Challenge</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="operations">
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="personnel">Personnel</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Lesson</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search lessons..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="success">Successes</SelectItem>
            <SelectItem value="challenge">Challenges</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((lesson) => (
          <Card key={lesson.id} className={"border-l-4 " + (lesson.type === "success" ? "border-l-green-500" : "border-l-amber-500")}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {lesson.type === "success" ? (
                  <ThumbsUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <ThumbsDown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge className={lesson.type === "success" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                      {lesson.type}
                    </Badge>
                    <Badge variant="outline" className="capitalize">{lesson.category}</Badge>
                    <Badge variant="outline" className={"text-xs " + (lesson.impact === "high" ? "border-red-300 text-red-700" : "border-slate-300 text-slate-600")}>
                      {lesson.impact} impact
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mt-1">{lesson.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{lesson.description}</p>
                  <p className="text-xs text-slate-400 mt-2">{lesson.contract} | {lesson.date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
