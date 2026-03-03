

## Plan: Custom Service Line Items + Zelle Payment Info

### Problem
1. Invoice form only allows adding services by selecting properties — no way to add standalone services like sofa cleaning, steam cleaning, stove cleaning, etc.
2. The "Pay Now" button on the public invoice is a placeholder with no action.

### Changes

#### 1. `src/components/InvoiceSection.tsx` — Add Manual Line Items
- Add an **"Add Custom Service"** button below the property selector that appends a blank editable line item (no property link required)
- Custom line items will have `property_name` set to "Custom Service" and allow full editing of description, quantity, and rate
- Add a **delete button** (trash icon) on each line item row so users can remove individual services
- Add a list of **quick-add service presets** (e.g., "Sofa Cleaning", "Steam Cleaning", "Stove Deep Clean", "Oven Cleaning", "Window Cleaning") as small clickable chips that auto-populate a line item with a default description and $0 rate for the user to fill in
- Update the validation: change error message from "select at least one property" to "add at least one service"

#### 2. `src/pages/PublicInvoice.tsx` — Fix Pay Now Button
- Replace the non-functional "Pay Now" button with a clear **Zelle payment CTA**: "Pay via Zelle" that opens the default email/messaging app or simply highlights the Zelle email prominently
- For pending invoices, show a styled call-to-action card with the Zelle email (`payments@maisonpurusa.com`) and instructions
- For paid invoices, keep the current "This invoice has been paid" message

#### 3. `src/hooks/useInvoices.ts` — No Changes
The `LineItem` interface already supports `description`, `property_name`, `quantity`, `rate`, `total` — custom services fit the existing schema perfectly. No database changes needed.

### Technical Details
- Custom line items use `property_name: ''` and `address: ''` to distinguish from property-linked items
- The quick-add presets are a simple array of `{ label, description }` rendered as chips
- No database migration required — `line_items` JSONB already stores arbitrary items
- Public invoice Zelle button uses `mailto:` link or clipboard copy for the payment email

