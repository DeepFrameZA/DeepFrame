import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabaseClient";
import { createSignupTicketRequest } from "../../lib/invitation";
import RequiredBadge from "../../components/RequiredBadge";

const pendingEmailKey = "deepframe.registration.email";
const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const invitationAlphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function readPendingEmail() {
  try {
    return sessionStorage.getItem(pendingEmailKey) ?? "";
  } catch {
    return "";
  }
}

function storePendingEmail(email) {
  try {
    if (email) {
      sessionStorage.setItem(pendingEmailKey, email);
    } else {
      sessionStorage.removeItem(pendingEmailKey);
    }
  } catch {
    // Registration still works when browser storage is unavailable.
  }
}

function normalizeInvitationCode(value) {
  return value
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .split("")
    .filter((character) => invitationAlphabet.includes(character))
    .join("")
    .slice(0, 12);
}

function formatInvitationCode(value) {
  return (
    normalizeInvitationCode(value)
      .match(/.{1,4}/g)
      ?.join("-") ?? ""
  );
}

function RegistrationSteps({ currentStep }) {
  return (
    <ul
      className="steps steps-horizontal w-full"
      aria-label="Registration progress"
    >
      {["Invitation", "Verify email", "Password"].map((label, index) => (
        <li
          key={label}
          className={`step ${currentStep >= index + 1 ? "step-primary" : ""}`}
          aria-current={currentStep === index + 1 ? "step" : undefined}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}

function Register() {
  const navigate = useNavigate();
  const {
    session,
    profile,
    loading,
    error: authError,
    refreshProfile,
    setRegistrationPending,
  } = useAuth();

  const [pendingEmail, setPendingEmail] = useState(readPendingEmail);
  const [email, setEmail] = useState(readPendingEmail);
  const [invitationCode, setInvitationCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [action, setAction] = useState(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const actionRef = useRef(false);

  /*
   * Keep this screen mounted throughout registration, including
   * Auth events between verification, password setup, and sign-out.
   *
   * RegistrationRoute still redirects recovery sessions.
   * Backend rules remain responsible for authorization.
   */
  useEffect(() => {
    setRegistrationPending(true);

    return () => {
      setRegistrationPending(false);
    };
  }, [setRegistrationPending]);

  const busy = action !== null;
  const disabled = busy || loading || Boolean(authError);
  const completed = registrationComplete || Boolean(profile);
  const currentStep = session ? 3 : pendingEmail ? 2 : 1;

  function beginAction(name) {
    if (actionRef.current) {
      return false;
    }

    actionRef.current = true;
    setAction(name);
    return true;
  }

  function endAction() {
    actionRef.current = false;
    setAction(null);
  }

  function clearPendingEmail() {
    storePendingEmail("");
    setPendingEmail("");
  }

  /*
   * Synchronize the provider after sign-out so the login route
   * does not see the old authenticated session.
   */
  async function signOutToLogin(message) {
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      throw error;
    }

    clearPendingEmail();
    setInvitationCode("");
    setVerificationCode("");
    setPassword("");
    setPasswordConfirmation("");

    await refreshProfile();

    if (message) {
      toast.success(message);
    }

    navigate("/login", { replace: true });
  }

  async function handleStart(event) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = normalizeInvitationCode(invitationCode);

    if (!normalizedEmail || normalizedCode.length !== 12) {
      toast.error("Enter your invited email and complete invitation code.");
      return;
    }

    if (!beginAction("request")) {
      return;
    }

    try {
      /*
       * Every new signup attempt obtains a fresh ticket.
       * Auth failure can still leave the previous ticket consumed.
       */
      const ticket = await createSignupTicketRequest({
        email: normalizedEmail,
        code: normalizedCode,
      });

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
          data: {
            signup_ticket: ticket.signup_ticket,
          },
        },
      });

      if (error) {
        throw error;
      }

      storePendingEmail(normalizedEmail);
      setPendingEmail(normalizedEmail);
      setEmail(normalizedEmail);
      setInvitationCode("");
      setVerificationCode("");

      toast.success("Check your email for the verification code.");
    } catch {
      toast.error(
        "Unable to start registration. Check your invited email and invitation code. If you have tried several times, wait five minutes before trying again.",
        { duration: 7000 },
      );
    } finally {
      endAction();
    }
  }

  async function handleResend() {
    if (!pendingEmail || !beginAction("resend")) {
      return;
    }

    try {
      /*
       * The initial request already created the preliminary account.
       * Resending must not create another account or signup ticket.
       */
      const { error } = await supabase.auth.signInWithOtp({
        email: pendingEmail,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        throw error;
      }

      setVerificationCode("");
      toast.success(
        "A verification code has been requested. Check your email.",
      );
    } catch {
      toast.error(
        "Unable to resend the code. Please wait a moment and try again.",
      );
    } finally {
      endAction();
    }
  }

  async function handleVerify(event) {
    event.preventDefault();

    const token = verificationCode.trim();

    if (!/^\d{6}$/.test(token)) {
      toast.error("Enter the six-digit verification code.");
      return;
    }

    if (!beginAction("verify")) {
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token,
        type: "email",
      });

      if (error || !data.session) {
        throw error ?? new Error("No verification session returned");
      }

      setVerificationCode("");
      await refreshProfile();
      clearPendingEmail();

      toast.success("Email verified.");
    } catch {
      toast.error(
        "Unable to verify your email. Use the newest code or request another one.",
      );
    } finally {
      endAction();
    }
  }

  function handleChangeEmail() {
    clearPendingEmail();
    setVerificationCode("");
    setInvitationCode("");
  }

  async function handleComplete(event) {
    event.preventDefault();

    if (!passwordPattern.test(password)) {
      toast.error(
        "Use at least 8 characters, including an uppercase letter, a lowercase letter, and a number.",
      );
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("The passwords do not match.");
      return;
    }

    if (!beginAction("complete")) {
      return;
    }

    let completionSucceeded = false;
    let phase = "password";

    try {
      /*
       * Confirm the current server-side account identity before
       * changing its password. This also detects a session changed
       * by another tab since this form was rendered.
       */
      const { data: account, error: accountError } =
        await supabase.auth.getUser();

      if (
        accountError ||
        !account.user ||
        account.user.id !== session?.user.id ||
        !account.user.email_confirmed_at ||
        !account.user.email
      ) {
        throw accountError ?? new Error("Registration session changed");
      }

      const { error: passwordError } = await supabase.auth.updateUser({
        password,
      });

      /*
       * A retry may follow an earlier successful password update.
       * Password sign-in below still has to prove this password works.
       */
      if (passwordError && passwordError.code !== "same_password") {
        throw passwordError;
      }

      phase = "authentication";

      const { data: signedIn, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: account.user.email,
          password,
        });

      if (
        signInError ||
        !signedIn.session ||
        signedIn.user?.id !== account.user.id
      ) {
        throw signInError ?? new Error("Password authentication failed");
      }

      phase = "completion";

      const { data: role, error: completionError } = await supabase.rpc(
        "complete_registration",
      );

      if (completionError) {
        throw completionError;
      }

      if (!["resident", "contractor"].includes(role)) {
        throw new Error("Unexpected registration role");
      }

      completionSucceeded = true;
      setRegistrationComplete(true);
      setPassword("");
      setPasswordConfirmation("");

      phase = "signout";

      /*
       * Let the completed screen remain visible for three seconds
       * before signing out and navigating to login.
       */
      await new Promise((resolve) => {
        window.setTimeout(resolve, 3000);
      });

      await signOutToLogin("Registration complete. You can now log in.");
    } catch {
      if (completionSucceeded) {
        toast.error(
          "Registration is complete, but sign-out could not be finished. Select Login to try again.",
          { duration: 7000 },
        );
      } else if (phase === "completion") {
        toast.error(
          "Unable to complete registration. You can retry. If your invitation is no longer available, contact the administrator.",
          { duration: 7000 },
        );
      } else {
        toast.error(
          "Unable to finish password setup. Please try again. If your session has expired, sign out and restart registration.",
          { duration: 7000 },
        );
      }
    } finally {
      endAction();
    }
  }

  async function handleSignOut() {
    if (!beginAction("signout")) {
      return;
    }

    try {
      await signOutToLogin(
        registrationComplete
          ? "Registration complete. You can now log in."
          : undefined,
      );
    } catch {
      toast.error("Unable to finish signing out. Please try again.");
    } finally {
      endAction();
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="card card-border bg-base-100 w-full max-w-md">
        <div className="card-body gap-6">
          <div>
            <h1 className="card-title">Register</h1>
            <p className="mt-2">
              Registration is available to invited residents and contractors.
            </p>
          </div>

          {authError && (
            <div className="alert alert-error" role="alert">
              Unable to load your account. Refresh the page or sign out and try
              again.
            </div>
          )}

          {completed ? (
            <section className="space-y-6">
              <div className="alert alert-success" role="status">
                {registrationComplete && busy
                  ? "Registration complete. Taking you to login…"
                  : "Your account is registered. Select Login to continue."}
              </div>

              <div className="card-actions justify-end">
                <button
                  className="btn w-23"
                  type="button"
                  onClick={handleSignOut}
                  disabled={busy}
                  aria-label="Login"
                  aria-busy={busy}
                >
                  {busy ? (
                    <span className="loading loading-bars loading-xs" />
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
            </section>
          ) : (
            <>
              <RegistrationSteps currentStep={currentStep} />

              {currentStep === 1 && (
                <form className="space-y-6" onSubmit={handleStart}>
                  <fieldset>
                    <h3 className="label pb-2">Your email address:</h3>
                    <label className="floating-label input validator w-full">
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Email"
                        autoComplete="email"
                        required
                        disabled={disabled}
                      />
                      <span>Email</span>
                      <RequiredBadge />
                    </label>
                  </fieldset>

                  <fieldset>
                    <h3 className="label pb-2">Your invitation code:</h3>
                    <label className="floating-label input validator w-full">
                      <input
                        type="text"
                        value={invitationCode}
                        onChange={(event) =>
                          setInvitationCode(
                            formatInvitationCode(event.target.value),
                          )
                        }
                        placeholder="XXXX-XXXX-XXXX"
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        maxLength={14}
                        required
                        disabled={disabled}
                      />
                      <span>Invitation code</span>
                      <RequiredBadge />
                    </label>
                  </fieldset>

                  <div className="card-actions justify-between">
                    {busy ? (
                      <button className="btn w-23 btn-ghost" disabled>
                        Cancel
                      </button>
                    ) : (
                      <Link className="btn w-23 btn-ghost" to="/login">
                        Cancel
                      </Link>
                    )}

                    <button
                      className="btn w-23"
                      type="submit"
                      disabled={disabled}
                      aria-label="Continue"
                      aria-busy={action === "request"}
                    >
                      {busy ? (
                        <span className="loading loading-bars loading-xs" />
                      ) : (
                        "Continue"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {currentStep === 2 && (
                <form className="space-y-6" onSubmit={handleVerify}>
                  <div className="alert alert-info" role="status">
                    <p>
                      Enter the six-digit code sent to{" "}
                      <strong>{pendingEmail}</strong>.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <label className="otp validator">
                      <span aria-hidden="true" />
                      <span aria-hidden="true" />
                      <span aria-hidden="true" />
                      <span aria-hidden="true" />
                      <span aria-hidden="true" />
                      <span aria-hidden="true" />

                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        aria-label="Six-digit verification code"
                        value={verificationCode}
                        onChange={(event) =>
                          setVerificationCode(
                            event.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        pattern="[0-9]{6}"
                        minLength={6}
                        maxLength={6}
                        required
                        disabled={disabled}
                      />
                    </label>
                  </div>

                  <div className="divider" />

                  <div className="flex flex-col gap-1">
                    <div className="w-full">
                      <span className="mr-2">Didn't get a code?</span>
                      <button
                        className="link"
                        type="button"
                        onClick={handleResend}
                        disabled={disabled}
                        aria-label="Resend code"
                        aria-busy={action === "resend"}
                      >
                        {action === "resend" ? (
                          <span className="loading loading-bars loading-xs" />
                        ) : (
                          "Resend code"
                        )}
                      </button>
                    </div>
                    <div className="w-full">
                      <span className="mr-2">Not the correct email?</span>

                      <button
                        className="link"
                        type="button"
                        onClick={handleChangeEmail}
                        disabled={disabled}
                      >
                        Change email
                      </button>
                    </div>
                  </div>

                  <div className="card-actions justify-end">
                    <button
                      className="btn w-23"
                      type="submit"
                      disabled={disabled}
                      aria-label="Verify email"
                      aria-busy={action === "verify"}
                    >
                      {action === "verify" ? (
                        <span className="loading loading-bars loading-xs" />
                      ) : (
                        "Verify"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {currentStep === 3 && (
                <form className="space-y-6" onSubmit={handleComplete}>
                  <p>
                    Set a password for <strong>{session.user.email}</strong>.
                  </p>

                  <div>
                    <label className="floating-label input validator w-full">
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Password"
                        autoComplete="new-password"
                        minLength={8}
                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                        required
                        disabled={disabled}
                      />
                      <span>Password</span>
                      <RequiredBadge />
                    </label>

                    <p className="mt-2 text-xs">
                      Use at least 8 characters, including an uppercase letter,
                      a lowercase letter, and a number.
                    </p>
                  </div>

                  <label className="floating-label input validator w-full">
                    <input
                      type="password"
                      value={passwordConfirmation}
                      onChange={(event) =>
                        setPasswordConfirmation(event.target.value)
                      }
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      disabled={disabled}
                    />
                    <span>Confirm password</span>
                    <RequiredBadge />
                  </label>

                  <div className="card-actions justify-between">
                    <button
                      className="btn btn-ghost w-23"
                      type="button"
                      onClick={handleSignOut}
                      disabled={busy}
                    >
                      Sign out
                    </button>

                    <button
                      className="btn w-23"
                      type="submit"
                      disabled={disabled}
                      aria-label="Create account"
                      aria-busy={action === "complete"}
                    >
                      {action === "complete" ? (
                        <span className="loading loading-bars loading-xs" />
                      ) : (
                        "Create"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default Register;
