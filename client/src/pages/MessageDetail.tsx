// @ts-nocheck
import React, { useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  Reply, 
  Paperclip, 
  Flag, 
  Mail, 
  MailOpen, 
  MoreVertical, 
  Send,
  User,
  Clock,
  Link as LinkIcon
} from "lucide-react";
import PageGuide from "@/components/PageGuide";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Demo data for fallback
const DEMO_THREAD = {
  id: "msg-123",
  subject: "Clarification on Proposal RFP-2024-001",
  linkedRecord: {
    type: "Proposal",
    id: "RFP-2024-001",
    name: "Cybersecurity Infrastructure Upgrade"
  },
  isRead: true,
  isFlagged: false,
  messages: [
    {
      id: "m1",
      sender: { name: "Sarah Jenkins", role: "Contracting Officer", email: "s.jenkins@gov.mil" },
      timestamp: "2024-05-10T09:30:00Z",
      content: "Hello team,\n\nCould you please provide more details regarding the timeline for phase 2 of the proposed implementation? The current schedule seems a bit aggressive given the security clearance requirements.\n\nThanks,\nSarah",
      attachments: [
        { name: "RFP_Timeline_Review.pdf", size: "2.4 MB" }
      ]
    },
    {
      id: "m2",
      sender: { name: "David Chen", role: "Project Manager", email: "d.chen@primecontractor.com" },
      timestamp: "2024-05-10T11:15:00Z",
      content: "Hi Sarah,\n\nThank you for the feedback. We have reviewed the timeline and agree that phase 2 needs more buffer for the clearance process. I will have our team revise the schedule and send over an updated Gantt chart by tomorrow morning.\n\nBest regards,\nDavid",
      attachments: []
    },
    {
      id: "m3",
      sender: { name: "Sarah Jenkins", role: "Contracting Officer", email: "s.jenkins@gov.mil" },
      timestamp: "2024-05-11T08:45:00Z",
      content: "Perfect, I will look out for the updated schedule. Please ensure it explicitly outlines the clearance milestones.\n\nThanks.",
      attachments: []
    }
  ]
};

export default function MessageDetail() {
  const [, params] = useRoute("/app/messages/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [replyContent, setReplyContent] = useState("");
  const [isFlagged, setIsFlagged] = useState(DEMO_THREAD.isFlagged);
  const [isRead, setIsRead] = useState(DEMO_THREAD.isRead);

  // In a real app, we would fetch the thread using the ID
  // const { data: thread, isLoading } = trpc.messages.getThread.useQuery({ id: params?.id });
  const thread = DEMO_THREAD;

  const handleSendReply = () => {
    if (!replyContent.trim()) {
      toast({ title: "Error", description: "Reply cannot be empty", variant: "destructive" });
      return;
    }
    toast({ title: "Reply Sent", description: "Your message has been sent successfully." });
    setReplyContent("");
  };

  const toggleFlag = () => {
    setIsFlagged(!isFlagged);
    toast({ title: isFlagged ? "Unflagged" : "Flagged", description: "Message thread updated." });
  };

  const toggleReadStatus = () => {
    setIsRead(!isRead);
    toast({ title: isRead ? "Marked as Unread" : "Marked as Read", description: "Message thread updated." });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <PageLayout>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-12">
        <PageGuide
          title="Message Thread"
          description="View and reply to secure communications regarding contracts, proposals, and compliance."
          whenToUse="Use this page to read full message history and respond to contracting officers or team members."
          whatToDoNext="Review the message history and use the reply box at the bottom to respond."
          relatedRecords={[
            { title: "All Messages", href: "/app/messages" },
            { title: "Proposals", href: "/app/proposals" }
          ]}
        />

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setLocation("/app/messages")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Messages
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={toggleReadStatus} title={isRead ? "Mark as unread" : "Mark as read"}>
              {isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={toggleFlag} title={isFlagged ? "Unflag" : "Flag"}>
              <Flag className={`h-4 w-4 ${isFlagged ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={() => toast({ title: "Feature coming soon" })}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Thread Subject & Meta */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  {thread.subject}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {thread.messages.length} messages
                  </span>
                  <span>•</span>
                  <span>Started {formatDate(thread.messages[0].timestamp)}</span>
                </div>
              </div>
              
              {thread.linkedRecord && (
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Related Record</span>
                  <Link href={`/app/${thread.linkedRecord.type.toLowerCase()}s/${thread.linkedRecord.id}`}>
                    <a className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-md text-sm transition-colors border border-border">
                      <LinkIcon className="h-3.5 w-3.5" />
                      <span className="font-medium">{thread.linkedRecord.type}: {thread.linkedRecord.id}</span>
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Messages List */}
        <div className="flex flex-col gap-4">
          {thread.messages.map((msg, index) => (
            <Card key={msg.id} className="bg-card border-border overflow-hidden">
              <div className="bg-muted/30 px-4 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {msg.sender.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm flex items-center gap-2">
                      {msg.sender.name}
                      <span className="text-xs font-normal text-muted-foreground">&lt;{msg.sender.email}&gt;</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{msg.sender.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(msg.timestamp)}
                </div>
              </div>
              
              <CardContent className="p-4 sm:p-6">
                <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
                
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5" />
                      Attachments ({msg.attachments.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-muted/20 text-sm hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => toast({ title: "Downloading attachment..." })}>
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{att.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">{att.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reply Form */}
        <Card className="bg-card border-border mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Reply className="h-5 w-5" />
              Reply to Thread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Textarea 
                placeholder="Type your reply here..." 
                className="min-h-[150px] resize-y bg-background"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => toast({ title: "Feature coming soon" })}>
                  <Paperclip className="h-4 w-4" />
                  Attach Files
                </Button>
                <Button onClick={handleSendReply} className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Reply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
