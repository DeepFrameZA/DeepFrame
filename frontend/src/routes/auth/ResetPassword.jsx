import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../core/AuthContext";
import { toast } from "react-hot-toast";
import ThemeSwitch from "../../components/ThemeSwitch";
import { validatePassword } from "../../core/utils/validation";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const { updatePassword, loading, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      toast.error("Session expired. Request a new reset link.");
      navigate("/forgot-password");
    }
  }, [session, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="fixed top-6 right-6 z-2">
        <ThemeSwitch className="" />
      </div>
      <form
        className="w-full max-w-xs md:max-w-sm space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const pw = validatePassword(password);
          if (!pw.valid) {
            toast.error(pw.error);
            return;
          }
          try {
            await updatePassword({ password: pw.value });
            navigate("/");
          } catch {
            // error toast is already shown by AuthContext.updatePassword
          }
        }}
      >
        <h1 className="text-xl font-bold">Choose new password</h1>
        <input
          className="input input-bordered w-full focus-within:outline-0 focus-within:border-primary focus-within:shadow-none"
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className="btn btn-primary w-full focus-within:outline-0 focus-within:border-primary focus-within:shadow-none"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner text-current" />
          ) : (
            "Update password"
          )}
        </button>
      </form>
    </div>
  );
}
