
ALTER TABLE public.invoices
  ADD COLUMN property_ids text[] DEFAULT '{}',
  ADD COLUMN service_date text DEFAULT '',
  ADD COLUMN invoice_number text DEFAULT '',
  ADD COLUMN line_items jsonb DEFAULT '[]';
