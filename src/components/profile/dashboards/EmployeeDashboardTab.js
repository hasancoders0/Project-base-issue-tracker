"use client";

import Link from "next/link";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiLayers,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";

function getProjectStatusClass(status) {
  if (status === "Complete") return "bg-emerald-400/15 text-emerald-300";
  if (status === "In Progress") return "bg-amber-400/15 text-amber-300";
  if (status === "Cancel") return "bg-rose-400/15 text-rose-300";
  return "bg-white/10 text-white/70";
}

function getIssueStatusClass(status) {
  if (status === "Closed") return "bg-emerald-400/15 text-emerald-300";
  if (status === "In Progress") return "bg-amber-400/15 text-amber-300";
  if (status === "Open") return "bg-sky-400/15 text-sky-300";
  return "bg-white/10 text-white/70";
}

const boardCard =
  "rounded-[20px] border border-white/10 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm";

const innerCard =
  "rounded-[16px] border border-white/10 bg-white/[0.07] backdrop-blur-md";

export default function EmployeeDashboardTab({ user, projects = [], issues = [] }) {
  const userNames = [user?.name, user?.fullName, user?.username, user?.email]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  const myProjects = projects.filter((project) => {
    const assignedMembers = Array.isArray(project.assignedTeamMembers)
      ? project.assignedTeamMembers.map((member) =>
          typeof member === "string" ? member : String(member?._id)
        )
      : [];

    const assignedProjectIds = Array.isArray(user?.assignedProjects)
      ? user.assignedProjects.map((item) =>
          typeof item === "string" ? item : String(item?._id || item)
        )
      : [];

    return (
      assignedMembers.includes(String(user?._id)) ||
      assignedProjectIds.includes(String(project._id))
    );
  });

  const myProjectIds = myProjects.map((project) => String(project._id));

  const myTasks = issues.filter((issue) => {
    const issueProjectId =
      typeof issue.projectId === "object"
        ? String(issue.projectId?._id)
        : String(issue.projectId);

    const assignee = String(issue.assignee || "").toLowerCase();
    const reporter = String(issue.reporter || "").toLowerCase();

    return (
      myProjectIds.includes(issueProjectId) ||
      userNames.includes(assignee) ||
      userNames.includes(reporter)
    );
  });

  const openTasks = myTasks.filter((issue) => issue.status === "Open").length;
  const progressTasks = myTasks.filter((issue) => issue.status === "In Progress").length;
  const closedTasks = myTasks.filter((issue) => issue.status === "Closed").length;
  const highPriorityTasks = myTasks.filter((issue) => issue.priority === "High").length;

  const completedPercent = Math.round((closedTasks / (myTasks.length || 1)) * 100);

  const recentProjects = [...myProjects]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4);

  const recentTasks = [...myTasks]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className={`${boardCard} p-4`}>
        <div className="grid gap-3 lg:grid-cols-[1.25fr_0.85fr_0.7fr]">
          <div className="rounded-[18px] bg-gradient-to-br from-emerald-500/90 via-emerald-600/85 to-green-800/90 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
              Employee Workspace
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Hello, {user?.name || user?.fullName || "Employee"}
            </h1>

            <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
              Focus on assigned work, track progress, and follow project updates.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <Link
                href="/profile"
                className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-white/90"
              >
                View Profile
              </Link>

              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("change-tab", { detail: { tab: "my-tasks" } })
                  )
                }
                className="rounded-full border border-white/25 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10"
              >
                View Tasks
              </button>
            </div>
          </div>

          <div className="rounded-[18px] bg-violet-700/95 p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400 text-slate-950">
                <FiUser />
              </div>

              <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold text-slate-950">
                Active
              </span>
            </div>

            <h2 className="mt-7 text-3xl font-bold">My Work</h2>

            <div className="mt-5 border-t border-white/20 pt-4">
              <p className="text-sm text-white/70">Completion</p>
              <p className="mt-1 text-5xl font-bold">{completedPercent}%</p>
            </div>
          </div>

          <div className="rounded-[18px] bg-zinc-900/90 p-5">
            <h2 className="text-3xl font-bold">Overview</h2>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {[
                ["Projects", myProjects.length],
                ["Tasks", myTasks.length],
                ["Done", closedTasks],
                ["High", highPriorityTasks],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[14px] bg-white/10 p-3 text-center">
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="mt-1 text-[10px] text-white/55">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Open Tasks", value: openTasks, icon: <FiAlertCircle />, color: "text-sky-300" },
          { label: "In Progress", value: progressTasks, icon: <FiClock />, color: "text-amber-300" },
          { label: "Completed", value: closedTasks, icon: <FiCheckCircle />, color: "text-emerald-300" },
          { label: "High Priority", value: highPriorityTasks, icon: <FiLayers />, color: "text-rose-300" },
        ].map((item) => (
          <div key={item.label} className={`${boardCard} p-4`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/55">{item.label}</p>
                <h2 className="mt-2 text-3xl font-bold">{item.value}</h2>
              </div>

              <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] bg-white/10 text-xl ${item.color}`}>
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_0.9fr]">
        <div className={`${boardCard} p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Personal Progress</h2>
              <p className="mt-1 text-sm text-white/55">Completion rate across assigned work.</p>
            </div>
            <FiTrendingUp className="text-white/45" />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-white/65">Completed</span>
              <span className="font-bold">{completedPercent}%</span>
            </div>

            <div className="h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-emerald-400"
                style={{ width: `${completedPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              ["Projects", myProjects.length],
              ["Tasks", myTasks.length],
              ["Finished", closedTasks],
            ].map(([label, value]) => (
              <div key={label} className={`${innerCard} p-4`}>
                <p className="text-xs text-white/50">{label}</p>
                <p className="mt-2 text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`${boardCard} p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Quick Access</h2>
              <p className="mt-1 text-sm text-white/55">Jump into work faster.</p>
            </div>
            <FiUser className="text-white/45" />
          </div>

          <div className="space-y-2">
            {[
              ["My Tasks", "Review assigned tasks", "my-tasks"],
              ["My Projects", "Open project list", "my-projects"],
              ["Profile", "View your account", "profile"],
            ].map(([title, desc, tab]) => (
              <button
                key={title}
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("change-tab", { detail: { tab } })
                  )
                }
                className="group flex w-full items-center justify-between rounded-[14px] bg-white/[0.07] px-4 py-3 text-left transition hover:bg-white/12"
              >
                <div>
                  <p className="font-bold text-white">{title}</p>
                  <p className="text-xs text-white/50">{desc}</p>
                </div>
                <FiArrowRight className="text-white/45 transition group-hover:translate-x-1 group-hover:text-white" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <div className={`${boardCard} p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">My Projects</h2>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("change-tab", { detail: { tab: "my-projects" } })
                )
              }
              className="text-xs font-bold text-cyan-300"
            >
              View all
            </button>
          </div>

          <div className="space-y-2">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div key={project._id} className={`${innerCard} px-4 py-3`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{project.title}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-white/50">
                        {project.details || "No project details"}
                      </p>
                    </div>

                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${getProjectStatusClass(project.status)}`}>
                      {project.status || "N/A"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/55">No assigned projects found.</p>
            )}
          </div>
        </div>

        <div className={`${boardCard} p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Tasks</h2>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("change-tab", { detail: { tab: "my-tasks" } })
                )
              }
              className="text-xs font-bold text-cyan-300"
            >
              View all
            </button>
          </div>

          <div className="space-y-2">
            {recentTasks.length > 0 ? (
              recentTasks.map((issue) => (
                <div key={issue._id} className={`${innerCard} px-4 py-3`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{issue.title}</p>
                      <p className="mt-1 text-xs text-white/50">
                        #{issue.issueNumber || "N/A"} • {issue.priority || "Medium"}
                      </p>
                    </div>

                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${getIssueStatusClass(issue.status)}`}>
                      {issue.status || "Open"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/55">No assigned tasks found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}