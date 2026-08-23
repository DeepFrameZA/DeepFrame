import { useState } from "react";
import { useAuth } from "../../core/AuthContext";
import ThemeSwitch from "../../components/ThemeSwitch";
import { toast } from "react-hot-toast";
import { validateEmail } from "../../core/utils/validation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const { resetPasswordForEmail, loading } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="fixed top-6 right-6 z-2">
        <ThemeSwitch className="" />
      </div>
      <form
        className="w-full max-w-xs md:max-w-sm space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const result = validateEmail(email);
          if (!result.valid) {
            toast.error(result.error);
            return;
          }
          try {
            await resetPasswordForEmail(result.value);
          } catch {
            // error toast is already shown by AuthContext.resetPasswordForEmail
          }
        }}
      >
        <h1 className="text-xl font-bold">Reset password</h1>
        <input
          className="input input-bordered w-full focus-within:outline-0 focus-within:border-primary focus-within:shadow-none"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          className="btn btn-primary w-full focus-within:outline-0 focus-within:border-primary focus-within:shadow-none"
          type="submit"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
