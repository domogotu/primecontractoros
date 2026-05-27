import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PageGuide from "@/components/PageGuide";
import RecordNotes from "@/components/RecordNotes";
import RecordTimeline from "@/components/RecordTimeline";
import {
  User, Mail, Phone, Building, ArrowLeft, Clock, Plus,
  AlertCircle, Calendar, CheckCircle2, Circle, Trash2, Edit
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function ContactDetail() {
  const [, params] = useRoute("/app/contacts/:id");
  const [, setLocation] = useLocation();
  const contactId = parseInt(params?.id || "0");
  const utils = trpc.useUtils();

  const { data: contact, isLoading } = trpc.contacts.getById.useQuery({ id: contactId }, { enabled: contactId > 0 });
  const { data: followups = [] } = trpc.followups.list.useQuery({ contactId }, { enabled: contactId > 0 });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [followupType, setFollowupType] = useState("call");
  const [followupNotes, setFollowupNotes] = useState("");
  const [followupDue, setFollowupDue] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateMutation = trpc.contacts.update.useMutation({
    onSuccess: () => { utils.contacts.getById.invalidate({ id: contactId }); setIsEditing(false); toast.success("Contact updated"); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteMutation = trpc.contacts.delete.useMutation({
    onSuccess: () => { toast.success("Contact deleted"); setLocation("/app/contacts"); },
    onError: (e: any) => toast.error(e.message),
  });
  const createFollowup = trpc.followups.create.useMutation({
    onSuccess: () => { utils.followups.list.invalidate({ contactId }); setShowFollowupForm(false); setFollowupNotes(""); toast.success("Follow-up created"); },
    onError: (e: any) => toast.error(e.message),
  });
  const updateFollowup = trpc.followups.update.useMutation({
    onSuccess: () => { utils.followups.list.invalidate({ contactId }); toast.success("Follow-up updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <div className="p-6 text-center text-slate-500">Loading contact...</div>;
  if (!contact) return (
    <div className="p-6 max-w-4xl mx-auto text-center pb-32">
      <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-slate-700">Contact Not Found</h2>
      <Button variant="outline" className="mt-4" onClick={() => setLocation("/app/contacts")}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Contacts
      </Button>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto pb-32">
      <PageGuide
        title="Contact Detail"
        description="View and manage contact information, follow-ups, and linked records."
        whenToUse="Use to review contact details, schedule follow-ups, or update information."
        whatToDoNext={["Update contact info", "Schedule a follow-up", "View linked records"]}
        relatedRecords={[{ label: "All Contacts", path: "/app/contacts" }]}
      />

      <Button variant="ghost" size="sm" className="mb-4" onClick={() => setLocation("/app/contacts")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Contacts
      </Button>

      {/* Contact Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>First Name</Label><Input value={editData.firstName || ""} onChange={(e) => setEditData({ ...editData, firstName: e.target.value })} /></div>
                  <div><Label>Last Name</Label><Input value={editData.lastName || ""} onChange={(e) => setEditData({ ...editData, lastName: e.target.value })} /></div>
                  <div><Label>Email</Label><Input value={editData.email || ""} onChange={(e) => setEditData({ ...editData, email: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={editData.phone || ""} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} /></div>
                  <div><Label>Organization</Label><Input value={editData.organization || ""} onChange={(e) => setEditData({ ...editData, organization: e.target.value })} /></div>
                  <div><Label>Title</Label><Input value={editData.title || ""} onChange={(e) => setEditData({ ...editData, title: e.target.value })} /></div>
                  <div className="col-span-2 flex gap-2 mt-2">
                    <Button size="sm" onClick={() => updateMutation.mutate({ id: contactId, ...editData })} className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-slate-900">{contact.firstName} {contact.lastName}</h1>
                  {contact.title && <p className="text-sm text-slate-600">{contact.title}</p>}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                    {contact.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {contact.email}</span>}
                    {contact.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {contact.phone}</span>}
                    {contact.organization && <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {contact.organization}</span>}
                  </div>
                  {contact.role && <Badge variant="outline" className="mt-2 capitalize">{contact.role.replace(/_/g, " ")}</Badge>}
                </>
              )}
            </div>
            {!isEditing && (
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => { setEditData({ firstName: contact.firstName, lastName: contact.lastName, email: contact.email, phone: contact.phone, organization: contact.organization, title: contact.title }); setIsEditing(true); }}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          {contact.notes && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs font-medium text-slate-500 mb-1">Notes</p>
              <p className="text-sm text-slate-700">{contact.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Linked Record */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Linked Record</CardTitle>
          </CardHeader>
          <CardContent>
            {contact.linkedRecordType && contact.linkedRecordId ? (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-900 capitalize">{contact.linkedRecordType} #{contact.linkedRecordId}</p>
                <Link href={`/app/${contact.linkedRecordType}s/${contact.linkedRecordId}`}>
                  <Button size="sm" variant="link" className="p-0 h-auto text-blue-600">View Record →</Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Not linked to a specific record</p>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Created</span><span className="text-slate-700">{new Date(contact.createdAt).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Updated</span><span className="text-slate-700">{new Date(contact.updatedAt).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Role</span><span className="text-slate-700 capitalize">{contact.role?.replace(/_/g, " ") || "—"}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Follow-ups */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Follow-ups
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowFollowupForm(true)}>
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showFollowupForm && (
              <div className="p-3 bg-blue-50 rounded-lg mb-4 border border-blue-200">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Type</Label>
                    <Select value={followupType} onValueChange={setFollowupType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input type="date" value={followupDue} onChange={(e) => setFollowupDue(e.target.value)} />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input value={followupNotes} onChange={(e) => setFollowupNotes(e.target.value)} placeholder="Follow-up notes..." />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => createFollowup.mutate({ contactId, type: followupType, notes: followupNotes || undefined, dueDate: followupDue || undefined })} className="bg-blue-600 hover:bg-blue-700 text-white">Create</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowFollowupForm(false)}>Cancel</Button>
                </div>
              </div>
            )}
            {(followups as any[]).length === 0 ? (
              <p className="text-sm text-slate-500">No follow-ups scheduled</p>
            ) : (
              <div className="space-y-2">
                {(followups as any[]).map((f: any) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <button onClick={() => updateFollowup.mutate({ id: f.id, status: f.status === "completed" ? "pending" : "completed" })}>
                      {f.status === "completed" ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-slate-300 hover:text-blue-500" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">{f.type}</Badge>
                        {f.notes && <span className="text-sm text-slate-700">{f.notes}</span>}
                      </div>
                    </div>
                    {f.dueDate && <span className="text-xs text-slate-400">{new Date(f.dueDate).toLocaleDateString()}</span>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Record Notes & Timeline */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <RecordNotes recordType="contact" recordId={contactId} />
        <RecordTimeline recordType="contact" recordId={contactId} />
      </div>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">Are you sure you want to delete {contact.firstName} {contact.lastName}?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate({ id: contactId })}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
