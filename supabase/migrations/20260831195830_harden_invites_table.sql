REVOKE ALL ON TABLE "public"."invites" FROM "anon";

REVOKE ALL ON TABLE "public"."invites" FROM "authenticated";

ALTER TABLE "public"."invites"
  ADD COLUMN "invited_email" text NOT NULL;

ALTER TABLE "public"."invites"
  ADD COLUMN "revoked_at" timestamp WITH time zone;

ALTER TABLE "public"."invites"
  ALTER COLUMN "expires_at" SET NOT NULL;
