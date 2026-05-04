import { Plus, FileText, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Templates() {
  const templates = {
    proposal: [
      { id: 1, name: 'Standard Structured', description: 'Executive Summary, Technical Approach, Past Performance, Cost', used: 12 },
      { id: 2, name: 'Technical/Compliance Focus', description: 'Technical Requirements, Compliance Matrix, Risk Mitigation', used: 8 },
      { id: 3, name: 'Subcontract/Partner', description: 'Prime Role, Subcontractor Roles, Teaming Agreements', used: 5 },
    ],
    capability: [
      { id: 1, name: 'Company Overview', description: 'Company history, mission, key differentiators', used: 15 },
      { id: 2, name: 'Core Capabilities', description: 'Technical capabilities, experience, certifications', used: 15 },
      { id: 3, name: 'Past Performance', description: 'Recent contracts, client references, success metrics', used: 12 },
    ],
    checklists: [
      { id: 1, name: 'Contract Setup Checklist', description: 'Initial contract setup and requirements review', used: 8 },
      { id: 2, name: 'Finance/Invoice Checklist', description: 'Billing requirements, payment terms, invoice process', used: 10 },
      { id: 3, name: 'Compliance Checklist', description: 'Regulatory requirements, certifications, evidence', used: 9 },
      { id: 4, name: 'Closeout Checklist', description: 'Final deliverables, lessons learned, contract closure', used: 4 },
    ],
    file: [
      { id: 1, name: 'Contract File Structure', description: 'Organized folder structure for contract documents', used: 8 },
      { id: 2, name: 'Proposal File Structure', description: 'Organized folder structure for proposal development', used: 12 },
      { id: 3, name: 'Finance File Structure', description: 'Organized folder structure for invoices and payments', used: 6 },
    ],
    communication: [
      { id: 1, name: 'Follow-up Message Template', description: 'Standard follow-up message for contacts', used: 25 },
      { id: 2, name: 'Status Update Pattern', description: 'Regular status update communication', used: 18 },
      { id: 3, name: 'Issue Escalation Template', description: 'Escalation communication pattern', used: 7 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-cyan-50 p-6 rounded-lg border border-cyan-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Templates</h1>
            <p className="text-slate-600">Store and reuse structures for proposals, checklists, capability statements, and communication patterns.</p>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="proposal" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="proposal">Proposals</TabsTrigger>
          <TabsTrigger value="capability">Capability</TabsTrigger>
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
          <TabsTrigger value="file">File Structure</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        {/* Proposal Templates */}
        <TabsContent value="proposal" className="space-y-4">
          {templates.proposal.map(template => (
            <div key={template.id} className="p-6 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium">
                  Used {template.used} times
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">View</Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Copy className="w-4 h-4" />
                  Use Template
                </Button>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Capability Templates */}
        <TabsContent value="capability" className="space-y-4">
          {templates.capability.map(template => (
            <div key={template.id} className="p-6 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800 font-medium">
                  Used {template.used} times
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">View</Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Copy className="w-4 h-4" />
                  Use Template
                </Button>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Checklists */}
        <TabsContent value="checklists" className="space-y-4">
          {templates.checklists.map(template => (
            <div key={template.id} className="p-6 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 font-medium">
                  Used {template.used} times
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">View</Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Copy className="w-4 h-4" />
                  Use Template
                </Button>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* File Structure */}
        <TabsContent value="file" className="space-y-4">
          {templates.file.map(template => (
            <div key={template.id} className="p-6 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-800 font-medium">
                  Used {template.used} times
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">View</Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Copy className="w-4 h-4" />
                  Use Template
                </Button>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Communication */}
        <TabsContent value="communication" className="space-y-4">
          {templates.communication.map(template => (
            <div key={template.id} className="p-6 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-pink-100 text-pink-800 font-medium">
                  Used {template.used} times
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">View</Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Copy className="w-4 h-4" />
                  Use Template
                </Button>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
