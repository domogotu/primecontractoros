#!/usr/bin/env python3
"""
Adds PageLayout wrapper to pages that use old-style `<div className="p-6 max-w-... pb-32">` or
`<div className="space-y-6">` outer containers.

For each file:
1. Adds `import PageLayout from "@/components/PageLayout";` if not present
2. Replaces the outermost container div with a PageLayout wrapper
3. Preserves all existing logic, queries, and mutations
"""

import re
import sys

# Config: (filename, label, title, subtitle, stat_cards_code_or_None, actions_code_or_None)
PAGES = [
    (
        "Deadlines",
        "Contract Operations",
        "Deadlines & Milestones",
        "Track all contract deadlines, submission dates, and compliance milestones.",
        '[{ label: "Total", value: deadlines.length }, { label: "Upcoming", value: upcoming.length, color: "text-amber-600" }, { label: "Overdue", value: overdue.length, color: "text-red-600" }]',
        None,
    ),
    (
        "Requirements",
        "Contract Operations",
        "Contract Requirements",
        "Track and verify all contract requirements and their compliance status.",
        '[{ label: "Total", value: requirements.length }, { label: "Verified", value: (requirements as any[]).filter((r:any)=>r.status==="verified").length, color: "text-green-600" }, { label: "Pending", value: (requirements as any[]).filter((r:any)=>r.status!=="verified").length, color: "text-amber-600" }]',
        None,
    ),
    (
        "ChangeManagement",
        "Contract Operations",
        "Change Management",
        "Track contract modifications, change orders, and amendments.",
        '[{ label: "Total", value: changes.length }, { label: "Pending", value: (changes as any[]).filter((c:any)=>c.status==="pending").length, color: "text-amber-600" }, { label: "Approved", value: (changes as any[]).filter((c:any)=>c.status==="approved").length, color: "text-green-600" }]',
        None,
    ),
    (
        "Closeout",
        "Contract Operations",
        "Contract Closeout",
        "Manage contract closeout processes, final deliverables, and documentation.",
        None,
        None,
    ),
    (
        "LessonsLearned",
        "Knowledge Base",
        "Lessons Learned",
        "Capture and review lessons learned from contracts, proposals, and operations.",
        '[{ label: "Total", value: lessons.length }, { label: "Positive", value: (lessons as any[]).filter((l:any)=>l.outcome==="positive").length, color: "text-green-600" }, { label: "Negative", value: (lessons as any[]).filter((l:any)=>l.outcome==="negative").length, color: "text-red-600" }]',
        None,
    ),
    (
        "Reports",
        "Analytics",
        "Reports",
        "Generate and download reports for contracts, proposals, finance, and compliance.",
        None,
        None,
    ),
    (
        "Billing",
        "Finance",
        "Billing & Subscription",
        "Manage your subscription plan, billing history, and payment methods.",
        None,
        None,
    ),
    (
        "Payments",
        "Finance",
        "Payments",
        "Track all payment records linked to invoices and contracts.",
        '[{ label: "Total", value: payments.length }, { label: "Completed", value: (payments as any[]).filter((p:any)=>p.status==="completed").length, color: "text-green-600" }, { label: "Pending", value: (payments as any[]).filter((p:any)=>p.status==="pending").length, color: "text-amber-600" }]',
        None,
    ),
    (
        "Webhooks",
        "Administration",
        "Webhooks",
        "Register outbound webhook endpoints to receive real-time event notifications.",
        '[{ label: "Total", value: webhooks.length }, { label: "Active", value: (webhooks as any[]).filter((w:any)=>w.active).length, color: "text-green-600" }]',
        None,
    ),
    (
        "WorkspaceTeam",
        "Administration",
        "Team & Roles",
        "Manage workspace members and assign roles to control access levels.",
        '[{ label: "Members", value: members.length }]',
        None,
    ),
    (
        "EmailNotificationPreferences",
        "Settings",
        "Notification Preferences",
        "Choose which email notifications you want to receive.",
        None,
        None,
    ),
    (
        "WorkspaceExport",
        "Administration",
        "Data Export",
        "Export your workspace data including contracts, invoices, contacts, and more.",
        None,
        None,
    ),
    (
        "FarReference",
        "Compliance",
        "FAR Reference",
        "Browse and search Federal Acquisition Regulation clauses and provisions.",
        '[{ label: "Total Clauses", value: filteredClauses.length }]',
        None,
    ),
]


def process_file(name, label, title, subtitle, stat_cards, actions):
    path = f"/home/ubuntu/prime-contractor-os/client/src/pages/{name}.tsx"
    with open(path, "r") as f:
        content = f.read()

    if "PageLayout" in content:
        print(f"  SKIP {name} — already uses PageLayout")
        return

    # Add import after last existing import line
    import_line = 'import PageLayout from "@/components/PageLayout";'
    if import_line not in content:
        # Find last import line
        lines = content.split("\n")
        last_import_idx = 0
        for i, line in enumerate(lines):
            if line.startswith("import "):
                last_import_idx = i
        lines.insert(last_import_idx + 1, import_line)
        content = "\n".join(lines)

    # Build PageLayout open tag
    props = f'\n        label="{label}"\n        title="{title}"\n        subtitle="{subtitle}"'
    if stat_cards:
        props += f"\n        summaryCards={{{stat_cards}}}"
    if actions:
        props += f"\n        actions={{{actions}}}"

    page_layout_open = f"<PageLayout{props}\n      >"
    page_layout_close = "\n      </PageLayout>"

    # Replace outer container patterns
    # Pattern 1: <div className="p-6 max-w-...mx-auto pb-32">
    old_outer1 = re.compile(
        r'<div className="(?:p-6 |p-4 )?max-w-\w+ mx-auto(?: space-y-\d+)?(?: pb-32)?">'
    )
    # Pattern 2: <div className="space-y-6"> at top level return
    old_outer2 = re.compile(r'<div className="space-y-\d+">')

    # Find the return statement and replace the first outer div
    return_match = re.search(r'\n  return \(\n', content)
    if not return_match:
        print(f"  SKIP {name} — cannot find return statement")
        return

    return_pos = return_match.end()
    rest = content[return_pos:]

    # Find first <div className="..."> in the return
    first_div = re.search(r'<div className="[^"]*">', rest)
    if not first_div:
        print(f"  SKIP {name} — cannot find outer div")
        return

    outer_div_str = first_div.group(0)
    print(f"  {name}: replacing outer div: {outer_div_str[:60]}")

    # Replace the outer div with PageLayout open
    new_rest = rest.replace(outer_div_str, page_layout_open, 1)

    # Find and replace the matching closing </div> at the end
    # The last </div> before </> or end of return should be the outer one
    # Find last </div> before the closing paren
    last_close = new_rest.rfind("</div>")
    if last_close == -1:
        print(f"  SKIP {name} — cannot find closing div")
        return

    new_rest = new_rest[:last_close] + page_layout_close + new_rest[last_close + len("</div>"):]

    new_content = content[:return_pos] + new_rest

    with open(path, "w") as f:
        f.write(new_content)

    print(f"  OK {name}")


for page_args in PAGES:
    print(f"Processing {page_args[0]}...")
    try:
        process_file(*page_args)
    except Exception as e:
        print(f"  ERROR {page_args[0]}: {e}")

print("\nDone.")
