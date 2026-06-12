import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Target, FileText, Briefcase, DollarSign, Building2, Users,
  Folder, History, Wand2, BookOpen, ShieldCheck, UserPlus,
  Crown, Activity, BarChart3, Settings, LogOut, ChevronDown, ChevronRight, Webhook,
  Shield, Package, Calendar, Bell, MessageSquare, Lightbulb, Archive, Brain, LifeBuoy,
  Scale, ClipboardList, CheckSquare, AlertTriangle, Sparkles, Globe, User,
  CreditCard, FileCheck, Send, Download, AlertCircle, BarChart2, Search,
  GitBranch, Zap, Clock,
} from "lucide-react";
import RecentRecordsSidebar from "./RecentRecordsSidebar";

export default function WorkspaceSidebar() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const [expandedSections, setExpandedSections] = useState<string[]>(["setup", "lifecycle"]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const sections = [
    // ── Setup ──────────────────────────────────────────────────────────────
    {
      id: "setup",
      label: "Setup",
      items: [
        { icon: Building2,  label: "Business Profile",  path: "/app/business-profile" },
        { icon: User,       label: "Account Settings",  path: "/app/account-settings" },
      ],
    },

    // ── Core Workflow / Lifecycle ───────────────────────────────────────────
    {
      id: "lifecycle",
      label: "Core Workflow",
      items: [
        { icon: LayoutDashboard, label: "Dashboard",       path: "/app/dashboard" },
        { icon: Target,          label: "Opportunities",   path: "/app/opportunities" },
        { icon: FileText,        label: "Proposals",       path: "/app/proposals" },
        { icon: Briefcase,       label: "Contracts",       path: "/app/contracts" },
        { icon: DollarSign,      label: "Invoices",        path: "/app/invoices" },
        { icon: CreditCard,      label: "Payments",        path: "/app/payments" },
        { icon: Archive,         label: "Closeout",        path: "/app/closeout" },
        { icon: Lightbulb,       label: "Lessons Learned", path: "/app/lessons-learned" },
      ],
    },

    // ── Operations ─────────────────────────────────────────────────────────
    {
      id: "operations",
      label: "Operations",
      items: [
        { icon: CheckSquare,  label: "Tasks",           path: "/app/tasks" },
        { icon: Calendar,     label: "Deadlines",       path: "/app/deadlines" },
        { icon: Package,      label: "Deliverables",    path: "/app/deliverables" },
        { icon: Users,        label: "Contacts",        path: "/app/contacts" },
        { icon: Folder,       label: "Files",           path: "/app/files" },
        { icon: Building2,    label: "Subcontractors",  path: "/app/subcontractors" },
        { icon: Users,        label: "Vendors",         path: "/app/vendors" },
        { icon: Building2,    label: "Clients",         path: "/app/clients" },
        { icon: MessageSquare,label: "Messages",        path: "/app/messages" },
        { icon: GitBranch,    label: "Change Management", path: "/app/change-management" },
      ],
    },

    // ── Compliance ─────────────────────────────────────────────────────────
    {
      id: "compliance",
      label: "Compliance",
      items: [
        { icon: ShieldCheck,  label: "Compliance Matrix",   path: "/app/compliance" },
        { icon: DollarSign,   label: "Rate Parity",         path: "/app/rate-parity" },
        { icon: FileCheck,    label: "Obligations",         path: "/app/obligations" },
        { icon: Scale,        label: "FAR/DFARS Reference", path: "/app/far-reference" },
        { icon: ShieldCheck,  label: "Flowdown Review",     path: "/app/flowdown-review" },
        { icon: ClipboardList,label: "Requirements",        path: "/app/requirements" },
        { icon: FileCheck,    label: "Consistency Check",   path: "/app/consistency-check" },
      ],
    },

    // ── Finance ────────────────────────────────────────────────────────────
    {
      id: "finance",
      label: "Finance",
      items: [
        { icon: BarChart3,  label: "Finance Overview", path: "/app/finance" },
        { icon: DollarSign, label: "Billing",          path: "/app/billing" },
        { icon: CreditCard, label: "Subscription",     path: "/app/subscription" },
      ],
    },

    // ── Intelligence ───────────────────────────────────────────────────────
    {
      id: "intelligence",
      label: "Intelligence",
      items: [
        { icon: Search,    label: "SAM.gov Search",     path: "/app/sam-search" },
        { icon: Brain,     label: "AI Contract Review", path: "/app/ai-contract-review" },
        { icon: Sparkles,  label: "AI Findings",        path: "/app/ai-findings" },
        { icon: Sparkles,  label: "AI Suggestions",     path: "/app/ai-suggestions" },
        { icon: Activity,  label: "AI Runs",            path: "/app/ai-runs" },
        { icon: Wand2,     label: "Doc Generator",      path: "/app/document-generation" },
        { icon: BarChart3, label: "Reports",            path: "/app/reports" },
        { icon: Target,    label: "Capability Statements", path: "/app/capability-statements" },
        { icon: FileText,  label: "Proposal Frameworks", path: "/app/proposal-frameworks" },
        { icon: Briefcase, label: "Contract Hub",       path: "/app/contract-hub" },
      ],
    },

    // ── Communication ──────────────────────────────────────────────────────
    {
      id: "communication",
      label: "Communication",
      items: [
        { icon: AlertCircle,  label: "Alerts & Tasks",     path: "/app/alerts-tasks" },
        { icon: AlertTriangle,label: "Alerts",             path: "/app/alerts" },
        { icon: MessageSquare,label: "Communication Log",  path: "/app/communication-log" },
        { icon: Send,         label: "Email Templates",    path: "/app/email-templates" },
        { icon: Bell,         label: "Notifications",      path: "/app/notifications" },
        { icon: Globe,        label: "External Viewers",   path: "/app/external-viewers" },
        { icon: LifeBuoy,      label: "Support",            path: "/app/support" },
      ],
    },

    // ── Documents ──────────────────────────────────────────────────────────
    {
      id: "documents",
      label: "Documents",
      items: [
        { icon: History,  label: "Document Versions", path: "/app/document-versions" },
        { icon: FileText, label: "Templates",         path: "/app/templates" },
        { icon: BookOpen, label: "Handbook",          path: "/app/handbook" },
      ],
    },

    // ── Administration ─────────────────────────────────────────────────────
    {
      id: "admin",
      label: "Administration",
      items: [
        { icon: Settings,  label: "Settings",               path: "/app/settings" },
        { icon: BookOpen,  label: "Training",               path: "/app/training" },
        { icon: Users,     label: "Team Members",           path: "/app/team" },
        { icon: Users,     label: "Users",                  path: "/app/users" },
        { icon: UserPlus,  label: "Invites",                path: "/app/invites" },
        { icon: BarChart2, label: "Audit Log",              path: "/app/audit-log" },
        { icon: Webhook,   label: "Webhooks",               path: "/app/webhooks" },
        { icon: Download,  label: "Export Data",            path: "/app/export" },
        { icon: Bell,      label: "Notification Preferences", path: "/app/notification-preferences" },
        { icon: Crown,     label: "Plan Features",          path: "/app/plan-features" },
        { icon: Activity,  label: "Diagnostics",            path: "/app/diagnostics" },
        { icon: Zap,       label: "Onboarding",             path: "/app/onboarding" },

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

        {/* Recently Viewed Records */}
        <RecentRecordsSidebar />

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
