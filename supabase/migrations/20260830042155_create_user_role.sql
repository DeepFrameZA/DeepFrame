CREATE TYPE "public"."user_role" AS ENUM (
  'admin',
  'resident',
  'contractor'
);

GRANT USAGE ON TYPE "public"."user_role" TO "postgres";
