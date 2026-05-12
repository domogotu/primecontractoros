import { useState, useMemo } from "react";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, MessageSquare, Mail, Phone, Video, FileText } from "lucide-react";

const channelIcons: Record<string, typeof Mail> = {
  email: Mail,
  phone: Phone,
  meeting: Video,
  letter: FileText,
  message: MessageSquare,
};

const mockMessages = [
  { id: 1, subject: "RE: Monthly Status Report - April 2026", channel: "email", direction: "outgoing", contact: "James Wilson (COR)", contract: "IT Services", date: "2026-05-12T14:30:00", summary: "Submitted April status report. COR acknowledged receipt and noted no issues." },
  { id: 2, subject: "Option Year Exercise Discussion", channel: "meeting", direction: "incoming", contact: "Sarah Chen (CO)", contract: "Engineering Support", date: "2026-05-11T10:00:00", summary: "Discussed option year exercise. CO indicated intent to exercise. Formal notification expected by May 25." },
  { id: 3, subject: "Subcontractor Performance Concern", channel: "email", direction: "outgoing", contact: "Mike Torres (PM - ABC Corp)", contract: "IT Services", date: "2026-05-10T09:15:00", summary: "Raised concern about late deliverable from ABC Corp. Requested corrective action plan by May 15." },
  { id: 4, subject: "CMMC Assessment Scheduling", channel: "phone", direction: "incoming", contact: "Lisa Park (DIBCAC)", contract: "IT Services", date: "2026-05-09T11:00:00", summary: "DIBCAC assessor called to schedule Level 2 assessment. Tentatively set for June 15-17." },
  { id: 5, subject: "Invoice Dispute Resolution", channel: "email", direction: "incoming", contact: "Robert Kim (DFAS)", contract: "Engineering Support", date: "2026-05-08T16:45:00", summary: "DFAS flagged line item discrepancy on Invoice #INV-2026-003. Requested supporting documentation." },
  { id: 6, subject: "Quarterly Program Review Agenda", channel: "email", direction: "outgoing", contact: "James Wilson (COR)", contract: "IT Services", date: "2026-05-07T08:30:00", summary: "Sent proposed agenda for Q2 program review. Includes contract performance, staffing update, and risk register." },
];

export default function CommunicationLog() {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    return mockMessages.filter((m) => {
      const matchesSearch = !search || m.subject.toLowerCase().includes(search.toLowerCase()) || m.summary.toLowerCase().includes(search.toLowerCase()) || m.contact.toLowerCase().includes(search.toLowerCase());
      const matchesChannel = channelFilter === "all" || m.channel === channelFilter;
      const matchesDirection = directionFilter === "all" || m.direction === directionFilter;
      return matchesSearch && matchesChannel && matchesDirection;
    });
  }, [search, channelFilter, directionFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageGuide
        title="Communication Log"
        description="Record and track all contract-related communications with government contacts, subcontractors, and stakeholders."
        whenToUse="Log every significant communication for audit trail and institutional memory. Essential for contract disputes and performance reviews."
        whatToDoNext={[
          "Log recent communications with government contacts",
          "Review communication history before meetings",
          "Link communications to relevant contract actions",
          "Export communication log for audit purposes",
        ]}
        relatedRecords={[
          { label: "Contacts", path: "/app/contacts" },
          { label: "Contracts", path: "/app/contracts" },
          { label: "Change Management", path: "/app/change-management" },
          { label: "Alerts & Tasks", path: "/app/alerts" },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Communication Log</h1>
          <p className="text-sm text-slate-500 mt-1">{mockMessages.length} communications recorded</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Log Communication
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <Input placeholder="Subject..." />
            <div className="flex gap-3">
              <Input placeholder="Contact name and role..." className="flex-1" />
              <Select defaultValue="email">
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="outgoing">
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="outgoing">Outgoing</SelectItem>
                  <SelectItem value="incoming">Incoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea placeholder="Summary of the communication..." className="min-h-[80px]" />
            <div className="flex gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search communications..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Channel" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="letter">Letter</SelectItem>
          </SelectContent>
        </Select>
        <Select value={directionFilter} onValueChange={setDirectionFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Direction" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="incoming">Incoming</SelectItem>
            <SelectItem value="outgoing">Outgoing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((msg) => {
          const Icon = channelIcons[msg.channel] || MessageSquare;
          return (
            <Card key={msg.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={"p-2 rounded-lg flex-shrink-0 " + (msg.direction === "outgoing" ? "bg-blue-100" : "bg-green-100")}>
                    <Icon className={"w-4 h-4 " + (msg.direction === "outgoing" ? "text-blue-600" : "text-green-600")} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className="capitalize text-xs">{msg.channel}</Badge>
                      <Badge className={msg.direction === "outgoing" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>
                        {msg.direction}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm">{msg.subject}</h3>
                    <p className="text-sm text-slate-600 mt-1">{msg.summary}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {msg.contact} | {msg.contract} | {new Date(msg.date).toLocaleDateString()} {new Date(msg.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
