import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Receipt, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import PageLayout from "@/components/PageLayout";

export default function Finance() {
  const [, navigate] = useLocation();

  return (
    <PageLayout
      title="Finance Summary"
      subtitle="Overview of revenue, expenses, invoicing, and cash flow across all contracts"
      label="Finance"
      summaryCards={[
        { label: "Total Revenue", value: "$0", color: "text-green-600" },
        { label: "Outstanding", value: "$0", color: "text-amber-600" },
        { label: "This Month", value: "$0", color: "text-blue-600" },
        { label: "Overdue", value: "$0", color: "text-red-600" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-4">
        <Card onClick={() => navigate("/app/invoices")} className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <Receipt className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Invoices</h3>
          </div>
          <p className="text-sm text-gray-600">Create, submit, and track invoices for your contracts.</p>
        </Card>

        <Card onClick={() => navigate("/app/payments")} className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <CreditCard className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-gray-900">Payments</h3>
          </div>
          <p className="text-sm text-gray-600">Track received payments and reconcile against invoices.</p>
        </Card>

        <Card className="bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Cash Flow</h3>
          </div>
          <p className="text-sm text-gray-600">Monitor cash flow trends and forecast future revenue.</p>
        </Card>

        <Card className="bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-6 h-6 text-amber-600" />
            <h3 className="font-semibold text-gray-900">Budget Tracking</h3>
          </div>
          <p className="text-sm text-gray-600">Track spending against contract budgets and CLINs.</p>
        </Card>
      </div>
    </PageLayout>
  );
}
