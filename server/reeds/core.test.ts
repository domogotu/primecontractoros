import { describe, expect, it } from "vitest";
import { assertTransition, canTransition, createEventEnvelope, sanitizeForModel } from "./core";
import { evaluatePolicy } from "./policy";

describe("Reeds governed core contracts", () => {
  it("creates a canonical event with correlation and content hash", () => {
    const event = createEventEnvelope({ eventType:"test.created", source:{system:"test",channel:"unit",adapter:"v1"}, actor:{actor_type:"owner",actor_id:"1",authenticated:true}, ownerScope:{owner_id:"1",organization_id:"org",project_id:"p"}, classification:{sensitivity:"internal",contains_pii:false,contains_secret:false,retention_class:"test"}, idempotencyKey:"abc", requestedCapability:"test", payload:{x:1} });
    expect(event.event_id).toMatch(/^evt_/); expect(event.correlation_id).toBeTruthy(); expect(event.integrity.content_hash).toHaveLength(64);
  });
  it("rejects invalid lifecycle transitions", () => { expect(canTransition("POLICY_CHECK","AWAITING_APPROVAL")).toBe(true); expect(canTransition("COMPLETE","EXECUTING")).toBe(false); expect(() => assertTransition("COMPLETE","EXECUTING")).toThrow(); });
  it("requires approval for external actions", () => {
    const r = evaluatePolicy({actionId:"a",runId:"r",toolId:"gmail.send",operation:"send",actionClass:"external_message",actorId:"1",ownerId:"1",organizationId:"org",projectId:"p",destination:"x",parameters:{body:"hi"},credentialRef:"gmail_prod",expectedCost:0,reversible:false,requestedAt:new Date().toISOString(),correlationId:"c",causationId:null},{ownerId:"1",organizationId:"org",projectId:"p",actorId:"1",actorType:"owner",authenticated:true,roles:["owner"],permissions:["*"],dataClassifications:["internal"],policySet:"default",budgetRef:null,correlationId:"c"});
    expect(r.decision).toBe("require_approval");
  });
  it("redacts credential-like keys before model use", () => { const x = sanitizeForModel({ api_key:"secret", nested:{password:"pw",safe:"ok"} }) as any; expect(x.api_key).toBe("[REDACTED]"); expect(x.nested.password).toBe("[REDACTED]"); expect(x.nested.safe).toBe("ok"); });
});
