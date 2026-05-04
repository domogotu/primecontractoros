import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/_core/hooks/useAuth';
import AppLayout from '@/components/AppLayout';
import {
  Users,
  Target,
  FileText,
  Briefcase,
  DollarSign,
  FileCheck,
  Folder,
  MessageSquare,
  Contact,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  BarChart3,
  Settings,
} from 'lucide-react';

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-white">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  const quickAccessItems = [
    { label: 'Open Clients', icon: Users, href: '/app/clients', color: 'from-blue-500 to-blue-600' },
    { label: 'Open Opportunities', icon: Target, href: '/app/opportunities', color: 'from-purple-500 to-purple-600' },
    { label: 'Open Proposals', icon: FileText, href: '/app/proposals', color: 'from-pink-500 to-pink-600' },
    { label: 'Open Contracts', icon: Briefcase, href: '/app/contracts', color: 'from-green-500 to-green-600' },
    { label: 'Open Invoices', icon: DollarSign, href: '/app/invoices', color: 'from-yellow-500 to-yellow-600' },
    { label: 'Open Payments', icon: FileCheck, href: '/app/payments', color: 'from-indigo-500 to-indigo-600' },
    { label: 'Open Files', icon: Folder, href: '/app/files', color: 'from-cyan-500 to-cyan-600' },
    { label: 'Open Messages', icon: MessageSquare, href: '/app/messages', color: 'from-orange-500 to-orange-600' },
    { label: 'Open Contacts', icon: Contact, href: '/app/contacts', color: 'from-red-500 to-red-600' },
    { label: 'Open Obligations', icon: AlertCircle, href: '/app/obligations', color: 'from-teal-500 to-teal-600' },
    { label: 'Open Deliverables', icon: CheckCircle2, href: '/app/deliverables', color: 'from-lime-500 to-lime-600' },
    { label: 'Open Deadlines', icon: Clock, href: '/app/deadlines', color: 'from-rose-500 to-rose-600' },
    { label: 'Open Compliance', icon: AlertCircle, href: '/app/compliance', color: 'from-violet-500 to-violet-600' },
    { label: 'Open AI Workspace', icon: Zap, href: '/app/ai-confirmation', color: 'from-amber-500 to-amber-600' },
    { label: 'Open Settings', icon: Settings, href: '/app/settings', color: 'from-slate-500 to-slate-600' },
    { label: 'Open Reports', icon: BarChart3, href: '/app/reports', color: 'from-sky-500 to-sky-600' },
  ];

  const countCards = [
    { label: 'Clients', count: 2, icon: Users },
    { label: 'Opportunities', count: 1, icon: Target },
    { label: 'Proposals', count: 2, icon: FileText },
    { label: 'Contracts', count: 2, icon: Briefcase },
  ];

  return (
    <AppLayout>
      <div className="p-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="text-blue-300 text-sm font-semibold tracking-wider uppercase">Dashboard</div>
          <h1 className="text-4xl font-bold text-white">
            Welcome, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-slate-300 max-w-2xl">
            This is the guided PrimeContractorOS build. The goal of this version is to help a user understand how federal contracting work flows through the system before deeper automation and tracking are added.
          </p>
        </div>

        {/* Quick Access Grid */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickAccessItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={`p-6 rounded-lg bg-gradient-to-br ${item.color} hover:shadow-lg transition-all transform hover:scale-105 text-white font-semibold flex items-center justify-center gap-2 min-h-[120px]`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Count Cards */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {countCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.label}
                  className="bg-blue-900/40 border-blue-700/50 backdrop-blur p-6 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-sm font-medium">{card.label}</p>
                      <p className="text-3xl font-bold text-white mt-2">{card.count}</p>
                    </div>
                    <Icon className="w-10 h-10 text-blue-400 opacity-50" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
