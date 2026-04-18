"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFolder,
  FiGrid,
  FiHash,
  FiSearch,
  FiSliders,
  FiUser,
} from "react-icons/fi";
import IssueDetailsModal from "@/components/issues/IssueDetailsModal";
import DeleteIssueModal from "@/components/issues/DeleteIssueModal";

function getPriorityClass(priority) {
  if (priority === "High") return "bg-rose-100 text-rose-600";
  if (priority === "Medium") return "bg-amber-100 text-amber-700";
  if (priority === "Low") return "bg-slate-100 text-slate-600";
  return "bg-slate-100 text-slate-600";
}

function getStatusClass(status) {
  if (status === "Open") return "bg-blue-100 text-blue-600";
  if (status === "In Progress") return "bg-amber-100 text-amber-700";
  if (status === "Closed") return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-600";
}

function getBorderColor(status) {
  if (status === "Open") return "border-blue-500";
  if (status === "In Progress") return "border-amber-500";
  if (status === "Closed") return "border-emerald-500";
  return "border-slate-300";
}

function getTagClass(tag) {
  const name = tag.toLowerCase();

  if (name === "bug") return "bg-rose-100 text-rose-600";
  if (name === "enhancement") return "bg-emerald-100 text-emerald-700";
  if (name === "help wanted") return "bg-amber-100 text-amber-700";
  if (name === "good first issue") return "bg-lime-100 text-lime-700";
  if (name === "ui") return "bg-violet-100 text-violet-700";
  if (name === "design") return "bg-fuchsia-100 text-fuchsia-700";
  if (name === "auth") return "bg-sky-100 text-sky-700";
  if (name === "payment") return "bg-cyan-100 text-cyan-700";
  if (name === "feature") return "bg-indigo-100 text-indigo-700";

  return "bg-slate-100 text-slate-600";
}

function formatDate(value) {
  if (!value) return "Not closed";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-GB");
}

