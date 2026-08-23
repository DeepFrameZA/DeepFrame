create trigger set_houses_owner
  before insert on public.houses
  for each row execute procedure public.set_owner_user_id();

create trigger set_areas_owner
  before insert on public.areas
  for each row execute procedure public.set_owner_user_id();

create trigger set_surfaces_owner
  before insert on public.surfaces
  for each row execute procedure public.set_owner_user_id();
