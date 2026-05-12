// @ts-nocheck
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function EmailTemplates() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: templates = [], isLoading, refetch } = trpc.emailTemplates.list.useQuery();
  const createMutation = trpc.emailTemplates.create.useMutation({ onSuccess: () => { refetch(); setShowForm(false); } });
  const deleteMutation = trpc.emailTemplates.delete.useMutation({ onSuccess: () => refetch() });

  const filtered = (templates as any[]).filter((t) => t.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <PageLayout title="Email Templates" subtitle="Manage email templates for notifications" label="Communications"
      actions={<Button onClick={() => setShowForm(true)} className="bg-white text-blue-900 hover:bg-blue-50"><Plus className="h-4 w-4 mr-2" />Create Template</Button>}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        {isLoading ? (<div className="text-center py-12 text-gray-500">Loading...</div>) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Email Templates Yet</h3>
            <p className="text-gray-500 mb-4">Create reusable email templates for notifications and communications.</p>
            <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Create First Template</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((template: any) => (
              <Card key={template.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{template.name}</p>
                    <p className="text-sm text-gray-500">Subject: {template.subject}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate({ id: template.id })}><Trash2 className="h-4 w-4" /></Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
