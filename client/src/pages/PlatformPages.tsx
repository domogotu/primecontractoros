// Platform Owner Pages - Placeholder implementations
// These will be built out with full functionality

import { Button } from "@/components/ui/button";
import { Plus, Search, AlertCircle } from "lucide-react";

// Platform Workspaces List
export function PlatformWorkspaces() {
  const workspaces = [
    { id: 1, name: "TechFlow Solutions", plan: "Growth", status: "Active", users: 3, created: "2025-06-15" },
    { id: 2, name: "BuildCorp Inc", plan: "Starter", status: "Active", users: 1, created: "2025-07-20" },
    { id: 3, name: "Federal Contractors LLC", plan: "Advanced", status: "Active", users: 5, created: "2025-05-10" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-blue-900">Workspace Directory</h1>
        <p className="text-gray-600">Manage all customer workspaces</p>
      </div>
      <div className="p-8">
        <div className="flex gap-4 mb-6">
          <input type="text" placeholder="Search workspaces..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" />
          <Button className="bg-blue-900 hover:bg-blue-800 text-white">
            <Plus className="w-4 h-4 mr-2" /> New Workspace
          </Button>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Workspace</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Users</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Created</th>
              </tr>
            </thead>
            <tbody>
              {workspaces.map((ws) => (
                <tr key={ws.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-blue-900">{ws.name}</td>
                  <td className="px-6 py-4">{ws.plan}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">{ws.status}</span></td>
                  <td className="px-6 py-4">{ws.users}</td>
                  <td className="px-6 py-4 text-gray-600">{ws.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Platform Workspace Summary
export function PlatformWorkspaceSummary() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-blue-900">Workspace Summary</h1>
        <p className="text-gray-600">TechFlow Solutions - Workspace ID: 1</p>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-xs text-gray-600 font-medium uppercase">Status</p>
            <p className="text-2xl font-bold text-green-600 mt-2">Active</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-xs text-gray-600 font-medium uppercase">Billing</p>
            <p className="text-2xl font-bold text-blue-900 mt-2">Paid</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-xs text-gray-600 font-medium uppercase">Users</p>
            <p className="text-2xl font-bold text-blue-900 mt-2">3</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Access & Billing</h2>
          <p className="text-gray-600">Plan: Growth | Billing Contact: john@techflow.com | Next Renewal: 2026-06-15</p>
        </div>
      </div>
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-blue-900">Plans Management</h1>
        <p className="text-gray-600">Configure pricing and plan features</p>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900">{plan.name}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{plan.price}</p>
              <p className="text-sm text-gray-600 mt-2">{plan.features} features</p>
              <Button className="w-full mt-4 bg-blue-900 hover:bg-blue-800 text-white">Edit Plan</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Discounts / Promo Codes
export function PlatformDiscounts() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-blue-900">Discounts & Promo Codes</h1>
        <p className="text-gray-600">Manage promotional codes and discounts</p>
      </div>
      <div className="p-8">
        <Button className="bg-blue-900 hover:bg-blue-800 text-white mb-6">
          <Plus className="w-4 h-4 mr-2" /> Create Promo Code
        </Button>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Used</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4">EARLYBIRD2026</td>
                <td className="px-6 py-4">20%</td>
                <td className="px-6 py-4">12</td>
                <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Billing / Activation
export function PlatformBilling() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-blue-900">Billing & Activation</h1>
        <p className="text-gray-600">Manage billing states and workspace activation</p>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Billing States</h3>
            <div className="space-y-2">
              <p className="text-sm"><span className="font-medium">Active:</span> 19 workspaces</p>
              <p className="text-sm"><span className="font-medium">Grace Period:</span> 2 workspaces</p>
              <p className="text-sm"><span className="font-medium">Suspended:</span> 1 workspace</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Actions</h3>
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white mb-2">Send Payment Reminders</Button>
            <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">Reactivate Suspended</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Owner Overrides
export function PlatformOverrides() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-blue-900">Owner Overrides</h1>
        <p className="text-gray-600">Controlled override panel with audit log</p>
      </div>
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Restricted Action</h3>
              <p className="text-sm text-red-700 mt-1">All overrides are logged and require justification</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Recent Overrides</h2>
          <p className="text-gray-600">No recent overrides</p>
        </div>
      </div>
    </div>
  );
}

// Platform Support Inbox
export function PlatformSupport() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-blue-900">Support Inbox</h1>
        <p className="text-gray-600">Customer support requests and escalations</p>
      </div>
      <div className="p-8">
        <div className="flex gap-3 mb-6">
          <input type="text" placeholder="Search support requests..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" />
          <select className="px-3 py-2 border border-gray-200 rounded-lg">
            <option>All Status</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600">No support requests</p>
        </div>
      </div>
    </div>
  );
}

// Pricing History / Grandfathering
export function PlatformPricingHistory() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-blue-900">Pricing History</h1>
        <p className="text-gray-600">Price change history and grandfathering rules</p>
      </div>
      <div className="p-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Price Changes</h2>
          <p className="text-gray-600">No price changes recorded</p>
        </div>
      </div>
    </div>
  );
}

// Ownership Recovery
export function PlatformOwnershipRecovery() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-blue-900">Ownership Recovery</h1>
        <p className="text-gray-600">Manage ownership transfer cases</p>
      </div>
      <div className="p-8">
        <Button className="bg-blue-900 hover:bg-blue-800 text-white mb-6">
          <Plus className="w-4 h-4 mr-2" /> New Recovery Case
        </Button>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600">No active recovery cases</p>
        </div>
      </div>
    </div>
  );
}

// Demo Workspaces
export function PlatformDemoWorkspaces() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-blue-900">Demo Workspaces</h1>
        <p className="text-gray-600">Manage demo and test workspaces</p>
      </div>
      <div className="p-8">
        <Button className="bg-blue-900 hover:bg-blue-800 text-white mb-6">
          <Plus className="w-4 h-4 mr-2" /> Create Demo Workspace
        </Button>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600">2 demo workspaces available</p>
        </div>
      </div>
    </div>
  );
}

// Platform Tasks
export function PlatformTasks() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-blue-900">Platform Tasks</h1>
        <p className="text-gray-600">Internal platform business tasks</p>
      </div>
      <div className="p-8">
        <Button className="bg-blue-900 hover:bg-blue-800 text-white mb-6">
          <Plus className="w-4 h-4 mr-2" /> Create Task
        </Button>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600">No open tasks</p>
        </div>
      </div>
    </div>
  );
}
