"use client";

import { useEffect, useState } from "react";
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
} from "react-icons/fi";

export default function AddProject() {
  const router = useRouter();

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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
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

    if (clientSource === "existing" && !selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    if (!formData.clientName.trim()) {
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
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";
  const fileClass =
    "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-violet-100 file:px-4 file:py-2 file:font-medium file:text-violet-700 hover:file:bg-violet-200";

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
          Create a clean project profile with client, team, phase, payment, and
          timeline details.
        </p>
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
                  placeholder="Enter project title"
                  value={formData.title}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Thumbnail Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={fileClass}
              />

              {preview && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-56 w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Details</label>
              <textarea
                name="details"
                placeholder="Write short project details"
                value={formData.details}
                onChange={handleChange}
                rows="4"
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
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Project Management Info
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Select team members who should be assigned to this project.
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
                    placeholder="Enter custom project type"
                    value={formData.customType}
                    onChange={handleChange}
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
                  placeholder="Example: 2 weeks / 1 month / 10 days"
                  value={formData.estimatedTime}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
          <h3 className="text-xl font-bold text-slate-900">Timeline / Extra</h3>

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
                  placeholder="Google Drive / Figma / Docs / GitHub link"
                  value={formData.resourceLink}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Note</label>
              <textarea
                name="note"
                placeholder="Write project note"
                value={formData.note}
                onChange={handleChange}
                rows="4"
                className={textareaClass}
              />
            </div>
          </div>
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