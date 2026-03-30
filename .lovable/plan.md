

## Plan: Fix WhatsApp Link Previews by Using Edge Function URLs for Sharing

### Root Cause
All shared links currently point directly to the SPA frontend (e.g., `maisonpur.lovable.app/r/TOKEN`). WhatsApp's crawler fetches these URLs and only sees the **static, generic** OG tags from `index.html` (just the drop logo and "Professional Cleaning Services"). iMessage handles SPAs differently and renders correctly.

The edge functions (`share-report`, `share-invoice`, `share-estimate`) already serve **dynamic, rich OG HTML** with proper metadata and the full branding image, then redirect users to the SPA. But they are never used as the shared URLs.

### Solution
Change all share/copy-link functions to use edge function URLs instead of direct SPA URLs. The edge functions already handle the redirect to the app seamlessly.

### Files to Change

**1. `src/pages/Reports.tsx`** — `getShareUrl()`
- Change from `https://maisonpur.lovable.app/r/${token}` to edge function URL: `https://ebafqcanwdqomqcrifrj.supabase.co/functions/v1/share-report?token=${token}`

**2. `src/components/InvoiceSection.tsx`** — `copyLink()`
- Change from `https://maisonpur.lovable.app/invoice/${token}` to `share-invoice` edge function URL

**3. `src/components/InvoiceHistoryContent.tsx`** — `copyLink()`
- Same change for invoice links

**4. `src/pages/InvoiceHistory.tsx`** — `copyLink()`
- Same change for invoice links

**5. `src/components/EstimateSection.tsx`** — `copyLink()`
- Change from `https://maisonpur.lovable.app/estimate/${token}` to `share-estimate` edge function URL

**6. `src/components/EstimateHistoryContent.tsx`** — `copyLink()`
- Same change for estimate links

All six files get the same pattern: replace the direct SPA URL with the corresponding edge function URL. The edge functions serve OG tags for WhatsApp/bots, then instantly redirect real users to the app via `<meta http-equiv="refresh">` and JavaScript.

