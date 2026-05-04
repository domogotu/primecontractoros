import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Search, CheckSquare, Loader2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <PageLayout
      title="Tasks"
      subtitle="Track action items, assignments, and workflow steps across all contracts"
      label="Workflow"
      summaryCards={[
        { label: "Total Tasks", value: 0 },
        { label: "In Progress", value: 0, color: "text-blue-600" },
        { label: "Due This Week", value: 0, color: "text-amber-600" },
        { label: "Completed", value: 0, color: "text-green-600" },
      ]}
      actions={
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Task
        </Button>
      }
    >
      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      <Card className="bg-white border border-gray-200 p-12 text-center">
        <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Tasks Created</h3>
        <p className="text-gray-600 mb-6">Create tasks to track action items and assignments across your contracts and proposals.</p>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create Your First Task
        </Button>
      </Card>
    </PageLayout>
  );
}
