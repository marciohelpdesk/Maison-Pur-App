

## Plan: Add Per-Line-Item Service Dates

### Problem
Currently the invoice has a single "Service Date" for the entire invoice, but in reality each property/service may be cleaned on a different day within the week. The invoice needs individual dates per line item.

### Changes

#### 1. `src/hooks/useInvoices.ts` — Add `service_date` to LineItem interface
- Add `service_date?: string` field to the `LineItem` interface (optional, since custom services may not have a date)

#### 2. `src/components/InvoiceSection.tsx` — Date picker per line item
- When a property is added, default its `service_date` to today's date
- Add a **date column** to the line items table with a compact date picker (popover calendar) on each row
- Remove the single "Service Date" field from the top-level Dates section (keep only "Due Date" at the top level since the service dates are now per-item)
- The overall invoice `service_date` will be auto-computed as a date range (e.g., "Mar 01–05, 2026") from the line items' individual dates
- Custom services also get a date picker

#### 3. `src/pages/PublicInvoice.tsx` — Show dates in public invoice table
- Add a **"Date"** column to the services table header
- Display each line item's `service_date` formatted nicely (e.g., "Mar 03")
- Replace the single "Service" date in the header meta with the computed date range
- Group or sort line items by date for better readability

### No database changes needed
The `line_items` column is JSONB, so adding `service_date` to line item objects requires no migration.

