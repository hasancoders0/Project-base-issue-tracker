"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProject() {
  const router = useRouter();

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

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
    startDate: "",
    completeDate: "",
    note: "",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
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

  const uploadImage = async () => {
    if (!imageFile) return "";

    const uploadFormData = new FormData();
    uploadFormData.append("file", imageFile);

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
      formDataToSend.append("clientName", formData.clientName);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("value", formData.value);
      formDataToSend.append("website", formData.website);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("type", finalType);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("completeDate", formData.completeDate);
      formDataToSend.append("note", formData.note);

      const res = await fetch("/api/projects", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();
      console.log("PROJECT RESPONSE:", data);

      if (!res.ok) {
        alert(data.message || "Failed to create project");
        return;
      }

      alert("Project created successfully");
      router.push("/projects");
      router.refresh();
    } catch (error) {
      console.log("CREATE PROJECT ERROR:", error);
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-sm">
        <h1 className="text-3xl font-bold">Add Project</h1>
        <p className="mt-1 text-slate-500">
          Create a new project with full details
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-6 rounded-3xl bg-white p-6 text-slate-800 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Project Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter project title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Project Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />

            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-4 h-40 w-full rounded-xl object-cover"
              />
            )}
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Details</label>
            <textarea
              name="details"
              placeholder="Enter short project details"
              value={formData.details}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Client Name
            </label>
            <input
              type="text"
              name="clientName"
              placeholder="Enter client name"
              value={formData.clientName}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Country</label>
            <input
              type="text"
              name="country"
              placeholder="Enter country"
              value={formData.country}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Value ($)</label>
            <input
              type="number"
              name="value"
              placeholder="Enter project value"
              value={formData.value}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Website Link
            </label>
            <input
              type="text"
              name="website"
              placeholder="https://example.com"
              value={formData.website}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
            >
              <option value="In Progress">In Progress</option>
              <option value="Complete">Complete</option>
              <option value="Cancel">Cancel</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
            >
              <option value="Shopify">Shopify</option>
              <option value="WordPress">WordPress</option>
              <option value="Laravel">Laravel</option>
              <option value="Node.js">Node.js</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {formData.type === "Other" && (
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Custom Type
              </label>
              <input
                type="text"
                name="customType"
                placeholder="Enter custom type"
                value={formData.customType}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Complete Date
            </label>
            <input
              type="date"
              name="completeDate"
              value={formData.completeDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Note</label>
            <textarea
              name="note"
              placeholder="Write admin note"
              value={formData.note}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-violet-600 px-6 py-3 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>
    </div>
  );
}