

## Plan: Redeploy Edge Functions to Fix Sharing Links

### Problem
The screenshot shows the edge function's HTML being displayed as raw source text instead of being rendered as an HTML page. The code is correct (Content-Type is properly set to `text/html`), but the deployed version appears to be stale or not properly deployed.

### Solution
Redeploy all three sharing edge functions (`share-report`, `share-invoice`, `share-estimate`) and verify they work correctly by testing each one.

### Steps

1. **Redeploy `share-report`** edge function and test with a sample token
2. **Redeploy `share-invoice`** edge function and test
3. **Redeploy `share-estimate`** edge function and test
4. **Verify** that each function returns proper `text/html` Content-Type and redirects correctly

No code changes needed — the existing code is correct. This is a deployment sync issue.

