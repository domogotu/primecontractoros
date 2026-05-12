import PageGuide from "@/components/PageGuide";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Search, Building2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function Clients() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <PageLayout
      title="Clients"
      subtitle="Manage your government agency clients and contracting relationships"
      label="Relationships"
      summaryCards={[
        { label: "Total Clients", value: 0 },
        { label: "Active", value: 0, color: "text-green-600" },
        { label: "With Contracts", value: 0, color: "text-blue-600" },
        { label: "New This Quarter", value: 0, color: "text-purple-600" },
      ]}
      actions={
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Client
        </Button>
      }
    >
      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search clients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      <Card className="bg-white border border-gray-200 p-12 text-center">
        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Clients Added</h3>
        <p className="text-gray-600 mb-6">Add your first client to start tracking agency relationships and contract history.</p>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Your First Client
        </Button>
      </Card>
    </PageLayout>
  );
}
