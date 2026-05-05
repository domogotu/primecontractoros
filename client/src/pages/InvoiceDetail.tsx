import PageLayout from "@/components/PageLayout";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";

export default function InvoiceDetail() {
  const [, params] = useRoute("/app/invoices/:id");
  
  return (
    <PageLayout title="Details" subtitle="Record details">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Invoice Details</h1>
          <p className="text-blue-100">Invoice ID: {params?.id}</p>
        </div>
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8">
          <p className="text-blue-100 mb-4">Invoice details will be displayed here</p>
          <Button variant="outline" className="border-white text-white">Download PDF</Button>
        </div>
      </div>
    </PageLayout>
  );
}
