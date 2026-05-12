// @ts-nocheck
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Plus, Users, Trash2 } from 'lucide-react';

export default function Subcontractors() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const { data: subs, isLoading } = trpc.subcontractors.list.useQuery();
  const utils = trpc.useUtils();
  const createMutation = trpc.subcontractors.create.useMutation({ onSuccess: () => { utils.subcontractors.list.invalidate(); setShowForm(false); } });
  const deleteMutation = trpc.subcontractors.delete.useMutation({ onSuccess: () => utils.subcontractors.list.invalidate() });

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Subcontractors</h1>
          <p className="text-muted-foreground">Manage subcontractor relationships</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />Add Subcontractor
        </Button>
      </div>
      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Company name" value={name} onChange={e => setName(e.target.value)} />
              <Input placeholder="Contact" value={contact} onChange={e => setContact(e.target.value)} />
              <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <Button className="mt-4" onClick={() => createMutation.mutate({ companyName: name, contactName: contact, email })}>Save</Button>
          </CardContent>
        </Card>
      )}
      {isLoading ? (
        <p>Loading...</p>
      ) : !subs?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No subcontractors yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {subs.map((s: any) => (
            <Card key={s.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.companyName}</p>
                  <p className="text-sm text-muted-foreground">{s.contactName} - {s.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: s.id })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
