import PageLayout from "@/components/PageLayout";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";

export default function ContactDetail() {
  const [, params] = useRoute("/app/contacts/:id");
  
  return (
    <PageLayout title="Details" subtitle="Record details">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Contact Details</h1>
          <p className="text-blue-100">Contact ID: {params?.id}</p>
        </div>
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8">
          <p className="text-blue-100 mb-4">Contact information will be displayed here</p>
          <Button className="bg-green-500 hover:bg-green-600">Edit Contact</Button>
        </div>
      </div>
    </PageLayout>
  );
}
