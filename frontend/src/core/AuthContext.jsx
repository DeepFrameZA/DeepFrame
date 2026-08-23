/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase/supabase";
import { toast } from "react-hot-toast";
import { getErrorMessage, getDevErrorMessage } from "./utils/message";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId) {
    if (!userId) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      setProfile(null);
      console.error("Failed to load profile", error);
      return;
    }

    setProfile(data);
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(sessionData.session);
      await loadProfile(sessionData.session?.user?.id);
      setLoading(false);
    }

    load();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      await loadProfile(session?.user?.id);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(getDevErrorMessage(error) ?? getErrorMessage(error, "Sign in failed"));
      throw error;
    }
    toast.success("Signed in");
  }

  async function signUp({ email, password, displayName, inviteCode }) {
    if (!inviteCode) throw new Error("Invite code is required");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, invite_code: inviteCode },
      },
    });
    if (error) {
      toast.error(getDevErrorMessage(error) ?? getErrorMessage(error, "Signup failed"));
      throw error;
    }
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          display_name: displayName,
        });

      if (profileError) {
        toast.error(getDevErrorMessage(profileError) ?? getErrorMessage(profileError, "Profile setup failed"));
        throw profileError;
      }
    }
    toast.success("Signup successful. Verify email if required.");
  }

  async function resetPasswordForEmail(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(getDevErrorMessage(error) ?? getErrorMessage(error, "Password reset failed"));
      throw error;
    }
    toast.success("Password reset email sent");
  }

  async function updatePassword({ password }) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(getDevErrorMessage(error) ?? getErrorMessage(error, "Password update failed"));
      throw error;
    }
    toast.success("Password updated successfully");
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    toast.success("Signed out");
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        role: profile?.role ?? null,
        loading,
        signIn,
        signUp,
        resetPasswordForEmail,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
