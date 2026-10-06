import { supabase } from "./supabaseClient";

export async function listPropertyMembershipsRequest() {
  const { data, error } = await supabase.rpc("list_property_memberships");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listPropertyAccessAccountsRequest() {
  const { data, error } = await supabase.rpc("list_property_access_accounts");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function grantPropertyAccessRequest({ profileId, propertyId }) {
  const { data, error } = await supabase.rpc("grant_property_access", {
    p_profile_id: profileId,
    p_property_id: propertyId,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Granting property access returned no membership ID.");
  }

  return data;
}

export async function revokePropertyAccessRequest(membershipId) {
  const { error } = await supabase.rpc("revoke_property_access", {
    p_membership_id: membershipId,
  });

  if (error) {
    throw error;
  }
}
