// @ts-nocheck
import React, { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import PageGuide from "@/components/PageGuide";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  Clock, 
  Paperclip,
  Download,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function InvoiceDetail() {
  const [, params] = useRoute("/app/invoices/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const invoiceId = params?.id || "INV-0000";

  // Demo data fallback
  const demoInvoice = {
    id: invoiceId,
    number: "INV-2023-042",
    amount: 45000.00,
    status: "Submitted",
    contractId: "CON-9921",
    contractName: "Cloud Migration Services",
    issueDate: "2023-10-15",
    dueDate: "2023-11-14",
    agency: "Department of Defense",
    notes: "Monthly billing for phase 2 cloud migration.",
    lineItems: [
      { id: 1, description: "Senior Cloud Architect", quantity: 160, rate: 150, amount: 24000 },
      { id: 2, description: "DevOps Engineer", quantity: 120, rate: 125, amount: 15000 },
      { id: 3, description: "Server Infrastructure (AWS)", quantity: 1, rate: 6000, amount: 6000 }
    ],
    supportFiles: [
      { id: 1, name: "timesheets_oct.pdf", size: "2.4 MB", date: "2023-10-15" },
      { id: 2, name: "aws_billing_report.csv", size: "1.1 MB", date: "2023-10-14" }
    ],
    payments: [
      { id: 1, date: "2023-10-20", amount: 10000, reference: "ACH-99281", status: "Cleared" }
    ],
    history: [
      { id: 1, date: "2023-10-15 09:00 AM", action: "Invoice Created", user: "Jane Doe" },
      { id: 2, date: "2023-10-15 10:30 AM", action: "Status changed to Submitted", user: "Jane Doe" },
      { id: 3, date: "2023-10-20 02:15 PM", action: "Partial Payment Applied", user: "System" }
    ]
  };

  // Try to use tRPC, fallback to demo data
  const { data: invoices } = trpc.invoices.list.useQuery(undefined, {
    enabled: false // Disable auto-fetch for demo
  });
  
  const invoice = invoices?.find(i => i.id === invoiceId) || demoInvoice;

  const [status, setStatus] = useState(invoice.status);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleAction = (actionName: string) => {
    toast({
      title: "Action Triggered",
      description: `Feature coming soon: ${actionName}`,
    });
  };

  const updateStatus = (newStatus: string) => {
    setStatus(newStatus);
    toast({
      title: "Status Updated",
      description: `Invoice status changed to ${newStatus}`,
    });
  };

  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'paid': return 'green';
      case 'submitted': return 'blue';
      case 'partially paid': return 'yellow';
      case 'overdue': return 'red';
      case 'disputed': return 'orange';
      case 'draft': return 'gray';
      case 'archived': return 'slate';
      default: return 'gray';
    }
  };

  const statusColor = getStatusColor(status);

  return (
    <PageLayout>
      <div className="space-y-6 pb-10">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/app/invoices")} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>
        </div>

        <PageGuide
          title="Invoice Detail"
          description={`Viewing details for invoice ${invoice.number}. Manage status, support files, and payments.`}
          whenToUse="Use this page to review invoice details, attach required documentation, and track payment status."
          whatToDoNext="Review line items, attach timesheets if needed, and submit to the agency."
          relatedRecords={[
            { title: "Contract", link: `/app/contracts/${invoice.contractId}` },
            { title: "Agency", link: `/app/agencies/1` }
          ]}
        />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-6 rounded-lg">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{invoice.number}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
                {status}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Contract: <Link href={`/app/contracts/${invoice.contractId}`} className="text-primary hover:underline">{invoice.contractName}</Link>
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">
              ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-muted-foreground text-sm">Total Amount</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => updateStatus("Submitted")} variant={status === "Submitted" ? "secondary" : "outline"}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Submitted
          </Button>
          <Button onClick={() => updateStatus("Disputed")} variant={status === "Disputed" ? "secondary" : "outline"}>
            <AlertCircle className="w-4 h-4 mr-2" />
            Mark Disputed
          </Button>
          <Button onClick={() => handleAction("Apply Payment")} className="bg-primary text-primary-foreground">
            <DollarSign className="w-4 h-4 mr-2" />
            Apply Payment
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Invoice Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Issue Date</p>
                    <p className="font-medium text-foreground">{invoice.issueDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                    <p className="font-medium text-foreground">{invoice.dueDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Agency</p>
                    <p className="font-medium text-foreground">{invoice.agency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="font-medium text-foreground">{invoice.notes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-md overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-right">Qty</div>
                    <div className="col-span-2 text-right">Rate</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                  <div className="divide-y divide-border">
                    {invoice.lineItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 p-3 text-sm text-foreground items-center">
                        <div className="col-span-6 font-medium">{item.description}</div>
                        <div className="col-span-2 text-right">{item.quantity}</div>
                        <div className="col-span-2 text-right">${item.rate.toLocaleString()}</div>
                        <div className="col-span-2 text-right font-medium">${item.amount.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-12 gap-4 p-3 bg-muted/20 border-t border-border text-sm font-bold text-foreground">
                    <div className="col-span-10 text-right">Total</div>
                    <div className="col-span-2 text-right">${invoice.amount.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payments */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Linked Payments</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleAction("View All Payments")}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {invoice.payments.length > 0 ? (
                  <div className="border border-border rounded-md overflow-hidden">
                    <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
                      <div>Date</div>
                      <div>Reference</div>
                      <div>Status</div>
                      <div className="text-right">Amount</div>
                    </div>
                    <div className="divide-y divide-border">
                      {invoice.payments.map((payment) => (
                        <div key={payment.id} className="grid grid-cols-4 gap-4 p-3 text-sm text-foreground items-center">
                          <div>{payment.date}</div>
                          <div>{payment.reference}</div>
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {payment.status}
                            </span>
                          </div>
                          <div className="text-right font-medium">${payment.amount.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No payments linked to this invoice yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Support Files */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Support Files</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsUploadOpen(true)}>
                  <Upload className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoice.supportFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border border-border rounded-md bg-muted/10">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="truncate">
                          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size} • {file.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAction("Download File")}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleAction("Delete File")}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {invoice.supportFiles.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No support files attached.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* History Timeline */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {invoice.history.map((event, index) => (
                    <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full border border-primary bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"></div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-border bg-card shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm text-foreground">{event.action}</div>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.date} • {event.user}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Upload Support File</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">File</Label>
              <Input id="file" type="file" className="bg-background border-border" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" placeholder="e.g., Timesheets for October" className="bg-background border-border" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              handleAction("Upload File");
              setIsUploadOpen(false);
            }}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
