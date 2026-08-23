grant maintain, references, trigger, truncate on public.houses to service_role;
grant select, insert, update, delete on public.houses to service_role;
grant select, insert, update, delete on public.houses to authenticated;

grant maintain, references, trigger, truncate on public.areas to service_role;
grant select, insert, update, delete on public.areas to service_role;
grant select, insert, update, delete on public.areas to authenticated;

grant maintain, references, trigger, truncate on public.surfaces to service_role;
grant select, insert, update, delete on public.surfaces to service_role;
grant select, insert, update, delete on public.surfaces to authenticated;

grant maintain, references, trigger, truncate on public.tiles to service_role;
grant select, insert, update, delete on public.tiles to service_role;
grant select on public.tiles to authenticated;

grant maintain, references, trigger, truncate on public.profiles to service_role;
grant select, insert, update, delete on public.profiles to service_role;
grant select, insert, update, delete on public.profiles to authenticated;

grant maintain, references, trigger, truncate on public.invite_codes to service_role;
grant select, insert, update, delete on public.invite_codes to service_role;
grant select on public.invite_codes to authenticated;

grant usage, select on all sequences in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated;
