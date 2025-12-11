-- Add link and linked_area_id columns to resources table

ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS link TEXT,
ADD COLUMN IF NOT EXISTS linked_area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL;

-- Comment on columns
COMMENT ON COLUMN public.resources.link IS 'Optional external URL for the resource';
COMMENT ON COLUMN public.resources.linked_area_id IS 'Optional link to a Realm/Area';
