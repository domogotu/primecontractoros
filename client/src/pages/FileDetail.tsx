import AppLayout from "@/components/AppLayout";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";

export default function FileDetail() {
  const [, params] = useRoute("/app/files/:id");
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">File Details</h1>
          <p className="text-blue-100">File ID: {params?.id}</p>
        </div>
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8">
          <p className="text-blue-100 mb-4">File content will be displayed here</p>
          <Button variant="outline" className="border-white text-white">Download</Button>
        </div>
      </div>
    </AppLayout>
  );
}
