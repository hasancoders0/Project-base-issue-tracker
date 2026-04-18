"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEdit3,
  FiFileText,
  FiImage,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";

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

function isImageFile(file) {
  if (!file) return false;

  const type = file.type || "";
  const url = file.url || "";

  return (
    type.startsWith("image/") ||
    url.endsWith(".jpg") ||
    url.endsWith(".jpeg") ||
    url.endsWith(".png") ||
    url.endsWith(".webp")
  );
}

function isPdfFile(file) {
  if (!file) return false;

  const type = file.type || "";
  const url = file.url || "";

  return type === "application/pdf" || url.endsWith(".pdf");
}

export default function IssueDetailsModal({
  selectedIssue,
  setSelectedIssue,
  setDeleteTarget,
  handleStatusChange,
  statusUpdating,
  router,
}) {
  const [storedUser, setStoredUser] = useState(null);

  useEffect(() => {
    const user =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null;

    setStoredUser(user);
  }, []);

  const assignedMemberIds = useMemo(() => {
    const members = selectedIssue?.projectId?.assignedTeamMembers;

    if (!Array.isArray(members)) return [];

    return members.map((member) =>
      typeof member === "string" ? member : String(member._id)
    );
  }, [selectedIssue]);

  const canEditOrChangeStatus = useMemo(() => {
    if (!storedUser || !selectedIssue) return false;

    if (storedUser.role === "admin" || storedUser.role === "project-manager") {
      return true;
    }

    return (
      (storedUser.role === "employee" || storedUser.role === "client") &&
      assignedMemberIds.includes(String(storedUser._id))
    );
  }, [storedUser, selectedIssue, assignedMemberIds]);

  const canDelete = useMemo(() => {
    if (!storedUser || !selectedIssue) return false;

    if (storedUser.role === "admin" || storedUser.role === "project-manager") {
      return true;
    }

    return (
      storedUser.role === "client" &&
      assignedMemberIds.includes(String(storedUser._id))
    );
  }, [storedUser, selectedIssue, assignedMemberIds]);

  if (!selectedIssue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 text-slate-800 shadow-2xl md:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                  selectedIssue.status
                )}`}
              >
                {selectedIssue.status}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${getPriorityClass(
                  selectedIssue.priority
                )}`}
              >
                {selectedIssue.priority}
              </span>
            </div>

            <h2 className="text-3xl font-bold">{selectedIssue.title}</h2>

            <p className="mt-2 text-sm text-slate-500">
              Project:{" "}
              {selectedIssue.projectId?.slug ? (
                <Link
                  href={`/projects/${selectedIssue.projectId.slug}`}
                  className="font-medium text-violet-600 hover:underline"
                >
                  {selectedIssue.projectId?.title}
                </Link>
              ) : (
                "N/A"
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedIssue(null)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="grid gap-4 rounded-3xl bg-slate-50 p-5 text-sm sm:grid-cols-2">
          <p>
            <span className="font-semibold">Issue Number:</span> #
            {selectedIssue.issueNumber}
          </p>
          <p>
            <span className="font-semibold">Project Code:</span>{" "}
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              #P-{selectedIssue.projectId?.projectNumber || "N/A"}
            </span>
          </p>
          <p>
            <span className="font-semibold">Assignee:</span>{" "}
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
              <FiUser className="text-slate-400" />
              {selectedIssue.assignee || "Unassigned"}
            </span>
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
            {formatDate(selectedIssue.createdAt)}
          </p>
          <p>
            <span className="font-semibold">Updated:</span>{" "}
            {formatDate(selectedIssue.updatedAt)}
          </p>
          <p>
            <span className="font-semibold">Closed:</span>{" "}
            {formatDate(selectedIssue.closedAt)}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="mb-2 text-lg font-semibold">Description</h3>
          <p className="text-sm leading-7 text-slate-600">
            {selectedIssue.description || "No description"}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-lg font-semibold">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {selectedIssue.tags?.length > 0 ? (
              selectedIssue.tags.map((tag, index) => (
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
        </div>

        {selectedIssue.note && (
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-semibold">Note</h3>
            <p className="text-sm leading-7 text-slate-600">
              {selectedIssue.note}
            </p>
          </div>
        )}

        <div className="mt-6">
          <h3 className="mb-3 text-lg font-semibold">Attachments</h3>

          {selectedIssue.attachments?.length > 0 ? (
            <div className="space-y-4">
              {selectedIssue.attachments.map((file, index) => (
                <div
                  key={`${file.url}-${index}`}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >
                  {isImageFile(file) ? (
                    <div className="relative h-52 w-full bg-white">
                      <Image
                        src={file.url}
                        alt={file.name || "Attachment"}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-4">
                      {isPdfFile(file) ? (
                        <FiFileText className="text-lg text-rose-500" />
                      ) : (
                        <FiImage className="text-lg text-slate-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {file.name || "Attachment"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {file.type || "File"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700">
                        {file.name || "Attachment"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {file.size ? `${Math.round(file.size / 1024)} KB` : file.type || "File"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-100 px-4 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-200"
                      >
                        <FiCheckCircle />
                        Open
                      </a>

                      <a
                        href={file.url}
                        download
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        <FiDownload />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
              No attachments
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {canEditOrChangeStatus && (
            <button
              type="button"
              onClick={() => router.push(`/issues/${selectedIssue._id}/edit`)}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <FiEdit3 />
              Edit
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => setDeleteTarget(selectedIssue)}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              <FiTrash2 />
              Delete
            </button>
          )}

          {canEditOrChangeStatus && (
            <div className="flex items-center gap-3">
              <select
                value={selectedIssue.status}
                onChange={(e) =>
                  handleStatusChange(selectedIssue._id, e.target.value)
                }
                disabled={statusUpdating}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none hover:border-violet-400"
              >
                <option value="Open">🟦 Open</option>
                <option value="In Progress">🟨 In Progress</option>
                <option value="Closed">🟩 Closed</option>
              </select>

              {statusUpdating && (
                <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <FiClock />
                  Updating...
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}