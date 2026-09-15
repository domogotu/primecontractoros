// @ts-nocheck
import { useAuth } from "@/_core/hooks/useAuth";
import { Shield } from "lucide-react";
import { isPlatformOwner } from "@/lib/platformOwner";

export default function AdminBadge() {
  const { user } = useAuth();
  if (!isPlatformOwner(user)) return null;
  return (
    <div className="fixed top-2 right-2 z-[100] flex items-center gap-1.5 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
      <Shield className="h-3 w-3" /><span>Platform Owner</span>
    </div>
  );
}
