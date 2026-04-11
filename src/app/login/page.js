"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaUserCircle,
  FaLock,
  FaShieldAlt,
  FaUserCheck,
  FaArrowRight,
} from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login successful");

      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputWrap =
    "flex items-center rounded-2xl border border-slate-300 bg-white px-4 shadow-sm transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100";
  const inputClass =
    "w-full bg-transparent px-3 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400";

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl lg:grid-cols-[420px_1fr]">
        <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-fuchsia-700 p-8 text-white lg:p-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <FaShieldAlt className="text-2xl" />
          </div>

          <h1 className="mt-6 text-3xl font-bold leading-tight">
            Welcome back
          </h1>
          <p className="mt-3 text-sm text-violet-100">
            Sign in to manage projects, issues, team work, and your profile from
            one place.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <FaUserCheck className="mt-1 text-violet-100" />
                <div>
                  <p className="text-sm font-semibold">Fast account access</p>
                  <p className="mt-1 text-sm text-violet-100">
                    Login with your account details and continue your work
                    quickly.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <FaShieldAlt className="mt-1 text-violet-100" />
                <div>
                  <p className="text-sm font-semibold">Secure access</p>
                  <p className="mt-1 text-sm text-violet-100">
                    Your account stays protected with role-based system access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 text-slate-800 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Login</h2>
              <p className="mt-2 text-sm text-slate-500">
                Access your dashboard and continue your work.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email or Username
                </label>

                <div className={inputWrap}>
                  <FaUserCircle className="text-slate-400" />
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter email or username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className={inputWrap}>
                  <FaLock className="text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login Now"}
                {!loading && <FaArrowRight className="text-xs" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}