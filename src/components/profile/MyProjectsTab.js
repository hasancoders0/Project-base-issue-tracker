"use client";

import Link from "next/link";

export default function MyProjectsTab({ projects = [] }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Projects</h2>
          <p className="mt-2 text-sm text-slate-500">
            View your assigned and accessible projects.
          </p>
        </div>

        <span className="rounded-full bg-violet-100 px-4 py-2 text-xs font-semibold text-violet-700">
          {projects.length} Project{projects.length !== 1 ? "s" : ""}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
          No assigned projects found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <div
              key={project._id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {project.details || "No project details"}
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {project.status || "N/A"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-white px-3 py-1">
                  #{project.projectNumber || "N/A"}
                </span>
                <span className="rounded-full bg-white px-3 py-1">
                  {project.type || "Other"}
                </span>
              </div>

              <div className="mt-4">
                <Link
                  href={project.slug ? `/projects/${project.slug}` : "#"}
                  className="inline-flex rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
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