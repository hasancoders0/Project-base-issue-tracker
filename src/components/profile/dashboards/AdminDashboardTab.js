"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowRight,
  FiBarChart2,
  FiClock,
  FiFolder,
  FiLayers,
  FiPlusSquare,
  FiTrendingUp,
  FiUserPlus,
  FiUsers,
  FiRefreshCw,
  FiClipboard,
  FiTrash2,
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

function getActivityIcon(action) {
  if (action === "created") return <FiPlusSquare className="text-base" />;
  if (action === "deleted") return <FiTrash2 className="text-base" />;

  if (
    action === "status_changed" ||
    action === "phase_changed" ||
    action === "priority_changed" ||
    action === "review_changed"
  ) {
    return <FiRefreshCw className="text-base" />;
  }

  if (action === "assigned" || action === "assignee_changed") {
    return <FiUserPlus className="text-base" />;
  }

  return <FiClipboard className="text-base" />;
}

function getActivityIconClass(action) {
  if (action === "created") return "bg-emerald-400/15 text-emerald-300";
  if (action === "deleted") return "bg-rose-400/15 text-rose-300";

  if (
    action === "status_changed" ||
    action === "phase_changed" ||
    action === "priority_changed" ||
    action === "review_changed"
  ) {
    return "bg-amber-400/15 text-amber-300";
  }

  if (action === "assigned" || action === "assignee_changed") {
    return "bg-violet-400/15 text-violet-300";
  }

  return "bg-white/10 text-white/70";
}

function formatDateTime(value) {
  if (!value) return "No time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No time";
  return date.toLocaleString();
}

function formatValue(value) {
  if (Array.isArray(value)) {
    if (value.length === 0) return "None";

    return value
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return item.fullName || item.name || item.username || item.title || "Item";
        }

        return String(item)
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());
      })
      .join(", ");
  }

  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (value === null || value === undefined || value === "") return "None";

  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getActivityTitle(activity) {
  const entityType = activity.entityType || "item";
  const action = activity.action || "updated";
  const actor = activity.performedBy?.name || "Someone";

  if (action === "created") return `${actor} created ${entityType}`;
  if (action === "deleted") return `${actor} deleted ${entityType}`;
  if (action === "status_changed") return `${actor} changed ${entityType} status`;
  if (action === "phase_changed") return `${actor} changed ${entityType} phase`;
  if (action === "priority_changed") return `${actor} changed ${entityType} priority`;
  if (action === "review_changed") return `${actor} updated ${entityType} review`;
  if (action === "assigned") return `${actor} updated ${entityType} assignment`;
  if (action === "assignee_changed") return `${actor} changed ${entityType} assignee`;

  if (activity.field) return `${actor} updated ${entityType} ${activity.field}`;

  return `${actor} updated ${entityType}`;
}

function getActivityDescription(activity) {
  const action = activity.action || "updated";
  const fromValue = formatValue(activity.from);
  const toValue = formatValue(activity.to);
  const projectTitle = activity.projectTitle || "";

  let mainText = "";

  if (action === "created") {
    mainText = `Created: ${toValue}`;
  } else if (action === "deleted") {
    mainText = `Deleted: ${fromValue}`;
  } else if (
    action === "status_changed" ||
    action === "phase_changed" ||
    action === "priority_changed" ||
    action === "review_changed" ||
    action === "assignee_changed"
  ) {
    mainText = `${fromValue} → ${toValue}`;
  } else if (action === "assigned") {
    mainText = `Assigned to ${toValue}`;
  } else if (activity.field) {
    mainText = `${formatValue(activity.field)}: ${fromValue} → ${toValue}`;
  } else {
    mainText = `${fromValue} → ${toValue}`;
  }

  if (projectTitle) return `${mainText} • ${projectTitle}`;

  return mainText;
}

const boardCard =
  "rounded-[20px] border border-white/10 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm";

const innerCard =
  "rounded-[16px] border border-white/10 bg-white/[0.07] backdrop-blur-md";

function DashboardActionCard({ title, subtitle, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between rounded-[14px] bg-white/[0.07] px-4 py-3 text-left transition hover:bg-white/12"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/10 text-white/75">
          {icon}
        </div>

        <div>
          <p className="font-bold text-white">{title}</p>
          <p className="text-xs text-white/50">{subtitle}</p>
        </div>
      </div>

      <FiArrowRight className="shrink-0 text-white/45 transition group-hover:translate-x-1 group-hover:text-white" />
    </button>
  );
}

