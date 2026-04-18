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
  FiImage,
  FiLayers,
  FiLink,
  FiMapPin,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUsers,
  FiChevronDown,
  FiChevronUp,
  FiX,
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

  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showTeamTimeline, setShowTeamTimeline] = useState(false);
  const [showClientInfo, setShowClientInfo] = useState(false);

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [project, setProject] = useState(null);
  const [teamUsers, setTeamUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientSource, setClientSource] = useState("new");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

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

  const filteredTeamUsers = useMemo(() => {
    const keyword = teamSearch.trim().toLowerCase();

    if (!keyword) return teamUsers;

    return teamUsers.filter((user) => {
      const fullName = user.fullName?.toLowerCase() || "";
      const username = user.username?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      const role = user.role?.toLowerCase() || "";

      return (
        fullName.includes(keyword) ||
        username.includes(keyword) ||
        email.includes(keyword) ||
        role.includes(keyword)
      );
    });
  }, [teamSearch, teamUsers]);

  const filteredClients = useMemo(() => {
    const keyword = clientSearch.trim().toLowerCase();

    if (!keyword) return clients;

    return clients.filter((client) => {
      const fullName = client.fullName?.toLowerCase() || "";
      const username = client.username?.toLowerCase() || "";
      const email = client.email?.toLowerCase() || "";
      const country = client.country?.toLowerCase() || "";
      const address = client.address?.toLowerCase() || "";

      return (
        fullName.includes(keyword) ||
        username.includes(keyword) ||
        email.includes(keyword) ||
        country.includes(keyword) ||
        address.includes(keyword)
      );
    });
  }, [clientSearch, clients]);

  const selectedClient = useMemo(() => {
    return clients.find((client) => client._id === selectedClientId) || null;
  }, [clients, selectedClientId]);

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
        setPreview(data.image || "");
        setRemoveCurrentImage(false);

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
    setClientSearch("");

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

  const clearSelectedClient = () => {
    setSelectedClientId("");
    setFormData((prev) => ({
      ...prev,
      clientName: "",
      country: "",
      assignedTeamMembers: prev.assignedTeamMembers.filter(
        (id) => id !== selectedClientId
      ),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setRemoveCurrentImage(false);
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview("");
    setRemoveCurrentImage(true);
  };

  const uploadImage = async () => {
    if (!imageFile) return "";

    const uploadFormData = new FormData();
    uploadFormData.append("file", imageFile);
    uploadFormData.append("type", "image");

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: uploadFormData,
    });

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      throw new Error(uploadData.message || "Image upload failed");
    }

    return uploadData.filePath;
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

    if (!formData.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    if (clientSource === "existing" && !selectedClientId) {
      setShowClientInfo(true);
      toast.error("Please select a client");
      return;
    }

    if (!formData.clientName.trim()) {
      setShowClientInfo(true);
      toast.error("Client name is required");
      return;
    }

    try {
      setSaving(true);

      const finalType =
        formData.type === "Other"
          ? formData.customType || "Other"
          : formData.type;

      let imagePath = project?.image || "";

      if (removeCurrentImage) {
        imagePath = "";
      }

      if (imageFile) {
        imagePath = await uploadImage();
      }

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
          image: imagePath,
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
  const fileClass =
    "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-violet-100 file:px-4 file:py-2 file:font-medium file:text-violet-700 hover:file:bg-violet-200";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  const sectionClass = "rounded-3xl border border-slate-200 bg-slate-50/70 p-5";
  const basicGridClass = "mt-5 grid gap-6 lg:grid-cols-[1fr_1.15fr]";
  const detailsGridClass = "mt-5 grid gap-6 lg:grid-cols-[1fr_1fr]";
  const teamGridClass = "mt-5 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]";
  const leftStackClass = "space-y-5";
  const rightStackClass = "space-y-5";

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
          <div className={sectionClass}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Basic Info</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Update the main project information first.
                </p>
              </div>

              <div className="rounded-xl bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-700">
                Main
              </div>
            </div>

            <div className={basicGridClass}>
              <div className={leftStackClass}>
                <div>
                  <label className={labelClass}>Project Title *</label>
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

                <div className="grid gap-5 md:grid-cols-2">
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
                </div>

                {formData.type === "Other" && (
                  <div>
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
              </div>

              <div className={rightStackClass}>
                <div>
                  <label className={labelClass}>Details</label>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleChange}
                    rows="10"
                    placeholder="Write short project details"
                    className={textareaClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <button
              type="button"
              onClick={() => setShowProjectDetails((prev) => !prev)}
              className="flex w-full items-center justify-between gap-3"
            >
              <div className="text-left">
                <h3 className="text-xl font-bold text-slate-900">
                  Project Details
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Phase, payment, image, resource link, and internal project note.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                {showProjectDetails ? <FiChevronUp /> : <FiChevronDown />}
              </div>
            </button>

            {showProjectDetails && (
              <div className={detailsGridClass}>
                <div className={leftStackClass}>
                  <div>
                    <label className={labelClass}>Thumbnail Image</label>

                    <div className="flex flex-col gap-3 rounded-2xl border border-slate-300 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className={fileClass}
                        />
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        {preview ? (
                          <div className="relative">
                            <img
                              src={preview}
                              alt="Preview"
                              className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                            >
                              <FiX className="text-sm" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                            <FiImage className="text-xl" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
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
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
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

                    <div>
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
                  </div>
                </div>

                <div className={rightStackClass}>
                  <div>
                    <label className={labelClass}>Note</label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      rows="14"
                      placeholder="Write project note"
                      className={textareaClass}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={sectionClass}>
            <button
              type="button"
              onClick={() => setShowTeamTimeline((prev) => !prev)}
              className="flex w-full items-center justify-between gap-3"
            >
              <div className="text-left">
                <h3 className="text-xl font-bold text-slate-900">
                  Team & Timeline
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Search and update team members, then adjust project dates.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-100 px-3 py-2 text-sm font-medium text-violet-700">
                  Selected: {formData.assignedTeamMembers.length}
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                  {showTeamTimeline ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </div>
            </button>

            {showTeamTimeline && (
              <div className={teamGridClass}>
                <div className={leftStackClass}>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Timeline
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Update your planned start and completion dates.
                    </p>

                    <div className="mt-4 space-y-4">
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
                    </div>
                  </div>
                </div>

                <div className={rightStackClass}>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          Assigned Team Members
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          Search by name, email, or role and click to select.
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {formData.assignedTeamMembers.length} selected
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className={inputWrap}>
                        <FiSearch className="text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search team by name, email, or role"
                          value={teamSearch}
                          onChange={(e) => setTeamSearch(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      {usersLoading ? (
                        <p className="text-sm text-slate-500">
                          Loading team members...
                        </p>
                      ) : filteredTeamUsers.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          No matching team members found.
                        </p>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {filteredTeamUsers.map((member) => {
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
                </div>
              </div>
            )}
          </div>

          <div className={sectionClass}>
            <button
              type="button"
              onClick={() => setShowClientInfo((prev) => !prev)}
              className="flex w-full items-center justify-between gap-3"
            >
              <div className="text-left">
                <h3 className="text-xl font-bold text-slate-900">
                  Client & Business Info
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Search existing clients or choose a new one, then update business details.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                {showClientInfo ? <FiChevronUp /> : <FiChevronDown />}
              </div>
            </button>

            {showClientInfo && (
              <div className="mt-5 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Client Source
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Choose existing client or switch to a new client entry.
                      </p>
                    </div>

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
                    <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                      <div>
                        <label className={labelClass}>Search Client</label>
                        <div className={inputWrap}>
                          <FiSearch className="text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search by name, email, country"
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            className={inputClass}
                          />
                        </div>

                        <div className="mt-4 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          {filteredClients.length === 0 ? (
                            <p className="text-sm text-slate-500">
                              No matching clients found.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {filteredClients.map((client) => {
                                const isSelected = selectedClientId === client._id;

                                return (
                                  <button
                                    key={client._id}
                                    type="button"
                                    onClick={() => handleClientSelect(client._id)}
                                    className={`w-full rounded-2xl border p-4 text-left transition ${
                                      isSelected
                                        ? "border-violet-500 bg-violet-50"
                                        : "border-slate-200 bg-white hover:border-violet-300"
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                          isSelected
                                            ? "bg-violet-100 text-violet-700"
                                            : "bg-slate-100 text-slate-500"
                                        }`}
                                      >
                                        <FiUsers />
                                      </div>

                                      <div className="min-w-0">
                                        <p className="line-clamp-1 font-semibold text-slate-900">
                                          {client.fullName || client.username}
                                        </p>
                                        {client.email && (
                                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                            {client.email}
                                          </p>
                                        )}
                                        {(client.country || client.address) && (
                                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                            {client.country || client.address}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Selected Client</label>

                        {selectedClient ? (
                          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                                  <FiUsers />
                                </div>

                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {selectedClient.fullName || selectedClient.username}
                                  </p>
                                  {selectedClient.email && (
                                    <p className="mt-1 text-xs text-slate-500">
                                      {selectedClient.email}
                                    </p>
                                  )}
                                  {(selectedClient.country || selectedClient.address) && (
                                    <p className="mt-1 text-xs text-slate-500">
                                      {selectedClient.country || selectedClient.address}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={clearSelectedClient}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                              >
                                <FiX />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                            No client selected yet
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-slate-900">
                    Client & Business Fields
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Update or review the client and business information below.
                  </p>

                  <div className="mt-5 space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>Client Name *</label>
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
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
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
                    </div>
                  </div>
                </div>
              </div>
            )}
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