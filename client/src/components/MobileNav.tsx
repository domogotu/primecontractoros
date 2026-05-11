import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavProps {
  sidebarContent: React.ReactNode;
  children: React.ReactNode;
}

export default function MobileNav({ sidebarContent, children }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden bg-slate-900 text-white h-16 flex items-center px-4 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:bg-slate-800"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
        <h1 className="text-lg font-bold ml-4">PrimeContractorOS</h1>
      </div>

      {/* Mobile Drawer Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-30 md:hidden bg-black/50" onClick={() => setIsOpen(false)} />
      )}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white z-40 md:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } pt-16`}
      >
        <div onClick={() => setIsOpen(false)}>{sidebarContent}</div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
        {sidebarContent}
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 mt-16 md:mt-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
