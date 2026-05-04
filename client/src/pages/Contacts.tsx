import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Search, UserCircle } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function Contacts() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <PageLayout
      title="Contacts"
      subtitle="Manage contacts for government agencies, contracting officers, and team members"
      label="People"
      summaryCards={[
        { label: "Total Contacts", value: 0 },
        { label: "Government", value: 0, color: "text-blue-600" },
        { label: "Internal", value: 0, color: "text-green-600" },
        { label: "Subcontractors", value: 0, color: "text-purple-600" },
      ]}
      actions={
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Contact
        </Button>
      }
    >
      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search contacts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      <Card className="bg-white border border-gray-200 p-12 text-center">
        <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Contacts Added</h3>
        <p className="text-gray-600 mb-6">Add contacts to track relationships with contracting officers, agency representatives, and team members.</p>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Your First Contact
        </Button>
      </Card>
    </PageLayout>
  );
}
