import { createHash } from "node:crypto";
import type { ExecutionContext, ReedsAction, RiskLevel } from "./core";

export type PolicyResult = { decision: "allow" | "deny" | "require_approval"; reason: string; policyIds: string[]; actionHash: string; risk: RiskLevel };

const APPROVAL_CLASSES = new Set<ReedsAction["actionClass"]>(["external_message","spending","credential_change","production_change","destructive","physical","emergency"]);

export function actionHash(action: ReedsAction): string {
  const canonical = JSON.stringify({ toolId: action.toolId, operation: action.operation, parameters: action.parameters, destination: action.destination, credentialRef: action.credentialRef, expectedCost: action.expectedCost, ownerId: action.ownerId, organizationId: action.organizationId, projectId: action.projectId });
  return createHash("sha256").update(canonical).digest("hex");
}

export function evaluatePolicy(action: ReedsAction, ctx: ExecutionContext, opts?: { killSwitch?: boolean; maxSpend?: number; allowedTools?: string[] }): PolicyResult {
  const hash = actionHash(action);
  const policyIds: string[] = ["reeds.core.identity_scope.v1"];
  if (opts?.killSwitch) return { decision:"deny", reason:"Kill switch is active; tool execution disabled.", policyIds:[...policyIds,"reeds.emergency.kill_switch.v1"], actionHash:hash, risk:"critical" };
  if (!ctx.authenticated && action.actionClass !== "read") return { decision:"deny", reason:"Unauthenticated actor cannot perform a state-changing action.", policyIds:[...policyIds,"reeds.authenticated_write.v1"], actionHash:hash, risk:"high" };
  if (action.ownerId !== ctx.ownerId || action.organizationId !== ctx.organizationId || action.projectId !== ctx.projectId) return { decision:"deny", reason:"Action scope does not match execution context.", policyIds:[...policyIds,"reeds.scope_match.v1"], actionHash:hash, risk:"critical" };
  if (opts?.allowedTools && !opts.allowedTools.includes(action.toolId)) return { decision:"deny", reason:"Tool is not registered for this execution scope.", policyIds:[...policyIds,"reeds.tool_registry.v1"], actionHash:hash, risk:"high" };
  if (action.credentialRef && !/^[-a-zA-Z0-9_.:]+$/.test(action.credentialRef)) return { decision:"deny", reason:"Invalid credential reference.", policyIds:[...policyIds,"reeds.credential_reference.v1"], actionHash:hash, risk:"critical" };
  if (action.actionClass === "spending" && opts?.maxSpend !== undefined && action.expectedCost > opts.maxSpend) return { decision:"require_approval", reason:"Expected spend exceeds configured automatic limit.", policyIds:[...policyIds,"reeds.spending_limit.v1"], actionHash:hash, risk:"high" };
  if (APPROVAL_CLASSES.has(action.actionClass)) return { decision:"require_approval", reason:`Action class ${action.actionClass} requires deterministic approval handling.`, policyIds:[...policyIds,`reeds.approval.${action.actionClass}.v1`], actionHash:hash, risk: action.actionClass === "physical" || action.actionClass === "emergency" ? "critical" : "high" };
  return { decision:"allow", reason:"Action is within registered low-risk scope.", policyIds:[...policyIds,"reeds.low_risk_allow.v1"], actionHash:hash, risk: action.actionClass === "read" ? "low" : "medium" };
}
