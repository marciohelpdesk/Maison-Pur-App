

## Plan: Move Invoices to Dedicated Page + Fix Mobile Responsiveness

### Two Issues

**1. Invoice section is embedded in Settings** — should be its own dedicated page (like Finance/Invoice History), accessible via a navigation button in Settings instead of the full form inline.

**2. Public invoice is squeezed on mobile** — the screenshot shows text crammed together because the table uses fixed column widths (`w-20`, `w-12`) and padding (`px-8`) that don't adapt to small screens.

---

### Changes

#### 1. Create dedicated Invoice page (`src/pages/Invoices.tsx`)
- New page that renders the `InvoiceSection` component within its own full-screen layout (same pattern as Finance/InvoiceHistory pages — back button header, scrollable content).
- Route already exists at `/invoices` pointing to InvoiceHistory. We'll create a new route `/invoices/new` for the creation flow, or better: merge creation + history into a single `/invoices` page with tabs.

**Approach**: Replace the current `/invoices` page (InvoiceHistory) with a combined page that has two tabs: **"New Invoice"** (the creation form) and **"History"** (the existing invoice list). This keeps everything in one clean section.

#### 2. Update Settings (`src/views/SettingsView.tsx`)
- Remove the inline `<InvoiceSection />` component.
- Replace it with a navigation button (same style as the "Earnings" button) that navigates to `/invoices`.

#### 3. Fix Public Invoice mobile responsiveness (`src/pages/PublicInvoice.tsx`)
From the screenshot, the issues are:
- `px-8` padding is too wide for small screens — change to `px-4 sm:px-8`
- Table columns `w-20`, `w-12` are fixed and squeeze the description — use responsive approach
- On mobile (<640px), switch to a **card-based layout** instead of a table: each line item as a stacked card showing property name, date, rate, and amount
- Header section needs `flex-col` on mobile instead of side-by-side
- Font sizes and spacing need mobile breakpoints

### No database changes needed.

