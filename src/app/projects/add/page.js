"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiFolder,
  FiGlobe,
  FiLink,
  FiMapPin,
  FiLayers,
  FiUsers,
  FiShield,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiImage,
  FiX,
} from "react-icons/fi";

export default function AddProject() {
  const router = useRouter();

  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showTeamTimeline, setShowTeamTimeline] = useState(false);
  const [showClientInfo, setShowClientInfo] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [teamUsers, setTeamUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isAllowed, setIsAllowed] = useState(false);
  const [clientSource, setClientSource] = useState("existing");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    image: "",
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setLoggedInUser(parsedUser);

      const allowed =
        parsedUser.role === "admin" || parsedUser.role === "project-manager";

      setIsAllowed(allowed);

      if (!allowed) {
        toast.error("Only admin or project manager can add a project");
        router.push("/projects");
        return;
      }

      fetchUsers();
    } catch (error) {
      toast.error("Invalid login session");
      router.push("/login");
    } finally {
      setAuthLoading(false);
    }
  }, [router]);

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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview("");
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  };

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

    if (!isAllowed) {
      toast.error("Only admin or project manager can add a project");
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
      setLoading(true);

      const finalType =
        formData.type === "Other"
          ? formData.customType || "Other"
          : formData.type;

      let imagePath = "";

      if (imageFile) {
        imagePath = await uploadImage();
      }

      const formDataToSend = new FormData();

      formDataToSend.append("title", formData.title);
      formDataToSend.append("image", imagePath);
      formDataToSend.append("details", formData.details);
      formDataToSend.append("clientSource", clientSource);
      formDataToSend.append("clientUserId", selectedClientId || "");
      formDataToSend.append("clientName", formData.clientName);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("value", formData.value);
      formDataToSend.append("website", formData.website);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("type", finalType);
      formDataToSend.append("projectPhase", formData.projectPhase);
      formDataToSend.append("paymentStatus", formData.paymentStatus);
      formDataToSend.append("estimatedTime", formData.estimatedTime);
      formDataToSend.append("resourceLink", formData.resourceLink);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("completeDate", formData.completeDate);
      formDataToSend.append("note", formData.note);
      formDataToSend.append(
        "assignedTeamMembers",
        JSON.stringify(formData.assignedTeamMembers)
      );

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "x-user-id": loggedInUser._id || "",
          "x-user-email": loggedInUser.email || "",
          "x-user-username": loggedInUser.username || "",
          "x-user-role": loggedInUser.role || "",
        },
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create project");
        return;
      }

      toast.success("Project created successfully");
      router.push("/projects");
      router.refresh();
    } catch (error) {
      console.log("CREATE PROJECT ERROR:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
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

  if (authLoading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Checking permission...</p>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-red-600">
          <FiShield className="text-xl" />
          <p className="font-medium">
            Only admin or project manager can access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-sm lg:p-8">
        <h1 className="text-3xl font-bold text-slate-900">Add Project</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create a clean project profile with a more balanced and user-friendly layout.
        </p>
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
                Start with the main project information first.
              </p>
            </div>

            <div className="rounded-xl bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-700">
              Step 1
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
                    placeholder="Enter project title"
                    value={formData.title}
                    onChange={handleChange}
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
                      placeholder="Enter custom project type"
                      value={formData.customType}
                      onChange={handleChange}
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
                  placeholder="Write short project details"
                  value={formData.details}
                  onChange={handleChange}
                  rows="10"
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
                        placeholder="Example: 2 weeks / 1 month / 10 days"
                        value={formData.estimatedTime}
                        onChange={handleChange}
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
                        placeholder="Google Drive / Figma / Docs / GitHub link"
                        value={formData.resourceLink}
                        onChange={handleChange}
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
                    placeholder="Write project note"
                    value={formData.note}
                    onChange={handleChange}
                    rows="14"
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
                Search and assign team members, then set project dates.
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
                    Set your planned start and completion dates.
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
                Search existing clients or add a new one, then fill business details.
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
                      Choose existing client or create a new client entry.
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
                  Fill or review the client and business information below.
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
                          placeholder="Enter client name"
                          value={formData.clientName}
                          onChange={handleChange}
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
                          placeholder="Enter country"
                          value={formData.country}
                          onChange={handleChange}
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
                          placeholder="https://example.com"
                          value={formData.website}
                          onChange={handleChange}
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
                          placeholder="Enter project budget"
                          value={formData.value}
                          onChange={handleChange}
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>
    </div>
  );
}