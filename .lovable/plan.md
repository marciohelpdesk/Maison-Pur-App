

## Plan: Fix Invoice Link Branding, Footer Text, and Template Refinement

### Issues Found

1. **Link preview shows raw HTML as "Text Document"**: The screenshot shows iMessage displaying the edge function HTML source code as a downloadable text document instead of rendering OG preview cards. The OG image (`Logo-solo.png`) is a small transparent logo — social platforms need a proper 1200x630 social card image with the logo on a branded background to display correctly. The current setup technically works for bots, but the logo alone on transparent background renders poorly as a preview.

2. **share-report still says "Pur" not "Maison Pur"**: Lines 63-66 use old branding.

3. **Logo alt text still says "Maison Purusa"**: PublicInvoice.tsx line 49.

4. **Footer phrase "Eco-Innovation & Empowerment Ethos"**: Meaningless/confusing for clients. Replace with something clear and professional.

5. **Template could be more elegant**: Add visual refinements.

---

### Changes

#### 1. Fix OG Image for proper link previews
The current OG image is the raw logo PNG on transparent background — this renders as a tiny icon or invisible on dark chat backgrounds. Need to use a proper social card image (1200x630) with the logo centered on a branded background. Since we can't generate images, we'll use a solid-color HTML approach: set `og:image` to the logo but also set `twitter:card` to `summary` (not `summary_large_image`) so the logo renders as a small icon preview which looks better than a broken large card.

**Better approach**: Update the share-invoice edge function to serve the OG tags for ALL requests (not just bots), with a delayed redirect. iMessage previews work by fetching the URL and reading meta tags — the bot detection may be blocking iMessage's previewer. Remove the bot-only branching and always serve OG HTML with a `<meta http-equiv="refresh">` redirect.

#### 2. Fix share-report branding
- `supabase/functions/share-report/index.ts`: Change "Pur" → "Maison Pur" in title, description, site_name. Update OG_IMAGE to the official logo.

#### 3. Fix PublicInvoice.tsx
- Line 49: Change alt from "Maison Purusa" → "Maison Pur"
- Replace footer text "Eco-Innovation & Empowerment Ethos" → "Cleaning with Integrity and Respect" (the actual company slogan)
- Add subtle visual refinements: decorative line between sections, slightly refined spacing

#### 4. Template visual improvements (PublicInvoice.tsx)
- Add a subtle watermark/pattern element in the background
- Improve the "Billed To" section with a left green border accent
- Add a thin decorative separator between the services table and financial summary
- Refine the Zelle payment section with better hierarchy
- Add a "Thank you" message at the bottom before the footer

#### 5. Update share-invoice edge function
- Always serve OG HTML (remove bot-only branching) so ALL link previewers get the meta tags
- Use `twitter:card` as `summary` instead of `summary_large_image` since the logo works better as a small card
- Keep the `<meta http-equiv="refresh">` and JS redirect for human visitors

### Files to modify:
- `supabase/functions/share-invoice/index.ts`
- `supabase/functions/share-report/index.ts`
- `src/pages/PublicInvoice.tsx`

### No database changes needed.

