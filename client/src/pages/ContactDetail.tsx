// @ts-nocheck
import React, { useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Edit, 
  MessageSquare, 
  CheckSquare, 
  FileText, 
  Plus,
  Clock,
  User
} from "lucide-react";

export default function ContactDetail() {
  const [, params] = useRoute("/app/contacts/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  // Demo data for contact
  const contact = {
    id: params?.id || "1",
    name: "Jane Doe",
    title: "Contracting Officer",
    organization: "Department of Defense",
    email: "jane.doe@dod.gov",
    phone: "(555) 123-4567",
    role: "Government",
    tags: ["Government", "Prime"],
    status: "Active",
    lastContact: "2023-10-15",
  };

  // Demo data for linked records
  const linkedRecords = {
    contracts: [
      { id: "C-1001", title: "Cloud Infrastructure Modernization", status: "Active", value: "$1.2M" },
      { id: "C-1005", title: "Cybersecurity Assessment", status: "Completed", value: "$450K" }
    ],
    proposals: [
      { id: "P-2023-05", title: "AI Research Initiative", status: "Submitted", date: "2023-09-20" }
    ],
    opportunities: [
      { id: "O-9921", title: "Data Center Migration", status: "Evaluating", value: "$2.5M" }
    ]
  };

  // Demo data for communication history
  const communications = [
    { id: 1, type: "Email", direction: "Sent", subject: "Follow up on proposal P-2023-05", date: "2023-10-15", summary: "Sent requested additional documentation." },
    { id: 2, type: "Meeting", direction: "Received", subject: "Quarterly Review", date: "2023-09-10", summary: "Discussed progress on Cloud Infrastructure contract." },
    { id: 3, type: "Phone", direction: "Sent", subject: "Quick question regarding requirements", date: "2023-08-22", summary: "Clarified section 4.2 of the RFP." }
  ];

  // Demo data for follow-up tasks
  const tasks = [
    { id: 1, title: "Send updated pricing matrix", dueDate: "2023-10-25", status: "Pending" },
    { id: 2, title: "Schedule technical review meeting", dueDate: "2023-11-05", status: "Pending" }
  ];

  // Demo data for notes
  const [notes, setNotes] = useState([
    { id: 1, author: "John Smith", date: "2023-10-01", content: "Jane prefers email communication over phone calls. Very detail-oriented." },
    { id: 2, author: "Sarah Johnson", date: "2023-08-15", content: "Met at the GovCon conference. Expressed interest in our new cybersecurity offerings." }
  ]);

  const handleAction = (action: string) => {
    toast({
      title: "Action triggered",
      description: `Feature coming soon: ${action}`,
    });
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    
    const newNote = {
      id: Date.now(),
      author: user?.name || "Current User",
      date: new Date().toISOString().split('T')[0],
      content: noteText
    };
    
    setNotes([newNote, ...notes]);
    setNoteText("");
    setIsAddNoteDialogOpen(false);
    toast({
      title: "Success",
      description: "Note added successfully",
    });
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "Government": return "blue";
      case "Prime": return "purple";
      case "Sub": return "orange";
      case "Vendor": return "green";
      case "Internal": return "gray";
      default: return "gray";
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation("/app/contacts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageGuide
            title="Contact Detail"
            description="View and manage complete contact information, communication history, and linked records."
            whenToUse="Use this page to review a contact's history before a meeting or to update their information."
            whatToDoNext="Log a recent communication, add a follow-up task, or update contact details."
            relatedRecords={[
              { label: "Contracts", href: "/app/contracts" },
              { label: "Opportunities", href: "/app/opportunities" }
            ]}
          />
        </div>

        {/* Contact Header Card */}
        <Card className="bg-card text-foreground border-border">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{contact.name}</h1>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Briefcase className="h-4 w-4" /> {contact.title}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Building className="h-4 w-4" /> {contact.organization}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 items-end">
                <Button onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Contact
                </Button>
                <div className="flex gap-2 mt-2">
                  {contact.tags.map(tag => (
                    <span key={tag} className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${getTagColor(tag)}-100 text-${getTagColor(tag)}-800 dark:bg-${getTagColor(tag)}-900/30 dark:text-${getTagColor(tag)}-400`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-secondary">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${contact.email}`} className="font-medium hover:underline">{contact.email}</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-secondary">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a href={`tel:${contact.phone}`} className="font-medium hover:underline">{contact.phone}</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-secondary">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{contact.role}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Linked Records & Tasks */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Linked Records */}
            <Card className="bg-card text-foreground border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" /> Linked Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Contracts */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Contracts</h3>
                    <div className="space-y-2">
                      {linkedRecords.contracts.map(contract => (
                        <div key={contract.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => handleAction(`View Contract ${contract.id}`)}>
                          <div>
                            <p className="font-medium">{contract.title}</p>
                            <p className="text-sm text-muted-foreground">{contract.id} • {contract.value}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${contract.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {contract.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Proposals */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Proposals</h3>
                    <div className="space-y-2">
                      {linkedRecords.proposals.map(proposal => (
                        <div key={proposal.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => handleAction(`View Proposal ${proposal.id}`)}>
                          <div>
                            <p className="font-medium">{proposal.title}</p>
                            <p className="text-sm text-muted-foreground">{proposal.id} • {proposal.date}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {proposal.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opportunities */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Opportunities</h3>
                    <div className="space-y-2">
                      {linkedRecords.opportunities.map(opp => (
                        <div key={opp.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => handleAction(`View Opportunity ${opp.id}`)}>
                          <div>
                            <p className="font-medium">{opp.title}</p>
                            <p className="text-sm text-muted-foreground">{opp.id} • {opp.value}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {opp.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communication History */}
            <Card className="bg-card text-foreground border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" /> Communication History
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleAction("Log Communication")}>
                  <Plus className="h-4 w-4 mr-1" /> Log Activity
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {communications.map(comm => (
                    <div key={comm.id} className="flex gap-4 p-4 rounded-lg border border-border">
                      <div className="mt-1">
                        {comm.type === 'Email' ? <Mail className="h-5 w-5 text-blue-500" /> : 
                         comm.type === 'Phone' ? <Phone className="h-5 w-5 text-green-500" /> : 
                         <User className="h-5 w-5 text-purple-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{comm.subject}</h4>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {comm.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${comm.direction === 'Sent' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                            {comm.direction}
                          </span>
                          <span className="text-xs text-muted-foreground">{comm.type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{comm.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tasks & Notes */}
          <div className="space-y-6">
            
            {/* Follow-up Tasks */}
            <Card className="bg-card text-foreground border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" /> Follow-ups
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => handleAction("Add Task")}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-secondary/20">
                      <input type="checkbox" className="mt-1" onChange={() => handleAction("Complete Task")} />
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Due: {task.dueDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="bg-card text-foreground border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Notes
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsAddNoteDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notes.map(note => (
                    <div key={note.id} className="p-3 rounded-lg bg-secondary/30 border border-border">
                      <p className="text-sm">{note.content}</p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                        <span className="text-xs font-medium">{note.author}</span>
                        <span className="text-xs text-muted-foreground">{note.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" defaultValue={contact.name} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" defaultValue={contact.title} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="org" className="text-right">Organization</Label>
              <Input id="org" defaultValue={contact.organization} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" defaultValue={contact.email} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input id="phone" defaultValue={contact.phone} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <Select defaultValue={contact.role}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Prime">Prime</SelectItem>
                  <SelectItem value="Sub">Sub</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                  <SelectItem value="Internal">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              handleAction("Save Contact");
              setIsEditDialogOpen(false);
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea 
              placeholder="Type your note here..." 
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddNoteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNote}>Add Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
