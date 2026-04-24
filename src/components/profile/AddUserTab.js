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

const boardCard =
  "rounded-[20px] border border-white/10 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm";

const sectionCard =
  "rounded-[20px] border border-white/10 bg-white/[0.06] p-5 text-white backdrop-blur-md";

const inputWrap =
  "flex items-center rounded-[14px] border border-white/10 bg-white/[0.07] px-3 transition focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-400/20";

const inputClass =
  "w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/35";

const labelClass = "mb-2 block text-sm font-bold text-white/65";

const selectClass =
  "w-full bg-transparent px-3 py-3 text-sm text-white outline-none";

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

    if (name === "username") setUsernameEdited(true);

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

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
    if (role === "admin") return "Full system access and user management permissions.";
    if (role === "project-manager") return "Can manage assigned projects, team flow, and issue updates.";
    if (role === "employee") return "Can work on assigned projects, tasks, and issue activities.";
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
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className={`${boardCard} p-5 lg:p-6`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">
          User Access
        </p>
        <h2 className="mt-2 text-3xl font-bold">Add User</h2>
        <p className="mt-1 text-sm text-white/55">
          Create a new user account with role-based access and optional project assignment.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            {
              icon: <FiUserPlus />,
              title: "Quick account setup",
              text: "Add basic fields first. Details can be updated later.",
            },
            {
              icon: <FiCheckCircle />,
              title: "Auto username ready",
              text: "Username is generated from full name and editable.",
            },
            {
              icon: <FiFolder />,
              title: "Project assignment",
              text: "Assign projects for manager, employee, and client roles.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[16px] border border-white/10 bg-white/[0.07] p-4"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-violet-400/15 text-violet-300">
                {item.icon}
              </div>
              <h3 className="mt-4 font-bold text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-white/50">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`${boardCard} p-5 lg:p-6`}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className={sectionCard}>
            <h3 className="text-xl font-bold">Basic Info</h3>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Full Name</label>
                <div className={inputWrap}>
                  <FiUser className="text-white/40" />
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
                  <FiMail className="text-white/40" />
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
                  <FiEdit3 className="text-white/40" />
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
                <p className="mt-2 text-xs text-white/45">
                  Auto-generated from full name. You can edit it before create.
                </p>
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <div className={inputWrap}>
                  <FiLock className="text-white/40" />
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

          <div className={sectionCard}>
            <h3 className="text-xl font-bold">Role & Access</h3>

            <div className="mt-5">
              <label className={labelClass}>User Role</label>
              <div className={inputWrap}>
                <FiBriefcase className="text-white/40" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={selectClass}
                  required
                >
                  <option className="bg-white text-slate-900" value="admin">
                    Admin
                  </option>
                  <option className="bg-white text-slate-900" value="project-manager">
                    Project Manager
                  </option>
                  <option className="bg-white text-slate-900" value="employee">
                    Employee
                  </option>
                  <option className="bg-white text-slate-900" value="client">
                    Client
                  </option>
                </select>
              </div>

              <p className="mt-2 text-sm text-white/50">
                {getRoleDescription(formData.role)}
              </p>
            </div>
          </div>

          {shouldShowProjects && (
            <div className={sectionCard}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Assign Projects</h3>
                  <p className="mt-1 text-sm text-white/50">
                    Select one or multiple projects for this user.
                  </p>
                </div>

                <div className="rounded-full bg-violet-400/15 px-3 py-2 text-sm font-bold text-violet-300">
                  Selected: {formData.assignedProjects.length}
                </div>
              </div>

              <div className="mt-5 max-h-[360px] overflow-y-auto rounded-[16px] border border-white/10 bg-white/[0.04] p-4">
                {projects.length === 0 ? (
                  <p className="text-sm text-white/55">No projects found.</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {projects.map((project) => {
                      const isSelected = formData.assignedProjects.includes(project._id);

                      return (
                        <button
                          type="button"
                          key={project._id}
                          onClick={() => handleProjectSelect(project._id)}
                          className={`flex items-start gap-3 rounded-[16px] border p-4 text-left transition ${
                            isSelected
                              ? "border-violet-400 bg-violet-400/15"
                              : "border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-[14px] ${
                              isSelected
                                ? "bg-violet-400/15 text-violet-300"
                                : "bg-white/10 text-white/60"
                            }`}
                          >
                            <FiFolder />
                          </div>

                          <div className="min-w-0">
                            <p className="line-clamp-2 font-bold text-white">
                              {project.title}
                            </p>
                            <p className="mt-1 text-xs text-white/50">
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
            className="w-full rounded-full bg-white py-3.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
}