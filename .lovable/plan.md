

## Plan: Robust Invoice System Linked to Properties & Jobs

### Problem
Current invoice form is a simple manual entry with Portuguese text and Euro currency. User needs invoices tied to their properties/jobs, in English, with USD currency.

### Database Migration
Add new columns to `invoices` table:
- `property_ids` (text[] — array of property IDs selected)
- `service_date` (text — date the cleaning was performed)
- `invoice_number` (text — auto-generated sequential number like INV-001)
- `line_items` (jsonb — array of `{property_name, address, service_type, price}`)

### Changes to `src/components/InvoiceSection.tsx`
Complete rewrite of the form and listing, all in English:
- **Property selector**: Multi-select checklist of user's properties (fetched via `useProperties`). Each selected property auto-populates a line item with its name, address, service type, and `base_price`.
- **Service date picker**: Date input for when cleaning was performed.
- **Line items table**: Shows each selected property as a row with editable price. Total auto-calculates.
- **Client name/email**: Kept as manual fields.
- **Currency**: All amounts displayed as `$` (USD).
- **All labels and messages in English**.

### Changes to `src/hooks/useInvoices.ts`
- Update `Invoice` interface to include new fields (`property_ids`, `service_date`, `invoice_number`, `line_items`).
- Update `createInvoice` mutation to accept and store the new data.
- Toast messages in English.

### Changes to `src/pages/PublicInvoice.tsx`
- All text in English ("Billed To", "Description", "Date", "Total", "Paid", "Pending", "Pay Now", "Invoice not found").
- Currency symbol changed from `€` to `$`.
- Display line items table showing each property/service with individual prices.
- Show invoice number and service date.

### Technical Details
- `InvoiceSection` will import and use `useProperties(userId)` to get the property list.
- Selected properties generate line items with pre-filled prices from `base_price`.
- Invoice number generated client-side as `INV-{timestamp-based sequence}`.
- No changes to RLS policies needed — same access patterns.

