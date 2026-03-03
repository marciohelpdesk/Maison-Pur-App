

## Plan: Fix Invoice Description + Zelle Phone Number

### Issues from Screenshot
1. **Line items show generic "Airbnb Cleaning Cleaning"** instead of the property name prominently — the property name (Lake Shore, Mahalo, etc.) should be the main description, with service type as secondary info.
2. **Zelle payment info uses email** (`payments@maisonpurusa.com`) but should use the company phone number: **(941) 330-4713**.

### Changes

#### 1. `src/components/InvoiceSection.tsx` — Fix line item description when adding from property
- Change line ~63: instead of `description: "${property.serviceType || 'Standard'} Cleaning"`, use `description: property.name` (the property name as the main label)
- The `property_name` field already stores the property name, but it only shows as small subtitle text — make description = property name so it's prominent

#### 2. `src/pages/PublicInvoice.tsx` — Two fixes
- **Table description**: Swap the display — show `property_name` as the bold primary text (if present), with `description` as the subtitle. Currently line 157 shows `li.description` as primary and `li.property_name` as subtitle.
- **Zelle section**: Change from email (`payments@maisonpurusa.com`) to phone number `(941) 330-4713`. Update the clipboard copy, icon (Phone instead of Mail), and display text accordingly.

### No database changes needed.

