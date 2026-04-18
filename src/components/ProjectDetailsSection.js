"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProjectDetailsOffcanvas from "./ProjectDetailsOffcanvas";
import ProjectQuickUpdateCard from "./projects/ProjectQuickUpdateCard";
import {
  FiBriefcase,
  FiClock,
  FiEdit3,
  FiEye,
  FiLayers,
  FiPlusCircle,
  FiShield,
  FiUsers,
} from "react-icons/fi";

function getStatusClass(status) {
  if (status === "In Progress") {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
  if (status === "Complete") {
    return "bg-green-100 text-green-700 border-green-200";
  }
  if (status === "Cancel") {
    return "bg-red-100 text-red-700 border-red-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function ProjectDetailsSection({ project }) {
  const [open, setOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showQuickUpdate, setShowQuickUpdate] = useState(false);
  const [quickData, setQuickData] = useState({
    status: project.status || "In Progress",
    projectPhase: project.projectPhase || "Planning",
    estimatedTime: project.estimatedTime || "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return;

    try {
      setLoggedInUser(JSON.parse(storedUser));
    } catch (error) {
      console.log("USER PARSE ERROR:", error);
    }
  }, []);

  useEffect(() => {
    setQuickData({
      status: project.status || "In Progress",
      projectPhase: project.projectPhase || "Planning",
      estimatedTime: project.estimatedTime || "",
    });
  }, [project]);

  const imageUrl =
    project.image?.trim() ||
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80";

  const assignedTeamMembers = Array.isArray(project.assignedTeamMembers)
    ? project.assignedTeamMembers
    : [];

  const assignedIds = assignedTeamMembers.map((member) =>
    typeof member === "string" ? member : member._id,
  );

  const canFullEdit =
    loggedInUser?.role === "admin" || loggedInUser?.role === "project-manager";

  const canQuickUpdate =
    canFullEdit ||
    (loggedInUser?.role === "employee" &&
      assignedIds.includes(loggedInUser?._id));

  const teamCount = assignedTeamMembers.length;

  const quickStatusClass = useMemo(
    () => getStatusClass(quickData.status),
    [quickData.status],
  );

  return (
    <>
      <div className="overflow-hidden rounded-3xl bg-white text-slate-800 shadow-sm">
        <div className="relative">
          <img
            src={imageUrl}
            alt={project.title}
            className="h-72 w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />

          <div className="absolute bottom-0 left-0 w-full p-6 lg:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                Project #{project.projectNumber || "N/A"}
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur ${quickStatusClass}`}
              >
                {quickData.status}
              </span>

              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                {project.type || "Other"}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {quickData.projectPhase || "Planning"}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold text-white lg:text-4xl">
              {project.title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200">
              {project.details || "No project details added yet."}
            </p>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <FiBriefcase />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Client
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {project.clientName || "Not added"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <FiUsers />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Team Members
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {teamCount} assigned
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <FiLayers />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phase
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {quickData.projectPhase || "Planning"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <FiClock />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estimated Time
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {quickData.estimatedTime || "Not added"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FiEye />
              View Project Details
            </button>

            {canFullEdit && (
              <Link
                href={`/projects/${project.slug}/edit`}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
              >
                <FiEdit3 />
                Edit Project
              </Link>
            )}

            <Link
              href={`/issues/new?projectId=${project._id}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              <FiPlusCircle />
              Add New Issue
            </Link>

            {canQuickUpdate && (
              <button
                type="button"
                onClick={() => setShowQuickUpdate((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <FiShield />
                {showQuickUpdate ? "Hide Quick Update" : "Quick Update"}
              </button>
            )}
          </div>

          {canQuickUpdate && showQuickUpdate && (
            <ProjectQuickUpdateCard
              project={project}
              onSaved={(values) => {
                setQuickData(values);
                setShowQuickUpdate(false);
              }}
            />
          )}
        </div>
      </div>

      <ProjectDetailsOffcanvas
        project={{
          ...project,
          status: quickData.status,
          projectPhase: quickData.projectPhase,
          estimatedTime: quickData.estimatedTime,
        }}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}