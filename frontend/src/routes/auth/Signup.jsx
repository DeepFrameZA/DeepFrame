import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../core/AuthContext";
import ThemeSwitch from "../../components/ThemeSwitch";
import { toast } from "react-hot-toast";
import {
  validateName,
  validateEmail,
  validatePassword,
} from "../../core/utils/validation";

export default function Signup() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
    inviteCode: "",
  });
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="fixed top-6 right-6 z-2">
        <ThemeSwitch className="" />
      </div>
      <form
        className="w-full max-w-xs md:max-w-sm space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const display = validateName(form.displayName, "Display name");
          if (!display.valid) {
            toast.error(display.error);
            return;
          }
          const email = validateEmail(form.email);
          if (!email.valid) {
            toast.error(email.error);
            return;
          }
          const pw = validatePassword(form.password);
          if (!pw.valid) {
            toast.error(pw.error);
            return;
          }
          try {
            await signUp(form);
            navigate("/login");
          } catch {
            // error toast is already shown by AuthContext.signUp
          }
        }}
      >
        <h1 className="text-xl font-bold">Request account</h1>
        <input
          className="input input-bordered w-full focus-within:outline-0 focus-within:border-primary focus-within:shadow-none"
          type="text"
          placeholder="Display name"
          value={form.displayName}
          onChange={(e) =>
            setForm((f) => ({ ...f, displayName: e.target.value }))
          }
          required
        />
        <input
          className="input input-bordered w-full focus-within:outline-0 focus-within:border-primary focus-within:shadow-none"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          className="input input-bordered w-full focus-within:outline-0 focus-within:border-primary focus-within:shadow-none"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
        />
        <input
          className="input input-bordered w-full focus-within:outline-0 focus-within:border-primary focus-within:shadow-none"
          type="text"
          placeholder="Invite code"
          value={form.inviteCode}
          onChange={(e) =>
            setForm((f) => ({ ...f, inviteCode: e.target.value.trim() }))
          }
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
            "Submit request"
          )}
        </button>
        <div>
          <Link to="/login" className="link">
            Already have an account?
          </Link>
        </div>
      </form>
    </div>
  );
}
