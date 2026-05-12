import { useState, useMemo } from "react";
import PageGuide from "@/components/PageGuide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, DollarSign, CheckCircle2, Clock, AlertTriangle, ArrowDownRight, ArrowUpRight } from "lucide-react";

const mockPayments = [
  { id: 1, type: "received", description: "Payment for Invoice #INV-2026-004", amount: 45000, date: "2026-05-08", contract: "IT Services", method: "EFT/ACH", status: "cleared", invoiceRef: "INV-2026-004" },
  { id: 2, type: "received", description: "Payment for Invoice #INV-2026-003", amount: 32500, date: "2026-04-22", contract: "Engineering Support", method: "EFT/ACH", status: "cleared", invoiceRef: "INV-2026-003" },
  { id: 3, type: "sent", description: "Subcontractor payment - ABC Corp", amount: 18000, date: "2026-05-05", contract: "IT Services", method: "Wire Transfer", status: "cleared", invoiceRef: "SUB-001" },
  { id: 4, type: "received", description: "Payment for Invoice #INV-2026-005", amount: 67000, date: "2026-05-12", contract: "IT Services", method: "EFT/ACH", status: "pending", invoiceRef: "INV-2026-005" },
  { id: 5, type: "sent", description: "Vendor payment - XYZ Supplies", amount: 5200, date: "2026-05-10", contract: "Engineering Support", method: "Check", status: "pending", invoiceRef: "VND-042" },
];

const statusColors: Record<string, string> = {
  cleared: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  disputed: "bg-purple-100 text-purple-700",
};

export default function Payments() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return mockPayments.filter((p) => {
      const matchesSearch = !search || p.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || p.type === typeFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, typeFilter, statusFilter]);

  const stats = {
    totalReceived: mockPayments.filter((p) => p.type === "received" && p.status === "cleared").reduce((s, p) => s + p.amount, 0),
    totalSent: mockPayments.filter((p) => p.type === "sent" && p.status === "cleared").reduce((s, p) => s + p.amount, 0),
    pending: mockPayments.filter((p) => p.status === "pending").length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageGuide
        title="Payments"
        description="Track all incoming and outgoing payments separately from invoice management. Monitor payment status, methods, and reconciliation."
        whenToUse="Use to track payment receipts from the government, subcontractor payments, and vendor disbursements."
        whatToDoNext={[
          "Reconcile pending payments with bank records",
          "Follow up on overdue receivables",
          "Process pending subcontractor payments",
          "Match payments to invoices",
        ]}
        relatedRecords={[
          { label: "Finance & Invoicing", path: "/app/finance" },
          { label: "Subcontractors", path: "/app/subcontractors" },
          { label: "Vendors", path: "/app/vendors" },
          { label: "Reports", path: "/app/reports" },
        ]}
        alerts={stats.pending > 0 ? [{ message: `${stats.pending} payment(s) pending clearance`, type: "info" }] : []}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-sm text-slate-500 mt-1">Track incoming and outgoing payments</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <DollarSign className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="p-4"><p className="text-xs text-green-600 uppercase">Received</p><p className="text-2xl font-bold text-green-700">${stats.totalReceived.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-red-600 uppercase">Sent</p><p className="text-2xl font-bold text-red-700">${stats.totalSent.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-amber-600 uppercase">Pending</p><p className="text-2xl font-bold text-amber-700">{stats.pending}</p></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="cleared">Cleared</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Payment</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase hidden md:table-cell">Contract</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase hidden md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {payment.type === "received" ? (
                      <ArrowDownRight className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{payment.description}</p>
                      <p className="text-xs text-slate-500">{payment.method} | Ref: {payment.invoiceRef}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-slate-600">{payment.contract}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={"font-semibold text-sm " + (payment.type === "received" ? "text-green-700" : "text-red-700")}>
                    {payment.type === "received" ? "+" : "-"}${payment.amount.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge className={statusColors[payment.status]}>{payment.status}</Badge>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs text-slate-600">{payment.date}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
