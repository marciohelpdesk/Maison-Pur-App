

## Plan: Fix Mobile Invoice Links + Remove Lovable Branding

### Root Cause Analysis
The public invoice link is generated using `window.location.origin`, which gives the **preview URL** (e.g., `https://id-preview--13b46a3e...lovable.app`). When copied and opened on a mobile browser, the preview domain may not properly handle SPA routing (returning `index.html` for client-side routes like `/invoice/:token`), resulting in a 404 page.

The published production domain (`maisonpur.lovable.app`) handles SPA routing correctly, which is why it works "through the internet" on desktop.

### Changes

#### 1. Use production URL for all public links
**Files:** `src/components/InvoiceSection.tsx`, `src/pages/InvoiceHistory.tsx`

Replace `window.location.origin` with the hardcoded production domain `https://maisonpur.lovable.app` when generating shareable invoice links. This ensures all copied links point to the published app regardless of where the user is (preview, desktop, mobile).

```typescript
// Before
navigator.clipboard.writeText(`${window.location.origin}/invoice/${token}`);

// After
const APP_URL = 'https://maisonpur.lovable.app';
navigator.clipboard.writeText(`${APP_URL}/invoice/${token}`);
```

#### 2. Apply same fix to report sharing links (if applicable)
Search for any other `window.location.origin` usages generating public links and update them to use the production domain consistently.

#### 3. Lovable badge
The Lovable badge can be hidden from project settings (Settings > Hide 'Lovable' Badge). No code change needed — this is a project-level toggle. Your clients will never see Lovable branding on the published app.

### No database changes needed.

