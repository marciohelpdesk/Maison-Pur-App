
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS client_address text DEFAULT '',
  ADD COLUMN IF NOT EXISTS client_phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS due_date text DEFAULT '',
  ADD COLUMN IF NOT EXISTS notes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS discount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax numeric DEFAULT 0;
