-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

GRANT DELETE, INSERT ON public.areas TO anon;

GRANT DELETE, INSERT ON public.areas TO authenticated;

GRANT DELETE, INSERT ON public.houses TO anon;

GRANT DELETE, INSERT ON public.houses TO authenticated;

GRANT DELETE, INSERT ON public.surfaces TO anon;

GRANT DELETE, INSERT ON public.surfaces TO authenticated;

GRANT DELETE, INSERT ON public.tiles TO anon;

GRANT DELETE, INSERT ON public.tiles TO authenticated;