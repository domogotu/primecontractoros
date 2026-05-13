#!/usr/bin/env python3
"""
Add logAudit calls to all mutations in entityRouters.ts that don't already have them.
Strategy: Find every `.mutation(async ({ input, ctx })` block, determine the entity name
from the router context, and add a logAudit call before `return { success: true }`.
"""
import re
import sys

filepath = sys.argv[1] if len(sys.argv) > 1 else "server/entityRouters.ts"

with open(filepath, "r") as f:
    content = f.read()

# First, add the import for logAudit if not present
if "logAudit" not in content:
    # Add import after the last import line
    content = content.replace(
        'import { enforcePermission } from "./rbacMiddleware";',
        'import { enforcePermission } from "./rbacMiddleware";\nimport { logAudit } from "./featureRouter";'
    )

lines = content.split("\n")
result = []
i = 0

# Track current router name from comments like "// ===== Files ====="
# or from export const xxxRouter patterns
current_entity = "unknown"

while i < len(lines):
    line = lines[i]
    
    # Track entity name from router declarations
    router_match = re.match(r'^export const (\w+)Router\s*=', line)
    if router_match:
        name = router_match.group(1)
        # Convert camelCase to readable: contactLinks -> contactLink
        current_entity = name
    
    # Track procedure name from property declarations like "  create:", "  update:", "  delete:"
    proc_match = re.match(r'^\s+(create|update|delete|archive|restore|remove|revoke|dismiss|accept|reject|submit|cancel|complete|close|reopen|toggle|mark|set|assign|unassign|bulkDelete|bulkUpdate|bulkCreate|upsert)\s*:', line)
    if proc_match:
        current_action = proc_match.group(1)
        # Map to audit action
        action_map = {
            "create": "create", "update": "update", "delete": "delete",
            "archive": "archive", "restore": "restore", "remove": "delete",
            "revoke": "delete", "dismiss": "update", "accept": "update",
            "reject": "update", "submit": "update", "cancel": "update",
            "complete": "update", "close": "update", "reopen": "update",
            "toggle": "update", "mark": "update", "set": "update",
            "assign": "update", "unassign": "update", "upsert": "update",
            "bulkDelete": "delete", "bulkUpdate": "update", "bulkCreate": "create",
        }
        audit_action = action_map.get(current_action, "update")
    else:
        pass
    
    # Check if this line has `return { success: true }` inside a mutation
    # and the previous few lines don't already have logAudit
    if "return { success: true" in line or "return { success: true" in line.strip():
        # Check if logAudit already exists within the last 5 lines
        recent = "\n".join(result[-5:]) if len(result) >= 5 else "\n".join(result)
        if "logAudit" not in recent:
            # Determine indentation
            indent = len(line) - len(line.lstrip())
            indent_str = " " * indent
            
            # Try to determine entity ID from context
            # Look back for input.id or similar
            context_lines = "\n".join(result[-15:])
            
            entity_id = "0"
            if "input.id" in context_lines:
                entity_id = "input.id"
            elif "input" in context_lines:
                entity_id = "input.id || 0"
            
            # Determine what data to log
            if audit_action == "delete":
                changes_str = "null"
            else:
                changes_str = "input"
            
            # Add the logAudit call before the return
            audit_line = f'{indent_str}await logAudit(wsId, ctx.user.id, "{audit_action}", "{current_entity}", {entity_id}, {changes_str});'
            result.append(audit_line)
    
    result.append(line)
    i += 1

with open(filepath, "w") as f:
    f.write("\n".join(result))

print(f"Done. Processed {filepath}")
