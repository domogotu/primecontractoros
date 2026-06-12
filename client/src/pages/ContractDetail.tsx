import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import {
  ArrowLeft, Loader2, AlertCircle, CheckCircle2, FileText, Users, Zap,
  Briefcase, BarChart3, Plus, Trash2, Calendar
} from 'lucide-react';
import ContractForm from '@/components/ContractForm';
import { AIGuidancePanel } from '@/components/AIGuidancePanel';
import AIWorkflowButtons from "@/components/AIWorkflowButtons";
import { GuidancePanel } from '@/components/GuidancePanel';
import { toast } from 'sonner';
import PageGuide from "@/components/PageGuide";
import RecordNotes from "@/components/RecordNotes";
import RecordTimeline from "@/components/RecordTimeline";
import { useRecentRecords } from "@/hooks/useRecentRecords";

export default function ContractDetail() {
  const [, params] = useRoute('/app/contracts/:id');
  const [, navigate] = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showAddClin, setShowAddClin] = useState(false);
  const [showAddMod, setShowAddMod] = useState(false);
  const [showAddPersonnel, setShowAddPersonnel] = useState(false);

  const contractId = params?.id ? parseInt(params.id) : undefined;
  const { addRecord } = useRecentRecords();

  const { data: contract, isLoading, error } = trpc.contracts.get.useQuery(
    { id: contractId! },
    { enabled: !!contractId }
  );

  const { data: clins = [] } = trpc.clins.list.useQuery(
    { contractId: contractId! },
    { enabled: !!contractId }
  );

  const { data: modifications = [] } = trpc.modifications.list.useQuery(
    { contractId: contractId! },
    { enabled: !!contractId }
  );

  const { data: personnel = [] } = trpc.personnel.list.useQuery(
    { contractId: contractId! },
    { enabled: !!contractId }
  );

  const updateHealthMutation = trpc.contracts.updateHealth.useMutation();
  const utils = trpc.useUtils();

  // CLIN form
  const [clinForm, setClinForm] = useState({ clinNumber: '', description: '', quantity: '', unitPrice: '', totalValue: '' });
  const createClinMutation = trpc.clins.create.useMutation({
    onSuccess: () => { utils.clins.list.invalidate(); setShowAddClin(false); setClinForm({ clinNumber: '', description: '', quantity: '', unitPrice: '', totalValue: '' }); toast.success('CLIN added'); },
  });
  const deleteClinMutation = trpc.clins.delete.useMutation({ onSuccess: () => utils.clins.list.invalidate() });

  // Modification form
  const [modForm, setModForm] = useState({ modNumber: '', title: '', description: '', modType: 'administrative' as const, valueChange: '' });
  const createModMutation = trpc.modifications.create.useMutation({
    onSuccess: () => { utils.modifications.list.invalidate(); setShowAddMod(false); setModForm({ modNumber: '', title: '', description: '', modType: 'administrative', valueChange: '' }); toast.success('Modification added'); },
  });

  // Personnel form
  const [personnelForm, setPersonnelForm] = useState({ name: '', role: '', email: '', phone: '', clearanceLevel: '' });
  const createPersonnelMutation = trpc.personnel.create.useMutation({
    onSuccess: () => { utils.personnel.list.invalidate(); setShowAddPersonnel(false); setPersonnelForm({ name: '', role: '', email: '', phone: '', clearanceLevel: '' }); toast.success('Personnel added'); },
  });
  const deletePersonnelMutation = trpc.personnel.delete.useMutation({ onSuccess: () => utils.personnel.list.invalidate() });

  // PDF export
  const exportContract = trpc.pdf.exportContractSummary.useMutation({
    onSuccess: (data) => { window.open(data.url, '_blank'); },
  });
  // Closeout workflow (FAR 4.804)
  const { data: closeoutData } = trpc.intCloseout.getByContract.useQuery(
    { contractId: contractId! },
    { enabled: !!contractId }
  );
  const initiateCloseout = trpc.intCloseout.initiate.useMutation({
    onSuccess: () => { utils.intCloseout.getByContract.invalidate(); toast.success('Closeout initiated'); navigate(`/app/contracts/${contractId}/closeout`); },
  });
  const toggleCloseoutItem = trpc.intCloseout.toggleItem.useMutation({
    onSuccess: () => { utils.intCloseout.getByContract.invalidate(); },
  });
  const updateCloseoutStatus = trpc.intCloseout.updateStatus.useMutation({
    onSuccess: () => { utils.intCloseout.getByContract.invalidate(); toast.success('Closeout status updated'); },
  });

  // Track this record as recently viewed
  useEffect(() => {
    if (contract && contractId) {
      addRecord({ type: 'contract', id: contractId, title: contract.title, route: `/app/contracts/${contractId}` });
    }
  }, [contract?.id]);

  if (!contractId) {
    return (
      <PageLayout title="Contract Detail" subtitle="View and manage this contract" label="Contracts">
      <PageGuide
        title="Contract Detail"
        description="Complete contract view with requirements, deliverables, compliance, and financial tracking."
        whenToUse="When managing a specific contract, reviewing compliance, or tracking performance."
        whatToDoNext={["Review contract requirements and deliverables", "Check compliance status", "Track invoices and payments", "Run AI contract review for findings"]}
        relatedRecords={[{ label: "Contracts", path: "/app/contracts" }, { label: "Requirements", path: "/app/requirements" }, { label: "Finance", path: "/app/finance" }]}
      />
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold">Invalid Contract</h2>
          <Button onClick={() => navigate('/app/contracts')} className="mt-4">Back to Contracts</Button>
        </div>
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout title="Contract Detail" subtitle="View and manage this contract" label="Contracts">
        <div className="p-8 flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </PageLayout>
    );
  }

  if (error || !contract) {
    return (
      <PageLayout title="Contract Detail" subtitle="View and manage this contract" label="Contracts">
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold">Contract Not Found</h2>
          <Button onClick={() => navigate('/app/contracts')} className="mt-4">Back to Contracts</Button>
        </div>
      </PageLayout>
    );
  }

  const statusColors: Record<string, string> = {
    setup: 'bg-blue-100 text-blue-800', active: 'bg-green-100 text-green-800',
    modification: 'bg-yellow-100 text-yellow-800', closeout: 'bg-orange-100 text-orange-800',
    closed: 'bg-slate-100 text-slate-800', suspended: 'bg-red-100 text-red-800',
  };
  const healthColors: Record<string, string> = {
    healthy: 'bg-green-100 text-green-800', at_risk: 'bg-yellow-100 text-yellow-800', warning: 'bg-red-100 text-red-800',
  };

  // Calculate period of performance
  const startDate = contract.startDate ? new Date(contract.startDate) : null;
  const endDate = contract.endDate ? new Date(contract.endDate) : null;
  const now = new Date();
  let popProgress = 0;
  let daysRemaining = 0;
  if (startDate && endDate) {
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsed = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    popProgress = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));
    daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  return (
    <PageLayout title="Contract Detail" subtitle="View and manage this contract" label="Contracts">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/app/contracts')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Contracts
          </button>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{contract.title}</h1>
              <p className="text-slate-600">{contract.agency || 'No agency specified'}</p>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <Button variant="outline" size="sm" onClick={() => navigate(`/app/contracts/${contractId}/hub`)}>
                Contract Hub
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate(`/app/contracts/${contractId}/ai-confirmation`)}>
                AI Review
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportContract.mutate({ contractId: contract.id })} disabled={exportContract.isPending}>
                {exportContract.isPending ? 'Exporting...' : 'Export PDF'}
              </Button>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[contract.status || 'setup']}`}>
                {(contract.status || 'setup').replace(/_/g, ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${healthColors[contract.health || 'healthy']}`}>
                {(contract.health || 'healthy').replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Contract Number</p>
            <p className="text-lg font-semibold text-slate-900">{contract.contractNumber || 'N/A'}</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Value</p>
            <p className="text-lg font-semibold text-slate-900">{contract.value ? `$${Number(contract.value).toLocaleString()}` : 'N/A'}</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Start Date</p>
            <p className="text-lg font-semibold text-slate-900">{startDate ? startDate.toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">End Date</p>
            <p className="text-lg font-semibold text-slate-900">{endDate ? endDate.toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        {/* Period of Performance Progress */}
        {startDate && endDate && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Period of Performance
            </h2>
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span>{startDate.toLocaleDateString()}</span>
              <span>{daysRemaining} days remaining</span>
              <span>{endDate.toLocaleDateString()}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${popProgress}%` }} />
            </div>
            <p className="text-sm text-slate-500 mt-2">{popProgress.toFixed(1)}% complete</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Linked Records */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" /> Contract Summary
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Status</p>
                  <p className="text-slate-900">{(contract.status || 'setup').replace(/_/g, ' ')}</p>
                </div>
                {contract.proposalId && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Linked Proposal</p>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/app/proposals/${contract.proposalId}`)}>
                      View Proposal #{contract.proposalId}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* CLINs Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> Contract Line Items (CLINs)
                </h2>
                <Button size="sm" variant="outline" onClick={() => setShowAddClin(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add CLIN
                </Button>
              </div>
              {clins.length === 0 ? (
                <p className="text-slate-500 italic">No CLINs defined yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 font-medium text-slate-600">CLIN #</th>
                        <th className="text-left py-2 font-medium text-slate-600">Description</th>
                        <th className="text-right py-2 font-medium text-slate-600">Qty</th>
                        <th className="text-right py-2 font-medium text-slate-600">Unit Price</th>
                        <th className="text-right py-2 font-medium text-slate-600">Total</th>
                        <th className="text-right py-2 font-medium text-slate-600">Status</th>
                        <th className="py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {clins.map((clin) => (
                        <tr key={clin.id} className="border-b border-slate-100">
                          <td className="py-2 font-medium">{clin.clinNumber}</td>
                          <td className="py-2 text-slate-600">{clin.description || '-'}</td>
                          <td className="py-2 text-right">{clin.quantity || '-'}</td>
                          <td className="py-2 text-right">{clin.unitPrice ? `$${Number(clin.unitPrice).toLocaleString()}` : '-'}</td>
                          <td className="py-2 text-right font-medium">{clin.totalValue ? `$${Number(clin.totalValue).toLocaleString()}` : '-'}</td>
                          <td className="py-2 text-right"><span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">{clin.status}</span></td>
                          <td className="py-2 text-right">
                            <button onClick={() => deleteClinMutation.mutate({ id: clin.id })} className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modifications Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" /> Modifications
                </h2>
                <Button size="sm" variant="outline" onClick={() => setShowAddMod(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Mod
                </Button>
              </div>
              {modifications.length === 0 ? (
                <p className="text-slate-500 italic">No modifications recorded.</p>
              ) : (
                <div className="space-y-3">
                  {modifications.map((mod) => (
                    <div key={mod.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{mod.modNumber}</span>
                          <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">{mod.modType}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${mod.status === 'approved' ? 'bg-green-100 text-green-800' : mod.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{mod.status}</span>
                        </div>
                        {mod.valueChange && <span className="text-sm font-medium text-slate-700">{Number(mod.valueChange) >= 0 ? '+' : ''}${Number(mod.valueChange).toLocaleString()}</span>}
                      </div>
                      <p className="text-sm font-medium text-slate-800">{mod.title}</p>
                      {mod.description && <p className="text-sm text-slate-600 mt-1">{mod.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Key Personnel Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" /> Key Personnel
                </h2>
                <Button size="sm" variant="outline" onClick={() => setShowAddPersonnel(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Person
                </Button>
              </div>
              {personnel.length === 0 ? (
                <p className="text-slate-500 italic">No key personnel assigned.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {personnel.map((person) => (
                    <div key={person.id} className="border border-slate-200 rounded-lg p-4 flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{person.name}</p>
                        <p className="text-sm text-slate-600">{person.role}</p>
                        {person.email && <p className="text-sm text-blue-600">{person.email}</p>}
                        {person.clearanceLevel && <p className="text-xs text-slate-500 mt-1">Clearance: {person.clearanceLevel}</p>}
                      </div>
                      <button onClick={() => deletePersonnelMutation.mutate({ id: person.id })} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

            {/* Closeout Workflow Section (FAR 4.804) */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" /> Contract Closeout (FAR 4.804)
                </h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/app/contracts/${contractId}/closeout`)}>
                    Full Closeout View
                  </Button>
                  {!closeoutData && (
                    <Button size="sm" onClick={() => initiateCloseout.mutate({ contractId: contractId! })} disabled={initiateCloseout.isPending}>
                      {initiateCloseout.isPending ? 'Starting...' : 'Initiate Closeout'}
                    </Button>
                  )}
                </div>
              </div>
              {closeoutData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-200 rounded-full h-3 min-w-[120px]">
                        <div className="bg-green-600 h-3 rounded-full transition-all" style={{ width: `${closeoutData.completionPercentage}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-slate-700">{closeoutData.completionPercentage}%</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${closeoutData.status === 'completed' ? 'bg-green-100 text-green-800' : closeoutData.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>
                      {(closeoutData.status || 'not_started').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {closeoutData.items.map((item: any) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                        <input type="checkbox" checked={item.completed} onChange={() => toggleCloseoutItem.mutate({ itemId: item.id, completed: !item.completed })} className="mt-1 h-4 w-4 rounded border-slate-300" />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>{item.label}</p>
                          {item.description && <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
                          {item.completedAt && <p className="text-xs text-green-600 mt-1">Completed {new Date(item.completedAt).toLocaleDateString()}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {closeoutData.canComplete && closeoutData.status !== 'completed' && (
                    <Button className="w-full" onClick={() => updateCloseoutStatus.mutate({ closeoutId: closeoutData.id, status: 'completed' })}>
                      Mark Closeout Complete
                    </Button>
                  )}
                  {!closeoutData.canComplete && closeoutData.completionPercentage > 0 && (
                    <p className="text-xs text-amber-600 mt-2 text-center">
                      {closeoutData.unresolvedBlockers > 0 ? `${closeoutData.unresolvedBlockers} open blocker(s) must be resolved. ` : ''}
                      {closeoutData.requiredCompleted < closeoutData.requiredTotal ? `${closeoutData.requiredTotal - closeoutData.requiredCompleted} required item(s) incomplete.` : ''}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 italic text-sm">Closeout has not been initiated for this contract. Click "Initiate Closeout" to start the FAR 4.804 compliant checklist.</p>
              )}
            </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Health Status */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Health Status</h2>
              <div className="space-y-2">
                {(['healthy', 'at_risk', 'warning'] as const).map(h => (
                  <Button key={h} variant={contract.health === h ? 'default' : 'outline'} className="w-full justify-start"
                    onClick={() => updateHealthMutation.mutate({ id: contractId, health: h })} disabled={updateHealthMutation.isPending}>
                    {h.replace(/_/g, ' ')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Rule-based Guidance Panel */}
            <GuidancePanel compact={true} showPreferences={false} />

            {/* AI Workflow Buttons */}
            <AIWorkflowButtons context="contract" recordId={contractId} recordTitle={contract.title} />

            {/* Record Notes */}
            <RecordNotes recordType="contract" recordId={contractId!} />

            {/* Record Timeline */}
            <RecordTimeline recordType="contract" recordId={contractId!} />

            {/* AI Panel */}
            <AIGuidancePanel recordType="contract" recordId={contractId} context={`Managing contract: ${contract.title}`} title="AI Contract Assistance" />

            <Button variant="outline" className="w-full" onClick={() => setIsEditDialogOpen(true)}>Edit Contract</Button>
          </div>
        </div>

        {/* Add CLIN Dialog */}
        <Dialog open={showAddClin} onOpenChange={setShowAddClin}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add CLIN</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>CLIN Number</Label><Input value={clinForm.clinNumber} onChange={e => setClinForm(f => ({ ...f, clinNumber: e.target.value }))} placeholder="e.g. 0001" /></div>
              <div><Label>Description</Label><Input value={clinForm.description} onChange={e => setClinForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Qty</Label><Input type="number" value={clinForm.quantity} onChange={e => setClinForm(f => ({ ...f, quantity: e.target.value }))} /></div>
                <div><Label>Unit Price</Label><Input value={clinForm.unitPrice} onChange={e => setClinForm(f => ({ ...f, unitPrice: e.target.value }))} /></div>
                <div><Label>Total</Label><Input value={clinForm.totalValue} onChange={e => setClinForm(f => ({ ...f, totalValue: e.target.value }))} /></div>
              </div>
              <Button className="w-full" disabled={!clinForm.clinNumber || createClinMutation.isPending}
                onClick={() => createClinMutation.mutate({ contractId: contractId!, clinNumber: clinForm.clinNumber, description: clinForm.description || undefined, quantity: clinForm.quantity ? parseInt(clinForm.quantity) : undefined, unitPrice: clinForm.unitPrice || undefined, totalValue: clinForm.totalValue || undefined })}>
                {createClinMutation.isPending ? 'Adding...' : 'Add CLIN'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Modification Dialog */}
        <Dialog open={showAddMod} onOpenChange={setShowAddMod}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Modification</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Mod Number</Label><Input value={modForm.modNumber} onChange={e => setModForm(f => ({ ...f, modNumber: e.target.value }))} placeholder="e.g. P00001" /></div>
              <div><Label>Title</Label><Input value={modForm.title} onChange={e => setModForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><Label>Description</Label><Input value={modForm.description} onChange={e => setModForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><Label>Value Change ($)</Label><Input value={modForm.valueChange} onChange={e => setModForm(f => ({ ...f, valueChange: e.target.value }))} placeholder="e.g. 50000 or -10000" /></div>
              <Button className="w-full" disabled={!modForm.modNumber || !modForm.title || createModMutation.isPending}
                onClick={() => createModMutation.mutate({ contractId: contractId!, modNumber: modForm.modNumber, title: modForm.title, description: modForm.description || undefined, modType: modForm.modType, valueChange: modForm.valueChange || undefined })}>
                {createModMutation.isPending ? 'Adding...' : 'Add Modification'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Personnel Dialog */}
        <Dialog open={showAddPersonnel} onOpenChange={setShowAddPersonnel}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Key Personnel</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={personnelForm.name} onChange={e => setPersonnelForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Role</Label><Input value={personnelForm.role} onChange={e => setPersonnelForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. Program Manager" /></div>
              <div><Label>Email</Label><Input value={personnelForm.email} onChange={e => setPersonnelForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={personnelForm.phone} onChange={e => setPersonnelForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>Clearance Level</Label><Input value={personnelForm.clearanceLevel} onChange={e => setPersonnelForm(f => ({ ...f, clearanceLevel: e.target.value }))} /></div>
              <Button className="w-full" disabled={!personnelForm.name || !personnelForm.role || createPersonnelMutation.isPending}
                onClick={() => createPersonnelMutation.mutate({ contractId: contractId!, name: personnelForm.name, role: personnelForm.role, email: personnelForm.email || undefined, phone: personnelForm.phone || undefined, clearanceLevel: personnelForm.clearanceLevel || undefined })}>
                {createPersonnelMutation.isPending ? 'Adding...' : 'Add Personnel'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Edit Contract</DialogTitle></DialogHeader>
            <DialogBody>
              <ContractForm contractId={contractId} onSuccess={() => setIsEditDialogOpen(false)} onCancel={() => setIsEditDialogOpen(false)} />
            </DialogBody>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
