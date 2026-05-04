import TopNavigation from './TopNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <TopNavigation />
      <main className="min-h-[calc(100vh-120px)]">
        {children}
      </main>
    </div>
  );
}
