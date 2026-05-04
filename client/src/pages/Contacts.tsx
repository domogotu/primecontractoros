import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function Contacts() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", title: "", company: "", linkedRecordId: "" });

  const { data: contacts = [], isLoading, refetch } = trpc.contacts.list.useQuery();
  const createMutation = trpc.contacts.create.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setForm({ name: "", email: "", phone: "", title: "", company: "", linkedRecordId: "" }); } });
  const deleteMutation = trpc.contacts.delete.useMutation({ onSuccess: () => refetch() });

  const filtered = (contacts as any[]).filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.name) return;
    createMutation.mutate({
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      title: form.title || undefined,
      company: form.company || undefined,
      linkedRecordId: form.linkedRecordId ? parseInt(form.linkedRecordId) : undefined,
    } as any);
  };

  return (
    <PageLayout
      title="Contacts"
      subtitle="Manage key contacts for opportunities, proposals, and contracts"
      label="People"
      summaryCards={[
        { label: "Total Contacts", value: contacts.length },
        { label: "With Email", value: (contacts as any[]).filter((c) => c.email).length },
        { label: "With Phone", value: (contacts as any[]).filter((c) => c.phone).length },
      ]}
      actions={
        <Button onClick={() => setShowForm(!showForm)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Contact
        </Button>
      }
    >
      {showForm && (
        <Card className="bg-white border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Title/Role" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Linked Record ID (optional)" value={form.linkedRecordId} onChange={(e) => setForm({ ...form, linkedRecordId: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Adding..." : "Add Contact"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search contacts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading contacts...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Contacts Added</h3>
          <p className="text-gray-600 mb-6">Add contacts to track key people involved in your opportunities, proposals, and contracts.</p>
          <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Your First Contact
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((contact: any) => (
            <Card key={contact.id} className="bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                  {contact.title && <p className="text-sm text-gray-600">{contact.title}</p>}
                  {contact.company && <p className="text-sm text-gray-500">{contact.company}</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: contact.id })}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="mt-3 space-y-1">
                {contact.email && <p className="text-xs text-gray-500">📧 {contact.email}</p>}
                {contact.phone && <p className="text-xs text-gray-500">📞 {contact.phone}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
