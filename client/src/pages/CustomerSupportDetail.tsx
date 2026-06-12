import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft, Send, Loader2, Clock, User, Shield, RefreshCw,
  XCircle, AlertCircle, CheckCircle2, MessageSquare, Paperclip,
} from "lucide-react";

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

export default function CustomerSupportDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/app/support/:id");
  const ticketId = params?.id ? parseInt(params.id, 10) : null;

  const [replyContent, setReplyContent] = useState("");

  const ticketQuery = trpc.customerSupport.getById.useQuery(
    { id: ticketId! },
    { enabled: !!ticketId }
  );
  const messagesQuery = trpc.customerSupport.getMessages.useQuery(
    { ticketId: ticketId! },
    { enabled: !!ticketId }
  );

  const replyMutation = trpc.customerSupport.addReply.useMutation({
    onSuccess: () => {
      toast.success("Reply sent.");
      setReplyContent("");
      messagesQuery.refetch();
      ticketQuery.refetch();
    },
    onError: (err) => toast.error(err.message || "Failed to send reply"),
  });

  const reopenMutation = trpc.customerSupport.reopen.useMutation({
    onSuccess: () => {
      toast.success("Ticket reopened.");
      ticketQuery.refetch();
    },
    onError: (err) => toast.error(err.message || "Failed to reopen ticket"),
  });

  const closeMutation = trpc.customerSupport.close.useMutation({
    onSuccess: () => {
      toast.success("Ticket closed.");
      ticketQuery.refetch();
    },
    onError: (err) => toast.error(err.message || "Failed to close ticket"),
  });

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    replyMutation.mutate({ ticketId: ticketId!, content: replyContent.trim() });
  };

  if (!ticketId) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400">Invalid ticket ID.</p>
        <Button variant="outline" onClick={() => navigate("/app/support")} className="mt-4 border-slate-700 text-slate-300">
          Back to Support
        </Button>
      </div>
    );
  }

  if (ticketQuery.isLoading || messagesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const ticket = ticketQuery.data;
  if (!ticket) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-slate-300 mb-2">Ticket Not Found</h2>
        <p className="text-sm text-slate-500 mb-4">This ticket does not exist or you do not have access to it.</p>
        <Button variant="outline" onClick={() => navigate("/app/support")} className="border-slate-700 text-slate-300">
          Back to Support
        </Button>
      </div>
    );
  }

  const messages = messagesQuery.data || [];
  const canReply = ticket.status !== "closed";
  const canReopen = ticket.status === "resolved";
  const canClose = ticket.status !== "closed";

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate("/app/support")}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Support
      </button>

      {/* Ticket Header */}
      <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white mb-2">{ticket.subject}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {getStatusBadge(ticket.status || "open")}
              {getPriorityBadge(ticket.priority || "medium")}
              {ticket.category && (
                <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">
                  {ticket.category}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Created: {new Date(ticket.createdAt).toLocaleString()}
              </span>
              {ticket.resolvedAt && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  Resolved: {new Date(ticket.resolvedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {canReopen && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => reopenMutation.mutate({ ticketId: ticketId! })}
                disabled={reopenMutation.isPending}
                className="border-slate-700 text-slate-300 hover:text-white"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Reopen
              </Button>
            )}
            {canClose && ticket.status !== "resolved" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => closeMutation.mutate({ ticketId: ticketId! })}
                disabled={closeMutation.isPending}
                className="border-slate-700 text-slate-300 hover:text-white"
              >
                <XCircle className="w-3 h-3 mr-1" /> Close
              </Button>
            )}
          </div>
        </div>

        {/* Resolution note */}
        {ticket.resolution && (
          <div className="mt-4 p-3 rounded-lg bg-green-900/20 border border-green-800">
            <p className="text-xs font-medium text-green-400 mb-1">Resolution</p>
            <p className="text-sm text-green-200">{ticket.resolution}</p>
          </div>
        )}
      </Card>

      {/* Status Banner for waiting_on_customer */}
      {ticket.status === "waiting_on_customer" && (
        <div className="mb-4 p-3 rounded-lg bg-purple-900/20 border border-purple-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
          <p className="text-sm text-purple-300">
            Our team is waiting for your reply. Please respond below to continue.
          </p>
        </div>
      )}

      {/* Message Thread */}
      <div className="space-y-4 mb-6">
        <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Conversation ({messages.length} {messages.length === 1 ? "message" : "messages"})
        </h2>

        {messages.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-6 text-center">
            <p className="text-slate-500 text-sm">No messages yet.</p>
          </Card>
        ) : (
          messages.map((msg: any) => (
            <Card
              key={msg.id}
              className={`border p-4 ${
                msg.senderType === "customer"
                  ? "bg-slate-800 border-slate-700 ml-0 mr-8"
                  : "bg-blue-900/20 border-blue-800 ml-8 mr-0"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {msg.senderType === "customer" ? (
                  <User className="w-4 h-4 text-slate-400" />
                ) : (
                  <Shield className="w-4 h-4 text-blue-400" />
                )}
                <span className="text-sm font-medium text-slate-200">
                  {msg.senderType === "customer"
                    ? msg.senderName || "You"
                    : msg.senderName || "Support Team"}
                </span>
                <span className="text-xs text-slate-500 ml-auto">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{msg.content}</p>
              {msg.attachmentFileId && (
                <div className="mt-2 flex items-center gap-1 text-xs text-blue-400">
                  <Paperclip className="w-3 h-3" />
                  <span>Attachment (File #{msg.attachmentFileId})</span>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Reply Form */}
      {canReply ? (
        <Card className="bg-slate-800 border-slate-700 p-4">
          <form onSubmit={handleReply}>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Reply
            </label>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
              placeholder="Type your reply..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y mb-3"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={replyMutation.isPending || !replyContent.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {replyMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Reply
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="bg-slate-800 border-slate-700 p-4 text-center">
          <p className="text-sm text-slate-500">
            This ticket is closed. No further replies can be added.
          </p>
        </Card>
      )}
    </div>
  );
}
