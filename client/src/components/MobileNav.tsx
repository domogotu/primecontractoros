import { useState, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavProps {
  sidebarContent: React.ReactNode;
  children: React.ReactNode;
}

export default function MobileNav({ sidebarContent, children }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const prevLocationRef = useRef(location);

  // Close sidebar only when the route actually changes (i.e., user navigated to a page)
  useEffect(() => {
    if (prevLocationRef.current !== location) {
      prevLocationRef.current = location;
      setIsOpen(false);
    }
  }, [location]);

  const closeSidebar = useCallback(() => setIsOpen(false), []);

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

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-30 md:hidden bg-black/50" onClick={closeSidebar} />
      )}

      {/* Mobile Drawer Sidebar - scrollable, does NOT close on click inside.
          pb-8 adds safe-area padding so content is never cut off at the bottom. */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white z-40 md:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } pt-16 overflow-y-auto pb-8`}
      >
        {sidebarContent}
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
