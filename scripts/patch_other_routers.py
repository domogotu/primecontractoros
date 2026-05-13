#!/usr/bin/env python3
"""
Add logAudit calls to mutations in routers.ts, batch1Router.ts, batch2Router.ts,
batch3Router.ts, batch4Router.ts, integrationsRouter.ts that don't already have them.
"""
import re
import sys

def patch_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()
    
    # Add logAudit import if not present
    if "logAudit" not in content:
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
        elif 'import { protectedProcedure' in content:
            # Add after first import
            content = content.replace(
                'import { protectedProcedure',
                'import { logAudit } from "./featureRouter";\nimport { protectedProcedure'
            )
        else:
            lines = content.split("\n")
            # Find last import line
            last_import = 0
            for i, l in enumerate(lines):
                if l.strip().startswith("import "):
                    last_import = i
            lines.insert(last_import + 1, 'import { logAudit } from "./featureRouter";')
            content = "\n".join(lines)
    
    lines = content.split("\n")
    result = []
    
    current_entity = "unknown"
    current_proc = "unknown"
    in_mutation = False
    mutation_brace_depth = 0
    mutation_start = -1
    
    for i, line in enumerate(lines):
        # Track entity/router name
        router_match = re.match(r'^\s*(?:export\s+)?(?:const\s+)?(\w+)Router\s*[:=]', line)
        if router_match:
            current_entity = router_match.group(1)
        
        # Also track from nested router patterns like "opportunities: router({"
        nested_match = re.match(r'^\s+(\w+)\s*:\s*router\(\{', line)
        if nested_match:
            current_entity = nested_match.group(1)
        
        # Track procedure name
        proc_match = re.match(r'^\s+(create|update|delete|archive|restore|remove|revoke|dismiss|accept|reject|submit|cancel|complete|close|reopen|toggle|mark|set|assign|unassign|bulkDelete|bulkUpdate|bulkCreate|upsert|add|link|convert|generate|save|send|test|upload|download|updateStatus|updateHealth)\s*:', line)
        if proc_match:
            current_proc = proc_match.group(1)
        
        # Detect mutation start
        if ".mutation(async" in line:
            in_mutation = True
            mutation_brace_depth = 0
            mutation_start = len(result)
        
        if in_mutation:
            mutation_brace_depth += line.count("{") - line.count("}")
            
            stripped = line.strip()
            is_return = stripped.startswith("return {") and ("success" in stripped or "id" in stripped)
            
            if is_return:
                recent = "\n".join(result[-3:]) if len(result) >= 3 else ""
                if "logAudit" not in recent:
                    indent = len(line) - len(line.lstrip())
                    indent_str = " " * indent
                    
                    action_map = {
                        "create": "create", "update": "update", "delete": "delete",
                        "archive": "archive", "restore": "restore", "remove": "delete",
                        "revoke": "delete", "dismiss": "update", "accept": "update",
                        "updateStatus": "update", "updateHealth": "update",
                        "convert": "create", "generate": "create", "save": "update",
                        "send": "create", "test": "update", "upload": "create",
                    }
                    action = action_map.get(current_proc, "update")
                    
                    mutation_context = "\n".join(result[mutation_start:])
                    
                    # Find workspace ID variable
                    ws_var = "wsId"
                    if "wsId" not in mutation_context and "workspaceId" in mutation_context:
                        ws_var = "workspaceId"
                    
                    entity_id = "input.id" if "input.id" in mutation_context else "0"
                    changes = "null" if action == "delete" else "input"
                    
                    # Only add if wsId is available
                    if ws_var in mutation_context or "enforcePermission" in mutation_context:
                        audit_line = f'{indent_str}try {{ await logAudit({ws_var}, ctx.user.id, "{action}", "{current_entity}", {entity_id}, {changes}); }} catch {{}}'
                        result.append(audit_line)
            
            if mutation_brace_depth <= 0 and len(result) > mutation_start + 1:
                in_mutation = False
        
        result.append(line)
    
    new_content = "\n".join(result)
    audit_count = new_content.count("logAudit(") - content.count("logAudit(")
    
    with open(filepath, "w") as f:
        f.write(new_content)
    
    print(f"  {filepath}: +{audit_count} audit log calls")
    return audit_count

files = [
    "server/routers.ts",
    "server/batch1Router.ts",
    "server/batch2Router.ts",
    "server/batch3Router.ts",
    "server/batch4Router.ts",
    "server/integrationsRouter.ts",
]

total = 0
for f in files:
    try:
        total += patch_file(f)
    except Exception as e:
        print(f"  {f}: ERROR - {e}")

print(f"\nTotal: +{total} audit log calls added")
