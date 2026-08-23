-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

CREATE TYPE public.app_role AS ENUM (
  'admin',
  'contractor',
  'owner'
);

ALTER TABLE public.areas
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.areas
  ADD COLUMN user_id uuid;

ALTER TABLE public.areas
  ADD CONSTRAINT areas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

REVOKE DELETE, INSERT, SELECT, UPDATE ON public.areas FROM anon;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.areas TO service_role;

CREATE POLICY "Areas deletable by owner" ON public.areas
  FOR DELETE
  TO authenticated
  USING ((user_id = auth.uid()));

CREATE POLICY "Areas insertable by owner" ON public.areas
  FOR INSERT
  TO authenticated
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Areas readable by owner" ON public.areas
  FOR SELECT
  TO authenticated
  USING ((user_id = auth.uid()));

CREATE POLICY "Areas updatable by owner" ON public.areas
  FOR UPDATE
  TO authenticated
  USING ((user_id = auth.uid()));

ALTER TABLE public.houses
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.houses
  ADD COLUMN user_id uuid;

ALTER TABLE public.houses
  ADD CONSTRAINT houses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

REVOKE DELETE, INSERT, SELECT, UPDATE ON public.houses FROM anon;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.houses TO service_role;

CREATE POLICY "Homes deletable by owner" ON public.houses
  FOR DELETE
  TO authenticated
  USING ((user_id = auth.uid()));

CREATE POLICY "Homes insertable by owner" ON public.houses
  FOR INSERT
  TO authenticated
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Homes readable by owner" ON public.houses
  FOR SELECT
  TO authenticated
  USING ((user_id = auth.uid()));

CREATE POLICY "Homes updatable by owner" ON public.houses
  FOR UPDATE
  TO authenticated
  USING ((user_id = auth.uid()));

CREATE TABLE public.invite_codes (
  code       text                     NOT NULL,
  max_uses   integer                  DEFAULT 1,
  used_count integer                  DEFAULT 0,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.invite_codes
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.invite_codes
  ADD CONSTRAINT invite_codes_pkey PRIMARY KEY (code);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.invite_codes TO anon;

GRANT ALL ON public.invite_codes TO authenticated;

GRANT ALL ON public.invite_codes TO service_role;

CREATE TABLE public.profiles (
  id           uuid                     NOT NULL,
  display_name text,
  role         public.app_role          DEFAULT 'admin'::public.app_role NOT NULL,
  created_at   timestamp with time zone DEFAULT now(),
  updated_at   timestamp with time zone DEFAULT now()
);

CREATE POLICY "Admins manage invite codes" ON public.invite_codes
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.app_role)))));

ALTER TABLE public.profiles
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.profiles TO anon;

GRANT ALL ON public.profiles TO authenticated;

GRANT ALL ON public.profiles TO service_role;

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = id));

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = id));

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = id));

ALTER TABLE public.surfaces
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.surfaces
  ADD COLUMN user_id uuid;

ALTER TABLE public.surfaces
  ADD CONSTRAINT surfaces_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

REVOKE DELETE, INSERT, SELECT, UPDATE ON public.surfaces FROM anon;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.surfaces TO service_role;

CREATE POLICY "Surfaces deletable by owner" ON public.surfaces
  FOR DELETE
  TO authenticated
  USING ((user_id = auth.uid()));

CREATE POLICY "Surfaces insertable by owner" ON public.surfaces
  FOR INSERT
  TO authenticated
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Surfaces readable by owner" ON public.surfaces
  FOR SELECT
  TO authenticated
  USING ((user_id = auth.uid()));

CREATE POLICY "Surfaces updatable by owner" ON public.surfaces
  FOR UPDATE
  TO authenticated
  USING ((user_id = auth.uid()));

ALTER TABLE public.tiles
  ENABLE ROW LEVEL SECURITY;

REVOKE DELETE, INSERT, SELECT, UPDATE ON public.tiles FROM anon;

REVOKE DELETE, INSERT, UPDATE ON public.tiles FROM authenticated;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.tiles TO service_role;

CREATE POLICY "Tiles readable by authenticated users" ON public.tiles
  FOR SELECT
  TO authenticated
  USING (true);
