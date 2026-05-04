import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Users as UsersIcon, Shield } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function Users() {
  return (
    <PageLayout
      title="Users"
      subtitle="Manage workspace members, roles, and access permissions"
      label="Team"
      summaryCards={[
        { label: "Total Users", value: 1 },
        { label: "Admins", value: 1, color: "text-purple-600" },
        { label: "Members", value: 0, color: "text-blue-600" },
        { label: "Pending Invites", value: 0, color: "text-amber-600" },
      ]}
      actions={
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Invite User
        </Button>
      }
    >
      <Card className="bg-white border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Workspace Owner</h3>
              <p className="text-sm text-gray-600">Admin access to all features</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Admin</span>
        </div>
      </Card>

      <Card className="bg-white border border-gray-200 p-12 text-center">
        <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Invite Team Members</h3>
        <p className="text-gray-600 mb-6">Add team members to collaborate on contracts, proposals, and deliverables.</p>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Send Invitation
        </Button>
      </Card>
    </PageLayout>
  );
}
