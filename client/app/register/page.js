"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  // If you later want full-page (no left panel), toggle this
  const isFullPage = false;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "participant",
    adminSecret: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Registration successful!");
      router.push("/login");
    } catch (err) {
      setError(err.message || "Something went wrong");
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
      {/* ================= MOBILE CURVED HEADER ================= */}
      {!isFullPage && (
        <div className="lg:hidden relative w-full bg-[#261753] pt-6 pb-8 overflow-hidden">
          {/* Oval Curve */}
          <div className="absolute left-1/2 -bottom-12 w-[160%] h-28 -translate-x-1/2 bg-[#B09EE4] rounded-[100%]" />

          {/* Header Content */}
          <div className="relative z-10 flex items-center gap-3 px-6">
            <img
              src="/Transparent logo.png"
              alt="Logo"
              className="h-14 w-14 object-contain"
            />
            <div className="leading-tight">
              <span className="text-base font-extrabold tracking-wide text-[#B09EE4]">
                Finance Committee
              </span>
              <span className="block text-xs font-medium text-[#6d6a7c]">
                FOSTIIMA Chapter
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= DESKTOP LEFT PANEL ================= */}
      {!isFullPage && (
        <div className="hidden lg:flex relative justify-center items-center overflow-hidden rounded-r-[75px] bg-[#B09EE4]">
          <div className="absolute inset-0 bg-[#261753] rounded-r-[75px] z-0 mr-[20px]" />

          {/* Illustration */}
          <div className="relative z-10 px-8">
            <img
              src="/sign-up-Vector.svg"
              alt="Register Illustration"
              className="max-w-full h-auto"
              width={400}
              height={400}
            />
          </div>

          {/* Floating dots */}
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-white/20 rounded-full animate-pulse" />
          <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-white/15 rounded-full animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white/25 rounded-full animate-pulse delay-500" />

          {/* Logo */}
          <div className="absolute top-6 left-10 flex items-center gap-3 z-10">
            <img
              src="/Transparent logo.png"
              alt="Logo"
              width={65}
              height={65}
              className="object-contain"
            />
            <div className="leading-tight">
              <span className="block text-base font-extrabold tracking-wide text-[#B09EE4]">
                Finance Committee
              </span>
              <span className="block text-xs font-bold text-[#6d6a7c]">
                FOSTIIMA Chapter
              </span>
            </div>
          </div>

          <p className="absolute bottom-6 left-6 text-xs text-white/50 z-10">
            © 2026 Finance Committee – FOSTIIMA
          </p>
        </div>
      )}

      {/* ================= RIGHT FORM PANEL ================= */}
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border p-6">
          <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-[#B09EE4] via-[#8F7AE6] to-[#6B5FB5] bg-clip-text text-transparent">
            Quiz Registration
          </h1>

          {error && (
            <p className="mb-4 rounded bg-red-100 text-red-600 p-2 text-sm">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full h-12 rounded-lg bg-[#F8F6FF] border px-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8F7AE6]"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full h-12 rounded-lg bg-[#F8F6FF] border px-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8F7AE6]"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full h-12 rounded-lg bg-[#F8F6FF] border px-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8F7AE6]"
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full h-12 rounded-lg bg-[#F8F6FF] border px-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8F7AE6]"
            >
              <option value="participant">Participant</option>
              <option value="admin">Admin</option>
            </select>

            {formData.role === "admin" && (
              <input
                type="password"
                name="adminSecret"
                placeholder="Admin Secret Key"
                required
                value={formData.adminSecret}
                onChange={handleChange}
                className="w-full h-12 rounded-lg bg-[#F8F6FF] border px-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8F7AE6]"
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#B09EE4] to-[#8F7AE6] text-white rounded-lg font-semibold hover:opacity-90"
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-600">
            Already registered?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-indigo-600 cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
