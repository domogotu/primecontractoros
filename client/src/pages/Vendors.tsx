// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Plus, Building2, Trash2 } from "lucide-react";

export default function Vendors() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const { data: vendors, isLoading } = trpc.vendors.list.useQuery();
  const utils = trpc.useUtils();
  const createMutation = trpc.vendors.create.useMutation({ onSuccess: () => { utils.vendors.list.invalidate(); setShowForm(false); setName(""); } });
  const deleteMutation = trpc.vendors.delete.useMutation({ onSuccess: () => utils.vendors.list.invalidate() });

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-muted-foreground">Manage your vendor relationships</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" />Add Vendor</Button>
      </div>
      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <Input placeholder="Company name" value={name} onChange={e => setName(e.target.value)} />
              <Input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
              <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <Button className="mt-4" onClick={() => createMutation.mutate({ companyName: name, category, email })}>Save Vendor</Button>
          </CardContent>
        </Card>
      )}
      {isLoading ? <p>Loading...</p> : !vendors?.length ? (
        <Card><CardContent className="py-12 text-center"><Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No vendors yet. Add your first vendor to get started.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {vendors.map((v: any) => (
            <Card key={v.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div><p className="font-medium">{v.companyName}</p><p className="text-sm text-muted-foreground">{v.category} • {v.email}</p></div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: v.id })}><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