export default function AdminDashboardTab({ user, projects = [], issues = [] }) {
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchActivities() {
      try {
        setActivitiesLoading(true);

        const storedUser =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("user") || "{}")
            : {};

        const headers = {
          "x-user-id": storedUser?._id || "",
          "x-user-role": storedUser?.role || "",
          "x-user-email": storedUser?.email || "",
          "x-user-username": storedUser?.username || "",
        };

        const res = await fetch("/api/activities", {
          cache: "no-store",
          headers,
        });

        if (!res.ok) {
          if (isMounted) setActivities([]);
          return;
        }

        const data = await res.json();

        if (!isMounted) return;

        if (Array.isArray(data)) {
          setActivities(data.slice(0, 8));
        } else if (Array.isArray(data.activities)) {
          setActivities(data.activities.slice(0, 8));
        } else {
          setActivities([]);
        }
      } catch (error) {
        if (isMounted) setActivities([]);
      } finally {
        if (isMounted) setActivitiesLoading(false);
      }
    }

    fetchActivities();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalProjects = projects.length;
  const totalIssues = issues.length;

  const activeProjects = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "Complete"
  ).length;

  const openIssues = issues.filter((issue) => issue.status === "Open").length;

  const progressIssues = issues.filter(
    (issue) => issue.status === "In Progress"
  ).length;

  const closedIssues = issues.filter((issue) => issue.status === "Closed").length;

  const highPriorityIssues = issues.filter(
    (issue) => issue.priority === "High"
  ).length;

  const projectCompletionPercent = Math.round(
    (completedProjects / (totalProjects || 1)) * 100
  );

  const issueClosurePercent = Math.round(
    (closedIssues / (totalIssues || 1)) * 100
  );

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 4);
  }, [projects]);

  const recentIssues = useMemo(() => {
    return [...issues]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
  }, [issues]);

  function openProfileTab(tab) {
    window.dispatchEvent(new CustomEvent("change-tab", { detail: { tab } }));
  }

  return (
    <div className="space-y-4">
      <div className={`${boardCard} p-4`}>
        <div className="grid gap-3 lg:grid-cols-[1.25fr_0.85fr_0.7fr]">
          <div className="rounded-[18px] bg-gradient-to-br from-violet-600/95 via-fuchsia-700/90 to-slate-950/95 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
              Admin Command Center
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Welcome back, {user?.name || user?.fullName || "Admin"}
            </h1>

            <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
              Monitor platform health, manage team workload, and keep project
              delivery under control.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openProfileTab("add-task")}
                className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-white/90"
              >
                Add Task
              </button>

              <button
                type="button"
                onClick={() => openProfileTab("task-management")}
                className="rounded-full border border-white/25 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10"
              >
                Task Management
              </button>
            </div>
          </div>

          <div className="rounded-[18px] bg-violet-700/95 p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400 text-slate-950">
                <FiActivity />
              </div>

              <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold text-slate-950">
                Admin
              </span>
            </div>

            <h2 className="mt-7 text-3xl font-bold">Platform</h2>

            <div className="mt-5 border-t border-white/20 pt-4">
              <p className="text-sm text-white/70">Issue Closure</p>
              <p className="mt-1 text-5xl font-bold">{issueClosurePercent}%</p>
            </div>
          </div>

          <div className="rounded-[18px] bg-zinc-900/90 p-5">
            <h2 className="text-3xl font-bold">Overview</h2>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {[
                ["Projects", totalProjects],
                ["Issues", totalIssues],
                ["Done", closedIssues],
                ["High", highPriorityIssues],
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
          {
            label: "Total Projects",
            value: totalProjects,
            icon: <FiFolder />,
            color: "text-violet-300",
            tab: "my-projects",
          },
          {
            label: "Active Projects",
            value: activeProjects,
            icon: <FiClock />,
            color: "text-amber-300",
            tab: "my-projects",
          },
          {
            label: "Total Issues",
            value: totalIssues,
            icon: <FiLayers />,
            color: "text-sky-300",
            tab: "task-management",
          },
          {
            label: "High Priority",
            value: highPriorityIssues,
            icon: <FiAlertCircle />,
            color: "text-rose-300",
            tab: "task-management",
          },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => openProfileTab(item.tab)}
            className={`${boardCard} p-4 text-left transition hover:bg-white/[0.03]`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/55">{item.label}</p>
                <h2 className="mt-2 text-3xl font-bold">{item.value}</h2>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-[14px] bg-white/10 text-xl ${item.color}`}
              >
                {item.icon}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_0.9fr]">
        <div className={`${boardCard} p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Platform Overview</h2>
              <p className="mt-1 text-sm text-white/55">
                Review completion and issue resolution health.
              </p>
            </div>

            <FiTrendingUp className="text-white/45" />
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-white/65">Project Completion</span>
                <span className="font-bold">{projectCompletionPercent}%</span>
              </div>

              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-emerald-400"
                  style={{ width: `${projectCompletionPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-white/65">Issue Closure</span>
                <span className="font-bold">{issueClosurePercent}%</span>
              </div>

              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-violet-400"
                  style={{ width: `${issueClosurePercent}%` }}
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {[
                ["Completed Projects", completedProjects],
                ["Open Issues", openIssues],
                ["In Progress", progressIssues],
              ].map(([label, value]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    label === "Completed Projects"
                      ? openProfileTab("my-projects")
                      : openProfileTab("task-management")
                  }
                  className={`${innerCard} p-4 text-left transition hover:bg-white/10`}
                >
                  <p className="text-xs text-white/50">{label}</p>
                  <p className="mt-2 text-2xl font-bold">{value}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`${boardCard} p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Admin Shortcuts</h2>
              <p className="mt-1 text-sm text-white/55">
                Fast access to important actions.
              </p>
            </div>

            <FiUsers className="text-white/45" />
          </div>

          <div className="space-y-2">
            <DashboardActionCard
              title="Task Management"
              subtitle="Manage all tasks"
              icon={<FiActivity />}
              onClick={() => openProfileTab("task-management")}
            />

            <DashboardActionCard
              title="Add Task"
              subtitle="Create internal task"
              icon={<FiPlusSquare />}
              onClick={() => openProfileTab("add-task")}
            />

            <DashboardActionCard
              title="Analytics"
              subtitle="Open admin analytics"
              icon={<FiBarChart2 />}
              onClick={() => openProfileTab("analytics")}
            />

            <DashboardActionCard
              title="Add User"
              subtitle="Create new user account"
              icon={<FiUserPlus />}
              onClick={() => openProfileTab("add-user")}
            />

            <DashboardActionCard
              title="User List"
              subtitle="Manage platform users"
              icon={<FiUsers />}
              onClick={() => openProfileTab("users")}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_0.9fr]">
        <div className={`${boardCard} p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Recent Activities</h2>
              <p className="mt-1 text-sm text-white/55">
                Latest updates across projects, issues, and tasks.
              </p>
            </div>

            <FiActivity className="text-white/45" />
          </div>

          <div className="space-y-2">
            {activitiesLoading ? (
              <div className="rounded-[16px] border border-dashed border-white/15 bg-white/[0.04] px-4 py-8 text-center text-sm text-white/55">
                Loading activities...
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity, index) => (
                <div
                  key={activity._id || `${activity.entityType}-${index}`}
                  className={`${innerCard} p-4 transition hover:bg-white/10`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${getActivityIconClass(
                        activity.action
                      )}`}
                    >
                      {getActivityIcon(activity.action)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <p className="text-sm font-bold text-white">
                          {getActivityTitle(activity)}
                        </p>

                        <p className="text-xs text-white/45">
                          {formatDateTime(activity.createdAt)}
                        </p>
                      </div>

                      <p className="mt-1 text-sm text-white/60">
                        {getActivityDescription(activity)}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {activity.entityType && (
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium capitalize text-white/65">
                            {activity.entityType}
                          </span>
                        )}

                        {activity.field && (
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/65">
                            {formatValue(activity.field)}
                          </span>
                        )}

                        {activity.projectTitle && (
                          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-300">
                            {activity.projectTitle}
                          </span>
                        )}

                        {activity.performedBy?.name && (
                          <span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs font-medium text-violet-300">
                            By {activity.performedBy.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-white/15 bg-white/[0.04] px-4 py-8 text-center text-sm text-white/55">
                No recent activities found.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className={`${boardCard} p-5`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Projects</h2>

              <button
                type="button"
                onClick={() => openProfileTab("my-projects")}
                className="text-xs font-bold text-cyan-300"
              >
                View all
              </button>
            </div>

            <div className="space-y-2">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <button
                    type="button"
                    key={project._id}
                    onClick={() => openProfileTab("my-projects")}
                    className={`${innerCard} w-full px-4 py-3 text-left transition hover:bg-white/10`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">{project.title}</p>
                        <p className="mt-1 line-clamp-1 text-xs text-white/50">
                          {project.details || "No project details"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${getProjectStatusClass(
                          project.status
                        )}`}
                      >
                        {project.status || "N/A"}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-white/55">No recent projects found.</p>
              )}
            </div>
          </div>

          <div className={`${boardCard} p-5`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Issues</h2>

              <Link href="/issues" className="text-xs font-bold text-cyan-300">
                View all
              </Link>
            </div>

            <div className="space-y-2">
              {recentIssues.length > 0 ? (
                recentIssues.map((issue) => (
                  <Link
                    href="/issues"
                    key={issue._id}
                    className={`${innerCard} block px-4 py-3 transition hover:bg-white/10`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">{issue.title}</p>
                        <p className="mt-1 text-xs text-white/50">
                          #{issue.issueNumber || "N/A"} •{" "}
                          {issue.priority || "Medium"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${getIssueStatusClass(
                          issue.status
                        )}`}
                      >
                        {issue.status || "Open"}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-white/55">No recent issues found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}