
import React, { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  Reply, 
  Paperclip, 
  Mail, 
  MailOpen, 
  Send,
  Clock,
  Link as LinkIcon,
  MessageSquare
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function MessageDetail() {
  const [, params] = useRoute("/app/messages/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [replyContent, setReplyContent] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);

  const messageId = params?.id ? parseInt(params.id) : null;

  const utils = trpc.useUtils();
  const { data: allMessages = [], isLoading } = trpc.messages.list.useQuery();

  // Find the current message
  const message = messageId ? allMessages.find((m: any) => m.id === messageId) : null;

  // Find related messages (same subject thread)
  const thread = message 
    ? allMessages.filter((m: any) => m.subject === message.subject).sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    : message ? [message] : [];

  const createMutation = trpc.messages.create.useMutation({
    onSuccess: () => {
      utils.messages.list.invalidate();
      setReplyContent("");
      setShowReplyBox(false);
      toast({ title: "Reply Sent", description: "Your message has been sent successfully." });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleSendReply = () => {
    if (!replyContent.trim()) {
      toast({ title: "Error", description: "Reply cannot be empty", variant: "destructive" });
      return;
    }
    if (!message) return;
    createMutation.mutate({
      subject: `Re: ${message.subject}`,
      body: replyContent,
      recipientId: message.senderId !== user?.id ? message.senderId : (message.recipientId ?? undefined),
      linkedRecordType: message.linkedRecordType ?? undefined,
      linkedRecordId: message.linkedRecordId ?? undefined,
    });
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <PageLayout title="Message" subtitle="Loading...">
        <div className="py-12 text-center text-muted-foreground">Loading message...</div>
      </PageLayout>
    );
  }

  if (!message && !isLoading) {
    return (
      <PageLayout title="Message Not Found" subtitle="The requested message could not be found.">
        <div className="py-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium">Message not found</p>
          <p className="text-sm text-muted-foreground mt-2">This message may have been deleted or you may not have access.</p>
          <Button className="mt-6" onClick={() => setLocation("/app/messages")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Messages
          </Button>
        </div>
      </PageLayout>
    );
  }

  const displayThread = thread.length > 0 ? thread : (message ? [message] : []);

  return (
    <PageLayout title={message?.subject || "Message"} subtitle="View and reply to this message thread.">
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-12">

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setLocation("/app/messages")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Messages
          </Button>
        </div>

        {/* Thread Subject & Meta */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  {message?.subject}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {displayThread.length} message{displayThread.length !== 1 ? "s" : ""}
                  </span>
                  <span>•</span>
                  <span>Started {formatDate(displayThread[0]?.createdAt)}</span>
                </div>
              </div>
              
              {message?.linkedRecordType && (
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Related Record</span>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-md text-sm border border-border">
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span className="font-medium capitalize">{message.linkedRecordType} #{message.linkedRecordId}</span>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Messages List */}
        <div className="flex flex-col gap-4">
          {displayThread.map((msg: any, index: number) => {
            const isOwn = msg.senderId === user?.id;
            return (
              <Card key={msg.id} className="bg-card border-border overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {isOwn ? (user?.name?.charAt(0) || "Y") : "S"}
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm flex items-center gap-2">
                        {isOwn ? (user?.name || "You") : `Sender #${msg.senderId}`}
                        {isOwn && (
                          <span className="text-xs font-normal text-primary bg-primary/10 px-1.5 py-0.5 rounded">You</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {msg.linkedRecordType ? `Re: ${msg.linkedRecordType}` : "Direct message"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(msg.createdAt)}
                  </div>
                </div>
                
                <CardContent className="p-4 sm:p-6">
                  <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {msg.body}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Reply Section */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Reply className="h-4 w-4 text-primary" />
              Reply
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Write your reply..."
              className="min-h-[120px] resize-none"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setReplyContent("")}
                disabled={!replyContent.trim()}
              >
                Clear
              </Button>
              <Button 
                onClick={handleSendReply}
                disabled={!replyContent.trim() || createMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                {createMutation.isPending ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
