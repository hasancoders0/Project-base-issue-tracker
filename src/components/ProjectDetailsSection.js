"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProjectDetailsOffcanvas from "./ProjectDetailsOffcanvas";
import toast from "react-hot-toast";

function getStatusClass(status) {
  if (status === "In Progress") return "bg-yellow-100 text-yellow-700";
  if (status === "Complete") return "bg-green-100 text-green-700";
  if (status === "Cancel") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

export default function ProjectDetailsSection({ project }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(project.status || "In Progress");
  const [loading, setLoading] = useState(false);

  const imageUrl =
    project.image?.trim() ||
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80";

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);

      const res = await fetch(`/api/projects/${project.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update status");
        return;
      }

      setStatus(data.status);
      toast.success("Project status updated");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-3xl bg-white text-slate-800 shadow-sm">
        <img
          src={imageUrl}
          alt={project.title}
          className="h-72 w-full object-cover"
        />

        <div className="p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Project #{project.projectNumber || "N/A"}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(status)}`}
            >
              {status}
            </span>

            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              {project.type || "Other"}
            </span>
          </div>

          <h1 className="mb-3 text-3xl font-bold">{project.title}</h1>

          <p className="text-slate-600">
            {project.details || "No project details added yet."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              View Project Details
            </button>

            <Link
              href={`/projects/${project.slug}/edit`}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
            >
              Edit Project
            </Link>

            <Link
              href={`/issues/new?projectId=${project._id}`}
              className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white"
            >
              Add New Issue
            </Link>

            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none disabled:opacity-60"
            >
              <option value="In Progress">In Progress</option>
              <option value="Complete">Complete</option>
              <option value="Cancel">Cancel</option>
            </select>
          </div>
        </div>
      </div>

      <ProjectDetailsOffcanvas
        project={{ ...project, status }}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
