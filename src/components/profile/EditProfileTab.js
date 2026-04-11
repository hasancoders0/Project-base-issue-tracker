"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
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
} from "react-icons/fi";

export default function EditProfileTab({ user, onUserUpdate }) {
  const [loading, setLoading] = useState(false);
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
  });

  useEffect(() => {
    if (!user) return;

    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      username: user.username || "",
      password: "",
      image: null,

      phone: user.phone || "",
      address: user.address || "",

      linkedin: user.linkedin || "",
      facebook: user.facebook || "",
      whatsapp: user.whatsapp || "",
      slack: user.slack || "",
      website: user.website || "",

      companyName: user.companyName || "",
      companyWebsite: user.companyWebsite || "",
      contractStartDate: user.contractStartDate
        ? new Date(user.contractStartDate).toISOString().slice(0, 10)
        : "",
      contractEndDate: user.contractEndDate
        ? new Date(user.contractEndDate).toISOString().slice(0, 10)
        : "",
      preferredCommunication: user.preferredCommunication || "",

      jobTitle: user.jobTitle || "",
      skills: Array.isArray(user.skills) ? user.skills.join(", ") : "",
      experienceLevel: user.experienceLevel || "",
      cvFile: null,
    });

    setPreview(user.image || "");
  }, [user]);

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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      setLoading(true);

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
      };

      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update profile");
        return;
      }

      const updatedUser = {
        ...user,
        ...data.user,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputWrap =
    "flex items-center rounded-2xl border border-slate-300 bg-white px-3 shadow-sm transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100";
  const inputClass =
    "w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";
  const fileClass =
    "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-violet-100 file:px-4 file:py-2 file:font-medium file:text-violet-700 hover:file:bg-violet-200";

  return (
    <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-sm lg:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Edit Profile</h2>
        <p className="mt-2 text-sm text-slate-500">
          Update your profile information
        </p>
      </div>

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
                  placeholder="hasanrabby009@gmail.com"
                  className={inputClass}
                />
              </div>
            </div>

            {user?.role === "admin" ? (
              <div>
                <label className={labelClass}>Username</label>
                <div className={inputWrap}>
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
            ) : (
              <div>
                <label className={labelClass}>Username</label>
                <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600">
                  {formData.username || "Not set"}
                </div>
              </div>
            )}
            
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
                      Your selected profile image
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
              <label className={labelClass}>Website (optional)</label>
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

        {user?.role === "client" && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <h3 className="text-xl font-bold text-slate-900">Client Fields</h3>

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
                  Preferred Communication Method
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

        {(user?.role === "employee" || user?.role === "project-manager") && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <h3 className="text-xl font-bold text-slate-900">
              Professional Info
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
