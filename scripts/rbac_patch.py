"""
Patch entityRouters.ts to replace getWorkspaceId(ctx) with requireWrite(ctx) or requireDelete(ctx)
inside mutation handlers. Queries are left untouched.

Strategy:
- Track whether we're inside a .mutation() handler
- For create/update mutations: use requireWrite
- For delete mutations: use requireDelete
"""
import re

with open('server/entityRouters.ts', 'r') as f:
    lines = f.readlines()

# First pass: identify which router/procedure each mutation belongs to
# We need to know if it's a delete mutation or a create/update mutation
result = []
in_mutation = False
current_procedure_name = ""
mutation_depth = 0

for i, line in enumerate(lines):
    # Track procedure name from the pattern:  procedureName: protectedProcedure
    name_match = re.search(r'^\s+(\w+):\s+protectedProcedure', line)
    if name_match:
        current_procedure_name = name_match.group(1)
    
    # Detect entering a mutation
    if '.mutation(' in line:
        in_mutation = True
        mutation_depth = 0
    
    # Replace getWorkspaceId inside mutations
    if in_mutation and 'const wsId = await getWorkspaceId(ctx);' in line:
        if current_procedure_name.startswith('delete') or current_procedure_name == 'dismiss':
            line = line.replace('getWorkspaceId(ctx)', 'requireDelete(ctx)')
        else:
            line = line.replace('getWorkspaceId(ctx)', 'requireWrite(ctx)')
        in_mutation = False  # We've handled this mutation
    
    result.append(line)

with open('server/entityRouters.ts', 'w') as f:
    f.writelines(result)

# Count changes
original_count = sum(1 for l in open('server/entityRouters.ts').readlines() if 'requireWrite(ctx)' in l or 'requireDelete(ctx)' in l)
print(f"Applied {original_count} RBAC replacements in entityRouters.ts mutations")
