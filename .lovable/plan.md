## Goal
Fix the broken "Download PDF" flow in the Supplies / Inventory area and remove the WhatsApp sharing dependency, leaving the public link truly public and providing PDF download as the primary share method.

## Problems found

1. **PDF silently fails** in `PropertySuppliesPanel.tsx`. `generateSupplyRequestPdf()` runs inside a `try/catch` that only shows a generic toast and only after `createRequest.mutate` succeeds. If an error occurs inside `loadLogo` / `addImage` / fetching an item photo (CORS on a remote image, etc.) the download silently breaks. We have no logs to confirm the exact failure on the user's device.
2. **WhatsApp button on the public page** (`PublicSupplyRequest.tsx`) and in the History tab is no longer wanted.
3. **Public page lacks a Download PDF button** — clients opening the magic link have no way to save a PDF locally.
4. The `/supplies/:token` route is already public (not behind `RequireAuth`) and the RPC `get_supply_request_by_token` is `SECURITY DEFINER`, so the perceived "login wall" is most likely the missing PDF button + WhatsApp redirect confusing the user. We'll keep the route truly public and add the PDF action there.

## Changes

### 1. `src/lib/supplyRequestPdf.ts`
- Wrap `loadImage` for item photos so a failed fetch (CORS / 404) does not abort the whole PDF — already done, but also guard against `pdf.addImage` throwing on bad data URLs.
- Make `loadLogo` resilient: fall back to skipping the logo block instead of leaving a gap.
- Add a 5s timeout per image to avoid hanging forever on a stuck request.
- Return the generated PDF so callers can also `open()` it (useful for the public page where `pdf.save` may be blocked in some in-app browsers). Signature becomes:
  ```ts
  generateSupplyRequestPdf(req, { mode?: 'save' | 'open' })
  ```

### 2. `src/components/supplies/PropertySuppliesPanel.tsx`
- Remove the `shareWhatsApp` button (History tab).
- Keep: **PDF**, **Copy link**, **Open**, **Mark fulfilled**, **Delete**.
- Improve the catch around `generateSupplyRequestPdf` to log the real error and surface it: `toast.error(e.message || 'Could not generate PDF')`.
- After a successful new request, also auto-open the PDF (already happens) and keep a manual "Download PDF" button visible in the History tab card (already present).

### 3. `src/pages/PublicSupplyRequest.tsx`
- Replace the **Share via WhatsApp** button with **Download PDF** that calls `generateSupplyRequestPdf(req, { mode: 'save' })`.
- Remove the `Share2` icon import; add `Download`.
- Keep the rest of the page identical (header, items, notes, footer).

### 4. Route / access
- No code change needed: `/supplies/:token` is already outside `RequireAuth`. Confirm by visual smoke test in an incognito tab after deploy.

## Out of scope
- Database / RLS changes (RPC already works for anon).
- Branding / layout of the public page.
- Storing the PDF in a bucket (still generated on-demand client-side).
- iCal / notifications / other modules.

## Files touched
- `src/lib/supplyRequestPdf.ts` — resilience + optional `mode` param.
- `src/components/supplies/PropertySuppliesPanel.tsx` — remove WhatsApp, better error toast.
- `src/pages/PublicSupplyRequest.tsx` — swap WhatsApp button for Download PDF.