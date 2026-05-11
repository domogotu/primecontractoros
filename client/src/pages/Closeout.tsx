import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, Loader2, Plus } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function Closeout() {
  const params = useParams<{ id: string }>();
  const contractId = parseInt(params.id || "0");
  
  const [newItem, setNewItem] = useState("");

  const { data: closeoutData = null, isLoading, refetch } = trpc.intCloseout.getByContract.useQuery(
    { contractId },
    { enabled: contractId > 0 }
  );

  const initChecklist = trpc.intCloseout.initiate.useMutation({
    onSuccess: () => { refetch(); toast.success("Checklist Created: Standard closeout checklist initialized."); },
  });

  const toggleItem = trpc.intCloseout.toggleItem.useMutation({
    onSuccess: () => refetch(),
  });

  const addItem = trpc.intCloseout.addItem.useMutation({
    onSuccess: () => { refetch(); setNewItem(""); toast.success("Item Added"); },
  });

  if (isLoading) {
    return (
      <PageLayout title="Contract Closeout" subtitle="Checklist-driven closeout workflow" label="Closeout">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  const items = closeoutData?.items || [];
  const completedCount = items.filter((i: any) => i.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <PageLayout
      title="Contract Closeout"
      subtitle={`Contract #${contractId} — Checklist-driven closeout workflow`}
      label="Closeout"
      summaryCards={[
        { label: "Total Items", value: totalCount },
        { label: "Completed", value: completedCount, color: "text-green-600" },
        { label: "Remaining", value: totalCount - completedCount, color: "text-orange-600" },
        { label: "Progress", value: `${progress}%`, color: progress === 100 ? "text-green-600" : "text-blue-600" },
      ]}
      actions={
        totalCount === 0 ? (
          <Button onClick={() => initChecklist.mutate({ contractId })} disabled={initChecklist.isPending}>
            {initChecklist.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Initialize Checklist
          </Button>
        ) : undefined
      }
    >
      {totalCount === 0 ? (
        <Card className="p-8 text-center border border-gray-200">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Closeout Checklist</h3>
          <p className="text-gray-600 mb-4">Initialize a standard closeout checklist to begin the closeout process.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Checklist items */}
          <div className="space-y-2">
            {items.map((item: any) => (
              <Card
                key={item.id}
                className={`p-4 border cursor-pointer transition-colors ${item.completed ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:border-blue-200"}`}
                onClick={() => toggleItem.mutate({ itemId: item.id, completed: !item.completed })}
              >
                <div className="flex items-center gap-3">
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${item.completed ? "text-green-800 line-through" : "text-gray-900"}`}>
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                  {item.completedAt && (
                    <span className="text-xs text-gray-400">
                      {new Date(item.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Add custom item */}
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add custom checklist item..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newItem.trim()) {
                  addItem.mutate({ closeoutId: contractId, label: newItem.trim() });
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => { if (newItem.trim()) addItem.mutate({ closeoutId: contractId, label: newItem.trim() }); }}
              disabled={!newItem.trim() || addItem.isPending}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
