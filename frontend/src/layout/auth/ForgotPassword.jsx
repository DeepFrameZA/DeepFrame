import { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabaseClient";
import RequiredBadge from "../../components/RequiredBadge";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Enter your email address.");
      return;
    }

    setSending(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      },
    );

    setSending(false);

    if (error) {
      toast.error("Unable to send reset link. Please try again.");
      return;
    }

    /*
     * Always show the same generic message regardless of
     * whether the email exists in the system. This prevents
     * account enumeration attacks.
     */
    toast.success("If the email exists, a password reset link has been sent.");

    setEmail("");
  };

  return (
    <>
      <main className="flex min-h-dvh items-center justify-center p-4">
        <div className="card card-border bg-base-100 w-full max-w-md">
          <div className="card-body">
            <h1 className="card-title mb-4">Forgot password</h1>

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
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </g>
                  </svg>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email"
                    autoComplete="email"
                    required
                    disabled={sending}
                  />

                  <span>Email</span>
                  <RequiredBadge />
                </label>
              </div>

              <div className="card-actions justify-end">
                <button className="btn" type="submit" disabled={sending}>
                  {sending && (
                    <span className="loading loading-bars loading-xs" />
                  )}
                  Send reset link
                </button>
              </div>

              <div className="divider" />

              <div>
                <Link className="link font-bold" to="/login">
                  Back to login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

export default ForgotPassword;
