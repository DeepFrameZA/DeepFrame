import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabaseClient";

function SignOutButton({ buttonClass = "", spanClass = "" }) {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);

    const { error } = await supabase.auth.signOut({
      scope: "local",
    });

    if (error) {
      setSigningOut(false);

      toast.error("Unable to sign out. Please try again.");

      return;
    }

    /*
     * AuthProvider receives the SIGNED_OUT event.
     * RoleRoute then redirects the browser to /login.
     */
    toast.success("Signed out.");
  };

  return (
    <button
      className={`${buttonClass} btn is-drawer-close:tooltip is-drawer-close:tooltip-right`}
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      data-tip="Sign out"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="my-1.5 inline-block size-4"
        aria-hidden="true"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
      {signingOut && <span className="loading loading-bars loading-xs" />}
      <span className={`${spanClass} is-drawer-close:hidden`}>Sign out</span>
    </button>
  );
}

export default SignOutButton;
