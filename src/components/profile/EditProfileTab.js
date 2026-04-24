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

const boardCard =
  "rounded-[20px] border border-white/10 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm";

const sectionCard =
  "rounded-[20px] border border-white/10 bg-white/[0.06] p-5 text-white backdrop-blur-md";

const inputWrap =
  "flex items-center rounded-[14px] border border-white/10 bg-white/[0.07] px-3 transition focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-400/20";

const inputClass =
  "w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/35";

const labelClass = "mb-2 block text-sm font-bold text-white/65";

const fileClass =
  "w-full rounded-[14px] border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-violet-100 file:px-4 file:py-2 file:font-bold file:text-violet-700 hover:file:bg-violet-200";

const selectClass =
  "w-full rounded-[14px] border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20";

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

      if (formData.image) imagePath = await uploadFile(formData.image, "image");
      if (formData.cvFile) cvPath = await uploadFile(formData.cvFile, "cv");

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
      onUserUpdate?.(updatedUser);

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${boardCard} p-5 lg:p-6`}>
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">
          Account Settings
        </p>
        <h2 className="mt-2 text-3xl font-bold">Edit Profile</h2>
        <p className="mt-1 text-sm text-white/55">
          Update your profile information.
        </p>
      </div>

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
                  placeholder="name@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Username</label>
              {user?.role === "admin" ? (
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
              ) : (
                <div className="rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60">
                  {formData.username || "Not set"}
                </div>
              )}
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
                <div className="mt-4 flex items-center gap-4 rounded-[16px] border border-white/10 bg-white/[0.07] p-4">
                  <img
                    src={preview}
                    alt="Profile Preview"
                    className="h-20 w-20 rounded-[16px] border border-white/10 object-cover"
                  />
                  <div>
                    <p className="font-bold text-white">Image Preview</p>
                    <p className="text-sm text-white/50">
                      Your selected profile image
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={sectionCard}>
          <h3 className="text-xl font-bold">Contact Info</h3>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Phone Number</label>
              <div className={inputWrap}>
                <FiPhone className="text-white/40" />
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
                <FiMapPin className="text-white/40" />
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

        <div className={sectionCard}>
          <h3 className="text-xl font-bold">Social Links</h3>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {[
              ["linkedin", "LinkedIn", FiLinkedin],
              ["facebook", "Facebook", FiFacebook],
              ["whatsapp", "WhatsApp", FiMessageCircle],
              ["slack", "Slack", FiMessageCircle],
              ["website", "Website (optional)", FiGlobe],
            ].map(([name, label, Icon]) => (
              <div key={name} className={name === "website" ? "md:col-span-2" : ""}>
                <label className={labelClass}>{label}</label>
                <div className={inputWrap}>
                  <Icon className="text-white/40" />
                  <input
                    type="text"
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={`Enter ${label}`}
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {user?.role === "client" && (
          <div className={sectionCard}>
            <h3 className="text-xl font-bold">Client Fields</h3>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Company Name</label>
                <div className={inputWrap}>
                  <FiBriefcase className="text-white/40" />
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
                  <FiGlobe className="text-white/40" />
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
                  className={selectClass}
                />
              </div>

              <div>
                <label className={labelClass}>Contract End Date</label>
                <input
                  type="date"
                  name="contractEndDate"
                  value={formData.contractEndDate}
                  onChange={handleChange}
                  className={selectClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>
                  Preferred Communication Method
                </label>
                <div className={inputWrap}>
                  <FiMessageCircle className="text-white/40" />
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
          <div className={sectionCard}>
            <h3 className="text-xl font-bold">Professional Info</h3>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Job Title</label>
                <div className={inputWrap}>
                  <FiBriefcase className="text-white/40" />
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
                  <FiFileText className="text-white/40" />
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
                  className={selectClass}
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
                    className="mt-3 inline-block text-sm font-bold text-cyan-300 hover:text-cyan-200"
                  >
                    View Current CV
                  </a>
                )}

                {formData.cvFile && (
                  <p className="mt-3 text-sm text-white/55">
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
          className="w-full rounded-full bg-white py-3.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}