# n8n Continuation Prompt — Resume at Phase 4

Paste the following into the n8n AI Assistant when AI Builder credits are available again:

```text
Continue from the current build state at Phase 4.

Do not restart, recreate, replace, or redesign Phases 1 through 3.

Treat all workflows, schemas, registries, adapters, routing logic, logging, security, permissions, and dependencies already created in Phases 1 through 3 as preserved unless a real validation failure requires a targeted repair.

My priority remains: build the entire architecture first, then configure credentials and external services afterward.

Continue with Phase 4 and then proceed through every remaining phase in the previously defined order.

For anything that requires credentials, API keys, endpoints, databases, or external deployment:

- Build the complete adapter and workflow structure now
- Add input and output schemas
- Add credential and endpoint placeholders
- Add health checks
- Add provider test workflows
- Add retries and normalized error handling
- Mark it unconfigured or external deployment required
- Keep it disabled by default
- Do not pause to ask me to configure it
- Do not create fake successful responses

Do not simplify, merge away, rename, or omit any tool or provider because it overlaps with another tool.

Do not prioritize making the Real-Time Q&A Starter live yet.

Build the Real-Time Q&A Starter only after all remaining architecture phases are represented.

If the current Phase 4 work is partially complete:

1. Audit what already exists in Phase 4
2. Preserve completed work
3. Finish only the missing Phase 4 items
4. Continue to Phase 5 automatically
5. Continue through all remaining phases without stopping for credentials

If the build reaches a response or generation limit:

- Complete the largest coherent batch possible
- State the exact last completed workflow
- List what remains
- Provide one exact continuation prompt
- Continue from that exact point next time
- Do not ask me to resend Parts 1 through 8
- Do not restart earlier phases

Proceed now from Phase 4.
```
