

## Plan: Fix WhatsApp Link Preview to Match iMessage

### Problem
The OG preview cards look different on WhatsApp vs iMessage. Two causes identified:

1. **Edge functions use `twitter:card: summary`** (small square thumbnail) instead of `summary_large_image` (full-width banner like iMessage shows)
2. **Missing `og:image:type` meta tag** — WhatsApp sometimes needs this to render the image correctly

### Changes

#### 1. `supabase/functions/share-report/index.ts`
- Change `twitter:card` from `summary` to `summary_large_image`
- Add `og:image:type` = `image/png`

#### 2. `supabase/functions/share-invoice/index.ts`
- Same two changes

#### 3. `supabase/functions/share-estimate/index.ts`
- Same two changes

#### 4. `index.html`
- Add `og:image:type` = `image/png`
- Add `og:image:width` = `1200` and `og:image:height` = `630` (already present in edge functions but missing from index.html)

All four files, same small meta tag additions.

