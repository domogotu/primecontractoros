import { useState } from 'react';
import { Mail, Search, Filter, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const mockMessages = [
  {
    id: 1,
    subject: 'RFP Clarification - Technical Requirements',
    date: '2026-05-03',
    linkedContact: 'Dr. James Mitchell',
    linkedRecord: 'Defense IT Infrastructure Modernization',
    awaitingResponse: true,
    followUpNeeded: true,
    followUpDate: '2026-05-06',
    type: 'Email',
  },
  {
    id: 2,
    subject: 'Proposal Submission Confirmation',
    date: '2026-05-02',
    linkedContact: 'Sarah Chen',
    linkedRecord: 'Defense IT - Proposal',
    awaitingResponse: false,
    followUpNeeded: false,
    followUpDate: null,
    type: 'Email',
  },
  {
    id: 3,
    subject: 'Contract Modification Discussion',
    date: '2026-05-01',
    linkedContact: 'Dr. James Mitchell',
    linkedRecord: 'IT Infrastructure Support - Year 1',
    awaitingResponse: true,
    followUpNeeded: true,
    followUpDate: '2026-05-07',
    type: 'Phone Call',
  },
  {
    id: 4,
    subject: 'Invoice Payment Status Update',
    date: '2026-04-30',
    linkedContact: 'Jennifer Walsh',
    linkedRecord: 'Invoice INV-2026-001',
    awaitingResponse: false,
    followUpNeeded: false,
    followUpDate: null,
    type: 'Email',
  },
];

export default function Messages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredMessages = mockMessages.filter(msg => {
    const matchesSearch = msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.linkedContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.linkedRecord.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === 'Awaiting') matchesFilter = msg.awaitingResponse;
    if (filterStatus === 'FollowUp') matchesFilter = msg.followUpNeeded;
    if (filterStatus === 'All') matchesFilter = true;
    
    return matchesSearch && matchesFilter;
  });

  const isOverdue = (date: string | null) => date ? new Date(date) < new Date() : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-600 mt-1">Communication records and follow-up tracking</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
          <Mail className="w-4 h-4" />
          New Message
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by subject, contact, or record..."
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

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'Awaiting Response', 'Follow-up Needed'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status === 'All' ? 'All' : status === 'Awaiting Response' ? 'Awaiting' : 'FollowUp')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              (status === 'All' && filterStatus === 'All') ||
              (status === 'Awaiting Response' && filterStatus === 'Awaiting') ||
              (status === 'Follow-up Needed' && filterStatus === 'FollowUp')
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-12 px-6 bg-slate-50 rounded-lg border border-slate-200">
          <Mail className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No messages found</h3>
          <p className="text-slate-600 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first message record to get started'}
          </p>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Mail className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map(msg => {
            const overdue = isOverdue(msg.followUpDate);
            return (
              <div
                key={msg.id}
                className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-900">{msg.subject}</h3>
                      {msg.awaitingResponse && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 font-medium">
                          Awaiting Response
                        </span>
                      )}
                      {msg.followUpNeeded && (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
                          Follow-up Needed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{msg.type} • {new Date(msg.date).toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-slate-600 font-medium">Contact</span>
                    <p className="text-slate-900">{msg.linkedContact}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Linked To</span>
                    <p className="text-slate-900 truncate">{msg.linkedRecord}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Type</span>
                    <p className="text-slate-900">{msg.type}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Follow-up Date</span>
                    {msg.followUpDate ? (
                      <div className="flex items-center gap-1">
                        <p className={`${overdue ? 'text-red-700 font-semibold' : 'text-slate-900'}`}>
                          {new Date(msg.followUpDate).toLocaleDateString()}
                        </p>
                        {overdue && <AlertCircle className="w-4 h-4 text-red-600" />}
                      </div>
                    ) : (
                      <p className="text-slate-500">—</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Mail className="w-3 h-3 mr-1" />
                    Reply
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
