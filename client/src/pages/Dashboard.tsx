import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Users, Target, FileText, Briefcase, DollarSign, FileCheck, Folder, MessageSquare, Contact, AlertCircle, CheckCircle2, Clock, Zap, BarChart3, Settings } from "lucide-react";
import Footer from "@/components/Footer";

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const quickAccessButtons = [
    { label: "Open Clients", icon: Users, color: "bg-blue-500", href: "/app/clients" },
    { label: "Open Opportunities", icon: Target, color: "bg-purple-500", href: "/app/opportunities" },
    { label: "Open Proposals", icon: FileText, color: "bg-pink-500", href: "/app/proposals" },
    { label: "Open Contracts", icon: Briefcase, color: "bg-green-500", href: "/app/contracts" },
    { label: "Open Invoices", icon: DollarSign, color: "bg-yellow-500", href: "/app/invoices" },
    { label: "Open Payments", icon: FileCheck, color: "bg-indigo-500", href: "/app/payments" },
    { label: "Open Files", icon: Folder, color: "bg-cyan-500", href: "/app/files" },
    { label: "Open Messages", icon: MessageSquare, color: "bg-orange-500", href: "/app/messages" },
    { label: "Open Contacts", icon: Contact, color: "bg-red-500", href: "/app/contacts" },
    { label: "Open Obligations", icon: AlertCircle, color: "bg-teal-500", href: "/app/obligations" },
    { label: "Open Deliverables", icon: CheckCircle2, color: "bg-lime-500", href: "/app/deliverables" },
    { label: "Open Deadlines", icon: Clock, color: "bg-rose-500", href: "/app/deadlines" },
    { label: "Open Compliance", icon: AlertCircle, color: "bg-sky-500", href: "/app/compliance" },
    { label: "Open Reports", icon: BarChart3, color: "bg-violet-500", href: "/app/reports" },
    { label: "Open AI Workspace", icon: Zap, color: "bg-fuchsia-500", href: "/app/ai-workspace" },
    { label: "Open Settings", icon: Settings, color: "bg-slate-500", href: "/app/settings" },
  ];

  const countCards = [
    { label: "Total Clients", count: 12, icon: Users },
    { label: "Open Opportunities", count: 8, icon: Target },
    { label: "Active Contracts", count: 5, icon: Briefcase },
    { label: "Outstanding Invoices", count: "$125K", icon: DollarSign },
  ];

  const recentActivity = [
    { type: "Contract", title: "IT Infrastructure Support - Year 1", status: "Active", date: "2 days ago" },
    { type: "Proposal", title: "Defense IT Infrastructure Modernization", status: "Submitted", date: "5 days ago" },
    { type: "Opportunity", title: "Federal IT Services RFP", status: "In Evaluation", date: "1 week ago" },
    { type: "Invoice", title: "INV-2026-001", status: "Outstanding", date: "10 days ago" },
  ];

  const nextActions = [
    { title: "Security Compliance Audit Due", dueDate: "June 15, 2026", priority: "Critical", color: "bg-red-50 border-red-200" },
    { title: "Monthly Status Report Due", dueDate: "May 31, 2026", priority: "High", color: "bg-amber-50 border-amber-200" },
    { title: "Q2 Performance Review", dueDate: "June 30, 2026", priority: "Medium", color: "bg-blue-50 border-blue-200" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navy Header */}
      <div className="bg-blue-900 text-white px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-blue-200 text-sm font-semibold uppercase mb-2">Dashboard</p>
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name?.split(" ")[0] || "User"}</h1>
          <p className="text-blue-100">This is the guided PrimeContractorOS build. The goal of this version is to help a user understand how federal contracting work flows through the system before deeper automation and tracking are added.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Quick Access Grid */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {quickAccessButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <Link key={btn.label} href={btn.href}>
                    <a className={`${btn.color} text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer`}>
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-semibold text-center">{btn.label}</span>
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Summary Cards */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {countCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Card key={card.label} className="bg-white border border-gray-200 p-6 text-center">
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-2">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.count}</p>
                    <Icon className="w-8 h-8 text-gray-400 mx-auto mt-3 opacity-50" />
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <Card className="bg-white border border-gray-200 p-6">
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">{activity.type}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{activity.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{activity.date}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">{activity.status}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Next Actions */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Next Actions</h2>
            <div className="space-y-3">
              {nextActions.map((action, idx) => (
                <div key={idx} className={`${action.color} border rounded-lg p-4 flex items-center justify-between`}>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{action.title}</p>
                    <p className="text-xs text-gray-600 mt-1">Due: {action.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      action.priority === "Critical" ? "bg-red-100 text-red-800" :
                      action.priority === "High" ? "bg-amber-100 text-amber-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {action.priority}
                    </span>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Start</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
