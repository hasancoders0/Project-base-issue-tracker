"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiUserPlus,
  FiCheckCircle,
  FiUser,
  FiMail,
  FiLock,
  FiBriefcase,
  FiFolder,
  FiEdit3,
} from "react-icons/fi";

export default function AddUserTab() {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [usernameEdited, setUsernameEdited] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    role: "client",
    assignedProjects: [],
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!usernameEdited) {
      setFormData((prev) => ({
        ...prev,
        username: generateUsername(prev.fullName),
      }));
    }
  }, [formData.fullName, usernameEdited]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();

      if (res.ok) {
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.log("PROJECT FETCH ERROR:", error);
    }
  };

  const generateUsername = (fullName) => {
    if (!fullName) return "";

    return fullName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const shouldShowProjects =
    formData.role === "project-manager" ||
    formData.role === "employee" ||
    formData.role === "client";

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "username") {
      setUsernameEdited(true);
    }

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "role" && value === "admin") {
        updated.assignedProjects = [];
      }

      if (name === "fullName" && !usernameEdited) {
        updated.username = generateUsername(value);
      }

      return updated;
    });
  };

  const handleProjectSelect = (projectId) => {
    setFormData((prev) => {
      const alreadySelected = prev.assignedProjects.includes(projectId);

      return {
        ...prev,
        assignedProjects: alreadySelected
          ? prev.assignedProjects.filter((id) => id !== projectId)
          : [...prev.assignedProjects, projectId],
      };
    });
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

  function getRoleDescription(role) {
    if (role === "admin") {
      return "Full system access and user management permissions.";
    }

    if (role === "project-manager") {
      return "Can manage assigned projects, team flow, and issue updates.";
    }

    if (role === "employee") {
      return "Can work on assigned projects, tasks, and issue activities.";
    }

    return "Can access assigned projects, updates, and related client view.";
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        assignedProjects: shouldShowProjects ? formData.assignedProjects : [],
        permissions: getPermissionsByRole(formData.role),
      };

      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create user");
        return;
      }

      toast.success("User created successfully");

      setFormData({
        fullName: "",
        email: "",
        username: "",
        password: "",
        role: "client",
        assignedProjects: [],
      });
      setUsernameEdited(false);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputWrap =
    "flex items-center rounded-2xl border border-slate-300 bg-white px-3 shadow-sm transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100";
  const inputClass =
    "w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-sm lg:p-8">
        <h2 className="text-3xl font-bold text-slate-900">Add User</h2>
        <p className="mt-2 text-sm text-slate-500">
          Create a new user account with role-based access and optional project
          assignment.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <FiUserPlus className="text-lg" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              Quick account setup
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Add basic fields first. Other profile details can be updated
              later.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <FiCheckCircle className="text-lg" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              Auto username ready
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Username is generated from full name, but admin can edit it before
              saving.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <FiFolder className="text-lg" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              Project assignment
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Assign one or multiple projects for project manager, employee, and
              client roles.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-sm lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <h3 className="text-xl font-bold text-slate-900">Basic Info</h3>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Full Name</label>
                <div className={inputWrap}>
                  <FiUser className="text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <div className={inputWrap}>
                  <FiMail className="text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Username</label>
                <div className={inputWrap}>
                  <FiEdit3 className="text-slate-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Auto generated username"
                    className={inputClass}
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Auto-generated from full name. You can edit it before create.
                </p>
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <div className={inputWrap}>
                  <FiLock className="text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <h3 className="text-xl font-bold text-slate-900">Role & Access</h3>

            <div className="mt-5 space-y-5">
              <div>
                <label className={labelClass}>User Role</label>
                <div className={inputWrap}>
                  <FiBriefcase className="text-slate-400" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="project-manager">Project Manager</option>
                    <option value="employee">Employee</option>
                    <option value="client">Client</option>
                  </select>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {getRoleDescription(formData.role)}
                </p>
              </div>
            </div>
          </div>

          {shouldShowProjects && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Assign Projects
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Select one or multiple projects for this user.
                  </p>
                </div>

                <div className="rounded-xl bg-violet-100 px-3 py-2 text-sm font-medium text-violet-700">
                  Selected: {formData.assignedProjects.length}
                </div>
              </div>

              <div className="mt-5 max-h-[360px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4">
                {projects.length === 0 ? (
                  <p className="text-sm text-slate-500">No projects found.</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {projects.map((project) => {
                      const isSelected = formData.assignedProjects.includes(
                        project._id
                      );

                      return (
                        <button
                          type="button"
                          key={project._id}
                          onClick={() => handleProjectSelect(project._id)}
                          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? "border-violet-500 bg-violet-50"
                              : "border-slate-200 bg-white hover:border-violet-300"
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${
                              isSelected
                                ? "bg-violet-100 text-violet-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <FiFolder />
                          </div>

                          <div className="min-w-0">
                            <p className="line-clamp-2 font-semibold text-slate-900">
                              {project.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {project.status || "In Progress"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
}