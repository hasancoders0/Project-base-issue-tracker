"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FiAlertTriangle,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiFolder,
  FiGlobe,
  FiLayers,
  FiLink,
  FiMapPin,
  FiShield,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";

export default function EditProjectPage({ params }) {
  const router = useRouter();
  const { slug } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [project, setProject] = useState(null);
  const [teamUsers, setTeamUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientSource, setClientSource] = useState("new");
  const [selectedClientId, setSelectedClientId] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    details: "",
    clientName: "",
    country: "",
    value: "",
    website: "",
    status: "In Progress",
    type: "Shopify",
    customType: "",
    assignedTeamMembers: [],
    projectPhase: "Planning",
    paymentStatus: "Pending",
    estimatedTime: "",
    resourceLink: "",
    startDate: "",
    completeDate: "",
    note: "",
  });

  const canDeleteProject = useMemo(() => {
    if (!loggedInUser) return false;
    return (
      loggedInUser.role === "admin" || loggedInUser.role === "project-manager"
    );
  }, [loggedInUser]);

  const canEditProject = useMemo(() => {
    if (!loggedInUser || !project) return false;

    if (
      loggedInUser.role === "admin" ||
      loggedInUser.role === "project-manager"
    ) {
      return true;
    }

    if (loggedInUser.role === "employee") {
      const assignedMembers = Array.isArray(project.assignedTeamMembers)
        ? project.assignedTeamMembers.map((member) =>
            typeof member === "string" ? member : member._id
          )
        : [];

      return assignedMembers.includes(loggedInUser._id);
    }

    return false;
  }, [loggedInUser, project]);

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        toast.error("Please login first");
        router.push("/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);

        const res = await fetch(`/api/users/${parsedUser._id}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || !data?.user || data.user.status !== "active") {
          localStorage.removeItem("user");
          toast.error("Session expired or user removed");
          router.push("/login");
          return;
        }

        setLoggedInUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (error) {
        localStorage.removeItem("user");
        router.push("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    if (!slug) return;

    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${slug}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to fetch project");
          return;
        }

        setProject(data);
        setClientSource(data.clientSource || "new");
        setSelectedClientId(data.clientUserId?._id || data.clientUserId || "");

        setFormData({
          title: data.title || "",
          details: data.details || "",
          clientName: data.clientName || "",
          country: data.country || "",
          value: data.value || "",
          website: data.website || "",
          status: data.status || "In Progress",
          type:
            data.type &&
            ["Shopify", "WordPress", "Laravel", "Node.js", "Other"].includes(
              data.type
            )
              ? data.type
              : data.type
                ? "Other"
                : "Shopify",
          customType:
            data.type &&
            !["Shopify", "WordPress", "Laravel", "Node.js", "Other"].includes(
              data.type
            )
              ? data.type
              : "",
          assignedTeamMembers: Array.isArray(data.assignedTeamMembers)
            ? data.assignedTeamMembers.map((member) =>
                typeof member === "string" ? member : member._id
              )
            : [],
          projectPhase: data.projectPhase || "Planning",
          paymentStatus: data.paymentStatus || "Pending",
          estimatedTime: data.estimatedTime || "",
          resourceLink: data.resourceLink || "",
          startDate: data.startDate ? data.startDate.slice(0, 10) : "",
          completeDate: data.completeDate ? data.completeDate.slice(0, 10) : "",
          note: data.note || "",
        });
      } catch (error) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        setUsersLoading(true);

        const res = await fetch("/api/users", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) return;

        const users = Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data)
            ? data
            : [];

        const filteredTeamUsers = users.filter(
          (user) =>
            user.role === "admin" ||
            user.role === "employee" ||
            user.role === "project-manager"
        );

        const filteredClients = users.filter((user) => user.role === "client");

        setTeamUsers(filteredTeamUsers);
        setClients(filteredClients);
      } catch (error) {
        console.log("USER FETCH ERROR:", error);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchProject();
    fetchUsers();
  }, [slug]);

  useEffect(() => {
    if (loading || authLoading || !loggedInUser || !project) return;

    if (!canEditProject) {
      toast.error("You do not have permission to edit this project");
      router.push(`/projects/${slug}`);
    }
  }, [authLoading, loading, loggedInUser, project, canEditProject, router, slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTeamSelect = (userId) => {
    setFormData((prev) => {
      const exists = prev.assignedTeamMembers.includes(userId);

      return {
        ...prev,
        assignedTeamMembers: exists
          ? prev.assignedTeamMembers.filter((id) => id !== userId)
          : [...prev.assignedTeamMembers, userId],
      };
    });
  };

  const handleClientSourceChange = (source) => {
    setFormData((prev) => ({
      ...prev,
      assignedTeamMembers: selectedClientId
        ? prev.assignedTeamMembers.filter((id) => id !== selectedClientId)
        : prev.assignedTeamMembers,
    }));

    setClientSource(source);
    setSelectedClientId("");

    if (source === "new") {
      setFormData((prev) => ({
        ...prev,
        clientName: "",
        country: "",
      }));
    }
  };

  const handleClientSelect = (clientId) => {
    setSelectedClientId(clientId);

    const client = clients.find((item) => item._id === clientId);

    if (!client) {
      setFormData((prev) => ({
        ...prev,
        clientName: "",
        country: "",
        assignedTeamMembers: selectedClientId
          ? prev.assignedTeamMembers.filter((id) => id !== selectedClientId)
          : prev.assignedTeamMembers,
      }));
      return;
    }

    setFormData((prev) => {
      const withoutOldClient = selectedClientId
        ? prev.assignedTeamMembers.filter((id) => id !== selectedClientId)
        : prev.assignedTeamMembers;

      return {
        ...prev,
        clientName: client.fullName || client.username || "",
        country: client.country || client.address || "",
        assignedTeamMembers: withoutOldClient.includes(clientId)
          ? withoutOldClient
          : [...withoutOldClient, clientId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loggedInUser) {
      toast.error("Login required");
      return;
    }

    if (!canEditProject) {
      toast.error("You do not have permission to edit this project");
      return;
    }

    if (clientSource === "existing" && !selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    if (!formData.clientName.trim()) {
      toast.error("Client name is required");
      return;
    }

    try {
      setSaving(true);

      const finalType =
        formData.type === "Other"
          ? formData.customType || "Other"
          : formData.type;

      const res = await fetch(`/api/projects/${slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": loggedInUser._id || "",
          "x-user-email": loggedInUser.email || "",
          "x-user-username": loggedInUser.username || "",
          "x-user-role": loggedInUser.role || "",
        },
        body: JSON.stringify({
          ...formData,
          type: finalType,
          clientSource,
          clientUserId: selectedClientId || null,
          value: Number(formData.value) || 0,
          startDate: formData.startDate || null,
          completeDate: formData.completeDate || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update project");
        return;
      }

      toast.success("Project updated successfully");
      router.push(`/projects/${data.slug || slug}`);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!loggedInUser) {
      toast.error("Login required");
      return;
    }

    if (!canDeleteProject) {
      toast.error("You do not have permission to delete this project");
      return;
    }

    try {
      setDeleting(true);

      const res = await fetch(`/api/projects/${slug}`, {
        method: "DELETE",
        headers: {
          "x-user-id": loggedInUser._id || "",
          "x-user-email": loggedInUser.email || "",
          "x-user-username": loggedInUser.username || "",
          "x-user-role": loggedInUser.role || "",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete project");
        return;
      }

      toast.success("Project deleted successfully");
      router.push("/projects");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const inputWrap =
    "flex items-center rounded-2xl border border-slate-300 bg-white px-3 shadow-sm transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100";
  const inputClass =
    "w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400";
  const textareaClass =
    "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  if (authLoading || loading) {
    return (
      <div className="mx-auto w-full max-w-7xl p-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!canEditProject) {
    return (
      <div className="mx-auto w-full max-w-7xl p-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-red-600">
            <FiShield className="text-xl" />
            <p className="font-medium">
              You do not have permission to edit this project.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
        <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-sm lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Edit Project</h1>
              <p className="mt-1 text-sm text-slate-500">
                Update project client, team, payment, timeline, and management details.
              </p>
            </div>

            {canDeleteProject && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
              >
                <FiTrash2 />
                Delete Project
              </button>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-3xl bg-white p-6 text-slate-800 shadow-sm lg:p-8"
        >
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <h3 className="text-xl font-bold text-slate-900">Basic Info</h3>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Project Title</label>
                <div className={inputWrap}>
                  <FiBriefcase className="text-slate-400" />
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter project title"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Details</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Write short project details"
                  className={textareaClass}
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <h3 className="text-xl font-bold text-slate-900">
              Client / Business Info
            </h3>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Client Type</label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleClientSourceChange("existing")}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                      clientSource === "existing"
                        ? "border-violet-600 bg-violet-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-violet-300"
                    }`}
                  >
                    <FiCheckCircle />
                    Existing Client
                  </button>

                  <button
                    type="button"
                    onClick={() => handleClientSourceChange("new")}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                      clientSource === "new"
                        ? "border-violet-600 bg-violet-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-violet-300"
                    }`}
                  >
                    <FiUsers />
                    New Client
                  </button>
                </div>
              </div>

              {clientSource === "existing" && (
                <div className="md:col-span-2">
                  <label className={labelClass}>Select Client User</label>
                  <div className="rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm">
                    <select
                      value={selectedClientId}
                      onChange={(e) => handleClientSelect(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 outline-none"
                    >
                      <option value="">Select client</option>
                      {clients.map((client) => (
                        <option key={client._id} value={client._id}>
                          {client.fullName || client.username}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className={labelClass}>Client Name</label>
                <div
                  className={`${inputWrap} ${
                    clientSource === "existing" ? "bg-slate-50" : ""
                  }`}
                >
                  <FiUsers className="text-slate-400" />
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="Enter client name"
                    className={inputClass}
                    readOnly={clientSource === "existing"}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Country</label>
                <div
                  className={`${inputWrap} ${
                    clientSource === "existing" ? "bg-slate-50" : ""
                  }`}
                >
                  <FiMapPin className="text-slate-400" />
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter country"
                    className={inputClass}
                    readOnly={clientSource === "existing"}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Value (Budget)</label>
                <div className={inputWrap}>
                  <FiDollarSign className="text-slate-400" />
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    placeholder="Enter project budget"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Website Link</label>
                <div className={inputWrap}>
                  <FiGlobe className="text-slate-400" />
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Project Management Info
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Update assigned team members and management details.
                </p>
              </div>

              <div className="rounded-xl bg-violet-100 px-3 py-2 text-sm font-medium text-violet-700">
                Selected: {formData.assignedTeamMembers.length}
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Assigned Team Members</label>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  {usersLoading ? (
                    <p className="text-sm text-slate-500">
                      Loading team members...
                    </p>
                  ) : teamUsers.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No team members found.
                    </p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {teamUsers.map((member) => {
                        const isSelected = formData.assignedTeamMembers.includes(
                          member._id
                        );

                        return (
                          <button
                            type="button"
                            key={member._id}
                            onClick={() => handleTeamSelect(member._id)}
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
                              <FiUsers />
                            </div>

                            <div className="min-w-0">
                              <p className="line-clamp-1 font-semibold text-slate-900">
                                {member.fullName || member.username}
                              </p>
                              <p className="mt-1 text-xs capitalize text-slate-500">
                                {member.role}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Project Phase</label>
                <div className={inputWrap}>
                  <FiLayers className="text-slate-400" />
                  <select
                    name="projectPhase"
                    value={formData.projectPhase}
                    onChange={handleChange}
                    className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Design">Design</option>
                    <option value="Development">Development</option>
                    <option value="Testing">Testing</option>
                    <option value="Deployment">Deployment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Payment Status</label>
                <div className={inputWrap}>
                  <FiDollarSign className="text-slate-400" />
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                    className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Status</label>
                <div className={inputWrap}>
                  <FiFolder className="text-slate-400" />
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Complete">Complete</option>
                    <option value="Cancel">Cancel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Type</label>
                <div className={inputWrap}>
                  <FiBriefcase className="text-slate-400" />
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
                  >
                    <option value="Shopify">Shopify</option>
                    <option value="WordPress">WordPress</option>
                    <option value="Laravel">Laravel</option>
                    <option value="Node.js">Node.js</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {formData.type === "Other" && (
                <div className="md:col-span-2">
                  <label className={labelClass}>Custom Type</label>
                  <div className={inputWrap}>
                    <FiBriefcase className="text-slate-400" />
                    <input
                      type="text"
                      name="customType"
                      value={formData.customType}
                      onChange={handleChange}
                      placeholder="Enter custom project type"
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <label className={labelClass}>Estimated Time</label>
                <div className={inputWrap}>
                  <FiClock className="text-slate-400" />
                  <input
                    type="text"
                    name="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={handleChange}
                    placeholder="Example: 2 weeks / 1 month / 10 days"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <h3 className="text-xl font-bold text-slate-900">
              Timeline / Extra
            </h3>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Start Date</label>
                <div className={inputWrap}>
                  <FiCalendar className="text-slate-400" />
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Completion Date</label>
                <div className={inputWrap}>
                  <FiCalendar className="text-slate-400" />
                  <input
                    type="date"
                    name="completeDate"
                    value={formData.completeDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>File & Resource Link</label>
                <div className={inputWrap}>
                  <FiLink className="text-slate-400" />
                  <input
                    type="text"
                    name="resourceLink"
                    value={formData.resourceLink}
                    onChange={handleChange}
                    placeholder="Google Drive / Figma / Docs / GitHub link"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Note</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Write project note"
                  className={textareaClass}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-violet-600 px-6 py-3 font-medium text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Updating..." : "Update Project"}
            </button>

            {canDeleteProject && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
                className="rounded-2xl bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Delete Project
              </button>
            )}
          </div>
        </form>
      </div>

      {showDeleteModal && canDeleteProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <FiAlertTriangle className="text-xl" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Delete Project
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Are you sure you want to delete this project?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="rounded-xl bg-slate-100 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}