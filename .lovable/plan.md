

## Plan: Professional Invoice Redesign — Maison Purusa Branding

### Overview
Redesign the entire invoice experience: a premium creation form in Settings, a professional Maison Purusa-branded public invoice page (accessible without login), and an invoice history view. The design follows the reference image aesthetic — forest green palette, elegant typography, eco-friendly branding.

### Database Changes
**Add new columns** to `invoices` table:
- `client_address` (text) — client's physical address
- `client_phone` (text) — client phone number  
- `due_date` (text) — payment due date
- `notes` (text) — special message/thank you note
- `discount` (numeric, default 0) — discount amount
- `tax` (numeric, default 0) — tax/eco fee amount

### File Changes

#### 1. `src/hooks/useInvoices.ts`
- Expand `Invoice` and `LineItem` interfaces with new fields (`client_address`, `client_phone`, `due_date`, `notes`, `discount`, `tax`, `quantity`)
- Add `quantity` to `LineItem` for qty/hours column
- Update `createInvoice` mutation to accept new fields

#### 2. `src/components/InvoiceSection.tsx` — Complete Rewrite
Premium glassmorphism form with:
- **Client section**: Name, email, address, phone
- **Dates**: Service date + due date pickers
- **Property multi-select** with auto-population of line items
- **Line items table**: Description, Qty, Unit Rate, Total — each row editable
- **Financial summary**: Subtotal, Tax (eco fee), Discount, Grand Total
- **Notes field**: Custom thank you message
- **Invoice list** with better cards showing more detail and a "View" button that opens the public link

#### 3. `src/pages/PublicInvoice.tsx` — Complete Redesign
Professional invoice matching the Maison Purusa reference:
- **Color palette**: Forest green (#2D5016 / #4A7C2E), warm gray, cream/white background
- **Header**: Maison Purusa logo + company info (left) | "INVOICE" title + invoice number + dates (right)
- **Client block**: "BILLED TO" with name, address, email, phone
- **Services table**: Styled with green header row — Description, Qty, Rate, Total
- **Financial summary**: Subtotal, Tax (Eco Fee), Discount, Total (USD) — right-aligned
- **Thank you message** in elegant script/italic
- **Footer**: Payment methods (Zelle, Card Online), eco-friendly badges, brand tagline
- **Status badge**: Paid (green) / Pending (amber) — non-intrusive
- **Pay Now button** for pending invoices
- No login required — route already public at `/invoice/:token`
- No Lovable branding anywhere — footer says "Maison Purusa LLC · maisonpurusa.com"

#### 4. `src/pages/InvoiceHistory.tsx` — New Page
A dedicated page showing all invoices in a professional table/card layout:
- Filter by status (All/Pending/Paid)
- Each row shows: invoice #, client, amount, date, status badge, actions (view/copy/delete)
- Revenue summary at top (total earned, pending, paid)

#### 5. `src/lib/routes.tsx`
- Add protected route `/invoices` → `InvoiceHistory`

#### 6. `src/views/SettingsView.tsx`
- Update InvoiceSection to link to the full `/invoices` history page

### Technical Details
- Public invoice uses the existing RLS policy (`Public can view invoices by token` — SELECT with `true`)
- The `usePublicInvoice` hook already filters by `public_token` in code
- Fonts: Use Inter (already available) + add Playfair Display via Google Fonts link in the public page for the elegant headings
- The public page is self-contained with inline styles/Tailwind — no auth wrapper needed

