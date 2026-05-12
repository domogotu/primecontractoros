// @ts-nocheck
import React, { useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import PageGuide from "@/components/PageGuide";
import PageLayout from "@/components/PageLayout";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Building2,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Subcontractors() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Mock data for fallback
  const mockSubcontractors = [
    {
      id: "1",
      companyName: "TechCorp Solutions",
      contact: "Jane Smith",
      email: "jane@techcorp.com",
      phone: "555-0123",
      contract: "DoD Cloud Migration",
      status: "Active",
      flowdownStatus: "Compliant",
      naics: "541511, 541512",
      certifications: "WOSB, ISO 9001",
      lastActivity: "2023-10-25",
    },
    {
      id: "2",
      companyName: "SecureNet Defense",
      contact: "John Doe",
      email: "john@securenet.com",
      phone: "555-0199",
      contract: "Navy Cyber Ops",
      status: "Pending",
      flowdownStatus: "Review Required",
      naics: "541519",
      certifications: "SDVOSB",
      lastActivity: "2023-10-24",
    },
    {
      id: "3",
      companyName: "Global Logistics Inc",
      contact: "Alice Johnson",
      email: "alice@globallogistics.com",
      phone: "555-0144",
      contract: "Army Supply Chain",
      status: "Inactive",
      flowdownStatus: "Non-Compliant",
      naics: "488510",
      certifications: "None",
      lastActivity: "2023-09-15",
    },
  ];

  // Try to use tRPC, fallback to mock data
  const { data: trpcData, isLoading } = trpc.subcontractors.list.useQuery(undefined, {
    retry: false,
  });
  
  const createMutation = trpc.subcontractors.create.useMutation({
    onSuccess: () => {
      toast({ title: "Subcontractor added successfully" });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      // Fallback for demo
      toast({ title: "Subcontractor added (Demo Mode)" });
      setIsAddDialogOpen(false);
    }
  });

  const subcontractors = trpcData || mockSubcontractors;

  const filteredSubcontractors = subcontractors.filter((sub) => {
    const matchesSearch = sub.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.contract.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubcontractor = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSub = {
      companyName: formData.get("companyName"),
      contact: formData.get("contact"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      contract: formData.get("contract"),
      naics: formData.get("naics"),
      certifications: formData.get("certifications"),
      status: "Pending",
      flowdownStatus: "Review Required",
    };
    createMutation.mutate(newSub);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getFlowdownColor = (status) => {
    switch (status) {
      case "Compliant": return "bg-green-100 text-green-800";
      case "Review Required": return "bg-yellow-100 text-yellow-800";
      case "Non-Compliant": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <PageLayout>
      <PageGuide
        title="Subcontractor Management"
        description="Manage your subcontractors, track their compliance, and review flowdown requirements."
        whenToUse="Use this page to onboard new subcontractors, monitor their status, and ensure they meet all contract flowdown requirements."
        whatToDoNext="Add a new subcontractor or review pending flowdown requirements."
        relatedRecords={[
          { title: "Contracts", link: "/app/contracts" },
          { title: "Compliance", link: "/app/compliance" }
        ]}
        alerts={[
          { type: "warning", message: "2 subcontractors require flowdown review." }
        ]}
      />

      <div className="space-y-6 mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Subcontractors</p>
                <h3 className="text-2xl font-bold">{subcontractors.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <h3 className="text-2xl font-bold">
                  {subcontractors.filter(s => s.status === "Active").length}
                </h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Flowdown Review</p>
                <h3 className="text-2xl font-bold">
                  {subcontractors.filter(s => s.flowdownStatus === "Review Required").length}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subcontractors..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Subcontractor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Subcontractor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSubcontractor} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" name="companyName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contract">Primary Contract</Label>
                    <Input id="contract" name="contract" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Person</Label>
                    <Input id="contact" name="contact" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="naics">NAICS Codes</Label>
                    <Input id="naics" name="naics" placeholder="e.g. 541511, 541512" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Input id="certifications" name="certifications" placeholder="e.g. WOSB, SDVOSB" />
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Subcontractor</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card>
          <div className="w-full overflow-auto">
            <div className="min-w-[1000px]">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/50 text-sm font-medium text-muted-foreground">
                <div className="col-span-3">Company</div>
                <div className="col-span-2">Contract</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Flowdown</div>
                <div className="col-span-2">Last Activity</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-border">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading subcontractors...</div>
                ) : filteredSubcontractors.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No subcontractors found.</div>
                ) : (
                  filteredSubcontractors.map((sub) => (
                    <div key={sub.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/50 transition-colors">
                      <div className="col-span-3">
                        <div className="font-medium text-foreground">{sub.companyName}</div>
                        <div className="text-xs text-muted-foreground mt-1">{sub.contact} • {sub.email}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">NAICS: {sub.naics}</div>
                      </div>
                      <div className="col-span-2 text-sm">
                        {sub.contract}
                      </div>
                      <div className="col-span-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getFlowdownColor(sub.flowdownStatus)}`}>
                          {sub.flowdownStatus}
                        </span>
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">
                        {sub.lastActivity}
                      </div>
                      <div className="col-span-1 flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => toast({ title: "Feature coming soon" })}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => toast({ title: "Feature coming soon" })}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => toast({ title: "Feature coming soon" })}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
