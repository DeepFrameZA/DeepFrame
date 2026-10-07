import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabaseClient";
import RequiredBadge from "../../components/RequiredBadge";

const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

function ResetPassword() {
  const { session, loading } = useAuth();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [resetting, setResetting] = useState(false);

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-4">
        <div className="card card-border bg-base-100 w-full max-w-md">
          <div className="card-body">
            <div className="flex justify-center">
              <span
                className="loading loading-bars loading-xl"
                aria-label="Loading"
              />
            </div>
            <p className="mt-4 text-center">Verifying your session...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

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

    setResetting(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setResetting(false);
      toast.error("Unable to update password. Please try again.");
      return;
    }

    const { error: signOutError } = await supabase.auth.signOut({
      scope: "local",
    });

    if (signOutError) {
      setResetting(false);
      toast.error(
        "Your password was updated, but you could not be signed out. Please sign out manually.",
      );
      return;
    }

    toast.success("Password updated. Please sign in with your new password.");
  };

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="card card-border bg-base-100 w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title mb-4">Reset password</h1>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="floating-label input validator w-full">
                <svg
                  className="h-[1em] opacity-50"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
                    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
                  </g>
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="New password"
                  autoComplete="new-password"
                  minLength="8"
                  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                  title="Use at least 8 characters, including an uppercase letter, a lowercase letter, and a number."
                  required
                  disabled={resetting}
                />
                <span>New password</span>
                <RequiredBadge />
              </label>

              <p className="mt-2">
                Use at least 8 characters, including an uppercase letter, a
                lowercase letter, and a number.
              </p>
            </div>

            <div>
              <label className="floating-label input validator w-full">
                <svg
                  className="h-[1em] opacity-50"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
                    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
                  </g>
                </svg>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(event) =>
                    setPasswordConfirmation(event.target.value)
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  minLength="8"
                  required
                  disabled={resetting}
                />
                <span>Confirm new password</span>
                <RequiredBadge />
              </label>
            </div>

            <div className="card-actions justify-end">
              <button className="btn" type="submit" disabled={resetting}>
                {resetting && (
                  <span className="loading loading-bars loading-xs" />
                )}
                Update password
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default ResetPassword;
