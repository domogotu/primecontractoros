import { ReactNode } from 'react';
import WorkspaceSidebar from './WorkspaceSidebar';

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50">
      <WorkspaceSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
