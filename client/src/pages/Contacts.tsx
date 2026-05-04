import { useState } from 'react';
import { Users, Search, Filter, Phone, Mail, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const mockContacts = [
  {
    id: 1,
    name: 'Dr. James Mitchell',
    company: 'Department of Defense',
    role: 'Program Manager',
    type: 'Agency/Client',
    linkedRecords: 3,
    followUpDate: '2026-05-10',
    relationshipStatus: 'Active',
    email: 'james.mitchell@defense.gov',
    phone: '(202) 555-0101',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    company: 'Reed\'s Solutions',
    role: 'Proposal Lead',
    type: 'Internal',
    linkedRecords: 5,
    followUpDate: '2026-05-05',
    relationshipStatus: 'Active',
    email: 'sarah@reeds.com',
    phone: '(415) 555-0202',
  },
  {
    id: 3,
    name: 'Michael Rodriguez',
    company: 'TechFlow Partners',
    role: 'Subcontractor Manager',
    type: 'Partner/Subcontractor',
    linkedRecords: 2,
    followUpDate: '2026-05-15',
    relationshipStatus: 'Active',
    email: 'mrodriguez@techflow.com',
    phone: '(512) 555-0303',
  },
  {
    id: 4,
    name: 'Jennifer Walsh',
    company: 'Federal Accounting Services',
    role: 'Billing Contact',
    type: 'Billing',
    linkedRecords: 1,
    followUpDate: '2026-05-08',
    relationshipStatus: 'Inactive',
    email: 'jwalsh@fasservices.com',
    phone: '(617) 555-0404',
  },
];

const typeColors: Record<string, { bg: string; text: string; badge: string }> = {
  'Agency/Client': { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  'Internal': { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
  'Partner/Subcontractor': { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
  'Billing': { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  'Proposal': { bg: 'bg-cyan-50', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-800' },
  'Contract Management': { bg: 'bg-indigo-50', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-800' },
};

export default function Contacts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filteredContacts = mockContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || contact.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const types = ['All', ...Array.from(new Set(mockContacts.map(c => c.type)))];

  const isOverdue = (date: string) => new Date(date) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-600 mt-1">Manage agency, internal, partner, and billing contacts</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
          <Users className="w-4 h-4" />
          Add Contact
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, company, or email..."
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

      {/* Type Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {types.map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filterType === type
                ? 'bg-green-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12 px-6 bg-slate-50 rounded-lg border border-slate-200">
          <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No contacts found</h3>
          <p className="text-slate-600 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Add your first contact to get started'}
          </p>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Users className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContacts.map(contact => {
            const colors = typeColors[contact.type] || typeColors['Agency/Client'];
            const overdue = isOverdue(contact.followUpDate);
            return (
              <div
                key={contact.id}
                className={`${colors.bg} p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-900">{contact.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors.badge}`}>
                        {contact.type}
                      </span>
                      {contact.relationshipStatus === 'Inactive' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700 font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{contact.role} at {contact.company}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-slate-600 font-medium">Linked Records</span>
                    <p className="text-slate-900">{contact.linkedRecords}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Email</span>
                    <p className="text-slate-900 truncate">{contact.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Phone</span>
                    <p className="text-slate-900">{contact.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Follow-up</span>
                    <div className="flex items-center gap-1">
                      <p className={`${overdue ? 'text-red-700 font-semibold' : 'text-slate-900'}`}>
                        {new Date(contact.followUpDate).toLocaleDateString()}
                      </p>
                      {overdue && <AlertCircle className="w-4 h-4 text-red-600" />}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Phone className="w-3 h-3 mr-1" />
                    Call
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
