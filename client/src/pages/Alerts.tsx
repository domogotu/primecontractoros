import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">'"$page"'</h1>
          <p className="text-blue-100">Manage '"$(echo $page | tr '[:upper:]' '[:lower:]')"' for your workspace</p>
        </div>
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 text-center">
          <p className="text-blue-100 mb-4">No '"$(echo $page | tr '[:upper:]' '[:lower:]')"' yet</p>
          <Button className="bg-green-500 hover:bg-green-600">Add '"$page"'</Button>
        </div>
      </div>
    </AppLayout>
  );
}
