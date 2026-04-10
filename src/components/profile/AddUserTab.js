"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FiUserPlus, FiShield, FiUsers, FiCheckCircle } from "react-icons/fi";

export default function AddUserTab() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  function getPermissionsByRole(role) {
    if (role === "admin") {
      return {
        canAddProject: true,
        canEditProject: true,
        canDeleteProject: true,
        canAddIssue: true,
        canEditIssue: true,
        canDeleteIssue: true,
      };
    }

    if (role === "project-manager") {
      return {
        canAddProject: true,
        canEditProject: true,
        canDeleteProject: false,
        canAddIssue: true,
        canEditIssue: true,
        canDeleteIssue: false,
      };
    }

    if (role === "employee") {
      return {
        canAddProject: false,
        canEditProject: false,
        canDeleteProject: false,
        canAddIssue: true,
        canEditIssue: true,
        canDeleteIssue: false,
      };
    }

    return {
      canAddProject: false,
      canEditProject: false,
      canDeleteProject: false,
      canAddIssue: false,
      canEditIssue: false,
      canDeleteIssue: false,
    };
  }
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
          permissions: getPermissionsByRole(formData.role),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create user");
        return;
      }

      toast.success("User created successfully");

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "client",
      });
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  function getRoleDescription(role) {
    if (role === "admin") {
      return "Full system access and user management permission.";
    }

    if (role === "project-manager") {
      return "Can manage projects, team coordination, and project delivery.";
    }

    if (role === "employee") {
      return "Can work on assigned tasks, issues, and project activities.";
    }

    return "Limited access for project updates, approvals, and client view.";
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Add User</h2>
        <p className="mt-2 text-sm text-slate-500">
          Create a new system user with basic account access. Other profile
          details can be updated later.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <FiUserPlus className="text-2xl" />
          </div>

          <h3 className="mt-4 text-xl font-bold text-slate-900">
            User Creation Guide
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Keep user creation simple. Add only the main account fields now.
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <FiCheckCircle className="mt-0.5 text-violet-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Basic account setup
                </p>
                <p className="text-sm text-slate-500">
                  Name, email, password, and role only.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <FiShield className="mt-0.5 text-violet-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Role-based access
                </p>
                <p className="text-sm text-slate-500">
                  Admin, Project Manager, Employee, or Client.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <FiUsers className="mt-0.5 text-violet-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Edit later
                </p>
                <p className="text-sm text-slate-500">
                  Profile image, phone, timezone, and other details can be added
                  later.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                User Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none"
              >
                <option value="admin">Admin</option>
                <option value="project-manager">Project Manager</option>
                <option value="employee">Employee</option>
                <option value="client">Client</option>
              </select>
              <p className="mt-2 text-sm text-slate-500">
                {getRoleDescription(formData.role)}
              </p>
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 py-3 font-medium text-white disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
