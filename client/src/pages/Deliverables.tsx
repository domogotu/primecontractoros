// @ts-nocheck
import React, { useState } from "react";
import { Link, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import GuidanceQuestionPanel from "@/components/GuidanceQuestionPanel";
import TrainingWalkthrough from "@/components/TrainingWalkthrough";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  Plus,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  MoreVertical,
  Calendar,
  User,
  Briefcase
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

export default function Deliverables() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const contractIdParam = urlParams.get("contractId") ? parseInt(urlParams.get("contractId")!) : undefined;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  const [updateAction, setUpdateAction] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contractId: "",
    dueDate: "",
    assignedTo: "",
    acceptanceCriteria: "",
  });

  // Queries
  const { data: deliverablesData, isLoading, refetch } = trpc.deliverables.list.useQuery(
    contractIdParam ? { contractId: contractIdParam } : undefined
  );
  const createMutation = trpc.deliverables.create.useMutation({
    onSuccess: () => {
      toast({ title: "Deliverable created successfully" });
      setIsAddDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({ title: "Error creating deliverable", description: error.message, variant: "destructive" });
    }
  });
  const updateMutation = trpc.deliverables.update.useMutation({
    onSuccess: () => {
      toast({ title: "Deliverable updated successfully" });
      setIsUpdateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({ title: "Error updating deliverable", description: error.message, variant: "destructive" });
    }
  });

  const deliverables = deliverablesData || [];

  // Filtering
  const filteredDeliverables = deliverables.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.contract.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: deliverables.length,
    onTrack: deliverables.filter(d => ["Not Started", "In Progress"].includes(d.status)).length,
    atRisk: deliverables.filter(d => d.status === "Rejected").length,
    overdue: deliverables.filter(d => d.status === "Overdue").length,
    completed: deliverables.filter(d => d.status === "Accepted").length,
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Accepted":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Accepted</span>;
      case "Submitted":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Submitted</span>;
      case "In Progress":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">In Progress</span>;
      case "Overdue":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Overdue</span>;
      case "Rejected":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleUpdateStatus = () => {
    if (selectedDeliverable) {
      updateMutation.mutate({
        id: selectedDeliverable.id,
        status: updateAction === "Accept" ? "Accepted" : updateAction === "Reject" ? "Rejected" : "Submitted",
        reason: updateAction === "Reject" ? rejectReason : undefined
      });
    }
  };

  const openUpdateDialog = (deliverable, action) => {
    setSelectedDeliverable(deliverable);
    setUpdateAction(action);
    setRejectReason("");
    setIsUpdateDialogOpen(true);
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <PageGuide
          title="Deliverables Tracker"
          description="Track contract deliverables with status, due dates, and submissions."
          whenToUse="Use this page to monitor upcoming deadlines, review submitted deliverables, and manage the acceptance process."
          whatToDoNext={["Review overdue items, process submitted deliverables, or add new requirements."]}
          relatedRecords={[{ label: "Contracts", path: "/app/contracts" }, { label: "Requirements", path: "/app/requirements" }, { label: "Files", path: "/app/files" }]}
          alerts={stats.overdue > 0 ? [{ type: "warning", message: `You have ${stats.overdue} overdue deliverables requiring immediate attention.` }] : []}
        />

        {/* Guidance Question Panel */}
        <GuidanceQuestionPanel pageContext="deliverables" />

        {/* Training Walkthrough */}
        <TrainingWalkthrough pageContext="deliverables" />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <FileText className="h-8 w-8 text-blue-500 mb-2" />
              <p className="text-sm text-muted-foreground font-medium">Total</p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <Clock className="h-8 w-8 text-yellow-500 mb-2" />
              <p className="text-sm text-muted-foreground font-medium">On Track</p>
              <h3 className="text-2xl font-bold">{stats.onTrack}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <AlertTriangle className="h-8 w-8 text-orange-500 mb-2" />
              <p className="text-sm text-muted-foreground font-medium">At Risk</p>
              <h3 className="text-2xl font-bold">{stats.atRisk}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <XCircle className="h-8 w-8 text-red-500 mb-2" />
              <p className="text-sm text-muted-foreground font-medium">Overdue</p>
              <h3 className="text-2xl font-bold">{stats.overdue}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground font-medium">Completed</p>
              <h3 className="text-2xl font-bold">{stats.completed}</h3>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deliverables or contracts..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Deliverable
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Deliverables List</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-md border border-border">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/50 font-medium text-sm text-muted-foreground">
                <div className="col-span-3">Title</div>
                <div className="col-span-2">Contract</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Assigned To</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-border">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading deliverables...</div>
                ) : filteredDeliverables.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No deliverables found matching your criteria.</div>
                ) : (
                  filteredDeliverables.map((deliverable) => (
                    <div key={deliverable.id} className={`grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-muted/50 transition-colors ${deliverable.status === 'Overdue' ? 'bg-red-50/5 dark:bg-red-950/10' : ''}`}>
                      <div className="col-span-3 font-medium">
                        <div className="flex flex-col">
                          <span className={deliverable.status === 'Overdue' ? 'text-red-600 dark:text-red-400' : ''}>{deliverable.title}</span>
                          <span className="text-xs text-muted-foreground">{deliverable.id}</span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <Link href={`/app/contracts/${deliverable.contract}`} className="text-blue-600 hover:underline flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {deliverable.contract}
                        </Link>
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className={deliverable.status === 'Overdue' ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                          {deliverable.dueDate}
                        </span>
                      </div>
                      <div className="col-span-2">
                        {getStatusBadge(deliverable.status)}
                        {deliverable.submissionDate && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Submitted: {deliverable.submissionDate}
                          </div>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {deliverable.assignedTo}
                      </div>
                      <div className="col-span-1 flex justify-end gap-2">
                        {deliverable.status === "In Progress" && (
                          <Button variant="outline" size="sm" onClick={() => openUpdateDialog(deliverable, "Submit")}>
                            Submit
                          </Button>
                        )}
                        {deliverable.status === "Submitted" && (
                          <>
                            <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => openUpdateDialog(deliverable, "Accept")}>
                              Accept
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => openUpdateDialog(deliverable, "Reject")}>
                              Reject
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => openUpdateDialog(deliverable, "Update")}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Deliverable Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Deliverable</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract">Contract</Label>
                  <Select value={formData.contractId} onValueChange={(val) => setFormData({...formData, contractId: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CON-2024-001">CON-2024-001</SelectItem>
                      <SelectItem value="CON-2024-002">CON-2024-002</SelectItem>
                      <SelectItem value="CON-2024-003">CON-2024-003</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input 
                    id="dueDate" 
                    type="date" 
                    value={formData.dueDate} 
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input 
                  id="assignedTo" 
                  value={formData.assignedTo} 
                  onChange={(e) => setFormData({...formData, assignedTo: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acceptanceCriteria">Acceptance Criteria</Label>
                <Textarea 
                  id="acceptanceCriteria" 
                  value={formData.acceptanceCriteria} 
                  onChange={(e) => setFormData({...formData, acceptanceCriteria: e.target.value})} 
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Deliverable</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{updateAction} Deliverable</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to {updateAction.toLowerCase()} <strong>{selectedDeliverable?.title}</strong>?
              </p>
              
              {updateAction === "Reject" && (
                <div className="space-y-2">
                  <Label htmlFor="rejectReason">Reason for Rejection</Label>
                  <Textarea 
                    id="rejectReason" 
                    placeholder="Please provide details on why this deliverable is being rejected..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
              <Button 
                variant={updateAction === "Reject" ? "destructive" : "default"}
                onClick={handleUpdateStatus}
                disabled={updateAction === "Reject" && !rejectReason.trim()}
              >
                Confirm {updateAction}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
