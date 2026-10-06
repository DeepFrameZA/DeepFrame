CREATE TABLE "public"."addresses" (
  "id"                 uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "street_address"     text                     NOT NULL,
  "suburb_or_locality" text,
  "city_or_town"       text,
  "postal_code"        text,
  "created_at"         timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "addresses_pkey" PRIMARY KEY (id),
  CONSTRAINT "addresses_street_address_check" CHECK ((btrim(street_address) <> ''::text))
);

ALTER TABLE "public"."addresses"
  ENABLE ROW LEVEL SECURITY;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."addresses" TO "anon", "authenticated", "postgres", "service_role";
