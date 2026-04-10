"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function getPriorityClass(priority) {
  if (priority === "High") return "bg-red-100 text-red-500";
  if (priority === "Medium") return "bg-yellow-100 text-yellow-600";
  if (priority === "Low") return "bg-gray-100 text-gray-500";
  return "bg-gray-100 text-gray-500";
}

function getStatusClass(status) {
  if (status === "Open") return "bg-blue-100 text-blue-600";
  if (status === "In Progress") return "bg-yellow-100 text-yellow-600";
  if (status === "Closed") return "bg-green-100 text-green-600";
  return "bg-gray-100 text-gray-600";
}
function getBorderColor(status) {
  if (status === "Open") return "border-blue-500";
  if (status === "In Progress") return "border-yellow-500";
  if (status === "Closed") return "border-green-500";
  return "border-slate-300";
}

function getTagClass(tag) {
  const name = tag.toLowerCase();

  if (name === "bug") return "bg-red-100 text-red-500";
  if (name === "enhancement") return "bg-green-100 text-green-600";
  if (name === "help wanted") return "bg-yellow-100 text-yellow-600";
  if (name === "good first issue") return "bg-lime-100 text-lime-600";

  return "bg-gray-100 text-gray-600";
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

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      setStatusUpdating(true);

      const res = await fetch(`/api/issues/${issueId}`);
      const oldIssue = await res.json();

      const updateRes = await fetch(`/api/issues/${issueId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...oldIssue,
          status: newStatus,
        }),
      });

      if (updateRes.ok) {
        const updatedIssue = await updateRes.json();
        setSelectedIssue(updatedIssue);
        router.refresh();
      }
    } finally {
      setStatusUpdating(false);
    }
  };

  const filteredIssues = useMemo(() => {
    let result = [...issues];

    if (activeTab !== "All") {
      result = result.filter((issue) => issue.status === activeTab);
    }
    if (projectFilter !== "All") {
      result = result.filter(
        (issue) => issue.projectId?.title === projectFilter,
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
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (sortBy === "priority") {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      result.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
      );
    }

    if (sortBy === "status") {
      const statusOrder = { Open: 1, "In Progress": 2, Closed: 3 };
      result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }

    if (sortBy === "assignee") {
      result.sort((a, b) => (a.assignee || "").localeCompare(b.assignee || ""));
    }

    return result;
  }, [issues, activeTab, searchTerm, sortBy, projectFilter]);

  const tabs = ["All", "Open", "In Progress", "Closed"];

  const projectOptions = [
    "All",
    ...new Set(issues.map((issue) => issue.projectId?.title).filter(Boolean)),
  ];

  return (
    <div>
      <div className="mb-6 rounded-2xl bg-white p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl border px-6 py-3 text-sm font-medium transition ${
                  activeTab === tab
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <input
              type="text"
              placeholder="Search by title, tag, project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none md:w-72"
            />

            {!hideProjectFilter && (
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none"
              >
                {projectOptions.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none"
            >
              <option value="newest">Newest</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="assignee">Assignee</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl bg-white p-6 text-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-2xl text-violet-600">
              ⊛
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                {filteredIssues.length}{" "}
                {activeTab === "All" ? "Issues" : activeTab + " Issues"}
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
              <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500"></span>
              <span>Closed</span>
            </div>
          </div>
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <p className="text-white">No issues found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredIssues.map((issue) => (
            <button
              key={issue._id}
              type="button"
              onClick={() => setSelectedIssue(issue)}
              className={`rounded-2xl border-2 border-t-4 bg-white p-5 text-left text-slate-800 shadow-sm transition hover:-translate-y-1 ${getBorderColor(issue.status)}`}
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-4 py-1 text-xs font-bold uppercase ${getStatusClass(issue.status)}`}
                >
                  {issue.status}
                </span>

                <span
                  className={`rounded-full px-4 py-1 text-xs font-bold uppercase ${getPriorityClass(issue.priority)}`}
                >
                  {issue.priority}
                </span>
              </div>

              <h2 className="mb-2 text-xl font-bold">{issue.title}</h2>

              <p className="mb-4 line-clamp-2 text-sm text-slate-500">
                {issue.description || "No description"}
              </p>

              <div className="mb-5 flex flex-wrap gap-2">
                {issue.tags?.length > 0 ? (
                  issue.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getTagClass(tag)}`}
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                    no tag
                  </span>
                )}
              </div>

              <div className="space-y-1 border-t border-slate-200 pt-4 text-xs text-slate-500">
                <p>
                  #{issue.issueNumber} by {issue.createdBy || "admin"}
                </p>
                <p>Assignee: {issue.assignee || "Unassigned"}</p>
                <p>
                  Created:{" "}
                  {new Date(issue.createdAt).toLocaleDateString("en-GB")}
                </p>
                <p>
                  Updated:{" "}
                  {new Date(issue.updatedAt).toLocaleDateString("en-GB")}
                </p>
                <p>
                  Closed:{" "}
                  {issue.closedAt
                    ? new Date(issue.closedAt).toLocaleDateString("en-GB")
                    : "Not closed"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 text-slate-800 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedIssue.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Project:{" "}
                  {selectedIssue.projectId?.slug ? (
                    <a
                      href={`/projects/${selectedIssue.projectId.slug}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {selectedIssue.projectId?.title}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>

              <button
                onClick={() => setSelectedIssue(null)}
                className="rounded-lg bg-slate-100 px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(selectedIssue.status)}`}
              >
                {selectedIssue.status}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${getPriorityClass(selectedIssue.priority)}`}
              >
                {selectedIssue.priority}
              </span>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <p>
                <span className="font-semibold">Issue Number:</span> #
                {selectedIssue.issueNumber}
              </p>
              <p>
                <span className="font-semibold">Project ID:</span>{" "}
                {selectedIssue.projectId?._id || selectedIssue.projectId}
              </p>
              <p>
                <span className="font-semibold">Assignee:</span>{" "}
                {selectedIssue.assignee || "Unassigned"}
              </p>
              <p>
                <span className="font-semibold">Reporter:</span>{" "}
                {selectedIssue.reporter || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Created By:</span>{" "}
                {selectedIssue.createdBy || "admin"}
              </p>
              <p>
                <span className="font-semibold">Created:</span>{" "}
                {new Date(selectedIssue.createdAt).toLocaleDateString("en-GB")}
              </p>
              <p>
                <span className="font-semibold">Updated:</span>{" "}
                {new Date(selectedIssue.updatedAt).toLocaleDateString("en-GB")}
              </p>
              <p>
                <span className="font-semibold">Closed:</span>{" "}
                {selectedIssue.closedAt
                  ? new Date(selectedIssue.closedAt).toLocaleDateString("en-GB")
                  : "Not closed"}
              </p>
            </div>

            <div className="mt-5">
              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="text-sm text-slate-600">
                {selectedIssue.description || "No description"}
              </p>
            </div>

            <div className="mt-5">
              <h3 className="mb-2 font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {selectedIssue.tags?.length > 0 ? (
                  selectedIssue.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getTagClass(tag)}`}
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                    no tag
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => router.push(`/issues/${selectedIssue._id}/edit`)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteTarget(selectedIssue)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                Delete
              </button>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <select
                  value={selectedIssue.status}
                  onChange={(e) =>
                    handleStatusChange(selectedIssue._id, e.target.value)
                  }
                  disabled={statusUpdating}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>

                {statusUpdating && (
                  <span className="text-sm text-slate-500">Updating...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-800 shadow-xl">
            <h3 className="text-xl font-bold">Delete Issue</h3>
            <p className="mt-3 text-sm text-slate-600">
              Are you sure you want to delete this issue?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const res = await fetch(`/api/issues/${deleteTarget._id}`, {
                    method: "DELETE",
                  });

                  if (res.ok) {
                    setDeleteTarget(null);
                    setSelectedIssue(null);
                    router.refresh();
                  }
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
