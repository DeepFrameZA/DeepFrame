-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

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
  ADD CONSTRAINT houses_pkey PRIMARY KEY (id);

ALTER TABLE public.houses
  ADD CONSTRAINT houses_unit_number_key UNIQUE (unit_number);

ALTER TABLE public.houses
  ADD CONSTRAINT houses_client_contact_number_key UNIQUE (client_contact_number);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.houses TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.houses TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.houses TO service_role;

CREATE INDEX idx_houses_unit_number ON public.houses (unit_number);

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

ALTER TABLE public.areas
  ADD CONSTRAINT areas_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.areas TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.areas TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.areas TO service_role;

CREATE INDEX idx_areas_house_id ON public.areas (house_id);

CREATE TABLE public.surfaces (
  id             uuid                     DEFAULT gen_random_uuid() NOT NULL,
  area_id        uuid,
  surface_length numeric,
  surface_width  numeric,
  surface_height numeric,
  name           text                     NOT NULL,
  sort_order     integer                  DEFAULT 0,
  created_at     timestamp with time zone DEFAULT now(),
  updated_at     timestamp with time zone DEFAULT now()
);

ALTER TABLE public.surfaces
  ADD CONSTRAINT surfaces_pkey PRIMARY KEY (id);

ALTER TABLE public.surfaces
  ADD CONSTRAINT surfaces_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id) ON DELETE CASCADE;

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

ALTER TABLE public.tiles
  ADD CONSTRAINT tiles_sku_key UNIQUE (sku);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.tiles TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.tiles TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.tiles TO service_role;

GRANT SELECT ON public.houses TO anon;
GRANT SELECT ON public.houses TO authenticated;

GRANT SELECT ON public.areas TO anon;
GRANT SELECT ON public.areas TO authenticated;

GRANT SELECT ON public.surfaces TO anon;
GRANT SELECT ON public.surfaces TO authenticated;

