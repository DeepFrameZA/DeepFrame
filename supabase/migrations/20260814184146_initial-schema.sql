-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

GRANT UPDATE ON public.areas TO anon;

GRANT UPDATE ON public.areas TO authenticated;

GRANT UPDATE ON public.houses TO anon;

GRANT UPDATE ON public.houses TO authenticated;

GRANT UPDATE ON public.surfaces TO anon;

GRANT UPDATE ON public.surfaces TO authenticated;

GRANT UPDATE ON public.tiles TO anon;

GRANT UPDATE ON public.tiles TO authenticated;