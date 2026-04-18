"use client";

import {
  FiActivity,
  FiAlertCircle,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiFolder,
  FiLayers,
  FiPieChart,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import AnalyticsStatCard from "@/components/profile/analytics/AnalyticsStatCard";
import AnalyticsCombinedTrendChart from "@/components/profile/analytics/AnalyticsCombinedTrendChart";

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function getLastSixMonths() {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

    months.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleString("en-US", { month: "short" }),
      year: date.getFullYear(),
      month: date.getMonth(),
    });
  }

  return months;
}

function buildMonthlyData(items = []) {
  const months = getLastSixMonths();

  return months.map((monthItem) => {
    const count = items.filter((item) => {
      if (!item?.createdAt) return false;

      const date = new Date(item.createdAt);

      if (Number.isNaN(date.getTime())) return false;

      return (
        date.getFullYear() === monthItem.year &&
        date.getMonth() === monthItem.month
      );
    }).length;

    return {
      label: monthItem.label,
      value: count,
    };
  });
}

function ProgressRow({ label, value, total, barClass = "bg-violet-500" }) {
  const progress = percent(value, total);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">
          {value} ({progress}%)
        </span>
      </div>

      <div className="h-3 rounded-full bg-slate-100">
        <div
          className={`h-3 rounded-full ${barClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function SummaryPanel({ title, icon, children }) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        </div>
        {icon}
      </div>
      {children}
    </div>
  );
}

function CombinedBreakdownChart({
  title,
  leftTitle,
  rightTitle,
  leftItems = [],
  rightItems = [],
}) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Two summaries in one row
          </p>
        </div>
        <FiPieChart className="text-slate-400" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {leftTitle}
          </h3>
          <div className="space-y-4">
            {leftItems.map((item) => (
              <ProgressRow
                key={item.label}
                label={item.label}
                value={item.value}
                total={leftItems.reduce((sum, current) => sum + current.value, 0)}
                barClass={item.barClass}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {rightTitle}
          </h3>
          <div className="space-y-4">
            {rightItems.map((item) => (
              <ProgressRow
                key={item.label}
                label={item.label}
                value={item.value}
                total={rightItems.reduce((sum, current) => sum + current.value, 0)}
                barClass={item.barClass}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentList({ title, items = [], type = "project" }) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {type === "project" ? (
          <FiFolder className="text-slate-400" />
        ) : (
          <FiAlertCircle className="text-slate-400" />
        )}
      </div>

      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl bg-slate-50 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {type === "project"
                      ? item.details || "No project details"
                      : `#${item.issueNumber || "N/A"} • ${item.priority || "Medium"}`}
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {item.status || "N/A"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No data found.</p>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsTab({
  projects = [],
  issues = [],
  users = [],
}) {
  const totalProjects = projects.length;
  const totalIssues = issues.length;
  const totalUsers = users.length;

  const completeProjects = projects.filter(
    (project) => project.status === "Complete"
  ).length;
  const progressProjects = projects.filter(
    (project) => project.status === "In Progress"
  ).length;
  const cancelProjects = projects.filter(
    (project) => project.status === "Cancel"
  ).length;

  const openIssues = issues.filter((issue) => issue.status === "Open").length;
  const progressIssues = issues.filter(
    (issue) => issue.status === "In Progress"
  ).length;
  const closedIssues = issues.filter((issue) => issue.status === "Closed").length;

  const lowIssues = issues.filter((issue) => issue.priority === "Low").length;
  const mediumIssues = issues.filter(
    (issue) => issue.priority === "Medium"
  ).length;
  const highIssues = issues.filter((issue) => issue.priority === "High").length;

  const activeUsers = users.filter((user) => user.status === "active").length;
  const adminUsers = users.filter((user) => user.role === "admin").length;
  const managerUsers = users.filter(
    (user) => user.role === "project-manager"
  ).length;
  const employeeUsers = users.filter((user) => user.role === "employee").length;
  const clientUsers = users.filter((user) => user.role === "client").length;

  const projectTypeCount = {};
  for (const project of projects) {
    const type = project.type || "Other";
    projectTypeCount[type] = (projectTypeCount[type] || 0) + 1;
  }

  const projectTypeList = Object.entries(projectTypeCount)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const monthlyProjectData = buildMonthlyData(projects);
  const monthlyIssueData = buildMonthlyData(issues);

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-violet-950 to-indigo-950 p-6 text-white shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-100">
              Analytics Overview
            </div>

            <h1 className="mt-4 text-3xl font-bold leading-tight lg:text-5xl">
              Platform Analytics
            </h1>

            <p className="mt-3 max-w-xl text-sm text-slate-200 lg:text-base">
              Monitor projects, issues, users, and platform performance from one admin-only dashboard.
            </p>
          </div>

          <div className="grid min-w-[240px] grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-violet-100">Projects</p>
              <p className="mt-2 text-3xl font-bold">{totalProjects}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-violet-100">Issues</p>
              <p className="mt-2 text-3xl font-bold">{totalIssues}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsStatCard
          title="Total Users"
          value={totalUsers}
          subtitle={`${activeUsers} active users`}
          icon={<FiUsers className="text-2xl" />}
          tone="violet"
        />

        <AnalyticsStatCard
          title="Total Projects"
          value={totalProjects}
          subtitle={`${progressProjects} running`}
          icon={<FiFolder className="text-2xl" />}
          tone="blue"
        />

        <AnalyticsStatCard
          title="Total Issues"
          value={totalIssues}
          subtitle={`${openIssues} open now`}
          icon={<FiLayers className="text-2xl" />}
          tone="amber"
        />

        <AnalyticsStatCard
          title="Closed Issues"
          value={closedIssues}
          subtitle={`${percent(closedIssues, totalIssues)}% resolved`}
          icon={<FiCheckCircle className="text-2xl" />}
          tone="green"
        />
      </div>

      <AnalyticsCombinedTrendChart
        title="Monthly Growth"
        projectData={monthlyProjectData}
        issueData={monthlyIssueData}
      />

      <CombinedBreakdownChart
        title="Status & Priority Breakdown"
        leftTitle="Project Status"
        rightTitle="Issue Priority"
        leftItems={[
          {
            label: "In Progress",
            value: progressProjects,
            barClass: "bg-amber-500",
          },
          {
            label: "Completed",
            value: completeProjects,
            barClass: "bg-emerald-500",
          },
          {
            label: "Cancelled",
            value: cancelProjects,
            barClass: "bg-rose-500",
          },
        ]}
        rightItems={[
          {
            label: "High",
            value: highIssues,
            barClass: "bg-rose-500",
          },
          {
            label: "Medium",
            value: mediumIssues,
            barClass: "bg-amber-500",
          },
          {
            label: "Low",
            value: lowIssues,
            barClass: "bg-slate-500",
          },
        ]}
      />

      <CombinedBreakdownChart
        title="Issue Status & User Roles"
        leftTitle="Issue Status"
        rightTitle="User Roles"
        leftItems={[
          {
            label: "Open",
            value: openIssues,
            barClass: "bg-sky-500",
          },
          {
            label: "In Progress",
            value: progressIssues,
            barClass: "bg-amber-500",
          },
          {
            label: "Closed",
            value: closedIssues,
            barClass: "bg-emerald-500",
          },
        ]}
        rightItems={[
          {
            label: "Admin",
            value: adminUsers,
            barClass: "bg-violet-500",
          },
          {
            label: "Project Manager",
            value: managerUsers,
            barClass: "bg-sky-500",
          },
          {
            label: "Employee",
            value: employeeUsers,
            barClass: "bg-emerald-500",
          },
          {
            label: "Client",
            value: clientUsers,
            barClass: "bg-amber-500",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SummaryPanel
          title="Project Types"
          icon={<FiFolder className="text-slate-400" />}
        >
          <div className="space-y-4">
            {projectTypeList.length > 0 ? (
              projectTypeList.map((item) => (
                <ProgressRow
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  total={totalProjects}
                  barClass="bg-indigo-500"
                />
              ))
            ) : (
              <p className="text-sm text-slate-500">No project data found.</p>
            )}
          </div>
        </SummaryPanel>

        <SummaryPanel
          title="Health Summary"
          icon={<FiTrendingUp className="text-slate-400" />}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Project Completion</p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {percent(completeProjects, totalProjects)}%
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Issue Resolution</p>
              <p className="mt-2 text-2xl font-bold text-sky-700">
                {percent(closedIssues, totalIssues)}%
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">High Priority Load</p>
              <p className="mt-2 text-2xl font-bold text-rose-700">
                {percent(highIssues, totalIssues)}%
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Active Users</p>
              <p className="mt-2 text-2xl font-bold text-violet-700">
                {percent(activeUsers, totalUsers)}%
              </p>
            </div>
          </div>
        </SummaryPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RecentList title="Recent Projects" items={recentProjects} type="project" />
        <RecentList title="Recent Issues" items={recentIssues} type="issue" />
      </div>
    </div>
  );
} 