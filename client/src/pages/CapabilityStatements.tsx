import { Plus, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CapabilityStatements() {
  const statements = [
    {
      id: 1,
      title: 'General Capability Statement',
      version: '2.1',
      lastUpdated: '2026-04-15',
      status: 'Active',
      pages: 3,
      naics: ['541330', '541512', '541519'],
      certifications: ['ISO 9001', 'CMMC Level 2'],
      aiQuality: 'Approved',
    },
    {
      id: 2,
      title: 'Defense IT Infrastructure Tailored',
      version: '1.0',
      lastUpdated: '2026-05-01',
      status: 'Active',
      pages: 4,
      naics: ['541330'],
      certifications: ['ISO 9001'],
      aiQuality: 'Reviewed',
    },
    {
      id: 3,
      title: 'Legacy Capability Statement',
      version: '1.5',
      lastUpdated: '2025-12-10',
      status: 'Archived',
      pages: 2,
      naics: ['541512'],
      certifications: [],
      aiQuality: 'N/A',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-50 p-6 rounded-lg border border-teal-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Capability Statements</h1>
            <p className="text-slate-600">Build, maintain, and version your company capabilities. AI quality checks ensure accuracy without overstating experience.</p>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Statement
          </Button>
        </div>
      </div>

      {/* Statements List */}
      <div className="space-y-4">
        {statements.map(stmt => (
          <div key={stmt.id} className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">{stmt.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    stmt.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {stmt.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600">Version {stmt.version} • {stmt.pages} pages</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-600 font-medium">AI Quality</p>
                <div className="flex items-center gap-1 mt-1 justify-end">
                  {stmt.aiQuality === 'Approved' && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{stmt.aiQuality}</span>
                    </>
                  )}
                  {stmt.aiQuality === 'Reviewed' && (
                    <>
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">{stmt.aiQuality}</span>
                    </>
                  )}
                  {stmt.aiQuality === 'N/A' && (
                    <span className="text-sm font-medium text-slate-600">{stmt.aiQuality}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-slate-200">
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1">NAICS Codes</p>
                <div className="flex flex-wrap gap-1">
                  {stmt.naics.map(code => (
                    <span key={code} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {code}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1">Certifications</p>
                <div className="flex flex-wrap gap-1">
                  {stmt.certifications.length > 0 ? (
                    stmt.certifications.map(cert => (
                      <span key={cert} className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                        {cert}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-600">None listed</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1">Last Updated</p>
                <p className="text-sm text-slate-900">{new Date(stmt.lastUpdated).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">View</Button>
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="outline" size="sm">Duplicate</Button>
              {stmt.status === 'Active' && (
                <Button variant="outline" size="sm" className="text-amber-600 hover:text-amber-700">Archive</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Version History */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-600" />
          Version History
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <div>
              <p className="font-medium text-slate-900">General Capability Statement v2.1</p>
              <p className="text-sm text-slate-600">Updated Apr 15, 2026</p>
            </div>
            <Button variant="outline" size="sm">Restore</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <div>
              <p className="font-medium text-slate-900">General Capability Statement v2.0</p>
              <p className="text-sm text-slate-600">Updated Mar 20, 2026</p>
            </div>
            <Button variant="outline" size="sm">Restore</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <div>
              <p className="font-medium text-slate-900">General Capability Statement v1.9</p>
              <p className="text-sm text-slate-600">Updated Feb 10, 2026</p>
            </div>
            <Button variant="outline" size="sm">Restore</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
