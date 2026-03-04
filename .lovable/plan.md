

## Plan: OG Meta for Invoice Links + Duplicate Property Support + Logo Improvements

### 3 Issues to Fix

---

### 1. OG Meta Tags for Invoice Links (Brand Preview when sharing)

**Problem**: When sharing `/invoice/:token` on WhatsApp/iMessage, the link preview shows generic app metadata instead of the Pur brand with invoice details.

**Solution**: Create a new edge function `share-invoice` (modeled after `share-report`) that:
- Accepts `?token=XXX` parameter
- For social bots: serves HTML with OG meta tags showing the Pur logo, client name, invoice number, and amount
- For regular browsers: redirects to `https://maisonpur.lovable.app/invoice/{token}`
- Update `copyLink` in `InvoiceSection.tsx` and `InvoiceHistoryContent.tsx` to generate links through this edge function instead of direct `/invoice/:token` URLs

**Files**:
- `supabase/functions/share-invoice/index.ts` (new)
- `src/components/InvoiceSection.tsx` — update `copyLink`
- `src/components/InvoiceHistoryContent.tsx` — update copy link logic

---

### 2. Allow Same Property Multiple Times (different dates)

**Problem**: The property selection uses checkboxes — toggling adds or removes the property. You cannot add "Mahalo" twice (e.g., cleaned on March 28 AND March 30).

**Solution**: Change the property selection from toggle checkboxes to an "Add" button approach:
- Each property gets a **"+ Add"** button instead of a checkbox
- Clicking it adds a new line item for that property (with today's date as default)
- You can add the same property multiple times — each gets its own row with its own date
- The remove button (trash icon) on each line item already handles removal individually
- Remove `selectedPropertyIds` state and the checkbox-based toggle logic

**File**: `src/components/InvoiceSection.tsx`

---

### 3. Logo Centered and Larger on Public Invoice

**Problem**: Logo is left-aligned and small (`h-10 sm:h-12`).

**Solution**: Center the logo above the header content and increase its size:
- Move the logo to a centered position above the company info / invoice title row
- Increase size to `h-14 sm:h-16`
- Add subtle bottom margin for spacing

**File**: `src/pages/PublicInvoice.tsx`

---

### No database changes needed.

