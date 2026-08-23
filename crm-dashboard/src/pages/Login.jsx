import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../redux/slices/userSlice";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useTheme } from "../theme/ThemeContext.jsx";

const BrandMark = ({ size = 36, dark = true }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
    <rect
      x="2"
      y="2"
      width="36"
      height="36"
      rx="10"
      fill={dark ? "#ffffff" : "#0c0a09"}
      opacity={dark ? 0.08 : 0.06}
    />
    <path
      d="M11 25 L17 13 L29 13"
      stroke={dark ? "#fafafa" : "#1c1917"}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="29" cy="13" r="2.6" fill="#fbbf24" />
    {dark && <circle cx="11" cy="25" r="2.2" fill="#ffffff" />}
  </svg>
);

const Login = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_CRM_BACKEND}/api/v1/auth/login`,
        { email, password },
        { withCredentials: true },
      );
      dispatch(setUser(data?.data?.user || null));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative min-h-screen overflow-hidden ${isDark ? "bg-[#0a0a0a] text-stone-50" : "bg-[#f5f6fa] text-gray-900"}`}
    >
      {isDark && (
        <>
          <div className="fa-aurora pointer-events-none absolute inset-x-0 top-0" />
          <div className="fa-grid-bg fa-fade-radial pointer-events-none absolute inset-0 opacity-70" />
        </>
      )}

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <BrandMark size={44} dark={isDark} />
          <span className="fa-chip">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 fa-pulse-dot" />
            api monitoring · internal ops
          </span>
          <h1
            className={`text-3xl sm:text-4xl tracking-tight max-w-md ${isDark ? "uppercase text-stone-50" : "text-gray-900 font-semibold"}`}
            style={{ fontFamily: isDark ? "Anton, sans-serif" : "Manrope, sans-serif" }}
          >
            Sign in to <span className="text-accent">{isDark ? "ship" : "your"}</span>{" "}
            {isDark ? "insights." : "dashboard"}
          </h1>
          <p
            className={`text-[15px] max-w-sm leading-relaxed ${isDark ? "text-stone-400" : "text-gray-600"}`}
          >
            CRM Dashboard — APIs, tenants, cron jobs, and alerts in one place.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-md rounded-2xl p-6 sm:p-8 flex flex-col gap-4 ${isDark ? "fa-surface" : "bg-white border border-gray-200 shadow-sm"}`}
        >
          {error && (
            <div
              className={`text-sm rounded-xl px-3 py-2.5 border ${
                isDark
                  ? "text-rose-300 bg-rose-950/40 border-rose-900/60"
                  : "text-red-700 bg-red-50 border-red-200"
              }`}
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              className={`text-[12px] font-medium font-mono ${isDark ? "text-stone-400" : "text-gray-600"}`}
            >
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`border rounded-xl px-3 py-2.5 text-sm focus:outline-none ${
                isDark
                  ? "border-stone-700 bg-[#1a1a1a] text-stone-100 focus:border-amber-400/80"
                  : "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              }`}
              placeholder="you@company.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className={`text-[12px] font-medium font-mono ${isDark ? "text-stone-400" : "text-gray-600"}`}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`border rounded-xl px-3 py-2.5 text-sm focus:outline-none ${
                isDark
                  ? "border-stone-700 bg-[#1a1a1a] text-stone-100 focus:border-amber-400/80"
                  : "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              }`}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-2 inline-flex items-center justify-center gap-2 rounded-xl text-[14px] font-semibold disabled:opacity-60 px-4 py-3 transition-colors ${
              isDark
                ? "text-stone-950 bg-stone-50 hover:bg-stone-100"
                : "text-white bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Signing in…" : "Continue to dashboard"}
          </button>

          <p
            className={`text-[11px] text-center font-mono pt-1 ${isDark ? "text-stone-500" : "text-gray-500"}`}
          >
            Session secured · cookie auth
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
