import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Target, FileText, Briefcase, DollarSign, Building2, Users,
  Folder, History, Wand2, BookOpen, GitBranch, ShieldCheck, Mail, UserPlus,
  Crown, Activity, BarChart3, Settings, LogOut, ChevronDown, ChevronRight, Webhook,
  Shield, Package, Calendar, Bell, MessageSquare, Lightbulb, Archive, Brain,
  Scale, ClipboardList, CheckSquare, AlertTriangle, Sparkles, Search, Globe,
} from "lucide-react";

export default function WorkspaceSidebar() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const [expandedSections, setExpandedSections] = useState<string[]>(["workflow"]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const sections = [
    {
      id: "workflow",
      label: "Workflow",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/app/dashboard" },
        { icon: Target, label: "Opportunities", path: "/app/opportunities" },
        { icon: Globe, label: "SAM.gov Search", path: "/app/sam-search" },
        { icon: FileText, label: "Proposals", path: "/app/proposals" },
        { icon: Briefcase, label: "Contracts", path: "/app/contracts" },
        { icon: Briefcase, label: "Contract Hub", path: "/app/contract-hub" },
        { icon: GitBranch, label: "Operations", path: "/app/change-management" },
        { icon: DollarSign, label: "Finance", path: "/app/finance" },
        { icon: Archive, label: "Closeout", path: "/app/closeout" },
        { icon: Lightbulb, label: "Lessons Learned", path: "/app/lessons-learned" },
      ],
    },
    {
      id: "compliance",
      label: "Compliance",
      items: [
        { icon: ShieldCheck, label: "Compliance Matrix", path: "/app/compliance" },
        { icon: ClipboardList, label: "Requirements", path: "/app/requirements" },
        { icon: Package, label: "Deliverables", path: "/app/deliverables" },
        { icon: Calendar, label: "Deadlines", path: "/app/deadlines" },
        { icon: Scale, label: "FAR/DFARS Reference", path: "/app/far-reference" },
        { icon: ShieldCheck, label: "Flowdown Review", path: "/app/flowdown-review" },
      ],
    },
    {
      id: "ai-insights",
      label: "AI & Insights",
      items: [
        { icon: Sparkles, label: "AI Findings", path: "/app/ai-findings" },
        { icon: Brain, label: "AI Contract Review", path: "/app/ai-contract-review" },
        { icon: Sparkles, label: "AI Suggestions", path: "/app/ai-suggestions" },
        { icon: Activity, label: "AI Runs", path: "/app/ai-runs" },
        { icon: BarChart3, label: "Reports", path: "/app/reports" },
        { icon: AlertTriangle, label: "Alerts", path: "/app/alerts" },
        { icon: CheckSquare, label: "Tasks", path: "/app/tasks" },
      ],
    },
    {
      id: "partners",
      label: "Partners",
      items: [
        { icon: Building2, label: "Subcontractors", path: "/app/subcontractors" },
        { icon: Users, label: "Vendors", path: "/app/vendors" },
        { icon: Building2, label: "Clients", path: "/app/clients" },
        { icon: Users, label: "Contacts", path: "/app/contacts" },
        { icon: MessageSquare, label: "Messages", path: "/app/messages" },
      ],
    },
    {
      id: "documents",
      label: "Documents",
      items: [
        { icon: Folder, label: "Files", path: "/app/files" },
        { icon: History, label: "Versions", path: "/app/document-versions" },
        { icon: Wand2, label: "Doc Generator", path: "/app/document-generation" },
        { icon: FileText, label: "Templates", path: "/app/templates" },
        { icon: BookOpen, label: "Handbook", path: "/app/handbook" },
      ],
    },
    {
      id: "admin",
      label: "Administration",
      items: [
        { icon: Building2, label: "Business Profile", path: "/app/business-profile" },
        { icon: Settings, label: "Settings", path: "/app/settings" },
        { icon: Users, label: "Team Members", path: "/app/team" },
        { icon: Bell, label: "Notification Preferences", path: "/app/notification-preferences" },
        { icon: Users, label: "Users", path: "/app/users" },
        { icon: UserPlus, label: "Invites", path: "/app/invites" },
        { icon: Crown, label: "Plan Features", path: "/app/plan-features" },
        { icon: Activity, label: "Diagnostics", path: "/app/diagnostics" },
        { icon: Webhook, label: "Webhooks", path: "/app/webhooks" },
      ],
    },
  ];

  const isActive = (path: string) => location === path || location.startsWith(path + "/");

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col shadow-lg">
      <div className="p-6 border-b border-slate-800 shrink-0">
        <h1 className="text-xl font-bold text-white">PrimeContractorOS</h1>
        <p className="text-xs text-slate-400 mt-1">{user?.name}</p>
      </div>
      {/* Single scrollable area containing all nav items AND the bottom actions.
          This ensures Platform Admin and Sign Out are always reachable by scrolling,
          even when all sections are expanded on a small screen. */}
      <nav className="flex-1 overflow-y-auto py-2 pb-4">
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
                          ? "bg-blue-600 text-white border-l-4 border-blue-400"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
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

        {/* Bottom actions inside the scroll container so they are always reachable */}
        <div className="mt-4 mx-4 pt-4 border-t border-slate-800 space-y-1">
          {isAdmin && (
            <Button
              onClick={() => navigate("/platform")}
              className="w-full justify-start bg-blue-900 hover:bg-blue-800 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Platform Admin
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { logout(); navigate("/"); }}
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>
    </div>
  );
}
