import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Target,
  FileText,
  Briefcase,
  Folder,
  Users,
  Mail,
  DollarSign,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Shield,
  UserPlus,
  Building2,
  GitBranch,
  History,
  Wand2,
  BookOpen,
  ShieldCheck,
  BarChart3,
  Crown,
  Activity,
} from 'lucide-react';

export default function WorkspaceSidebar() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const sections = [
    {
      id: 'main',
      label: 'Main',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
        { icon: Target, label: 'Opportunities', path: '/app/opportunities' },
        { icon: FileText, label: 'Proposals', path: '/app/proposals' },
        { icon: Briefcase, label: 'Contracts', path: '/app/contracts' },
        { icon: DollarSign, label: 'Finance', path: '/app/finance' },
      ],
    },
    {
      id: 'partners',
      label: 'Partners',
      items: [
        { icon: Building2, label: 'Subcontractors', path: '/app/subcontractors' },
        { icon: Users, label: 'Vendors', path: '/app/vendors' },
        { icon: Users, label: 'Contacts', path: '/app/contacts' },
      ],
    },
    {
      id: 'documents',
      label: 'Documents',
      items: [
        { icon: Folder, label: 'Files', path: '/app/files' },
        { icon: History, label: 'Versions', path: '/app/document-versions' },
        { icon: Wand2, label: 'Doc Generator', path: '/app/document-generation' },
        { icon: BookOpen, label: 'Handbook', path: '/app/handbook' },
      ],
    },
    {
      id: 'operations',
      label: 'Operations',
      items: [
        { icon: GitBranch, label: 'Change Mgmt', path: '/app/change-management' },
        { icon: ShieldCheck, label: 'Flowdown Review', path: '/app/flowdown-review' },
        { icon: Mail, label: 'Messages', path: '/app/messages' },
      ],
    },
    {
      id: 'admin',
      label: 'Administration',
      items: [
        { icon: UserPlus, label: 'Invites', path: '/app/invites' },
        { icon: Crown, label: 'Plan Features', path: '/app/plan-features' },
        { icon: Activity, label: 'Diagnostics', path: '/app/diagnostics' },
        { icon: BarChart3, label: 'Adoption', path: '/app/customer-adoption' },
        { icon: ShieldCheck, label: 'Consistency', path: '/app/consistency-check' },
        { icon: Settings, label: 'Settings', path: '/app/settings' },
      ],
    },
  ];

  const isActive = (path: string) => location === path || location.startsWith(path + '/');

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">PrimeContractorOS</h1>
        <p className="text-xs text-slate-400 mt-1">{user?.name}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map((section) => (
          <div key={section.id} className="mb-1">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200"
            >
              <span>{section.label}</span>
              {expandedSections.includes(section.id) ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
            {expandedSections.includes(section.id) && (
              <div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-6 py-2 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Switch to Platform Admin (Admin Only) */}
      {isAdmin && (
        <div className="border-t border-slate-800 p-4">
          <Button
            onClick={() => navigate('/platform')}
            className="w-full justify-start bg-blue-900 hover:bg-blue-800 text-white mb-2"
          >
            <Shield className="w-4 h-4 mr-2" />
            Platform Admin
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-slate-800 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
