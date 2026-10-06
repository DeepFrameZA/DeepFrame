import { supabase } from "./supabaseClient";

export async function listInvitationsRequest() {
  const { data, error } = await supabase.rpc("list_invitations");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createInvitationRequest({
  invitedEmail,
  role,
  propertyIds = [],
}) {
  const { data, error } = await supabase.rpc("create_invitation", {
    p_invited_email: invitedEmail,
    p_role: role,
    p_property_ids: propertyIds,
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

export async function createSignupTicketRequest({ email, code }) {
  const { data, error } = await supabase.rpc("create_signup_ticket", {
    p_email: email,
    p_code: code,
  });

  if (error) {
    throw error;
  }

  const ticket = data?.[0];

  if (!ticket?.signup_ticket) {
    throw new Error("Unable to prepare registration. Please try again.");
  }

  return ticket;
}
