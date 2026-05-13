#!/usr/bin/env python3
"""
Add logAudit calls to all mutations in a router file.
Works by finding mutation blocks and inserting audit calls before the final return.
"""
import re
import sys

filepath = sys.argv[1]

with open(filepath, "r") as f:
    content = f.read()

# Ensure logAudit import exists
if "logAudit" not in content:
    # Try to add after enforcePermission import
    if 'import { enforcePermission }' in content:
        content = content.replace(
            'import { enforcePermission } from "./rbacMiddleware";',
            'import { enforcePermission } from "./rbacMiddleware";\nimport { logAudit } from "./featureRouter";'
        )
    elif 'import { requireWorkspaceId }' in content:
        content = content.replace(
            'import { requireWorkspaceId } from "./workspaceMiddleware";',
            'import { requireWorkspaceId } from "./workspaceMiddleware";\nimport { logAudit } from "./featureRouter";'
        )
    else:
        # Add at top after first import block
        content = 'import { logAudit } from "./featureRouter";\n' + content

lines = content.split("\n")
result = []

# Track state
current_entity = "unknown"
in_mutation = False
mutation_depth = 0
mutation_start_line = -1
current_action = "update"

# First pass: identify all mutation blocks
mutations = []  # (start_line, entity, action)

for i, line in enumerate(lines):
    # Track entity name
    router_match = re.match(r'^export const (\w+)Router\s*=', line)
    if router_match:
        current_entity = router_match.group(1)
    
    # Track procedure name
    proc_match = re.match(r'^\s+(create|update|delete|archive|restore|remove|revoke|dismiss|accept|reject|submit|cancel|complete|close|reopen|toggle|mark|set|assign|unassign|bulkDelete|bulkUpdate|bulkCreate|upsert)\s*:', line)
    if proc_match:
        proc_name = proc_match.group(1)
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
        current_action = action_map.get(proc_name, "update")
    
    # Detect mutation start
    if ".mutation(async" in line:
        in_mutation = True
        mutation_depth = 0
        mutation_start_line = i
        mutations.append({
            "entity": current_entity,
            "action": current_action,
            "start": i,
            "returns": [],
        })
    
    if in_mutation:
        mutation_depth += line.count("{") - line.count("}")
        
        # Find return statements in mutation
        stripped = line.strip()
        if stripped.startswith("return ") and "logAudit" not in lines[i-1] if i > 0 else True:
            mutations[-1]["returns"].append(i)
        
        if mutation_depth <= 0 and i > mutation_start_line:
            in_mutation = False

# Second pass: insert logAudit before the last return in each mutation
# Work backwards to preserve line numbers
insertions = []  # (line_number, text_to_insert)

for m in mutations:
    if not m["returns"]:
        continue
    
    # Use the last return in the mutation
    return_line = m["returns"][-1]
    
    # Check if logAudit already exists nearby
    nearby = "\n".join(lines[max(0, return_line-3):return_line+1])
    if "logAudit" in nearby:
        continue
    
    # Get indentation from the return line
    indent = len(lines[return_line]) - len(lines[return_line].lstrip())
    indent_str = " " * indent
    
    entity = m["entity"]
    action = m["action"]
    
    # Try to find wsId variable name in the mutation context
    context = "\n".join(lines[m["start"]:return_line])
    ws_var = "wsId"
    if "wsId" not in context:
        if "workspaceId" in context:
            ws_var = "workspaceId"
        else:
            # Skip if no workspace ID found
            continue
    
    # Determine entity ID
    if "input.id" in context:
        entity_id = "input.id"
    else:
        entity_id = "0"
    
    changes = "null" if action == "delete" else "input"
    
    audit_line = f'{indent_str}await logAudit({ws_var}, ctx.user.id, "{action}", "{entity}", {entity_id}, {changes});'
    insertions.append((return_line, audit_line))

# Apply insertions in reverse order
insertions.sort(key=lambda x: x[0], reverse=True)
for line_num, text in insertions:
    lines.insert(line_num, text)

with open(filepath, "w") as f:
    f.write("\n".join(lines))

print(f"Added {len(insertions)} logAudit calls to {filepath}")
