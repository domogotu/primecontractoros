import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Trash2, Users, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import PageGuidancePanel from "@/components/PageGuidancePanel";
import GuidanceQuestionPanel from "@/components/GuidanceQuestionPanel";
import TrainingWalkthrough from "@/components/TrainingWalkthrough";

export default function Contacts() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRecordType, setFilterRecordType] = useState("all");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", title: "", company: "",
    linkedRecordType: "none", linkedRecordId: "",
  });

  const { data: contacts = [], isLoading, refetch } = trpc.contacts.list.useQuery();
  const { data: opportunities = [] } = trpc.opportunities.list.useQuery();
  const { data: proposals = [] } = trpc.proposals.list.useQuery();
  const { data: contracts = [] } = trpc.contracts.list.useQuery();

  const createMutation = trpc.contacts.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", title: "", company: "", linkedRecordType: "none", linkedRecordId: "" });
    },
  });
  const deleteMutation = trpc.contacts.delete.useMutation({ onSuccess: () => refetch() });

  const filtered = useMemo(() => {
    let list = contacts as any[];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter((c) =>
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.company?.toLowerCase().includes(term)
      );
    }
    if (filterRecordType !== "all") {
      list = list.filter((c) => c.linkedRecordType === filterRecordType);
    }
    return list;
  }, [contacts, searchTerm, filterRecordType]);

  const getLinkedRecordName = (type: string, id: number) => {
    if (type === "opportunity") return (opportunities as any[]).find((o) => o.id === id)?.title || `Opportunity #${id}`;
    if (type === "proposal") return (proposals as any[]).find((p) => p.id === id)?.title || `Proposal #${id}`;
    if (type === "contract") return (contracts as any[]).find((c) => c.id === id)?.title || `Contract #${id}`;
    return null;
  };

  const getRecordOptions = () => {
    if (form.linkedRecordType === "opportunity") return (opportunities as any[]).map((o) => ({ id: o.id, title: o.title }));
    if (form.linkedRecordType === "proposal") return (proposals as any[]).map((p) => ({ id: p.id, title: p.title }));
    if (form.linkedRecordType === "contract") return (contracts as any[]).map((c) => ({ id: c.id, title: c.title }));
    return [];
  };

  const handleCreate = () => {
    if (!form.name) return;
    createMutation.mutate({
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      title: form.title || undefined,
      company: form.company || undefined,
      linkedRecordType: form.linkedRecordType !== "none" ? form.linkedRecordType : undefined,
      linkedRecordId: form.linkedRecordId ? parseInt(form.linkedRecordId) : undefined,
    } as any);
  };

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <PageLayout
      title="Contacts"
      subtitle="Manage key contacts for opportunities, proposals, and contracts"
      label="People"
      summaryCards={[
        { label: "Total Contacts", value: contacts.length },
        { label: "Linked", value: (contacts as any[]).filter((c) => c.linkedRecordType).length },
        { label: "With Email", value: (contacts as any[]).filter((c) => c.email).length },
      ]}
      actions={
        <Button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Contact
        </Button>
      }
    >
      <PageGuide
        title="Contacts"
        description="People connected to your contracting work across all records."
        whenToUse="When adding, finding, or managing contacts for opportunities, contracts, or subcontractors."
        whatToDoNext={["Add contacts for new opportunities", "Link contacts to contracts and proposals", "Update contact information", "Review communication history"]}
        relatedRecords={[{ label: "Contracts", path: "/app/contracts" }, { label: "Subcontractors", path: "/app/subcontractors" }, { label: "Messages", path: "/app/messages" }]}
      />

      {/* Guidance Question Panel */}
      <GuidanceQuestionPanel pageContext="contacts" />

      {/* Training Walkthrough */}
      <TrainingWalkthrough pageContext="contacts" />
      {/* Add Contact Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input placeholder="email@example.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input placeholder="(555) 000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title / Role</label>
                <input placeholder="Contracting Officer" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company / Agency</label>
                <input placeholder="Agency or company name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputCls} />
              </div>
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Link to Record</label>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={form.linkedRecordType} onValueChange={(v) => setForm({ ...form, linkedRecordType: v, linkedRecordId: "" })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Record type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Link</SelectItem>
                      <SelectItem value="opportunity">Opportunity</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.linkedRecordType !== "none" && (
                    <Select value={form.linkedRecordId} onValueChange={(v) => setForm({ ...form, linkedRecordId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select record" />
                      </SelectTrigger>
                      <SelectContent>
                        {getRecordOptions().map((r) => (
                          <SelectItem key={r.id} value={String(r.id)}>{r.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending || !form.name} className="bg-green-500 hover:bg-green-600 text-white">
              {createMutation.isPending ? "Adding..." : "Add Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search & Filter */}
      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search contacts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <Select value={filterRecordType} onValueChange={setFilterRecordType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by link" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contacts</SelectItem>
              <SelectItem value="opportunity">Linked to Opportunity</SelectItem>
              <SelectItem value="proposal">Linked to Proposal</SelectItem>
              <SelectItem value="contract">Linked to Contract</SelectItem>
            </SelectContent>
          </Select>
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
                {contact.linkedRecordType && contact.linkedRecordId && (
                  <p className="text-xs text-blue-600 flex items-center gap-1 mt-2">
                    <Link2 className="w-3 h-3" />
                    {getLinkedRecordName(contact.linkedRecordType, contact.linkedRecordId)}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
          <PageGuidancePanel
        pageKey="contacts"
        title="Contacts Help"
        description="Manage operational contacts — contracting officers, CORs, billing contacts, partners, and subcontractors. Link contacts to specific records."
        whatToDoNext={["Add contracting officer and COR for each contract", "Link contacts to specific contracts", "Add billing and technical contacts", "Track subcontractor contacts"]}
        helpArticleSlug="what-is-a-cor"
        glossaryTerms={["contracting-officer", "cor"]}
      />
    </PageLayout>
  );
}
