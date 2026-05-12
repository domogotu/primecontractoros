// @ts-nocheck
import React, { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PageLayout from "@/components/PageLayout";
import PageGuide from "@/components/PageGuide";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  FileText,
  Upload,
  Link as LinkIcon,
  Plus,
  Clock,
  DollarSign,
  CreditCard,
  Hash,
  Calendar,
  MoreHorizontal,
  File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function PaymentDetail() {
  const [, params] = useRoute("/app/payments/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const paymentId = params?.id || "1";

  // Demo data for payment
  const payment = {
    id: paymentId,
    amount: 125000.00,
    dateReceived: "2024-03-15",
    method: "Wire Transfer",
    referenceNumber: "WT-992837465",
    status: "Partially Matched",
    contractId: "C-2024-001",
    contractName: "DoD Cloud Infrastructure Upgrade",
    payer: "Department of Defense",
    notes: "Payment received for initial milestone. Needs matching with invoice INV-2024-001.",
    unmatchedAmount: 25000.00,
  };

  const matchedInvoices = [
    { id: "INV-2024-001", amount: 100000.00, date: "2024-03-01", status: "Paid" }
  ];

  const supportFiles = [
    { id: "1", name: "Wire_Transfer_Receipt.pdf", size: "1.2 MB", date: "2024-03-15" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Matched": return "bg-green-100 text-green-800";
      case "Partially Matched": return "bg-yellow-100 text-yellow-800";
      case "Unmatched": return "bg-red-100 text-red-800";
      case "Needs Review": return "bg-orange-100 text-orange-800";
      case "Recorded": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAction = (action: string) => {
    toast({
      title: "Action triggered",
      description: `${action} feature coming soon.`,
    });
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/app/payments")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>
        </div>

        <PageGuide
          title={`Payment Detail: ${payment.referenceNumber}`}
          description="Review payment details, match to invoices, and manage supporting documentation."
          whenToUse="Use this page to reconcile received payments with outstanding invoices."
          whatToDoNext={[
            "Match remaining amount to invoices",
            "Upload additional receipt documentation",
            "Update payment status"
          ]}
          relatedRecords={[
            { title: "Contract", link: `/app/contracts/${payment.contractId}` },
            { title: "Invoices", link: "/app/invoices" }
          ]}
          alerts={
            payment.status === "Partially Matched" 
              ? [{ type: "warning", message: `There is an unmatched amount of $${payment.unmatchedAmount.toLocaleString()}.` }]
              : []
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Payment Information</CardTitle>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                  {payment.status}
                </span>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" /> Amount
                    </p>
                    <p className="text-2xl font-bold">${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-1" /> Date Received
                    </p>
                    <p className="text-lg font-medium">{payment.dateReceived}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <CreditCard className="h-4 w-4 mr-1" /> Method
                    </p>
                    <p className="font-medium">{payment.method}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Hash className="h-4 w-4 mr-1" /> Reference Number
                    </p>
                    <p className="font-medium">{payment.referenceNumber}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-muted-foreground">Payer</p>
                    <p className="font-medium">{payment.payer}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-muted-foreground">Related Contract</p>
                    <Link href={`/app/contracts/${payment.contractId}`}>
                      <a className="text-primary hover:underline flex items-center font-medium">
                        <LinkIcon className="h-4 w-4 mr-1" />
                        {payment.contractId} - {payment.contractName}
                      </a>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Invoice Matching</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" /> Match to Invoice
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Match Payment to Invoice</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Select Invoice</Label>
                        <Input placeholder="Search invoices..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount to Apply</Label>
                        <Input type="number" defaultValue={payment.unmatchedAmount} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => handleAction("Cancel Match")}>Cancel</Button>
                      <Button onClick={() => handleAction("Apply Match")}>Apply Match</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border">
                    <span className="text-sm font-medium">Unmatched Amount:</span>
                    <span className="text-lg font-bold text-yellow-600">${payment.unmatchedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="border border-border rounded-md overflow-hidden">
                    <div className="grid grid-cols-4 bg-muted p-3 text-sm font-medium text-muted-foreground">
                      <div>Invoice ID</div>
                      <div>Date</div>
                      <div>Status</div>
                      <div className="text-right">Amount Applied</div>
                    </div>
                    <div className="divide-y divide-border">
                      {matchedInvoices.map((inv) => (
                        <div key={inv.id} className="grid grid-cols-4 p-3 text-sm items-center hover:bg-muted/50">
                          <div className="font-medium text-primary cursor-pointer" onClick={() => setLocation(`/app/invoices/${inv.id}`)}>
                            {inv.id}
                          </div>
                          <div>{inv.date}</div>
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {inv.status}
                            </span>
                          </div>
                          <div className="text-right font-medium">
                            ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      ))}
                      {matchedInvoices.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          No invoices matched yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions & Files */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline" onClick={() => handleAction("Mark Needs Review")}>
                  <AlertCircle className="h-4 w-4 mr-2" /> Mark Needs Review
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleAction("Confirm Match")}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Confirm Match
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleAction("Edit Payment")}>
                  <FileText className="h-4 w-4 mr-2" /> Edit Details
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Receipts & Files</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => handleAction("Upload File")}>
                  <Upload className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {supportFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 border border-border rounded-md hover:bg-muted/50">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <File className="h-8 w-8 text-blue-500 flex-shrink-0" />
                        <div className="truncate">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size} • {file.date}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleAction("Download File")}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">{payment.notes}</p>
                  <div className="space-y-2">
                    <Label>Add Note</Label>
                    <Textarea placeholder="Type your note here..." />
                    <Button size="sm" onClick={() => handleAction("Save Note")}>Save Note</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
