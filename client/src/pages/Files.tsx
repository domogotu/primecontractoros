import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Search, FolderOpen, Upload } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function Files() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <PageLayout
      title="Files"
      subtitle="Manage documents, attachments, and source files across all contracts and proposals"
      label="Documents"
      summaryCards={[
        { label: "Total Files", value: 0 },
        { label: "Contracts", value: 0, color: "text-blue-600" },
        { label: "Proposals", value: 0, color: "text-green-600" },
        { label: "Recent Uploads", value: 0, color: "text-purple-600" },
      ]}
      actions={
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Upload className="w-4 h-4 mr-2" /> Upload File
        </Button>
      }
    >
      <Card className="bg-white border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search files..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      <Card className="bg-white border border-gray-200 p-12 text-center">
        <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Files Uploaded</h3>
        <p className="text-gray-600 mb-6">Upload contract documents, proposals, and supporting files to keep everything organized in one place.</p>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Upload className="w-4 h-4 mr-2" /> Upload Your First File
        </Button>
      </Card>
    </PageLayout>
  );
}
