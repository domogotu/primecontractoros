import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Plus, MessageSquare, Clock, CheckCircle2, AlertCircle,
  Send, Loader2, Search, Filter, LifeBuoy,
} from "lucide-react";

const priorityOptions = [
  { value: "low", label: "Low", color: "text-slate-400" },
  { value: "medium", label: "Medium", color: "text-blue-400" },
  { value: "high", label: "High", color: "text-amber-400" },
  { value: "critical", label: "Critical", color: "text-red-400" },
];

const categoryOptions = [
  { value: "general", label: "General Question" },
  { value: "billing", label: "Billing & Subscription" },
  { value: "technical", label: "Technical Issue" },
  { value: "feature", label: "Feature Request" },
  { value: "bug", label: "Bug Report" },
  { value: "access", label: "Access & Permissions" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "open":
      return <Badge className="bg-amber-900/30 text-amber-300 border-amber-700">Open</Badge>;
    case "in_progress":
      return <Badge className="bg-blue-900/30 text-blue-300 border-blue-700">In Progress</Badge>;
    case "waiting_on_customer":
      return <Badge className="bg-purple-900/30 text-purple-300 border-purple-700">Awaiting Your Reply</Badge>;
    case "resolved":
      return <Badge className="bg-green-900/30 text-green-300 border-green-700">Resolved</Badge>;
    case "closed":
      return <Badge className="bg-slate-700/50 text-slate-400 border-slate-600">Closed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "critical":
      return <Badge variant="destructive">Critical</Badge>;
    case "high":
      return <Badge className="bg-amber-900/30 text-amber-300 border-amber-700">High</Badge>;
    case "medium":
      return <Badge className="bg-blue-900/30 text-blue-300 border-blue-700">Medium</Badge>;
    case "low":
      return <Badge className="bg-slate-700/50 text-slate-400 border-slate-600">Low</Badge>;
    default:
      return <Badge variant="secondary">{priority}</Badge>;
  }
}

export default function CustomerSupport() {
  const [, navigate] = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Form state
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("general");

  const ticketsQuery = trpc.customerSupport.list.useQuery();
  const createMutation = trpc.customerSupport.create.useMutation({
    onSuccess: (data) => {
      toast.success("Support ticket created successfully.");
      setShowCreate(false);
      setSubject("");
      setBody("");
      setPriority("medium");
      setCategory("general");
      ticketsQuery.refetch();
      if (data?.ticketId) {
        navigate(`/app/support/${data.ticketId}`);
      }
    },
    onError: (err) => toast.error(err.message || "Failed to create ticket"),
  });

  const tickets = ticketsQuery.data || [];
  const filtered = tickets.filter((t: any) => {
    const matchesSearch =
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.body?.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    return matchesSearch && t.status === filter;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      toast.error("Please fill in subject and message.");
      return;
    }
    createMutation.mutate({
      subject: subject.trim(),
      body: body.trim(),
      priority: priority as any,
      category,
    });
  };

  if (ticketsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-blue-400" />
            Support
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Submit and track your support requests
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> New Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <Card className="bg-slate-800 border-slate-700 p-3 text-center">
          <p className="text-xs text-slate-400">Total</p>
          <p className="text-lg font-bold text-white">{tickets.length}</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-3 text-center">
          <p className="text-xs text-slate-400">Open</p>
          <p className="text-lg font-bold text-amber-400">
            {tickets.filter((t: any) => t.status === "open").length}
          </p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-3 text-center">
          <p className="text-xs text-slate-400">In Progress</p>
          <p className="text-lg font-bold text-blue-400">
            {tickets.filter((t: any) => t.status === "in_progress").length}
          </p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-3 text-center">
          <p className="text-xs text-slate-400">Awaiting Reply</p>
          <p className="text-lg font-bold text-purple-400">
            {tickets.filter((t: any) => t.status === "waiting_on_customer").length}
          </p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-3 text-center">
          <p className="text-xs text-slate-400">Resolved</p>
          <p className="text-lg font-bold text-green-400">
            {tickets.filter((t: any) => t.status === "resolved" || t.status === "closed").length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "open", "in_progress", "waiting_on_customer", "resolved", "closed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {f === "all"
              ? "All"
              : f === "waiting_on_customer"
              ? "Awaiting Reply"
              : f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-800 border-slate-700 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-4">Create Support Ticket</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Message *</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                  className="border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Submit Ticket
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Ticket List */}
      {filtered.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">
            {tickets.length === 0 ? "No support tickets yet" : "No tickets match your filter"}
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            {tickets.length === 0
              ? "Create a ticket to get help from our support team."
              : "Try adjusting your search or filter criteria."}
          </p>
          {tickets.length === 0 && (
            <Button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Create Your First Ticket
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket: any) => (
            <Card
              key={ticket.id}
              className="bg-slate-800 border-slate-700 p-4 hover:bg-slate-750 hover:border-slate-600 cursor-pointer transition-colors"
              onClick={() => navigate(`/app/support/${ticket.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium truncate">{ticket.subject}</h3>
                    {ticket.status === "waiting_on_customer" && (
                      <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-1">{ticket.body}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    {ticket.category && (
                      <span className="text-xs text-slate-500">{ticket.category}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
