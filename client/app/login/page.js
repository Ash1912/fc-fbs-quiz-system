"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../utils/api";

export default function LoginPage() {
  const router = useRouter();
  const isFullPage = false;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    console.log("Login clicked");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });

      console.log("Login response:", res.data);

      localStorage.setItem("token", res.data.token);

      if (res.data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/quiz");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full bg-[#F4F6FB] overflow-hidden ${
        isFullPage ? "grid grid-cols-1" : "grid grid-cols-1 lg:grid-cols-2"
      }`}
    >
      {/* ================= MOBILE HEADER ================= */}
      {!isFullPage && (
        <div className="lg:hidden relative w-full bg-[#261753] pt-6 pb-8 overflow-hidden">
          <div className="absolute left-1/2 -bottom-12 w-[160%] h-28 -translate-x-1/2 bg-[#B09EE4] rounded-[100%]" />

          <div className="relative z-10 flex items-center gap-3 px-6">
            <img
              src="/Transparent logo.png"
              alt="Logo"
              className="h-14 w-14 object-contain"
            />
            <div className="leading-tight text-left -ml-1">
              <span className="block text-base font-extrabold tracking-wide text-[#B09EE4]">
                Finance Committee
              </span>
              <span className="block text-xs font-medium text-[#6d6a7c]">
                FOSTIIMA Chapter
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= LEFT FORM PANEL ================= */}
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border p-6">
          <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-[#B09EE4] via-[#8F7AE6] to-[#6B5FB5] bg-clip-text text-transparent">
            Login to Quiz
          </h1>

          {error && (
            <p className="mb-4 rounded bg-red-100 text-red-600 p-2 text-sm">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 rounded-lg bg-[#F8F6FF] border px-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8F7AE6]"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 rounded-lg bg-[#F8F6FF] border px-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8F7AE6]"
            />

            <button
              onClick={login}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#B09EE4] to-[#8F7AE6] text-white rounded-lg font-semibold hover:opacity-90"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          <p className="text-center mt-4 text-sm text-gray-600">
            New user?{" "}
            <span
              onClick={() => router.push("/register")}
              className="text-indigo-600 cursor-pointer hover:underline"
            >
              Register here
            </span>
          </p>
        </div>
      </div>

      {/* ================= RIGHT ILLUSTRATION PANEL ================= */}
      {!isFullPage && (
        <div className="hidden lg:flex relative justify-center items-center overflow-hidden rounded-l-[75px] bg-[#B09EE4]">
          <div className="absolute inset-0 bg-[#261753] rounded-l-[75px] z-0 ml-[20px]" />

          <div className="relative z-10 px-8">
            <img
              src="/login-vector.svg"
              alt="Login Illustration"
              width={400}
              height={400}
              className="max-w-full h-auto"
            />
          </div>

          <div className="absolute top-6 right-10 flex items-center gap-3 z-10">
            <img
              src="/Transparent logo.png"
              alt="Logo"
              width={65}
              height={65}
              className="object-contain"
            />
            <div className="leading-tight text-right">
              <span className="block text-lg font-extrabold tracking-wider text-[#B09EE4]">
                Finance Committee
              </span>
              <span className="block text-base font-semibold text-[#6d6a7c]">
                FOSTIIMA Chapter
              </span>
            </div>
          </div>

          <p className="absolute bottom-6 right-6 text-xs text-white/50 z-10">
            © 2026 Finance Committee – FOSTIIMA
          </p>
        </div>
      )}
    </div>
  );
}