export default function IssuesList({ issues, hideProjectFilter = false }) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("All");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [projectFilter, setProjectFilter] = useState("All");

  const tabs = [
    {
      label: "All",
      value: "All",
      icon: <FiGrid className="text-[14px]" />,
    },
    {
      label: "Open",
      value: "Open",
      icon: <FiAlertCircle className="text-[14px]" />,
    },
    {
      label: "In Progress",
      value: "In Progress",
      icon: <FiClock className="text-[14px]" />,
    },
    {
      label: "Closed",
      value: "Closed",
      icon: <FiCheckCircle className="text-[14px]" />,
    },
  ];

  const projectOptions = [
    "All",
    ...new Set(issues.map((issue) => issue.projectId?.title).filter(Boolean)),
  ];

  const filteredIssues = useMemo(() => {
    let result = [...issues];

    if (activeTab !== "All") {
      result = result.filter((issue) => issue.status === activeTab);
    }

    if (projectFilter !== "All") {
      result = result.filter(
        (issue) => issue.projectId?.title === projectFilter
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();

      result = result.filter((issue) => {
        const title = issue.title?.toLowerCase() || "";
        const description = issue.description?.toLowerCase() || "";
        const assignee = issue.assignee?.toLowerCase() || "";
        const reporter = issue.reporter?.toLowerCase() || "";
        const projectName = issue.projectId?.title?.toLowerCase() || "";
        const tags = issue.tags?.join(" ").toLowerCase() || "";

        return (
          title.includes(term) ||
          description.includes(term) ||
          assignee.includes(term) ||
          reporter.includes(term) ||
          projectName.includes(term) ||
          tags.includes(term)
        );
      });
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    if (sortBy === "priority") {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      result.sort(
        (a, b) =>
          (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
      );
    }

    if (sortBy === "status") {
      const statusOrder = { Open: 1, "In Progress": 2, Closed: 3 };
      result.sort(
        (a, b) => (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
      );
    }

    if (sortBy === "assignee") {
      result.sort((a, b) => (a.assignee || "").localeCompare(b.assignee || ""));
    }

    return result;
  }, [issues, activeTab, projectFilter, searchTerm, sortBy]);

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      setStatusUpdating(true);

      const user = JSON.parse(localStorage.getItem("user") || "null");

      const res = await fetch(`/api/issues/${issueId}`, {
        cache: "no-store",
      });

      const oldIssue = await res.json();

      const updateRes = await fetch(`/api/issues/${issueId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?._id || "",
          "x-user-email": user?.email || "",
          "x-user-username": user?.username || "",
          "x-user-role": user?.role || "",
        },
        body: JSON.stringify({
          ...oldIssue,
          status: newStatus,
        }),
      });

      const updatedIssue = await updateRes.json();

      if (!updateRes.ok) {
        alert(updatedIssue.message || "Failed to update status");
        return;
      }

      setSelectedIssue(updatedIssue);
      router.refresh();
    } catch (error) {
      alert("Something went wrong while updating status");
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-violet-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div
            className={`grid gap-4 ${
              hideProjectFilter
                ? "xl:grid-cols-[minmax(0,1fr)_220px]"
                : "xl:grid-cols-[minmax(0,1fr)_220px_180px]"
            }`}
          >
            <div className="flex items-center rounded-2xl border border-slate-300 bg-white px-3 shadow-sm focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100">
              <FiSearch className="text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, tag, assignee, reporter, project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            {!hideProjectFilter && (
              <div className="flex items-center rounded-2xl border border-slate-300 bg-white px-3 shadow-sm focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100">
                <FiFolder className="text-slate-400" />
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
                >
                  {projectOptions.map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center rounded-2xl border border-slate-300 bg-white px-3 shadow-sm focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100">
              <FiSliders className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
              >
                <option value="newest">Newest</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="assignee">Assignee</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <FiHash className="text-2xl" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                {filteredIssues.length}{" "}
                {activeTab === "All" ? "Issues" : `${activeTab} Issues`}
              </h1>
              <p className="mt-1 text-slate-500">
                Track and manage your project issues
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500"></span>
              <span>Open</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500"></span>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
              <span>Closed</span>
            </div>
          </div>
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="text-slate-500">No issues found.</p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {filteredIssues.map((issue) => (
            <button
              key={issue._id}
              type="button"
              onClick={() => setSelectedIssue(issue)}
              className={`group rounded-3xl border-2 border-t-4 bg-white p-6 text-left text-slate-800 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${getBorderColor(
                issue.status
              )}`}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase ${getStatusClass(
                      issue.status
                    )}`}
                  >
                    {issue.status}
                  </span>

                  <span
                    className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase ${getPriorityClass(
                      issue.priority
                    )}`}
                  >
                    {issue.priority}
                  </span>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  #{issue.issueNumber || "N/A"}
                </span>
              </div>

              <h2 className="text-2xl font-bold transition group-hover:text-violet-700">
                {issue.title}
              </h2>

              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                {issue.description || "No description"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {issue.tags?.length > 0 ? (
                  issue.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getTagClass(
                        tag
                      )}`}
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                    no tag
                  </span>
                )}
              </div>

              <div className="mt-5 grid gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <FiUser className="text-slate-400" />
                  <span>Assignee: {issue.assignee || "Unassigned"}</span>
                </p>

                <p className="flex items-center gap-2">
                  <FiFolder className="text-slate-400" />
                  <span>{issue.projectId?.title || "No Project"}</span>
                </p>

                <p>Created: {formatDate(issue.createdAt)}</p>
                <p>Updated: {formatDate(issue.updatedAt)}</p>
                <p>Closed: {formatDate(issue.closedAt)}</p>
                <p>By: {issue.createdBy || "admin"}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <IssueDetailsModal
        selectedIssue={selectedIssue}
        setSelectedIssue={setSelectedIssue}
        setDeleteTarget={setDeleteTarget}
        handleStatusChange={handleStatusChange}
        statusUpdating={statusUpdating}
        router={router}
      />

      <DeleteIssueModal
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        setSelectedIssue={setSelectedIssue}
        router={router}
      />
    </div>
  );
}