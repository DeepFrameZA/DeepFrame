import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../core/AuthContext";
import { toast } from "react-hot-toast";

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
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await updatePassword({ password });
            navigate("/");
          } catch {
            // error toast is already shown by AuthContext.updatePassword
          }
        }}
      >
        <h1 className="text-xl font-bold">Choose new password</h1>
        <input
          className="input input-bordered w-full"
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
