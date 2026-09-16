import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AuthContext from "./AuthContext";

function decodeAccessToken(session) {
  const accessToken = session?.access_token;

  if (!accessToken) {
    return null;
  }

  try {
    const encodedPayload = accessToken.split(".")[1];

    if (!encodedPayload) {
      return null;
    }

    const base64Payload = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");

    const binaryPayload = window.atob(base64Payload);

    const payloadBytes = Uint8Array.from(binaryPayload, (character) =>
      character.charCodeAt(0),
    );

    return JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch {
    return null;
  }
}

function hasRecoveryClaim(session) {
  const claims = decodeAccessToken(session);

  /*
   * This claim is added by DeepFrame's custom access-token
   * hook and is therefore part of the server-signed JWT.
   *
   * Reading it here is only used for frontend routing.
   * PostgreSQL independently enforces recovery restrictions
   * through is_recovery_session(), RLS, and is_admin().
   */
  return claims?.app_metadata?.deepframe_recovery === true;
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recovery, setRecovery] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mountedRef = useRef(false);
  const sessionRef = useRef(null);
  const requestSequenceRef = useRef(0);

  const synchronizeSession = useCallback(async (nextSession) => {
    const requestSequence = ++requestSequenceRef.current;

    const nextRecovery =
      Boolean(nextSession?.user) && hasRecoveryClaim(nextSession);

    sessionRef.current = nextSession;

    if (mountedRef.current) {
      setSession(nextSession);
      setProfile(null);
      setRecovery(nextRecovery);
      setError(null);
      setLoading(true);
    }

    if (!nextSession?.user) {
      if (
        mountedRef.current &&
        requestSequence === requestSequenceRef.current
      ) {
        setLoading(false);
      }

      return;
    }

    /*
     * Recovery sessions may update the password, but they
     * must not be treated as ordinary application sessions.
     *
     * Backend authorization already prevents these sessions
     * from reading profiles or receiving admin privileges.
     * Skipping this query also prevents misleading frontend
     * state and unnecessary rejected requests.
     */
    if (nextRecovery) {
      if (
        mountedRef.current &&
        requestSequence === requestSequenceRef.current
      ) {
        setLoading(false);
      }

      return;
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, created_at")
      .eq("id", nextSession.user.id)
      .maybeSingle();

    if (!mountedRef.current || requestSequence !== requestSequenceRef.current) {
      return;
    }

    if (profileError) {
      setProfile(null);
      setError(profileError);
      setLoading(false);
      return;
    }

    setProfile(data);
    setLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    await synchronizeSession(sessionRef.current);
  }, [synchronizeSession]);

  useEffect(() => {
    mountedRef.current = true;

    const initializeSession = async () => {
      const {
        data: { session: initialSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!mountedRef.current) {
        return;
      }

      if (sessionError) {
        sessionRef.current = null;

        setSession(null);
        setProfile(null);
        setRecovery(false);
        setError(sessionError);
        setLoading(false);
        return;
      }

      await synchronizeSession(initialSession);
    };

    void initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_authEvent, nextSession) => {
      /*
       * Keep asynchronous Supabase work outside the Auth
       * callback to avoid callback deadlocks.
       *
       * Supabase synchronizes Auth sessions between tabs.
       * Each synchronized recovery token contains the signed
       * deepframe_recovery claim.
       */
      setTimeout(() => {
        if (mountedRef.current) {
          void synchronizeSession(nextSession);
        }
      }, 0);
    });

    return () => {
      mountedRef.current = false;
      requestSequenceRef.current += 1;
      subscription.unsubscribe();
    };
  }, [synchronizeSession]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      recovery,
      loading,
      error,
      refreshProfile,
    }),
    [session, profile, recovery, loading, error, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
