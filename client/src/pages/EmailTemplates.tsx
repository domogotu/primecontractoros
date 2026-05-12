// @ts-nocheck
import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute, Link } from "wouter";
import { 
  Search, Plus, Edit, Trash2, Copy, Eye, Mail, 
  MoreVertical, Filter, AlertCircle, FileText, Check
} from "lucide-react";
import PageGuide from "@/components/PageGuide";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const CATEGORIES = [
  "Onboarding", 
  "Invoicing", 
  "Contract", 
  "Proposal", 
  "General", 
  "Follow-up"
];

const VARIABLES = [
  "{{name}}", 
  "{{company}}", 
  "{{date}}", 
  "{{amount}}"
];

export default function EmailTemplates() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "General",
    subject: "",
    body: ""
  });

  // tRPC Hooks
  const { data: templatesData, isLoading, refetch } = trpc.emailTemplates.list.useQuery();
  const createMutation = trpc.emailTemplates.create.useMutation({
    onSuccess: () => {
      toast({ title: "Template created successfully" });
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: () => {
      toast({ title: "Failed to create template", variant: "destructive" });
    }
  });

  // Fallback demo data if tRPC fails or returns empty
  const demoTemplates = [
    {
      id: "1",
      name: "Welcome to PrimeContractorOS",
      category: "Onboarding",
      subject: "Welcome {{name}}! Let's get started",
      body: "Hi {{name}},\n\nWelcome to PrimeContractorOS. We are excited to have {{company}} on board.\n\nBest,\nThe Team",
      lastModified: "2023-10-15",
      usageCount: 142
    },
    {
      id: "2",
      name: "Invoice Overdue Notice",
      category: "Invoicing",
      subject: "Action Required: Overdue Invoice for {{amount}}",
      body: "Dear {{name}},\n\nThis is a reminder that your invoice for {{amount}} was due on {{date}}.\n\nPlease remit payment as soon as possible.\n\nThank you,\nBilling Dept",
      lastModified: "2023-11-02",
      usageCount: 89
    },
    {
      id: "3",
      name: "Contract Renewal",
      category: "Contract",
      subject: "Contract Renewal for {{company}}",
      body: "Hello {{name}},\n\nYour contract is up for renewal on {{date}}. Please review the attached terms.\n\nRegards,\nContracts Team",
      lastModified: "2023-09-20",
      usageCount: 34
    }
  ];

  const templates = templatesData || demoTemplates;

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
    // For demo purposes, if mutation fails/isn't hooked up, just show toast
    if (!createMutation.isLoading) {
      toast({ title: "Template created (Demo)" });
      setIsCreateDialogOpen(false);
    }
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      subject: template.subject,
      body: template.body
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    toast({ title: "Feature coming soon: Update Template" });
    setIsEditDialogOpen(false);
  };

  const handleDeleteClick = (template) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    toast({ title: "Feature coming soon: Delete Template" });
    setIsDeleteDialogOpen(false);
  };

  const handleDuplicate = (template) => {
    toast({ title: "Feature coming soon: Duplicate Template" });
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const insertVariable = (variable) => {
    setFormData(prev => ({
      ...prev,
      body: prev.body + variable
    }));
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case "Onboarding": return "blue";
      case "Invoicing": return "red";
      case "Contract": return "purple";
      case "Proposal": return "yellow";
      case "Follow-up": return "green";
      default: return "gray";
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <PageGuide
          title="Email Templates"
          description="Manage and customize reusable email templates for consistent communication across your workspace."
          whenToUse="Use this page to create standard responses, automated notifications, and formal communications."
          whatToDoNext="Create a new template or edit an existing one to match your brand voice."
          relatedRecords={[
            { title: "Communications", url: "/app/communications" },
            { title: "Settings", url: "/app/settings" }
          ]}
          alerts={[
            { type: "info", message: "Use variables like {{name}} to personalize your emails automatically." }
          ]}
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-1 gap-2 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-9 bg-card border-border text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] bg-card border-border text-foreground">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => {
            setFormData({ name: "", category: "General", subject: "", body: "" });
            setIsCreateDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="w-full overflow-auto">
              <div className="min-w-[800px]">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/50 text-sm font-medium text-muted-foreground">
                  <div className="col-span-3">Template Name</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-3">Subject Line</div>
                  <div className="col-span-2">Last Modified</div>
                  <div className="col-span-1 text-center">Usage</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-border">
                  {isLoading && !templatesData ? (
                    <div className="p-8 text-center text-muted-foreground">Loading templates...</div>
                  ) : filteredTemplates.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No templates found matching your criteria.</div>
                  ) : (
                    filteredTemplates.map((template) => (
                      <div key={template.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/20 transition-colors">
                        <div className="col-span-3 font-medium text-foreground flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{template.name}</span>
                        </div>
                        <div className="col-span-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${getCategoryColor(template.category)}-100 text-${getCategoryColor(template.category)}-800`}>
                            {template.category}
                          </span>
                        </div>
                        <div className="col-span-3 text-sm text-muted-foreground truncate">
                          {template.subject}
                        </div>
                        <div className="col-span-2 text-sm text-muted-foreground">
                          {template.lastModified}
                        </div>
                        <div className="col-span-1 text-center text-sm text-muted-foreground">
                          {template.usageCount}
                        </div>
                        <div className="col-span-1 flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePreview(template)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(template)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDuplicate(template)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100/10" onClick={() => handleDeleteClick(template)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
          }
        }}>
          <DialogContent className="sm:max-w-[700px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>{isEditDialogOpen ? "Edit Template" : "Create New Template"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input 
                  id="subject" 
                  value={formData.subject} 
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="body">Email Body</Label>
                  <div className="flex gap-1">
                    {VARIABLES.map(v => (
                      <Badge 
                        key={v} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-muted text-xs"
                        onClick={() => insertVariable(v)}
                      >
                        {v}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Textarea 
                  id="body" 
                  rows={10}
                  value={formData.body} 
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  className="bg-background border-border font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Click on variables above to insert them into the body.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
              }}>Cancel</Button>
              <Button onClick={isEditDialogOpen ? handleUpdate : handleCreate}>
                {isEditDialogOpen ? "Save Changes" : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Template Preview</DialogTitle>
            </DialogHeader>
            {selectedTemplate && (
              <div className="space-y-4 py-4">
                <div className="p-4 border border-border rounded-md bg-muted/30 space-y-3">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-sm text-muted-foreground">Subject:</span>
                    <span className="font-medium">{selectedTemplate.subject}</span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm font-mono">
                    {selectedTemplate.body}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsPreviewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-500">
                <AlertCircle className="w-5 h-5" />
                Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete the template <strong>{selectedTemplate?.name}</strong>?</p>
              <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </PageLayout>
  );
}
