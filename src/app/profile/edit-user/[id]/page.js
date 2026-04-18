"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLinkedin,
  FiFacebook,
  FiMessageCircle,
  FiGlobe,
  FiLock,
  FiFileText,
  FiBriefcase,
  FiFolder,
  FiEdit3,
  FiTrash2,
  FiAlertTriangle,
} from "react-icons/fi";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [preview, setPreview] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    image: null,

    phone: "",
    address: "",

    linkedin: "",
    facebook: "",
    whatsapp: "",
    slack: "",
    website: "",

    companyName: "",
    companyWebsite: "",
    contractStartDate: "",
    contractEndDate: "",
    preferredCommunication: "",

    jobTitle: "",
    skills: "",
    experienceLevel: "",
    cvFile: null,

    role: "client",
    status: "active",
    assignedProjects: [],
  });

  useEffect(() => {
    if (!userId) return;
    fetchUser();
    fetchProjects();
  }, [userId]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setLoggedInUser(JSON.parse(storedUser));
      } catch (error) {
        console.log("USER PARSE ERROR:", error);
      }
    }
  }, []);

  const shouldShowProjects = useMemo(() => {
    return (
      formData.role === "project-manager" ||
      formData.role === "employee" ||
      formData.role === "client"
    );
  }, [formData.role]);

  const isOwnAccount =
    loggedInUser &&
    user &&
    (loggedInUser._id === user._id ||
      loggedInUser.username === user.username ||
      loggedInUser.email === user.email);

  const fetchUser = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/users/${userId}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to load user");
        return;
      }

      const currentUser = data.user;
      setUser(currentUser);
      setPreview(currentUser.image || "");

      setFormData({
        fullName: currentUser.fullName || "",
        email: currentUser.email || "",
        username: currentUser.username || "",
        password: "",
        image: null,

        phone: currentUser.phone || "",
        address: currentUser.address || "",

        linkedin: currentUser.linkedin || "",
        facebook: currentUser.facebook || "",
        whatsapp: currentUser.whatsapp || "",
        slack: currentUser.slack || "",
        website: currentUser.website || "",

        companyName: currentUser.companyName || "",
        companyWebsite: currentUser.companyWebsite || "",
        contractStartDate: currentUser.contractStartDate
          ? new Date(currentUser.contractStartDate).toISOString().slice(0, 10)
          : "",
        contractEndDate: currentUser.contractEndDate
          ? new Date(currentUser.contractEndDate).toISOString().slice(0, 10)
          : "",
        preferredCommunication: currentUser.preferredCommunication || "",

        jobTitle: currentUser.jobTitle || "",
        skills: Array.isArray(currentUser.skills)
          ? currentUser.skills.join(", ")
          : "",
        experienceLevel: currentUser.experienceLevel || "",
        cvFile: null,

        role: currentUser.role || "client",
        status: currentUser.status || "active",
        assignedProjects: Array.isArray(currentUser.assignedProjects)
          ? currentUser.assignedProjects.map((project) =>
              typeof project === "string" ? project : project._id,
            )
          : [],
      });
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);

      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await res.json();

      if (res.ok) {
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.log("PROJECT FETCH ERROR:", error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (type === "file") {
      const file = files?.[0] || null;

      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      if (name === "image" && file) {
        setPreview(URL.createObjectURL(file));
      }

      return;
    }

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "role" && value === "admin") {
        updated.assignedProjects = [];
      }

      return updated;
    });
  };

  const handleProjectSelect = (projectId) => {
    setFormData((prev) => {
      const exists = prev.assignedProjects.includes(projectId);

      return {
        ...prev,
        assignedProjects: exists
          ? prev.assignedProjects.filter((id) => id !== projectId)
          : [...prev.assignedProjects, projectId],
      };
    });
  };

  const uploadFile = async (file, type) => {
    if (!file) return "";

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("type", type);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: uploadFormData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Upload failed");
    }

    return data.filePath;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?._id) {
      toast.error("User not found");
      return;
    }

    try {
      setSaving(true);

      let imagePath = user.image || "";
      let cvPath = user.cvFile || "";

      if (formData.image) {
        imagePath = await uploadFile(formData.image, "image");
      }

      if (formData.cvFile) {
        cvPath = await uploadFile(formData.cvFile, "cv");
      }

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        image: imagePath,

        phone: formData.phone,
        address: formData.address,

        linkedin: formData.linkedin,
        facebook: formData.facebook,
        whatsapp: formData.whatsapp,
        slack: formData.slack,
        website: formData.website,

        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
        contractStartDate: formData.contractStartDate,
        contractEndDate: formData.contractEndDate,
        preferredCommunication: formData.preferredCommunication,

        jobTitle: formData.jobTitle,
        skills: formData.skills,
        experienceLevel: formData.experienceLevel,
        cvFile: cvPath,

        role: formData.role,
        status: formData.status,
        assignedProjects: shouldShowProjects ? formData.assignedProjects : [],
      };

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": storedUser._id || "",
          "x-user-email": storedUser.email || "",
          "x-user-username": storedUser.username || "",
          "x-user-role": storedUser.role || "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update user");
        return;
      }

      toast.success("User updated successfully");
      router.push(`/profile/view-user/${data.user.username || data.user._id}`);
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user?._id) return;

    if (isOwnAccount) {
      toast.error("You cannot delete your own account");
      setShowDeleteModal(false);
      return;
    }

    try {
      setDeleting(true);

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await fetch(`/api/users/${user._id}`, {
        method: "DELETE",
        headers: {
          "x-user-id": storedUser._id || "",
          "x-user-email": storedUser.email || "",
          "x-user-username": storedUser.username || "",
          "x-user-role": storedUser.role || "",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete user");
        return;
      }

      toast.success("User deleted successfully");
      router.push("/profile");
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
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";
  const fileClass =
    "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-violet-100 file:px-4 file:py-2 file:font-medium file:text-violet-700 hover:file:bg-violet-200";

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading user...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">User not found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-sm lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href={`/profile/view-user/${user.username || user._id}`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
              >
                <FiArrowLeft className="text-lg" />
              </Link>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">Edit User</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Update account details, profile information, and assigned
                  projects.
                </p>
              </div>
            </div>

            {!isOwnAccount && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                <FiTrash2 />
                Delete User
              </button>
            )}
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
                      placeholder="Enter username"
                      className={inputClass}
                    />
                  </div>
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
                      placeholder="Enter new password"
                      className={inputClass}
                    />
                  </div>
                </div>

                {user.role === "admin" ? (
                  <div>
                    <label className={labelClass}>Role</label>
                    <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600">
                      Admin role cannot be changed here.
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className={labelClass}>Role</label>
                    <div className={inputWrap}>
                      <FiBriefcase className="text-slate-400" />
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
                      >
                        <option value="admin">Admin</option>
                        <option value="project-manager">Project Manager</option>
                        <option value="employee">Employee</option>
                        <option value="client">Client</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className={labelClass}>Status</label>
                  <div className={inputWrap}>
                    <FiUser className="text-slate-400" />
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Profile Image</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className={fileClass}
                  />

                  {preview && (
                    <div className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <img
                        src={preview}
                        alt="Profile Preview"
                        className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">
                          Image Preview
                        </p>
                        <p className="text-sm text-slate-500">
                          Selected user profile image
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
              <h3 className="text-xl font-bold text-slate-900">Contact Info</h3>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <div className={inputWrap}>
                    <FiPhone className="text-slate-400" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Address</label>
                  <div className={inputWrap}>
                    <FiMapPin className="text-slate-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter address"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
              <h3 className="text-xl font-bold text-slate-900">Social Links</h3>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>LinkedIn</label>
                  <div className={inputWrap}>
                    <FiLinkedin className="text-slate-400" />
                    <input
                      type="text"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="Enter LinkedIn link"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Facebook</label>
                  <div className={inputWrap}>
                    <FiFacebook className="text-slate-400" />
                    <input
                      type="text"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      placeholder="Enter Facebook link"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>WhatsApp</label>
                  <div className={inputWrap}>
                    <FiMessageCircle className="text-slate-400" />
                    <input
                      type="text"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="Enter WhatsApp"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Slack</label>
                  <div className={inputWrap}>
                    <FiMessageCircle className="text-slate-400" />
                    <input
                      type="text"
                      name="slack"
                      value={formData.slack}
                      onChange={handleChange}
                      placeholder="Enter Slack"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Website</label>
                  <div className={inputWrap}>
                    <FiGlobe className="text-slate-400" />
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="Enter website"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            {formData.role === "client" && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <h3 className="text-xl font-bold text-slate-900">
                  Client Information
                </h3>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Company Name</label>
                    <div className={inputWrap}>
                      <FiBriefcase className="text-slate-400" />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Company Website</label>
                    <div className={inputWrap}>
                      <FiGlobe className="text-slate-400" />
                      <input
                        type="text"
                        name="companyWebsite"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                        placeholder="Enter company website"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Contract Start Date</label>
                    <input
                      type="date"
                      name="contractStartDate"
                      value={formData.contractStartDate}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Contract End Date</label>
                    <input
                      type="date"
                      name="contractEndDate"
                      value={formData.contractEndDate}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Preferred Communication
                    </label>
                    <div className={inputWrap}>
                      <FiMessageCircle className="text-slate-400" />
                      <input
                        type="text"
                        name="preferredCommunication"
                        value={formData.preferredCommunication}
                        onChange={handleChange}
                        placeholder="Email / Whatsapp / Slack / Fiverr / Upwork"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(formData.role === "employee" ||
              formData.role === "project-manager") && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <h3 className="text-xl font-bold text-slate-900">
                  Professional Information
                </h3>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Job Title</label>
                    <div className={inputWrap}>
                      <FiBriefcase className="text-slate-400" />
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        placeholder="Developer / Designer / Marketer / QA"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Skills</label>
                    <div className={inputWrap}>
                      <FiFileText className="text-slate-400" />
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="Shopify, Wordpress, Laravel, React, NodeJS"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Experience Level</label>
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    >
                      <option value="">Select experience level</option>
                      <option value="fresher">Fresher</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Upload CV (PDF only)</label>
                    <input
                      type="file"
                      name="cvFile"
                      accept="application/pdf"
                      onChange={handleChange}
                      className={fileClass}
                    />

                    {user?.cvFile && !formData.cvFile && (
                      <a
                        href={user.cvFile}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-sm font-medium text-violet-600 hover:text-violet-700"
                      >
                        View Current CV
                      </a>
                    )}

                    {formData.cvFile && (
                      <p className="mt-3 text-sm text-slate-500">
                        Selected: {formData.cvFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                  {projectsLoading ? (
                    <p className="text-sm text-slate-500">
                      Loading projects...
                    </p>
                  ) : projects.length === 0 ? (
                    <p className="text-sm text-slate-500">No projects found.</p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {projects.map((project) => {
                        const isSelected = formData.assignedProjects.includes(
                          project._id,
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
              disabled={saving}
              className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>

      {showDeleteModal && !isOwnAccount && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <FiAlertTriangle className="text-xl" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Delete User
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Are you sure you want to delete this user?
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
                onClick={handleDeleteUser}
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