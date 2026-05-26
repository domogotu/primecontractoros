import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Building2, Mail, Phone } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { toast } from "sonner";

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", organization: "", email: "", phone: "", title: "", notes: "" });

  const utils = trpc.useUtils();
  const { data: allContacts = [], isLoading } = trpc.contacts.list.useQuery();
  const createContact = trpc.contacts.create.useMutation({
    onSuccess: () => { utils.contacts.list.invalidate(); setShowAdd(false); setForm({ firstName: "", lastName: "", organization: "", email: "", phone: "", title: "", notes: "" }); toast.success("Client added"); },
    onError: (e: any) => toast.error(e.message || "Failed to add client"),
  });
  const deleteContact = trpc.contacts.delete.useMutation({
    onSuccess: () => { utils.contacts.list.invalidate(); toast.success("Client removed"); },
  });

  // Filter contacts to show clients (those with organization or client role)
  const clients = allContacts.filter((c: any) => c.role === "client" || c.role === "contracting_officer" || c.role === "agency_contact" || c.organization);
  const filtered = clients.filter((c: any) => {
    const term = searchTerm.toLowerCase();
    return !term || (c.firstName + " " + c.lastName + " " + (c.organization || "")).toLowerCase().includes(term);
  });
  const activeClients = filtered.filter((c: any) => !c.deletedAt);
  const uniqueOrgs = Array.from(new Set(activeClients.map((c: any) => c.organization).filter(Boolean)));

  const handleSubmit = () => {
    if (!form.firstName && !form.organization) { toast.error("Name or organization required"); return; }
    createContact.mutate({ firstName: form.firstName || form.organization, lastName: form.lastName || "(Client)", organization: form.organization, email: form.email || undefined, phone: form.phone || undefined, title: form.title || undefined, role: "client", notes: form.notes || undefined });
  };

  return (
    <PageLayout
      title="Clients"
      subtitle="Manage your government agency clients and contracting relationships"
      label="Relationships"
      summaryCards={[
        { label: "Total Clients", value: activeClients.length },
        { label: "Organizations", value: uniqueOrgs.length, color: "text-blue-600" },
        { label: "With Email", value: activeClients.filter((c: any) => c.email).length, color: "text-green-600" },
        { label: "New This Month", value: activeClients.filter((c: any) => { const d = new Date(c.createdAt); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length, color: "text-purple-600" },
      ]}
      actions={
        <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Client
        </Button>
      }
    >
      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search clients by name or organization..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
          <p className="text-gray-500 mt-4">Loading clients...</p>
        </Card>
      ) : activeClients.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Clients Added</h3>
          <p className="text-gray-600 mb-6">Add your first client to start tracking agency relationships and contract history.</p>
          <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Your First Client
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {activeClients.map((client: any) => (
            <Card key={client.id} className="bg-white border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{client.firstName} {client.lastName !== "(Client)" ? client.lastName : ""}</h4>
                    {client.organization && <p className="text-sm text-gray-600">{client.organization}</p>}
                    {client.title && <p className="text-xs text-gray-500">{client.title}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {client.email && <a href={"mailto:" + client.email} className="text-gray-400 hover:text-blue-600"><Mail className="w-4 h-4" /></a>}
                  {client.phone && <a href={"tel:" + client.phone} className="text-gray-400 hover:text-green-600"><Phone className="w-4 h-4" /></a>}
                  <Badge variant="secondary" className="text-xs">{client.role || "client"}</Badge>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => { if (confirm("Remove this client?")) deleteContact.mutate({ id: client.id }); }}>Remove</Button>
                </div>
              </div>
              {client.notes && <p className="text-sm text-gray-500 mt-2 pl-13">{client.notes}</p>}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Client</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First Name</Label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="Contact first name" /></div>
              <div><Label>Last Name</Label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Contact last name" /></div>
            </div>
            <div><Label>Organization / Agency</Label><Input value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} placeholder="e.g., Department of Defense" /></div>
            <div><Label>Title / Position</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Contracting Officer" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@agency.gov" /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(555) 123-4567" /></div>
            </div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createContact.isPending}>{createContact.isPending ? "Adding..." : "Add Client"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
