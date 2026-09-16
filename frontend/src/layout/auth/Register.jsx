import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabaseClient";

const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

const invitationAlphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

const roleDestinations = {
  admin: "/admin",
  contractor: "/contractor",
  resident: "/resident",
};

const authCallbackErrorParameters = [
  "error",
  "error_code",
  "error_description",
];

function hasAuthCallbackError() {
  const searchParameters = new URLSearchParams(window.location.search);
  const hashParameters = new URLSearchParams(
    window.location.hash.replace(/^#/, ""),
  );

  return searchParameters.has("error") || hashParameters.has("error");
}

function clearAuthCallbackErrorParameters() {
  const url = new URL(window.location.href);
  const hashParameters = new URLSearchParams(url.hash.replace(/^#/, ""));

  authCallbackErrorParameters.forEach((parameter) => {
    url.searchParams.delete(parameter);
  });

  if (hashParameters.has("error")) {
    url.hash = "";
  }

  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
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
  const normalizedCode = normalizeInvitationCode(value);
  const groups = normalizedCode.match(/.{1,4}/g);

  return groups?.join("-") ?? "";
}

function RegistrationSteps({ currentStep }) {
  return (
    <ul
      className="steps steps-horizontal w-full"
      aria-label="Registration progress"
    >
      <li className={`step ${currentStep >= 1 ? "step-primary" : ""}`}>
        Account
      </li>

      <li className={`step ${currentStep >= 2 ? "step-primary" : ""}`}>
        Confirm
      </li>

      <li className={`step ${currentStep >= 3 ? "step-primary" : ""}`}>
        Invite
      </li>
    </ul>
  );
}

function Register() {
  const navigate = useNavigate();

  const { session, refreshProfile } = useAuth();

  const [authCallbackError, setAuthCallbackError] = useState(
    hasAuthCallbackError(),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [redeemingInvitation, setRedeemingInvitation] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (authCallbackError) {
      clearAuthCallbackErrorParameters();
    }
  }, [authCallbackError]);

  const currentStep = session ? 3 : confirmationEmail ? 2 : 1;

  const handleCreateAccount = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Enter your email address.");
      return;
    }

    if (!passwordPattern.test(password)) {
      toast.error(
        "Your password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.",
      );
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("The passwords do not match.");
      return;
    }

    setCreatingAccount(true);

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/register`,
      },
    });

    setCreatingAccount(false);

    if (error) {
      toast.error(
        error.message || "Unable to create your account. Please try again.",
      );
      return;
    }

    /*
     * Supabase returns no session while email confirmation
     * is required. The confirmation link returns the user
     * to /register and establishes the authenticated session.
     */
    if (!data.session) {
      setConfirmationEmail(normalizedEmail);
      setPassword("");
      setPasswordConfirmation("");

      toast.success("Check your email to continue.");
      return;
    }

    /*
     * If confirmations are disabled in another environment,
     * signUp may return a session immediately. AuthProvider
     * will then advance this page to the invitation step.
     */
    toast.success("Account created.");
    setAuthCallbackError(false);
  };

  const handleInvitationCodeChange = (event) => {
    setInvitationCode(formatInvitationCode(event.target.value));
  };

  const handleRedeemInvitation = async (event) => {
    event.preventDefault();

    const normalizedCode = normalizeInvitationCode(invitationCode);

    if (normalizedCode.length !== 12) {
      toast.error("Enter the complete 12-character invitation code.");
      return;
    }

    setRedeemingInvitation(true);

    const { data: role, error } = await supabase.rpc("redeem_invitation", {
      p_code: normalizedCode,
    });

    if (error) {
      setRedeemingInvitation(false);

      /*
       * This response concerns the authenticated user's own
       * profile, so it may be handled separately from the
       * generic invitation response.
       */
      if (error.message === "Profile already exists") {
        await refreshProfile();

        toast("Registration has already been completed.");
        navigate("/", { replace: true });
        return;
      }

      toast.error(
        "This invitation code is incorrect or no longer available. Check the code and make sure you registered with the invited email address. If the problem continues, contact the administrator.",
        {
          duration: 7000,
        },
      );

      return;
    }

    await refreshProfile();

    const destination = roleDestinations[role];

    if (!destination) {
      setRedeemingInvitation(false);

      toast.error(
        "Your account role could not be recognized. Contact the administrator.",
      );
      return;
    }

    toast.success("Registration complete.");
    navigate(destination, { replace: true });
  };

  const handleSignOut = async () => {
    setSigningOut(true);

    const { error } = await supabase.auth.signOut({
      scope: "local",
    });

    setSigningOut(false);

    if (error) {
      toast.error("Unable to sign out. Please try again.");
      return;
    }

    navigate("/login", { replace: true });
  };

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

          {authCallbackError && (
            <div className="alert alert-error" role="alert">
              <div>
                <h2 className="font-bold">Confirmation link unavailable</h2>

                <p className="text-xs">
                  This email confirmation link is invalid or has expired.
                  Complete the account step again to request a new confirmation
                  email.
                </p>
              </div>
            </div>
          )}

          <RegistrationSteps currentStep={currentStep} />

          {currentStep === 1 && (
            <form className="space-y-6" onSubmit={handleCreateAccount}>
              <div>
                <label className="floating-label input validator w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email"
                    autoComplete="email"
                    required
                    disabled={creatingAccount}
                  />

                  <span>Email</span>
                </label>
              </div>

              <div>
                <label className="floating-label input validator w-full">
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    autoComplete="new-password"
                    minLength="8"
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                    title="Use at least 8 characters, including an uppercase letter, a lowercase letter, and a number."
                    required
                    disabled={creatingAccount}
                  />

                  <span>Password</span>
                </label>

                <p className="mt-2">
                  Use at least 8 characters, including an uppercase letter, a
                  lowercase letter, and a number.
                </p>
              </div>

              <div>
                <label className="floating-label input validator w-full">
                  <input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(event) =>
                      setPasswordConfirmation(event.target.value)
                    }
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    minLength="8"
                    required
                    disabled={creatingAccount}
                  />

                  <span>Confirm password</span>
                </label>
              </div>

              <div className="card-actions justify-between">
                <Link className="btn btn-ghost" to="/login">
                  Cancel
                </Link>

                <button
                  className="btn"
                  type="submit"
                  disabled={creatingAccount}
                >
                  {creatingAccount && (
                    <span className="loading loading-bars loading-xs" />
                  )}
                  Create account
                </button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <section className="space-y-6">
              <div className="alert alert-info" role="status">
                <div>
                  <h2 className="font-bold">Confirm your email</h2>

                  <p className="text-xs">
                    We sent a confirmation link to{" "}
                    <strong>{confirmationEmail}</strong>. Open the link to
                    continue registration.
                  </p>
                </div>
              </div>

              <p className="text-xs">
                After confirmation, you will redirected to enter your invitation
                code. You may close this tab.
              </p>

              <div className="card-actions justify-end">
                <Link className="btn btn-ghost" to="/login">
                  Back to login
                </Link>
              </div>
            </section>
          )}

          {currentStep === 3 && (
            <form className="space-y-6" onSubmit={handleRedeemInvitation}>
              <div>
                <h2 className="font-bold">Enter your invitation code</h2>

                <p className="mt-2 text-xs">
                  Use the code supplied by the administrator.
                </p>
              </div>

              <div>
                <label className="floating-label input validator w-full">
                  <input
                    type="text"
                    value={invitationCode}
                    onChange={handleInvitationCodeChange}
                    placeholder="XXXX-XXXX-XXXX"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck="false"
                    maxLength="14"
                    required
                    disabled={redeemingInvitation}
                  />

                  <span>Invitation code</span>
                </label>
              </div>

              <div className="card-actions justify-between">
                <button
                  className="btn"
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut || redeemingInvitation}
                >
                  {signingOut ? (
                    <span className="loading loading-bars loading-xs" />
                  ) : (
                    "Sign out"
                  )}
                </button>

                <button
                  className="btn"
                  type="submit"
                  disabled={redeemingInvitation}
                >
                  {redeemingInvitation && (
                    <span className="loading loading-bars loading-xs" />
                  )}
                  Redeem invitation
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default Register;
