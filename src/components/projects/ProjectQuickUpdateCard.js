"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiClock, FiFolder, FiLayers, FiSave } from "react-icons/fi";

export default function ProjectQuickUpdateCard({ project, onSaved }) {
  const router = useRouter();

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    status: project?.status || "In Progress",
    projectPhase: project?.projectPhase || "Planning",
    estimatedTime: project?.estimatedTime || "",
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) return;

    try {
      setLoggedInUser(JSON.parse(user));
    } catch (error) {
      console.log("USER PARSE ERROR:", error);
    }
  }, []);

  useEffect(() => {
    setFormData({
      status: project?.status || "In Progress",
      projectPhase: project?.projectPhase || "Planning",
      estimatedTime: project?.estimatedTime || "",
    });
  }, [project]);

  const assignedIds = Array.isArray(project?.assignedTeamMembers)
    ? project.assignedTeamMembers.map((member) =>
        typeof member === "string" ? member : member._id,
      )
    : [];

  const canQuickUpdate = useMemo(() => {
    if (!loggedInUser) return false;

    if (
      loggedInUser.role === "admin" ||
      loggedInUser.role === "project-manager"
    ) {
      return true;
    }

    if (loggedInUser.role === "employee") {
      return assignedIds.includes(loggedInUser._id);
    }

    return false;
  }, [loggedInUser, assignedIds]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loggedInUser) {
      toast.error("Please login first");
      return;
    }

    if (!canQuickUpdate) {
      toast.error("You do not have permission");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/projects/${project.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": loggedInUser._id || "",
          "x-user-email": loggedInUser.email || "",
          "x-user-username": loggedInUser.username || "",
          "x-user-role": loggedInUser.role || "",
        },
        body: JSON.stringify({
          status: formData.status,
          projectPhase: formData.projectPhase,
          estimatedTime: formData.estimatedTime,
          quickUpdateOnly: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Update failed");
        return;
      }

      toast.success("Project updated");
      onSaved?.(formData);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!canQuickUpdate) return null;

  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="mb-5">
        <h3 className="text-xl font-bold text-slate-900">Quick Project Update</h3>
        <p className="mt-1 text-sm text-slate-500">
          Update only phase, status, and estimated time.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Phase
          </label>
          <div className="flex items-center rounded-2xl border border-slate-300 bg-white px-3 shadow-sm">
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
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Status
          </label>
          <div className="flex items-center rounded-2xl border border-slate-300 bg-white px-3 shadow-sm">
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

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Estimated Time
          </label>
          <div className="flex items-center rounded-2xl border border-slate-300 bg-white px-3 shadow-sm">
            <FiClock className="text-slate-400" />
            <input
              type="text"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleChange}
              placeholder="2 weeks / 5 days"
              className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSave />
            {loading ? "Saving..." : "Save Quick Update"}
          </button>
        </div>
      </form>
    </div>
  );
}