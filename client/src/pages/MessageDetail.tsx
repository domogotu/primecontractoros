import AppLayout from "@/components/AppLayout";
import { useRoute } from "wouter";

export default function MessageDetail() {
  const [, params] = useRoute("/app/messages/:id");
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Message</h1>
          <p className="text-blue-100">Message ID: {params?.id}</p>
        </div>
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8">
          <p className="text-blue-100">Message content will be displayed here</p>
        </div>
      </div>
    </AppLayout>
  );
}
