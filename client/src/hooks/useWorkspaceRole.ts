import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

/**
 * Hook to get the current user's workspace role and derived permissions.
 * Returns role, loading state, and permission check helpers.
 */
export function useWorkspaceRole() {
  const { data, isLoading } = trpc.workspace.getMyRole.useQuery(undefined, {
    staleTime: 60_000, // cache for 1 minute
    retry: 1,
  });

  const role = (data?.role ?? "member") as WorkspaceRole;

  const permissions = useMemo(() => ({
    canRead: true,
    canWrite: ["owner", "admin", "member"].includes(role),
    canDelete: ["owner", "admin"].includes(role),
    canManageUsers: role === "owner",
    canManageSettings: role === "owner" || role === "admin",
  }), [role]);

  return {
    role,
    isLoading,
    ...permissions,
  };
}
