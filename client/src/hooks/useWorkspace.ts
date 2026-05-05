import { createContext, useContext } from "react";
import { trpc } from "@/lib/trpc";

export type WorkspaceData = {
  id: number;
  name: string;
  companyName: string | null;
  contractingModel: string | null;
  naicsCodes: string | null;
  certifications: string | null;
  onboardingCompleted: boolean;
};

type WorkspaceContextType = {
  workspace: WorkspaceData | null;
  workspaceId: number;
  isLoading: boolean;
  refetch: () => void;
};

export const WorkspaceContext = createContext<WorkspaceContextType>({
  workspace: null,
  workspaceId: 0,
  isLoading: true,
  refetch: () => {},
});

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

export function useWorkspaceQuery() {
  const { data, isLoading, refetch } = trpc.workspace.getMyWorkspace.useQuery();
  return {
    workspace: data as WorkspaceData | null,
    workspaceId: data?.id ?? 0,
    isLoading,
    refetch,
  };
}
