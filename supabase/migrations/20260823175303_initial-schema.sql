create type "public"."app_role" as enum ('admin', 'contractor', 'owner');


  create table "public"."areas" (
    "id" uuid not null default gen_random_uuid(),
    "house_id" uuid,
    "name" text not null,
    "sort_order" integer default 0,
    "user_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."areas" enable row level security;


  create table "public"."houses" (
    "id" uuid not null default gen_random_uuid(),
    "unit_number" text not null,
    "client_surname" text not null,
    "client_contact_number" text not null,
    "notes" text,
    "user_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."houses" enable row level security;


  create table "public"."invite_codes" (
    "code" text not null,
    "max_uses" integer default 1,
    "used_count" integer default 0,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."invite_codes" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "display_name" text,
    "role" public.app_role not null default 'owner'::public.app_role,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."surfaces" (
    "id" uuid not null default gen_random_uuid(),
    "area_id" uuid,
    "selected_tile" text,
    "surface_length" numeric,
    "surface_width" numeric,
    "surface_height" numeric,
    "name" text not null,
    "sort_order" integer default 0,
    "user_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."surfaces" enable row level security;


  create table "public"."tiles" (
    "sku" text not null,
    "description" text,
    "price_per_sqm" numeric,
    "price_per_box" numeric,
    "box_coverage_sqm" numeric,
    "unit" text default 'box'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."tiles" enable row level security;

CREATE UNIQUE INDEX areas_pkey ON public.areas USING btree (id);

CREATE UNIQUE INDEX houses_client_contact_number_key ON public.houses USING btree (client_contact_number);

CREATE UNIQUE INDEX houses_pkey ON public.houses USING btree (id);

CREATE UNIQUE INDEX houses_unit_number_key ON public.houses USING btree (unit_number);

CREATE INDEX idx_areas_house_id ON public.areas USING btree (house_id);

CREATE INDEX idx_houses_unit_number ON public.houses USING btree (unit_number);

CREATE INDEX idx_surfaces_area_id ON public.surfaces USING btree (area_id);

CREATE UNIQUE INDEX invite_codes_pkey ON public.invite_codes USING btree (code);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX surfaces_pkey ON public.surfaces USING btree (id);

CREATE UNIQUE INDEX tiles_pkey ON public.tiles USING btree (sku);

alter table "public"."areas" add constraint "areas_pkey" PRIMARY KEY using index "areas_pkey";

alter table "public"."houses" add constraint "houses_pkey" PRIMARY KEY using index "houses_pkey";

alter table "public"."invite_codes" add constraint "invite_codes_pkey" PRIMARY KEY using index "invite_codes_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."surfaces" add constraint "surfaces_pkey" PRIMARY KEY using index "surfaces_pkey";

alter table "public"."tiles" add constraint "tiles_pkey" PRIMARY KEY using index "tiles_pkey";

alter table "public"."areas" add constraint "areas_house_id_fkey" FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE not valid;

alter table "public"."areas" validate constraint "areas_house_id_fkey";

alter table "public"."areas" add constraint "areas_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."areas" validate constraint "areas_user_id_fkey";

alter table "public"."houses" add constraint "houses_client_contact_number_check" CHECK ((client_contact_number ~ '^(\+[1-9]\d{6,14}|[0-9]{10})$'::text)) not valid;

alter table "public"."houses" validate constraint "houses_client_contact_number_check";

alter table "public"."houses" add constraint "houses_client_contact_number_key" UNIQUE using index "houses_client_contact_number_key";

alter table "public"."houses" add constraint "houses_unit_number_key" UNIQUE using index "houses_unit_number_key";

alter table "public"."houses" add constraint "houses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."houses" validate constraint "houses_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."surfaces" add constraint "surfaces_area_id_fkey" FOREIGN KEY (area_id) REFERENCES public.areas(id) ON DELETE CASCADE not valid;

alter table "public"."surfaces" validate constraint "surfaces_area_id_fkey";

alter table "public"."surfaces" add constraint "surfaces_selected_tile_fkey" FOREIGN KEY (selected_tile) REFERENCES public.tiles(sku) ON DELETE SET NULL not valid;

alter table "public"."surfaces" validate constraint "surfaces_selected_tile_fkey";

alter table "public"."surfaces" add constraint "surfaces_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."surfaces" validate constraint "surfaces_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.before_user_created(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  v_code text := event->'user'->'raw_user_meta_data'->>'invite_code';
  v_found boolean;
begin
  if v_code is null or v_code = '' then
    raise exception 'invite code is required';
  end if;

  select true into v_found
  from public.invite_codes
  where code = v_code
    and (expires_at is null or expires_at > now())
    and used_count < max_uses
  for update;

  if not found then
    raise exception 'invalid or expired invite code';
  end if;

  update public.invite_codes
  set used_count = used_count + 1
  where code = v_code;

  return event;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.set_owner_user_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if NEW.user_id is null and auth.uid() is not null then
    NEW.user_id = auth.uid();
  end if;
  return NEW;
end;
$function$
;

grant references on table "public"."areas" to "anon";

grant trigger on table "public"."areas" to "anon";

grant truncate on table "public"."areas" to "anon";

grant delete on table "public"."areas" to "authenticated";

grant insert on table "public"."areas" to "authenticated";

grant references on table "public"."areas" to "authenticated";

grant select on table "public"."areas" to "authenticated";

grant trigger on table "public"."areas" to "authenticated";

grant truncate on table "public"."areas" to "authenticated";

grant update on table "public"."areas" to "authenticated";

grant delete on table "public"."areas" to "service_role";

grant insert on table "public"."areas" to "service_role";

grant references on table "public"."areas" to "service_role";

grant select on table "public"."areas" to "service_role";

grant trigger on table "public"."areas" to "service_role";

grant truncate on table "public"."areas" to "service_role";

grant update on table "public"."areas" to "service_role";

grant references on table "public"."houses" to "anon";

grant trigger on table "public"."houses" to "anon";

grant truncate on table "public"."houses" to "anon";

grant delete on table "public"."houses" to "authenticated";

grant insert on table "public"."houses" to "authenticated";

grant references on table "public"."houses" to "authenticated";

grant select on table "public"."houses" to "authenticated";

grant trigger on table "public"."houses" to "authenticated";

grant truncate on table "public"."houses" to "authenticated";

grant update on table "public"."houses" to "authenticated";

grant delete on table "public"."houses" to "service_role";

grant insert on table "public"."houses" to "service_role";

grant references on table "public"."houses" to "service_role";

grant select on table "public"."houses" to "service_role";

grant trigger on table "public"."houses" to "service_role";

grant truncate on table "public"."houses" to "service_role";

grant update on table "public"."houses" to "service_role";

grant references on table "public"."invite_codes" to "anon";

grant trigger on table "public"."invite_codes" to "anon";

grant truncate on table "public"."invite_codes" to "anon";

grant references on table "public"."invite_codes" to "authenticated";

grant select on table "public"."invite_codes" to "authenticated";

grant trigger on table "public"."invite_codes" to "authenticated";

grant truncate on table "public"."invite_codes" to "authenticated";

grant delete on table "public"."invite_codes" to "service_role";

grant insert on table "public"."invite_codes" to "service_role";

grant references on table "public"."invite_codes" to "service_role";

grant select on table "public"."invite_codes" to "service_role";

grant trigger on table "public"."invite_codes" to "service_role";

grant truncate on table "public"."invite_codes" to "service_role";

grant update on table "public"."invite_codes" to "service_role";

grant references on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant references on table "public"."surfaces" to "anon";

grant trigger on table "public"."surfaces" to "anon";

grant truncate on table "public"."surfaces" to "anon";

grant delete on table "public"."surfaces" to "authenticated";

grant insert on table "public"."surfaces" to "authenticated";

grant references on table "public"."surfaces" to "authenticated";

grant select on table "public"."surfaces" to "authenticated";

grant trigger on table "public"."surfaces" to "authenticated";

grant truncate on table "public"."surfaces" to "authenticated";

grant update on table "public"."surfaces" to "authenticated";

grant delete on table "public"."surfaces" to "service_role";

grant insert on table "public"."surfaces" to "service_role";

grant references on table "public"."surfaces" to "service_role";

grant select on table "public"."surfaces" to "service_role";

grant trigger on table "public"."surfaces" to "service_role";

grant truncate on table "public"."surfaces" to "service_role";

grant update on table "public"."surfaces" to "service_role";

grant references on table "public"."tiles" to "anon";

grant trigger on table "public"."tiles" to "anon";

grant truncate on table "public"."tiles" to "anon";

grant references on table "public"."tiles" to "authenticated";

grant select on table "public"."tiles" to "authenticated";

grant trigger on table "public"."tiles" to "authenticated";

grant truncate on table "public"."tiles" to "authenticated";

grant delete on table "public"."tiles" to "service_role";

grant insert on table "public"."tiles" to "service_role";

grant references on table "public"."tiles" to "service_role";

grant select on table "public"."tiles" to "service_role";

grant trigger on table "public"."tiles" to "service_role";

grant truncate on table "public"."tiles" to "service_role";

grant update on table "public"."tiles" to "service_role";


  create policy "Areas deletable by owner"
  on "public"."areas"
  as permissive
  for delete
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Areas insertable by owner"
  on "public"."areas"
  as permissive
  for insert
  to authenticated
with check (((( SELECT auth.uid() AS uid) IS NOT NULL) AND (user_id = ( SELECT auth.uid() AS uid))));



  create policy "Areas readable by owner"
  on "public"."areas"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Areas updatable by owner"
  on "public"."areas"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Homes deletable by owner"
  on "public"."houses"
  as permissive
  for delete
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Homes insertable by owner"
  on "public"."houses"
  as permissive
  for insert
  to authenticated
with check (((( SELECT auth.uid() AS uid) IS NOT NULL) AND (user_id = ( SELECT auth.uid() AS uid))));



  create policy "Homes readable by owner"
  on "public"."houses"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Homes updatable by owner"
  on "public"."houses"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Admins manage invite codes"
  on "public"."invite_codes"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.app_role)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.app_role)))));



  create policy "Users can insert own profile"
  on "public"."profiles"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = id));



  create policy "Users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = id));



  create policy "Users can view own profile"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = id));



  create policy "Surfaces deletable by owner"
  on "public"."surfaces"
  as permissive
  for delete
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Surfaces insertable by owner"
  on "public"."surfaces"
  as permissive
  for insert
  to authenticated
with check (((( SELECT auth.uid() AS uid) IS NOT NULL) AND (user_id = ( SELECT auth.uid() AS uid))));



  create policy "Surfaces readable by owner"
  on "public"."surfaces"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Surfaces updatable by owner"
  on "public"."surfaces"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Tiles readable by authenticated users"
  on "public"."tiles"
  as permissive
  for select
  to authenticated
using (true);


CREATE TRIGGER set_areas_owner BEFORE INSERT ON public.areas FOR EACH ROW EXECUTE FUNCTION public.set_owner_user_id();

CREATE TRIGGER set_houses_owner BEFORE INSERT ON public.houses FOR EACH ROW EXECUTE FUNCTION public.set_owner_user_id();

CREATE TRIGGER set_surfaces_owner BEFORE INSERT ON public.surfaces FOR EACH ROW EXECUTE FUNCTION public.set_owner_user_id();


