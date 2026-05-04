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
  DollarSign,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';

export default function WorkspaceSidebar() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
    { icon: Target, label: 'Opportunities', path: '/app/opportunities' },
    { icon: FileText, label: 'Proposals', path: '/app/proposals' },
    { icon: Briefcase, label: 'Contracts', path: '/app/contracts' },
    { icon: Folder, label: 'Files', path: '/app/files' },
    { icon: Users, label: 'Contacts', path: '/app/contacts' },
    { icon: DollarSign, label: 'Finance', path: '/app/finance' },
    { icon: Settings, label: 'Settings', path: '/app/settings' },
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
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          );
        })}
      </nav>

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
