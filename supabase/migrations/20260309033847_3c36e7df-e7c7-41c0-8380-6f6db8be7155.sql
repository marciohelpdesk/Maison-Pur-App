
ALTER TABLE public.inventory ADD COLUMN property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE;
CREATE INDEX idx_inventory_user_property ON public.inventory(user_id, property_id);
