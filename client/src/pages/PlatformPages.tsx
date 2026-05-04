// Platform Admin Pages with Dark Navy Design
import { Button } from "@/components/ui/button";
import { Plus, Search, AlertCircle } from "lucide-react";
import Footer from "@/components/Footer";
import { Link } from "wouter";

// Platform Workspaces List
export function PlatformWorkspaces() {
  const workspaces = [
    { id: 1, name: "TechFlow Solutions", plan: "Growth", status: "Active", users: 3, created: "2025-06-15" },
    { id: 2, name: "BuildCorp Inc", plan: "Starter", status: "Active", users: 1, created: "2025-07-20" },
    { id: 3, name: "Federal Contractors LLC", plan: "Advanced", status: "Active", users: 5, created: "2025-05-10" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <div className="bg-black/30 border-b border-blue-500/30 px-8 py-6">
        <h1 className="text-3xl font-bold mb-2">Workspace Directory</h1>
        <p className="text-blue-100">Manage all customer workspaces</p>
      </div>
      <div className="flex-1 p-8">
        <div className="flex gap-4 mb-6">
          <input type="text" placeholder="Search workspaces..." className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400" />
          <Button className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> New Workspace
          </Button>
        </div>
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-100 uppercase">Workspace</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-100 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-100 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-100 uppercase">Users</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-100 uppercase">Created</th>
              </tr>
            </thead>
            <tbody>
              {workspaces.map((ws) => (
                <tr key={ws.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="px-6 py-4 font-medium"><Link href={`/platform/workspaces/${ws.id}`}><a className="text-blue-300 hover:text-blue-200">{ws.name}</a></Link></td>
                  <td className="px-6 py-4">{ws.plan}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-green-500/30 text-green-200 rounded-full text-xs">{ws.status}</span></td>
                  <td className="px-6 py-4">{ws.users}</td>
                  <td className="px-6 py-4 text-gray-300">{ws.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Platform Workspace Summary
export function PlatformWorkspaceSummary() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <div className="bg-black/30 border-b border-blue-500/30 px-8 py-6">
        <h1 className="text-3xl font-bold mb-2">Workspace Summary</h1>
        <p className="text-blue-100">TechFlow Solutions - Workspace ID: 1</p>
      </div>
      <div className="flex-1 p-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
            <p className="text-xs text-blue-200 font-medium uppercase">Status</p>
            <p className="text-2xl font-bold text-green-400 mt-2">Active</p>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
            <p className="text-xs text-blue-200 font-medium uppercase">Billing</p>
            <p className="text-2xl font-bold text-white mt-2">Paid</p>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
            <p className="text-xs text-blue-200 font-medium uppercase">Users</p>
            <p className="text-2xl font-bold text-white mt-2">3</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Access &amp; Billing</h2>
          <p className="text-gray-300">Plan: Growth | Billing Contact: john@techflow.com | Next Renewal: 2026-06-15</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Plans Management
export function PlatformPlans() {
  const plans = [
    { name: "Starter", price: "$99/mo", features: 5, active: false },
    { name: "Growth", price: "$299/mo", features: 12, active: true },
    { name: "Advanced", price: "$699/mo", features: 20, active: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <div className="bg-black/30 border-b border-blue-500/30 px-8 py-6">
        <h1 className="text-3xl font-bold mb-2">Plans Management</h1>
        <p className="text-blue-100">Configure and manage subscription plans</p>
      </div>
      <div className="flex-1 p-8">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-2xl font-bold text-green-400 mb-4">{plan.price}</p>
              <p className="text-blue-100 mb-4">{plan.features} features included</p>
              <Button className={plan.active ? "w-full bg-blue-500 hover:bg-blue-600" : "w-full bg-gray-600 hover:bg-gray-700"}>
                {plan.active ? "Active" : "Edit"}
              </Button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Discounts Management
export function PlatformDiscounts() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <div className="bg-black/30 border-b border-blue-500/30 px-8 py-6">
        <h1 className="text-3xl font-bold mb-2">Discounts Management</h1>
        <p className="text-blue-100">Create and manage promotional discounts</p>
      </div>
      <div className="flex-1 p-8">
        <Button className="bg-green-500 hover:bg-green-600 mb-6">
          <Plus className="w-4 h-4 mr-2" /> Create Discount
        </Button>
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 text-center">
          <p className="text-blue-100">No active discounts. Create one to get started.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Billing Management
export function PlatformBilling() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <div className="bg-black/30 border-b border-blue-500/30 px-8 py-6">
        <h1 className="text-3xl font-bold mb-2">Billing Management</h1>
        <p className="text-blue-100">View and manage billing settings</p>
      </div>
      <div className="flex-1 p-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue This Month</h3>
            <p className="text-3xl font-bold text-green-400">$12,450</p>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Active Subscriptions</h3>
            <p className="text-3xl font-bold text-blue-300">127</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Overrides Management
export function PlatformOverrides() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <div className="bg-black/30 border-b border-blue-500/30 px-8 py-6">
        <h1 className="text-3xl font-bold mb-2">Overrides Management</h1>
        <p className="text-blue-100">Configure system overrides and exceptions</p>
      </div>
      <div className="flex-1 p-8">
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 text-center">
          <p className="text-blue-100">No active overrides configured.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Support Management
export function PlatformSupport() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <div className="bg-black/30 border-b border-blue-500/30 px-8 py-6">
        <h1 className="text-3xl font-bold mb-2">Support Management</h1>
        <p className="text-blue-100">Manage customer support tickets</p>
      </div>
      <div className="flex-1 p-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 text-center">
            <p className="text-blue-200 mb-2">Open Tickets</p>
            <p className="text-3xl font-bold">12</p>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 text-center">
            <p className="text-blue-200 mb-2">Avg Response Time</p>
            <p className="text-3xl font-bold">2.5h</p>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 text-center">
            <p className="text-blue-200 mb-2">Satisfaction</p>
            <p className="text-3xl font-bold text-green-400">4.8/5</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Pricing History
export function PlatformPricingHistory() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <div className="bg-black/30 border-b border-blue-500/30 px-8 py-6">
        <h1 className="text-3xl font-bold mb-2">Pricing History</h1>
        <p className="text-blue-100">View historical pricing changes</p>
      </div>
      <div className="flex-1 p-8">
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 text-center">
          <p className="text-blue-100">No pricing history available.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Ownership Recovery
export function PlatformOwnershipRecovery() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <div className="bg-black/30 border-b border-blue-500/30 px-8 py-6">
        <h1 className="text-3xl font-bold mb-2">Ownership Recovery</h1>
        <p className="text-blue-100">Manage workspace ownership transfers</p>
      </div>
      <div className="flex-1 p-8">
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 text-center">
          <p className="text-blue-100">No pending ownership recovery requests.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Demo Workspaces
export function PlatformDemoWorkspaces() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <div className="bg-black/30 border-b border-blue-500/30 px-8 py-6">
        <h1 className="text-3xl font-bold mb-2">Demo Workspaces</h1>
        <p className="text-blue-100">Create and manage demo workspaces for trials</p>
      </div>
      <div className="flex-1 p-8">
        <Button className="bg-green-500 hover:bg-green-600 mb-6">
          <Plus className="w-4 h-4 mr-2" /> Create Demo
        </Button>
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 text-center">
          <p className="text-blue-100">No demo workspaces created yet.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Platform Tasks
export function PlatformTasks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <div className="bg-black/30 border-b border-blue-500/30 px-8 py-6">
        <h1 className="text-3xl font-bold mb-2">Platform Tasks</h1>
        <p className="text-blue-100">Manage background tasks and jobs</p>
      </div>
      <div className="flex-1 p-8">
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 text-center">
          <p className="text-blue-100">All tasks completed successfully.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
