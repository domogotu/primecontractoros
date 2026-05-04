import { BookOpen, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LessonsLearned() {
  const lessons = [
    {
      id: 1,
      category: 'Closeout',
      title: 'Always Request Final Compliance Certification Early',
      description: 'Waiting until the end of contract for compliance certification caused delays. Request it 30 days before closeout.',
      source: 'Contract N00123-26-C-0001 Closeout',
      date: '2026-04-20',
      impact: 'High',
      status: 'Implemented',
    },
    {
      id: 2,
      category: 'Proposal',
      title: 'Cost Estimation: Account for Overhead Earlier',
      description: 'Our cost proposals were consistently 15-20% higher than competitors. Need to revisit overhead allocation methodology.',
      source: 'Loss Review: Defense IT Infrastructure',
      date: '2026-05-04',
      impact: 'High',
      status: 'In Progress',
    },
    {
      id: 3,
      category: 'Finance',
      title: 'Invoice Submission Window Matters',
      description: 'Submitting invoices within 5 days of month-end vs. end of month affected payment timing by 2-3 weeks.',
      source: 'Invoice Payment Analysis',
      date: '2026-04-10',
      impact: 'Medium',
      status: 'Implemented',
    },
    {
      id: 4,
      category: 'Support',
      title: 'Establish Single Point of Contact Early',
      description: 'Multiple contacts with client caused confusion. Designate one primary contact from day 1.',
      source: 'Contract N00456-26-C-0002 Closeout',
      date: '2026-03-15',
      impact: 'Medium',
      status: 'Implemented',
    },
    {
      id: 5,
      category: 'Workflow',
      title: 'Document Compliance Requirements in Checklist',
      description: 'Many compliance items were missed because they weren\'t tracked in a central checklist.',
      source: 'Compliance Review - Multiple Contracts',
      date: '2026-02-28',
      impact: 'High',
      status: 'Implemented',
    },
    {
      id: 6,
      category: 'Partnership',
      title: 'Vet Partners Earlier in Proposal Process',
      description: 'Partner performance issues discovered late in contract. Establish partner criteria and vet before proposal submission.',
      source: 'Loss Review: Infrastructure Proposal',
      date: '2026-05-02',
      impact: 'High',
      status: 'In Progress',
    },
  ];

  const impactColors = {
    'High': 'bg-red-100 text-red-800',
    'Medium': 'bg-amber-100 text-amber-800',
    'Low': 'bg-blue-100 text-blue-800',
  };

  const statusColors = {
    'Implemented': 'bg-green-100 text-green-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Planned': 'bg-slate-100 text-slate-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Lessons Learned</h1>
            <p className="text-slate-600">Capture improvements from closeouts, losses, support patterns, and workflow issues.</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Lesson
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600 font-medium">Total Lessons</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{lessons.length}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700 font-medium">Implemented</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{lessons.filter(l => l.status === 'Implemented').length}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">In Progress</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{lessons.filter(l => l.status === 'In Progress').length}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-700 font-medium">High Impact</p>
          <p className="text-3xl font-bold text-red-900 mt-2">{lessons.filter(l => l.impact === 'High').length}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({lessons.length})</TabsTrigger>
          <TabsTrigger value="closeout">Closeout ({lessons.filter(l => l.category === 'Closeout').length})</TabsTrigger>
          <TabsTrigger value="proposal">Proposal ({lessons.filter(l => l.category === 'Proposal').length})</TabsTrigger>
          <TabsTrigger value="finance">Finance ({lessons.filter(l => l.category === 'Finance').length})</TabsTrigger>
          <TabsTrigger value="other">Other ({lessons.filter(l => !['Closeout', 'Proposal', 'Finance'].includes(l.category)).length})</TabsTrigger>
        </TabsList>

        {/* All Lessons */}
        <TabsContent value="all" className="space-y-4">
          {lessons.map(lesson => (
            <div key={lesson.id} className="p-6 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-slate-100 text-slate-800">
                      {lesson.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${impactColors[lesson.impact as keyof typeof impactColors]}`}>
                      {lesson.impact} Impact
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[lesson.status as keyof typeof statusColors]}`}>
                      {lesson.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{lesson.title}</h3>
                  <p className="text-sm text-slate-600 mt-2">{lesson.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-200">
                <span className="text-slate-600">From: {lesson.source}</span>
                <span className="text-slate-600">{new Date(lesson.date).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">View</Button>
                <Button variant="outline" size="sm">Edit</Button>
                {lesson.status !== 'Implemented' && (
                  <Button variant="outline" size="sm">Mark Implemented</Button>
                )}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Closeout */}
        <TabsContent value="closeout" className="space-y-4">
          {lessons.filter(l => l.category === 'Closeout').map(lesson => (
            <div key={lesson.id} className="p-6 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${impactColors[lesson.impact as keyof typeof impactColors]}`}>
                      {lesson.impact} Impact
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[lesson.status as keyof typeof statusColors]}`}>
                      {lesson.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{lesson.title}</h3>
                  <p className="text-sm text-slate-600 mt-2">{lesson.description}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>
          ))}
        </TabsContent>

        {/* Proposal */}
        <TabsContent value="proposal" className="space-y-4">
          {lessons.filter(l => l.category === 'Proposal').map(lesson => (
            <div key={lesson.id} className="p-6 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${impactColors[lesson.impact as keyof typeof impactColors]}`}>
                      {lesson.impact} Impact
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[lesson.status as keyof typeof statusColors]}`}>
                      {lesson.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{lesson.title}</h3>
                  <p className="text-sm text-slate-600 mt-2">{lesson.description}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>
          ))}
        </TabsContent>

        {/* Finance */}
        <TabsContent value="finance" className="space-y-4">
          {lessons.filter(l => l.category === 'Finance').map(lesson => (
            <div key={lesson.id} className="p-6 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${impactColors[lesson.impact as keyof typeof impactColors]}`}>
                      {lesson.impact} Impact
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[lesson.status as keyof typeof statusColors]}`}>
                      {lesson.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{lesson.title}</h3>
                  <p className="text-sm text-slate-600 mt-2">{lesson.description}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>
          ))}
        </TabsContent>

        {/* Other */}
        <TabsContent value="other" className="space-y-4">
          {lessons.filter(l => !['Closeout', 'Proposal', 'Finance'].includes(l.category)).map(lesson => (
            <div key={lesson.id} className="p-6 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-slate-100 text-slate-800">
                      {lesson.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${impactColors[lesson.impact as keyof typeof impactColors]}`}>
                      {lesson.impact} Impact
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[lesson.status as keyof typeof statusColors]}`}>
                      {lesson.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{lesson.title}</h3>
                  <p className="text-sm text-slate-600 mt-2">{lesson.description}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
