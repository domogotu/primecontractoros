import { useState } from 'react';
import { Upload, FileText, AlertCircle, Search, Filter, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const mockFiles = [
  {
    id: 1,
    name: 'RFP_Defense_IT_2026.pdf',
    stage: 'Opportunity',
    category: 'Source Notice',
    linkedRecords: ['Defense IT Infrastructure Modernization'],
    governingStatus: 'Active',
    uploadedDate: '2026-05-01',
    missingLinks: false,
  },
  {
    id: 2,
    name: 'Technical_Proposal_v3.docx',
    stage: 'Proposal',
    category: 'Proposal Support',
    linkedRecords: ['Defense IT - Proposal'],
    governingStatus: 'Active',
    uploadedDate: '2026-05-02',
    missingLinks: false,
  },
  {
    id: 3,
    name: 'Contract_N00123-26-C-0001.pdf',
    stage: 'Contract',
    category: 'Awarded Contract',
    linkedRecords: ['IT Infrastructure Support - Year 1'],
    governingStatus: 'Active',
    uploadedDate: '2026-04-15',
    missingLinks: false,
  },
  {
    id: 4,
    name: 'Invoice_Support_May2026.zip',
    stage: 'Finance',
    category: 'Invoice Backup',
    linkedRecords: ['Invoice INV-2026-001'],
    governingStatus: 'Active',
    uploadedDate: '2026-05-03',
    missingLinks: true,
  },
];

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'Source Notice': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-l-purple-500' },
  'Proposal Support': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-l-cyan-500' },
  'Awarded Contract': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-l-blue-500' },
  'Modification': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-l-indigo-500' },
  'Compliance Evidence': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-l-green-500' },
  'Invoice Backup': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-l-amber-500' },
  'Payment Support': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-l-emerald-500' },
  'Closeout Evidence': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-l-slate-500' },
};

export default function Files() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredFiles = mockFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.linkedRecords.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterCategory === 'All' || file.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const categories = ['All', ...Array.from(new Set(mockFiles.map(f => f.category)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Files</h1>
          <p className="text-slate-600 mt-1">Manage documents, notices, and supporting materials</p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload File
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search files or linked records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filterCategory === cat
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Files List */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 px-6 bg-slate-50 rounded-lg border border-slate-200">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No files found</h3>
          <p className="text-slate-600 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Upload your first file to get started'}
          </p>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFiles.map(file => {
            const colors = categoryColors[file.category] || categoryColors['Source Notice'];
            return (
              <div
                key={file.id}
                className={`border-l-4 ${colors.border} ${colors.bg} p-4 rounded-r-lg hover:shadow-md transition-shadow cursor-pointer`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className={`w-5 h-5 ${colors.text}`} />
                      <h3 className="font-semibold text-slate-900">{file.name}</h3>
                      {file.missingLinks && (
                        <div className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          <AlertCircle className="w-3 h-3" />
                          Missing Link
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600 font-medium">Category</span>
                        <p className={`${colors.text} font-medium`}>{file.category}</p>
                      </div>
                      <div>
                        <span className="text-slate-600 font-medium">Stage</span>
                        <p className="text-slate-900">{file.stage}</p>
                      </div>
                      <div>
                        <span className="text-slate-600 font-medium">Linked To</span>
                        <p className="text-slate-900">{file.linkedRecords.length} record(s)</p>
                      </div>
                      <div>
                        <span className="text-slate-600 font-medium">Uploaded</span>
                        <p className="text-slate-900">{new Date(file.uploadedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {file.linkedRecords.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {file.linkedRecords.map((record, idx) => (
                          <span key={idx} className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-700">
                            {record}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="ml-4">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
