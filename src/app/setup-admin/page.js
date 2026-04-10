"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

export default function SetupAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "Administrator",
    email: "admin@gmail.com",
    password: "123456",
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

      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role: "admin",
          assignedProjects: [],
          permissions: {
            canAddProject: true,
            canEditProject: true,
            canDeleteProject: true,
            canAddIssue: true,
            canEditIssue: true,
            canDeleteIssue: true,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create admin");
        return;
      }

      toast.success("Administrator created successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-slate-800">Setup Admin</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create your first administrator account
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Name
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 px-3">
              <FaUser className="text-slate-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-3 text-slate-800 placeholder:text-slate-400 outline-none"
                placeholder="Enter admin name"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 px-3">
              <FaEnvelope className="text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-3 text-slate-800 placeholder:text-slate-400 outline-none"
                placeholder="Enter admin email"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 px-3">
              <FaLock className="text-slate-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-3 text-slate-800 placeholder:text-slate-400 outline-none"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-3 font-medium text-white disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Administrator"}
          </button>
        </form>
      </div>
    </div>
  );
}