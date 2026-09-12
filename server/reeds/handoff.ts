import { randomUUID } from "node:crypto";
import type { RiskLevel } from "./core";

export interface AgentHandoffPacket {
  handoff_id: string; from_agent: string; to_agent: string; run_id: string; correlation_id: string;
  project_id: string | null; business_area: string; source: string; objective: string;
  known_facts: unknown[]; missing_information: string[]; constraints: string[]; risk_level: RiskLevel;
  approval_required_before: string[]; memory_allowed_to_read: string[]; memory_allowed_to_write: string[];
  allowed_tools: string[]; required_output: string[]; deadline: string | null; owner_decision_needed: string[]; audit_note: string;
}

export function createHandoff(input: Omit<AgentHandoffPacket, "handoff_id">): AgentHandoffPacket {
  return { handoff_id: `handoff_${randomUUID()}`, ...input };
}

export function validateHandoff(packet: AgentHandoffPacket): string[] {
  const errors: string[] = [];
  if (!packet.from_agent || !packet.to_agent) errors.push("from_agent and to_agent are required");
  if (!packet.run_id || !packet.correlation_id) errors.push("run_id and correlation_id are required");
  if (!packet.objective) errors.push("objective is required");
  if (!Array.isArray(packet.allowed_tools)) errors.push("allowed_tools must be an array");
  if (!Array.isArray(packet.memory_allowed_to_read) || !Array.isArray(packet.memory_allowed_to_write)) errors.push("memory permissions must be arrays");
  return errors;
}
