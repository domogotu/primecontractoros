import { useLocation } from 'wouter';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Layout, Layers, Users, Zap, FileText } from 'lucide-react';

const frameworks = [
  {
    id: 'standard',
    name: 'Standard Structured Proposal',
    description: 'Traditional RFP response with executive summary, technical approach, management plan, and pricing.',
    icon: Layout,
    color: 'bg-blue-50 text-blue-600',
    sections: ['Executive Summary', 'Technical Approach', 'Management Plan', 'Pricing', 'References'],
    bestFor: 'Large government contracts with detailed requirements',
  },
  {
    id: 'technical',
    name: 'Technical/Compliance-Oriented',
    description: 'Emphasizes technical specifications, compliance requirements, and regulatory adherence.',
    icon: Layers,
    color: 'bg-purple-50 text-purple-600',
    sections: ['Technical Specifications', 'Compliance Matrix', 'Quality Assurance', 'Risk Management', 'Pricing'],
    bestFor: 'Defense, healthcare, and highly regulated contracts',
  },
  {
    id: 'subcontract',
    name: 'Subcontract/Partner Support',
    description: 'Designed for subcontractor proposals with focus on prime contractor alignment and team structure.',
    icon: Users,
    color: 'bg-green-50 text-green-600',
    sections: ['Team Structure', 'Prime Alignment', 'Capabilities', 'Subcontractor Roles', 'Pricing'],
    bestFor: 'Subcontractor and teaming proposals',
  },
  {
    id: 'simple',
    name: 'Simple/Lightweight Response',
    description: 'Streamlined format for smaller opportunities or quick-turnaround proposals.',
    icon: Zap,
    color: 'bg-orange-50 text-orange-600',
    sections: ['Overview', 'Approach', 'Team', 'Pricing'],
    bestFor: 'Small contracts, quotes, and quick responses',
  },
  {
    id: 'blank',
    name: 'Blank/Freeform Workspace',
    description: 'Start with a blank canvas and build your own proposal structure.',
    icon: FileText,
    color: 'bg-slate-50 text-slate-600',
    sections: [],
    bestFor: 'Custom proposals and unique requirements',
  },
];

export default function ProposalFrameworkSelector() {
  const [, navigate] = useLocation();

  const handleSelectFramework = (frameworkId: string) => {
    navigate(`/app/proposals/new?framework=${frameworkId}`);
  };

  return (
    <WorkspaceLayout>
      <div className="p-8">
        {/* Header */}
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

        {/* Framework Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {frameworks.map((framework) => {
            const Icon = framework.icon;
            return (
              <div key={framework.id} className="feature-card flex flex-col">
                <div className={`feature-card-icon ${framework.color} rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="feature-card-title">{framework.name}</h3>
                <p className="feature-card-description mb-4">{framework.description}</p>

                {/* Sections Preview */}
                {framework.sections.length > 0 && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Includes:</p>
                    <div className="flex flex-wrap gap-1">
                      {framework.sections.map((section, idx) => (
                        <span key={idx} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded">
                          {section}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Best For */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>Best for:</strong> {framework.bestFor}
                  </p>
                </div>

                <Button
                  onClick={() => handleSelectFramework(framework.id)}
                  className="mt-auto bg-blue-600 hover:bg-blue-700 text-white w-full"
                >
                  Select Framework
                </Button>
              </div>
            );
          })}
        </div>

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
      </div>
    </WorkspaceLayout>
  );
}
