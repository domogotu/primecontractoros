import PageLayout from "@/components/PageLayout";
import { useRoute } from "wouter";

export default function PaymentDetail() {
  const [, params] = useRoute("/app/payments/:id");
  
  return (
    <PageLayout title="Details" subtitle="Record details">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Details</h1>
          <p className="text-blue-100">Payment ID: {params?.id}</p>
        </div>
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8">
          <p className="text-blue-100">Payment details will be displayed here</p>
        </div>
      </div>
    </PageLayout>
  );
}
