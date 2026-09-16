import { supabase } from "./supabaseClient";

export async function listInvitationsRequest() {
  const { data, error } = await supabase.rpc("list_invitations");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createInvitationRequest({ invitedEmail, role }) {
  const { data, error } = await supabase.rpc("create_invitation", {
    p_invited_email: invitedEmail,
    p_role: role,
  });

  if (error) {
    throw error;
  }

  const invitation = data?.[0];

  if (!invitation) {
    throw new Error("Invitation creation returned no result.");
  }

  return invitation;
}

export async function revokeInvitationRequest(invitationId) {
  const { error } = await supabase.rpc("revoke_invitation", {
    p_invitation_id: invitationId,
  });

  if (error) {
    throw error;
  }
}
