#!/usr/bin/env python3
"""
Patch entityRouters.ts to add:
1. RBAC enforcement (requireWrite/requireDelete instead of getWorkspaceId in mutations)
2. Audit logging (logAudit calls in every mutation)
"""
import re

filepath = "server/entityRouters.ts"

with open(filepath, "r") as f:
    content = f.read()

# 1. Add imports
old_import = 'import { requireWorkspaceId } from "./workspaceMiddleware";'
new_import = '''import { requireWorkspaceId } from "./workspaceMiddleware";
import { enforcePermission } from "./rbacMiddleware";
import { logAudit } from "./featureRouter";'''
content = content.replace(old_import, new_import)

# 2. Add RBAC helper functions after getWorkspaceId
old_helper = '''// Helper: get workspace ID from user context (resolves from DB)
async function getWorkspaceId(ctx: any): Promise<number> {
  if (!ctx.user?.id) throw new Error("Not authenticated");
  return requireWorkspaceId(ctx.user.id);
}'''

new_helper = '''// Helper: get workspace ID from user context (resolves from DB)
async function getWorkspaceId(ctx: any): Promise<number> {
  if (!ctx.user?.id) throw new Error("Not authenticated");
  return requireWorkspaceId(ctx.user.id);
}

// RBAC helpers: enforce write/delete permissions and return wsId
async function requireWrite(ctx: any): Promise<number> {
  if (!ctx.user?.id) throw new Error("Not authenticated");
  const { wsId } = await enforcePermission(ctx.user.id, "write");
  return wsId;
}

async function requireDelete(ctx: any): Promise<number> {
  if (!ctx.user?.id) throw new Error("Not authenticated");
  const { wsId } = await enforcePermission(ctx.user.id, "delete");
  return wsId;
}'''
content = content.replace(old_helper, new_helper)

# 3. Now process line by line to:
#    a) Replace getWorkspaceId(ctx) with requireWrite/requireDelete in mutations
#    b) Add logAudit calls before return statements in mutations
lines = content.split("\n")
result = []

current_entity = "unknown"
current_proc = "unknown"
in_mutation = False
mutation_brace_depth = 0
mutation_start = -1

i = 0
while i < len(lines):
    line = lines[i]
    
    # Track entity name from router declarations
    router_match = re.match(r'^export const (\w+)Router\s*=', line)
    if router_match:
        current_entity = router_match.group(1)
    
    # Track procedure name
    proc_match = re.match(r'^\s+(create|update|delete|archive|restore|remove|revoke|dismiss|accept|reject|submit|cancel|complete|close|reopen|toggle|mark|set|assign|unassign|bulkDelete|bulkUpdate|bulkCreate|upsert|add|link)\s*:', line)
    if proc_match:
        current_proc = proc_match.group(1)
    
    # Detect mutation start
    if ".mutation(async" in line:
        in_mutation = True
        mutation_brace_depth = 0
        mutation_start = len(result)
    
    if in_mutation:
        mutation_brace_depth += line.count("{") - line.count("}")
        
        # Replace getWorkspaceId with RBAC-enforced version in mutations
        if "getWorkspaceId(ctx)" in line and "await" in line:
            delete_procs = {"delete", "remove", "revoke", "bulkDelete"}
            if current_proc in delete_procs:
                line = line.replace("getWorkspaceId(ctx)", "requireDelete(ctx)")
            else:
                line = line.replace("getWorkspaceId(ctx)", "requireWrite(ctx)")
        
        # Check for return statement - add logAudit before it
        stripped = line.strip()
        is_return = stripped.startswith("return ") and not stripped.startswith("return db") and not stripped.startswith("return await")
        
        if is_return:
            # Check if logAudit already exists nearby
            recent = "\n".join(result[-3:]) if len(result) >= 3 else ""
            if "logAudit" not in recent:
                indent = len(line) - len(line.lstrip())
                indent_str = " " * indent
                
                # Determine action
                action_map = {
                    "create": "create", "update": "update", "delete": "delete",
                    "archive": "archive", "restore": "restore", "remove": "delete",
                    "revoke": "delete", "dismiss": "update", "accept": "update",
                    "reject": "update", "submit": "update", "cancel": "update",
                    "complete": "update", "close": "update", "reopen": "update",
                    "toggle": "update", "mark": "update", "set": "update",
                    "assign": "update", "unassign": "update", "upsert": "update",
                    "bulkDelete": "delete", "bulkUpdate": "update", "bulkCreate": "create",
                    "add": "create", "link": "create",
                }
                action = action_map.get(current_proc, "update")
                
                # Find wsId variable in mutation context
                mutation_context = "\n".join(result[mutation_start:])
                ws_var = "wsId"
                
                # Determine entity ID
                if "input.id" in mutation_context:
                    entity_id = "input.id"
                else:
                    entity_id = "0"
                
                changes = "null" if action == "delete" else "input"
                
                # Add try-catch wrapped logAudit to avoid breaking the mutation
                audit_line = f'{indent_str}try {{ await logAudit({ws_var}, ctx.user.id, "{action}", "{current_entity}", {entity_id}, {changes}); }} catch {{}}'
                result.append(audit_line)
        
        # End of mutation
        if mutation_brace_depth <= 0 and len(result) > mutation_start + 1:
            in_mutation = False
    
    result.append(line)
    i += 1

with open(filepath, "w") as f:
    f.write("\n".join(result))

# Count changes
new_content = "\n".join(result)
rbac_count = new_content.count("requireWrite(ctx)") + new_content.count("requireDelete(ctx)")
audit_count = new_content.count("logAudit(")
print(f"Done. Added {rbac_count} RBAC enforcements and {audit_count} audit log calls.")
