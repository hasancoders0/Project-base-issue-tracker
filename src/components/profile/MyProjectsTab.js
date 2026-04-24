"use client";

import { useMemo } from "react";
import Link from "next/link";

function getProjectStatusClass(status) {
  if (status === "Complete") return "bg-emerald-400/15 text-emerald-300";
  if (status === "In Progress") return "bg-amber-400/15 text-amber-300";
  if (status === "Cancel") return "bg-rose-400/15 text-rose-300";
  return "bg-white/10 text-white/70";
}

const boardCard =
  "rounded-[20px] border border-white/10 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm";

const innerCard =
  "rounded-[16px] border border-white/10 bg-white/[0.07] backdrop-blur-md";

function getId(value) {
  if (!value) return "";
  if (typeof value === "string") return String(value);
  return String(value?._id || value?.id || "");
}

export default function MyProjectsTab({ user, projects = [] }) {
  const currentUser = useMemo(() => {
    if (user?._id) return user;

    if (typeof window === "undefined") return {};

    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, [user]);

  const myProjects = useMemo(() => {
    const userId = getId(currentUser?._id);

    const assignedProjectIds = Array.isArray(currentUser?.assignedProjects)
      ? currentUser.assignedProjects.map((item) => getId(item))
      : [];

    return projects.filter((project) => {
      const projectId = getId(project?._id);

      const assignedMembers = Array.isArray(project?.assignedTeamMembers)
        ? project.assignedTeamMembers.map((member) => getId(member))
        : [];

      const assignedClients = Array.isArray(project?.assignedClients)
        ? project.assignedClients.map((client) => getId(client))
        : [];

      const projectClientId = getId(project?.clientId);

      return (
        assignedProjectIds.includes(projectId) ||
        assignedMembers.includes(userId) ||
        assignedClients.includes(userId) ||
        projectClientId === userId
      );
    });
  }, [projects, currentUser]);

  return (
    <div className={`${boardCard} p-5`}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Projects</h2>
          <p className="mt-1 text-sm text-white/55">
            View your assigned and accessible projects.
          </p>
        </div>

        <span className="rounded-full bg-violet-400/15 px-4 py-2 text-xs font-bold text-violet-300">
          {myProjects.length} Project{myProjects.length !== 1 ? "s" : ""}
        </span>
      </div>

      {myProjects.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-white/15 bg-white/[0.04] px-4 py-8 text-center text-sm text-white/55">
          No assigned projects found.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {myProjects.map((project) => (
            <div key={project._id} className={`${innerCard} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {project.title}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-sm text-white/50">
                    {project.details || "No project details"}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${getProjectStatusClass(
                    project.status
                  )}`}
                >
                  {project.status || "N/A"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/55">
                <span className="rounded-full bg-white/10 px-3 py-1">
                  #{project.projectNumber || "N/A"}
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1">
                  {project.type || "Other"}
                </span>
              </div>

              <div className="mt-4">
                <Link
                  href={project.slug ? `/projects/${project.slug}` : "#"}
                  className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-white/90"
                >
                  View Project
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}