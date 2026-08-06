-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

CREATE TABLE public.areas (
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  house_id   uuid,
  name       text                     NOT NULL,
  sort_order integer                  DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.areas
  ADD CONSTRAINT areas_pkey PRIMARY KEY (id);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.areas TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.areas TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.areas TO service_role;

CREATE INDEX idx_areas_house_id ON public.areas (house_id);

CREATE TABLE public.houses (
  id                    uuid                     DEFAULT gen_random_uuid() NOT NULL,
  unit_number           text                     NOT NULL,
  client_surname        text                     NOT NULL,
  client_contact_number text                     NOT NULL,
  notes                 text,
  created_at            timestamp with time zone DEFAULT now(),
  updated_at            timestamp with time zone DEFAULT now()
);

ALTER TABLE public.houses
  ADD CONSTRAINT houses_client_contact_number_key UNIQUE (client_contact_number);

ALTER TABLE public.houses
  ADD CONSTRAINT houses_pkey PRIMARY KEY (id);

ALTER TABLE public.areas
  ADD CONSTRAINT areas_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;

ALTER TABLE public.houses
  ADD CONSTRAINT houses_unit_number_key UNIQUE (unit_number);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.houses TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.houses TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.houses TO service_role;

CREATE INDEX idx_houses_unit_number ON public.houses (unit_number);

CREATE TABLE public.selections (
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  surface_id uuid,
  tile_id    uuid,
  quantity   numeric                  DEFAULT 1 NOT NULL,
  notes      text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.selections
  ADD CONSTRAINT selections_pkey PRIMARY KEY (id);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.selections TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.selections TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.selections TO service_role;

CREATE INDEX idx_selections_surface_id ON public.selections (surface_id);

CREATE TABLE public.surface_types (
  id   uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL
);

ALTER TABLE public.surface_types
  ADD CONSTRAINT surface_types_name_key UNIQUE (name);

ALTER TABLE public.surface_types
  ADD CONSTRAINT surface_types_pkey PRIMARY KEY (id);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.surface_types TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.surface_types TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.surface_types TO service_role;

CREATE TABLE public.surfaces (
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  area_id    uuid,
  type_id    uuid                     NOT NULL,
  length     numeric,
  width      numeric,
  height     numeric,
  name       text                     NOT NULL,
  sort_order integer                  DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.surfaces
  ADD CONSTRAINT surfaces_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id) ON DELETE CASCADE;

ALTER TABLE public.surfaces
  ADD CONSTRAINT surfaces_pkey PRIMARY KEY (id);

ALTER TABLE public.selections
  ADD CONSTRAINT selections_surface_id_fkey FOREIGN KEY (surface_id) REFERENCES public.surfaces(id) ON DELETE CASCADE;

ALTER TABLE public.surfaces
  ADD CONSTRAINT surfaces_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.surface_types(id);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.surfaces TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.surfaces TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.surfaces TO service_role;

CREATE INDEX idx_surfaces_area_id ON public.surfaces (area_id);

CREATE TABLE public.tiles (
  id               uuid                     DEFAULT gen_random_uuid() NOT NULL,
  sku              text                     NOT NULL,
  description      text,
  price_per_sqm    numeric,
  price_per_box    numeric,
  box_coverage_sqm numeric,
  unit             text                     DEFAULT 'box'::text,
  created_at       timestamp with time zone DEFAULT now(),
  updated_at       timestamp with time zone DEFAULT now()
);

ALTER TABLE public.tiles
  ADD CONSTRAINT tiles_pkey PRIMARY KEY (id);

ALTER TABLE public.selections
  ADD CONSTRAINT selections_tile_id_fkey FOREIGN KEY (tile_id) REFERENCES public.tiles(id);

ALTER TABLE public.tiles
  ADD CONSTRAINT tiles_sku_key UNIQUE (sku);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.tiles TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.tiles TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.tiles TO service_role;

GRANT SELECT ON public.houses TO anon;
GRANT SELECT ON public.houses TO authenticated;

GRANT SELECT ON public.areas TO anon;
GRANT SELECT ON public.areas TO authenticated;
