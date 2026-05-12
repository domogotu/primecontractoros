// @ts-nocheck
import React, { useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Star,
  Building2,
  Users,
  Clock
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

export default function Vendors() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Mock data for fallback
  const mockVendors = [
    {
      id: "1",
      companyName: "Acme Materials Co.",
      contactName: "John Smith",
      email: "john@acmematerials.com",
      phone: "555-0101",
      category: "Materials",
      status: "Active",
      contracts: 3,
      rating: 4.8,
      lastActivity: "2023-10-25",
      notes: "Reliable supplier for concrete and steel.",
    },
    {
      id: "2",
      companyName: "TechFlow Solutions",
      contactName: "Sarah Jenkins",
      email: "sarah@techflow.io",
      phone: "555-0102",
      category: "Technology",
      status: "Pending",
      contracts: 0,
      rating: 0,
      lastActivity: "2023-10-26",
      notes: "Pending security review.",
    },
    {
      id: "3",
      companyName: "Heavy Lift Equipment",
      contactName: "Mike Davis",
      email: "mike@heavylift.com",
      phone: "555-0103",
      category: "Equipment",
      status: "Inactive",
      contracts: 1,
      rating: 3.5,
      lastActivity: "2023-08-15",
      notes: "Contract expired, do not renew.",
    },
  ];

  // tRPC hooks
  const { data: vendorsData, isLoading } = trpc.vendors.list.useQuery(undefined, {
    initialData: mockVendors,
  });
  
  const createVendor = trpc.vendors.create.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Vendor created successfully" });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create vendor", variant: "destructive" });
    }
  });

  const updateVendor = trpc.vendors.update.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Vendor updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update vendor", variant: "destructive" });
    }
  });

  const vendors = vendorsData || mockVendors;

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vendor.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || vendor.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || vendor.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.status === "Active").length;
  const pendingVendors = vendors.filter(v => v.status === "Pending").length;

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newVendor = {
      companyName: formData.get("companyName") as string,
      contactName: formData.get("contactName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      category: formData.get("category") as string,
      notes: formData.get("notes") as string,
      status: "Pending",
    };
    
    toast({ title: "Feature coming soon", description: "Creating vendor..." });
    setIsAddDialogOpen(false);
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Inactive": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <PageLayout>
      <PageGuide
        title="Vendor Management"
        description="Manage your vendors, track performance, and link contracts."
        whenToUse="Use this page to onboard new vendors, review pending approvals, and monitor vendor performance across all contracts."
        whatToDoNext="Add a new vendor or review pending vendors."
        relatedRecords={["Contracts", "Purchase Orders"]}
        alerts={pendingVendors > 0 ? [{ type: "warning", message: `${pendingVendors} vendors pending review.` }] : []}
      />

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                <h3 className="text-2xl font-bold">{totalVendors}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg dark:bg-green-900/30 dark:text-green-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Vendors</p>
                <h3 className="text-2xl font-bold">{activeVendors}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg dark:bg-yellow-900/30 dark:text-yellow-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <h3 className="text-2xl font-bold">{pendingVendors}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Materials">Materials</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Consulting">Consulting</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Vendor
          </Button>
        </div>

        {/* Data Table (Div-based) */}
        <Card>
          <div className="rounded-md border border-border">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/50 text-sm font-medium text-muted-foreground">
              <div className="col-span-3">Company</div>
              <div className="col-span-2">Contact</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-center">Contracts</div>
              <div className="col-span-1 text-center">Rating</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Body */}
            <div className="divide-y divide-border">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading vendors...</div>
              ) : filteredVendors.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No vendors found.</div>
              ) : (
                filteredVendors.map((vendor) => (
                  <div key={vendor.id} className="flex flex-col">
                    <div 
                      className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => toggleRow(vendor.id)}
                    >
                      <div className="col-span-3 font-medium flex items-center gap-2">
                        {expandedRow === vendor.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        {vendor.companyName}
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">
                        {vendor.contactName}
                      </div>
                      <div className="col-span-2 text-sm">
                        {vendor.category}
                      </div>
                      <div className="col-span-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(vendor.status)}`}>
                          {vendor.status}
                        </span>
                      </div>
                      <div className="col-span-1 text-center text-sm">
                        {vendor.contracts}
                      </div>
                      <div className="col-span-1 flex items-center justify-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {vendor.rating > 0 ? vendor.rating : "-"}
                      </div>
                      <div className="col-span-2 flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toast({ title: "Feature coming soon" }); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); toast({ title: "Feature coming soon" }); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Expanded Detail */}
                    {expandedRow === vendor.id && (
                      <div className="bg-muted/30 p-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Contact Information</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-muted-foreground">Email:</span> {vendor.email}</p>
                            <p><span className="text-muted-foreground">Phone:</span> {vendor.phone}</p>
                            <p><span className="text-muted-foreground">Last Activity:</span> {vendor.lastActivity}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Notes</h4>
                          <p className="text-sm text-muted-foreground">{vendor.notes || "No notes available."}</p>
                          <div className="mt-4 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => toast({ title: "Feature coming soon" })}>
                              View Full Profile
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => toast({ title: "Feature coming soon" })}>
                              Manage Contracts
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Add Vendor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleAddVendor}>
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="companyName" className="text-right">Company</Label>
                <Input id="companyName" name="companyName" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contactName" className="text-right">Contact</Label>
                <Input id="contactName" name="contactName" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input id="phone" name="phone" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <div className="col-span-3">
                  <Select name="category" defaultValue="Materials">
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Materials">Materials</SelectItem>
                      <SelectItem value="Services">Services</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right mt-2">Notes</Label>
                <Textarea id="notes" name="notes" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Vendor</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
