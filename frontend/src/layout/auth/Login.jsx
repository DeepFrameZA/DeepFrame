import { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabaseClient";
import RequiredBadge from "../../components/RequiredBadge";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      toast.error("Enter your email address and password.");
      return;
    }

    setSigningIn(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    setSigningIn(false);

    if (error) {
      if (error.code === "email_not_confirmed") {
        toast.error("Confirm your email address before signing in.");
        return;
      }

      /*
       * Use one response for an unknown email and an
       * incorrect password to avoid revealing which
       * accounts exist.
       */
      toast.error("Unable to sign in. Check your email and password.");
      return;
    }

    /*
     * AuthProvider receives the SIGNED_IN event, loads the
     * profile, and PublicOnlyRoute redirects the user to
     * the route associated with their database role.
     */
    toast.success("Signed in.");
  };

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="card card-border bg-base-100 w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title mb-4">Login</h1>

          <form className="space-y-6" onSubmit={handleSignIn}>
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
                  disabled={signingIn}
                />

                <span>Email</span>
                <RequiredBadge />
              </label>
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
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  disabled={signingIn}
                />

                <span>Password</span>
                <RequiredBadge />
              </label>

              <div className="mt-2 flex justify-end">
                <Link className="link" to="/forgot-password">
                  Forgot password
                </Link>
              </div>
            </div>

            <div className="card-actions justify-end">
              <button className="btn" type="submit" disabled={signingIn}>
                {signingIn && (
                  <span className="loading loading-bars loading-xs" />
                )}
                Log in
              </button>
            </div>

            <div className="divider" />

            <div>
              <span>Received an invite? </span>
              <Link className="link font-bold" to="/register">
                Register here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Login;
