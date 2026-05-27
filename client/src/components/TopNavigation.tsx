import { Link, useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export default function TopNavigation() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems1 = [
    { label: 'Dashboard', href: '/app/dashboard' },
    { label: 'Clients', href: '/app/clients' },
    { label: 'Opportunities', href: '/app/opportunities' },
    { label: 'Proposals', href: '/app/proposals' },
    { label: 'Contracts', href: '/app/contracts' },
    { label: 'Invoices', href: '/app/invoices' },
    { label: 'Payments', href: '/app/payments' },
    { label: 'Files', href: '/app/files' },
    { label: 'Messages', href: '/app/messages' },
    { label: 'Contacts', href: '/app/contacts' },
    { label: 'Reports', href: '/app/reports' },
    { label: 'Obligations', href: '/app/obligations' },
  ];

  const navItems2 = [
    { label: 'Deliverables', href: '/app/deliverables' },
    { label: 'Deadlines', href: '/app/deadlines' },
    { label: 'Compliance', href: '/app/compliance' },
    { label: 'AI Workspace', href: '/app/ai-contract-review' },
    { label: 'Settings', href: '/app/settings' },
    { label: 'Onboarding', href: '/app/onboarding' },
    { label: 'Help', href: '/help' },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-blue-700/50 sticky top-0 z-50">
      {/* Row 1 */}
      <div className="px-4 py-3 border-b border-blue-700/30">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/app/dashboard" className="flex items-center gap-2 font-bold text-white text-lg hover:text-blue-200 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              PC
            </div>
            <span>PrimeContractorOS</span>
          </Link>

          {/* Desktop Navigation Row 1 */}
          <div className="hidden md:flex items-center gap-6 flex-1 ml-8">
            {navItems1.map((item) => (
              <Link key={item.href} href={item.href}>
                <a className="text-slate-200 hover:text-white transition-colors text-sm font-medium whitespace-nowrap">
                  {item.label}
                </a>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-200 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Row 2 */}
      <div className="hidden md:block px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {navItems2.map((item) => (
              <Link key={item.href} href={item.href}>
                <a className="text-slate-200 hover:text-white transition-colors text-sm font-medium whitespace-nowrap">
                  {item.label}
                </a>
              </Link>
            ))}
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-slate-300 text-sm">
                {user.name || user.email}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              className="border-blue-400 text-blue-200 hover:bg-blue-900/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 py-3 border-t border-blue-700/30 space-y-2">
          {[...navItems1, ...navItems2].map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className="block text-slate-200 hover:text-white transition-colors text-sm font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            </Link>
          ))}
          <div className="pt-2 border-t border-blue-700/30">
            {user && (
              <p className="text-slate-300 text-sm py-2">
                {user.name || user.email}
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              className="w-full border-blue-400 text-blue-200 hover:bg-blue-900/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
