"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiEdit2,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiBriefcase,
 FiHome,
} from "react-icons/fi";

export default function EditProfileTab({ user, onUserUpdate }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    phone: "",
    address: "",
    timezone: "",
    facebook: "",
    linkedin: "",
    whatsapp: "",
    companyName: "",
    contactPersonName: "",
    businessEmail: "",
    budget: "",
    contractStartDate: "",
    contractEndDate: "",
    jobTitle: "",
    skills: "",
    adminLevel: "",
    image: null,
  });

  useEffect(() => {
    if (!user) return;

    setFormData({
      email: user.email || "",
      username: user.username || "",
      phone: user.phone || "",
      address: user.address || "",
      timezone: user.timezone || "",
      facebook: user.facebook || "",
      linkedin: user.linkedin || "",
      whatsapp: user.whatsapp || "",
      companyName: user.companyName || "",
      contactPersonName: user.contactPersonName || "",
      businessEmail: user.businessEmail || "",
      budget: user.budget || "",
      contractStartDate: user.contractStartDate
        ? new Date(user.contractStartDate).toISOString().slice(0, 10)
        : "",
      contractEndDate: user.contractEndDate
        ? new Date(user.contractEndDate).toISOString().slice(0, 10)
        : "",
      jobTitle: user.jobTitle || "",
      skills: Array.isArray(user.skills) ? user.skills.join(", ") : "",
      adminLevel: user.adminLevel || "",
      image: null,
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files?.[0] || null : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?._id) {
      toast.error("User not found");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email: formData.email,
        username: formData.username,
        phone: formData.phone,
        address: formData.address,
        timezone: formData.timezone,
        facebook: formData.facebook,
        linkedin: formData.linkedin,
        whatsapp: formData.whatsapp,
        adminLevel: formData.adminLevel,
        jobTitle: formData.jobTitle,
        skills: formData.skills,
        companyName: formData.companyName,
        contactPersonName: formData.contactPersonName,
        businessEmail: formData.businessEmail,
        budget: formData.budget,
        contractStartDate: formData.contractStartDate,
        contractEndDate: formData.contractEndDate,
        image: user.image || "",
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

      toast.success("Profile updated successfully");

      const updatedUser = {
        ...user,
        ...data.user,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <FiEdit2 className="text-xl text-slate-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Edit Profile</h2>
            <p className="mt-1 text-sm text-slate-500">
              Update common profile details and role-based information.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Profile Info</h3>

          <div className="mt-4 space-y-3 text-sm text-slate-500">
            <div className="rounded-2xl bg-slate-50 p-4">
              Common fields are available for all users.
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              Extra fields appear based on user role.
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              Image upload UI is ready. File storage can be connected next.
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Common Information
              </h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 px-3">
                  <FiMail className="text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="w-full px-3 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 px-3">
                  <FiPhone className="text-slate-400" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Time Zone
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 px-3">
                  <FiGlobe className="text-slate-400" />
                  <input
                    type="text"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    placeholder="Enter time zone"
                    className="w-full px-3 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Address
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 px-3">
                  <FiMapPin className="text-slate-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                    className="w-full px-3 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Facebook
                </label>
                <input
                  type="text"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="Enter Facebook profile link"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  LinkedIn
                </label>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="Enter LinkedIn profile link"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  WhatsApp
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="Enter WhatsApp number"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Profile Image
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-violet-100 file:px-4 file:py-2 file:text-violet-700"
                />
              </div>
            </div>

            {user?.role === "admin" && (
              <div className="space-y-5 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Admin Information
                </h3>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Admin Level
                  </label>
                  <select
                    name="adminLevel"
                    value={formData.adminLevel}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none"
                  >
                    <option value="">Select admin level</option>
                    <option value="super-admin">Super Admin</option>
                    <option value="support-admin">Support Admin</option>
                  </select>
                </div>
              </div>
            )}

            {user?.role === "employee" && (
              <div className="space-y-5 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Employee Information
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Job Title
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 px-3">
                      <FiBriefcase className="text-slate-400" />
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        placeholder="Enter job title"
                        className="w-full px-3 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Skills
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="React, Node.js, Testing"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {user?.role === "client" && (
              <div className="space-y-5 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Client Information
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Company Name
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 px-3">
                      <FiHome className="text-slate-400" />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        className="w-full px-3 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Contact Person Name
                    </label>
                    <input
                      type="text"
                      name="contactPersonName"
                      value={formData.contactPersonName}
                      onChange={handleChange}
                      placeholder="Enter contact person name"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Business Email
                    </label>
                    <input
                      type="email"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleChange}
                      placeholder="Enter business email"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Budget
                    </label>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="Enter budget"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Contract Start Date
                    </label>
                    <input
                      type="date"
                      name="contractStartDate"
                      value={formData.contractStartDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Contract End Date
                    </label>
                    <input
                      type="date"
                      name="contractEndDate"
                      value={formData.contractEndDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 py-3 font-medium text-white disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}