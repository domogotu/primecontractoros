# Temporary Internal Access Diagnostic

This branch adds a read-only startup diagnostic for the two internal PrimeContractorOS accounts. It does not change workspace ownership, memberships, billing state, subscription records, or platform permissions.

The diagnostic reports the authenticated database user IDs, current global roles, owned workspaces, workspace memberships, and Reeds Solutions workspace candidates so the legacy account/workspace mapping can be reconciled safely instead of guessing.

Remove the diagnostic startup step and this note after the production mapping has been confirmed and the permanent access/workspace fix is applied.
