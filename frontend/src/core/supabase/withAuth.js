import { supabase } from "./supabase";

export async function requireAuthSession() {
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;
  if (error || !user) {
    const err = new Error("Authentication required");
    err.code = "UNAUTHENTICATED";
    throw err;
  }
  return user;
}
