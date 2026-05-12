import { useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { ArrowLeft, Layout, Layers, Users, Zap, FileText, Loader2, Eye, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const frameworkIcons: Record<string, any> = {
  standard: Layout,
  technical: Layers,
  subcontract: Users,
  simple: Zap,
  blank: FileText,
};

const frameworkColors: Record<string, string> = {
  standard: 'bg-blue-50 text-blue-600',
  technical: 'bg-purple-50 text-purple-600',
  subcontract: 'bg-green-50 text-green-600',
  simple: 'bg-orange-50 text-orange-600',
  blank: 'bg-slate-50 text-slate-600',
};

const frameworkBestFor: Record<string, string> = {
  standard: 'Large government contracts with detailed requirements',
  technical: 'Defense, healthcare, and highly regulated contracts',
  subcontract: 'Subcontractor and teaming proposals',
  simple: 'Small contracts, quotes, and quick responses',
  blank: 'Custom proposals and unique requirements',
};

export default function ProposalFrameworkSelector() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const opportunityId = params.get('opportunityId');
  const [previewFramework, setPreviewFramework] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: frameworks = [], isLoading } = trpc.proposalFrameworks.list.useQuery();

  const createProposalMutation = trpc.proposals.create.useMutation({
    onSuccess: (result: any) => {
      toast.success('Proposal created with framework sections');
      navigate(`/app/proposals/${result.id}`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const createSectionsMutation = trpc.proposalSections.create.useMutation();

  const handleSelectFramework = async (framework: any) => {
    setSelectedId(framework.id);
    try {
      const proposalResult = await createProposalMutation.mutateAsync({
        title: `New ${framework.name}`,
        framework: framework.frameworkType || 'standard',
        opportunityId: opportunityId ? parseInt(opportunityId) : undefined,
      });

      // Create default sections from framework
      const sections: string[] = framework.sections ? JSON.parse(framework.sections) : [];
      for (let i = 0; i < sections.length; i++) {
        await createSectionsMutation.mutateAsync({
          proposalId: proposalResult.id,
          title: sections[i],
          sortOrder: i + 1,
        });
      }
    } catch {
      setSelectedId(null);
    }
  };

  return (
    <PageLayout title="Proposal Framework" subtitle="Select a framework for your proposal" label="Proposals">
      <div className="p-8">
        <button
          onClick={() => navigate('/app/proposals')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Proposals
        </button>

        <div className="section-header">
          <h2>Choose Your Proposal Framework</h2>
          <p>Select a structure that matches your opportunity type and requirements</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frameworks.map((framework: any) => {
              const fType = framework.frameworkType || 'standard';
              const Icon = frameworkIcons[fType] || FileText;
              const color = frameworkColors[fType] || 'bg-slate-50 text-slate-600';
              const bestFor = frameworkBestFor[fType] || '';
              const sections: string[] = framework.sections ? JSON.parse(framework.sections) : [];

              return (
                <div key={framework.id} className="feature-card flex flex-col">
                  <div className={`feature-card-icon ${color} rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="feature-card-title">{framework.name}</h3>
                  <p className="feature-card-description mb-4">{framework.description}</p>

                  {sections.length > 0 && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs font-semibold text-slate-600 mb-2">Includes:</p>
                      <div className="flex flex-wrap gap-1">
                        {sections.map((section, idx) => (
                          <span key={idx} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded">
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {bestFor && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700">
                        <strong>Best for:</strong> {bestFor}
                      </p>
                    </div>
                  )}

                  <div className="mt-auto flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewFramework(framework)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" /> Preview
                    </Button>
                    <Button
                      onClick={() => handleSelectFramework(framework)}
                      disabled={selectedId !== null}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      {selectedId === framework.id ? (
                        <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Creating...</>
                      ) : (
                        <><Check className="w-4 h-4 mr-1" /> Select</>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Not sure which framework to choose?</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• <strong>Large RFPs:</strong> Use Standard Structured for comprehensive responses</li>
            <li>• <strong>Technical Focus:</strong> Choose Technical/Compliance for defense and regulated industries</li>
            <li>• <strong>Subcontracting:</strong> Select Subcontract/Partner for team proposals</li>
            <li>• <strong>Quick Responses:</strong> Use Simple/Lightweight for fast turnarounds</li>
            <li>• <strong>Unique Needs:</strong> Start with Blank/Freeform for custom structures</li>
          </ul>
        </div>

        {/* Preview Dialog */}
        <Dialog open={!!previewFramework} onOpenChange={() => setPreviewFramework(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{previewFramework?.name} — Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">{previewFramework?.description}</p>
              {previewFramework?.sections && (() => {
                const sections: string[] = JSON.parse(previewFramework.sections);
                if (sections.length === 0) return <p className="text-sm text-slate-500 italic">No predefined sections — you'll build your own structure.</p>;
                return (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Default Sections:</p>
                    <div className="space-y-2">
                      {sections.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                          <span className="text-sm font-medium text-slate-800">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => setPreviewFramework(null)}>Close</Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setPreviewFramework(null);
                    handleSelectFramework(previewFramework);
                  }}
                  disabled={selectedId !== null}
                >
                  Select This Framework
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
