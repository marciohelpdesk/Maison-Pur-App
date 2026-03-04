

## Plan: Fix Link Preview Card Image + Footer Text

### Root Cause

The screenshot shows iMessage rendering the edge function response as a **"Text Document"** instead of a rich card. This happens because:

1. The current `og:image` points to a Supabase storage URL (`cleaning-photos/brand/og-image.png`) which may not be properly accessible or cached by social crawlers
2. iMessage and WhatsApp require the OG image to be a **directly accessible, publicly hosted image** with proper headers — Supabase storage URLs with encoded paths (`%2F`) can cause issues with some crawlers

The user provided a new branded card image: `https://i.ibb.co/1Yh2WJjw/Branding.png` — this is hosted on imgBB which is well-supported by all social crawlers.

### Changes

#### 1. Update OG image in both edge functions
Replace the Supabase storage OG image URL with the user's new branded card:

- **`supabase/functions/share-invoice/index.ts`** (line 10): Change `OG_IMAGE` to `https://i.ibb.co/1Yh2WJjw/Branding.png`
- **`supabase/functions/share-report/index.ts`** (line 10): Same change

#### 2. Update OG image in `index.html`
- Line 21: Change `og:image` to `https://i.ibb.co/1Yh2WJjw/Branding.png`
- Line 25: Change `twitter:image` to `https://i.ibb.co/1Yh2WJjw/Branding.png`

#### 3. Update PublicReport.tsx dynamic OG meta
- Line 82: Change the `ogUrl` variable to `https://i.ibb.co/1Yh2WJjw/Branding.png`

#### 4. Deploy both edge functions
Re-deploy `share-invoice` and `share-report` so the new image takes effect immediately.

### Files to modify
- `supabase/functions/share-invoice/index.ts`
- `supabase/functions/share-report/index.ts`
- `index.html`
- `src/pages/PublicReport.tsx`

### No database changes needed.

