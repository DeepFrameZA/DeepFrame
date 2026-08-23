import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../core/AuthContext";
import ThemeSwitch from "../../components/ThemeSwitch";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { signIn, loading } = useAuth();
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
          try {
            await signIn(form);
            navigate("/");
          } catch {
            // error toast is already shown by AuthContext.signIn
          }
        }}
      >
        <h1 className="text-xl font-bold">Sign in</h1>
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
        <button
          className="btn btn-primary w-full focus-within:outline-0 focus-within:border-primary focus-within:shadow-none"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <div className="flex justify-between text-sm">
          <Link to="/signup" className="link">
            Request account
          </Link>
          <Link to="/forgot-password" className="link">
            Forgot password?
          </Link>
        </div>
      </form>
    </div>
  );
}
