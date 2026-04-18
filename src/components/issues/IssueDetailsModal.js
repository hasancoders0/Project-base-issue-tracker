"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiCircle,
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

function getStatusIcon(status) {
  if (status === "Open") return <FiCircle className="text-blue-500" />;
  if (status === "In Progress") return <FiClock className="text-amber-500" />;
  if (status === "Closed")
    return <FiCheckCircle className="text-emerald-500" />;
  return <FiCircle className="text-slate-400" />;
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

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 py-3 last:border-b-0">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

export default function IssueDetailsModal({
  selectedIssue,
  setSelectedIssue,
  setDeleteTarget,
  handleStatusChange,
  statusUpdating,
  router,
  useGlobalIssueNumber = true,
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
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 text-slate-800 shadow-2xl md:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                  selectedIssue.status
                )}`}
              >
                {getStatusIcon(selectedIssue.status)}
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

            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-900">
                {selectedIssue.title}
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                #
                {useGlobalIssueNumber
                  ? selectedIssue.globalIssueNumber ||
                    selectedIssue.issueNumber ||
                    "N/A"
                  : selectedIssue.issueNumber || "N/A"}
              </span>
            </div>

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
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <InfoRow
                label="Issue Number"
                value={`#${
                  useGlobalIssueNumber
                    ? selectedIssue.globalIssueNumber ||
                      selectedIssue.issueNumber ||
                      "N/A"
                    : selectedIssue.issueNumber || "N/A"
                }`}
              />
              <InfoRow
                label="Project Code"
                value={`#P-${selectedIssue.projectId?.projectNumber || "N/A"}`}
              />
              <InfoRow
                label="Assignee"
                value={selectedIssue.assignee || "Unassigned"}
              />
              <InfoRow
                label="Reporter"
                value={selectedIssue.reporter || "N/A"}
              />
            </div>

            <div>
              <InfoRow
                label="Created By"
                value={selectedIssue.createdBy || "admin"}
              />
              <InfoRow
                label="Created"
                value={formatDate(selectedIssue.createdAt)}
              />
              <InfoRow
                label="Updated"
                value={formatDate(selectedIssue.updatedAt)}
              />
              <InfoRow
                label="Closed"
                value={formatDate(selectedIssue.closedAt)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-slate-900">
                Description
              </h3>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm leading-7 text-slate-700">
                  {selectedIssue.description || "No description"}
                </p>
              </div>
            </div>

            {selectedIssue.note && (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-slate-900">
                  Note
                </h3>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm leading-7 text-slate-700">
                    {selectedIssue.note}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-slate-900">
                Tags
              </h3>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
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
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">
                      no tag
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-slate-900">
                Attachments
              </h3>

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
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-700">
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
                            {file.size
                              ? `${Math.round(file.size / 1024)} KB`
                              : file.type || "File"}
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
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                  No attachments
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="flex flex-wrap items-center gap-3">
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
          </div>

          {canEditOrChangeStatus && (
            <div className="flex items-center gap-3">
              {statusUpdating && (
                <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <FiClock />
                  Updating...
                </span>
              )}
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  {getStatusIcon(selectedIssue.status)}
                </span>

                <select
                  value={selectedIssue.status}
                  onChange={(e) =>
                    handleStatusChange(selectedIssue._id, e.target.value)
                  }
                  disabled={statusUpdating}
                  className="rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition hover:border-violet-400"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}