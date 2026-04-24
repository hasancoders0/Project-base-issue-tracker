"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiCheckSquare,
  FiChevronDown,
  FiFlag,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import ConfirmModal from "@/components/common/ConfirmModal";

const boardCard =
  "rounded-[20px] border border-white/10 bg-white/[0.06] text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-md";

const selectStyle =
  "h-[56px] w-full appearance-none rounded-[14px] border border-white/10 bg-white px-4 pr-10 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20";

function roleBadgeClass(role) {
  if (role === "admin") return "bg-rose-400/15 text-rose-300";
  if (role === "project-manager") return "bg-violet-400/15 text-violet-300";
  if (role === "employee") return "bg-sky-400/15 text-sky-300";
  return "bg-white/10 text-white/60";
}

function prettyRole(role) {
  if (!role) return "User";
  if (role === "project-manager") return "Project Manager";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function SelectField({ label, icon, value, onChange, options = [] }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-white/55">
        {icon}
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={selectStyle}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-white text-slate-900"
            >
              {option.label}
            </option>
          ))}
        </select>

        <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
      </div>
    </div>
  );
}

function PremiumAssigneeSelect({ value, onChange, options = [] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    function handleOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const normalizedOptions = useMemo(() => {
    return [
      { value: "", label: "No assignee change", role: "", kind: "default" },
      { value: "__UNASSIGN__", label: "Unassign", role: "", kind: "danger" },
      ...options.map((item) => ({
        value: String(item.value || item._id),
        label: item.label || item.fullName || item.username || "Unknown",
        role: item.role || "",
        image: item.image || "",
        kind: "user",
      })),
    ];
  }, [options]);

  const selectedItem =
    normalizedOptions.find((item) => String(item.value) === String(value)) ||
    normalizedOptions[0];

  const filteredOptions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return normalizedOptions;

    return normalizedOptions.filter((item) => {
      const role = (item.role || "").toLowerCase();
      return item.label.toLowerCase().includes(keyword) || role.includes(keyword);
    });
  }, [normalizedOptions, search]);

  function handleSelect(nextValue) {
    onChange?.(nextValue);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={containerRef} className="relative min-w-0">
      <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-white/55">
        <FiUser />
        Bulk Assignee
      </label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-[56px] w-full items-center justify-between rounded-[14px] border border-white/10 bg-white px-4 text-left text-sm text-slate-900 outline-none transition hover:bg-white/90 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
      >
        <div className="min-w-0">
          <div className="truncate font-bold">{selectedItem.label}</div>

          {selectedItem.role ? (
            <div className="mt-0.5 text-xs text-slate-500">
              {prettyRole(selectedItem.role)}
            </div>
          ) : null}
        </div>

        <FiChevronDown
          className={`shrink-0 text-slate-500 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-[16px] border border-white/10 bg-slate-950 shadow-2xl">
          <div className="border-b border-white/10 p-3">
            <div className="flex items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.07] px-3 py-2">
              <FiSearch className="text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {filteredOptions.length === 0 ? (
              <div className="rounded-[14px] px-3 py-8 text-center text-sm text-white/40">
                No matching user found
              </div>
            ) : (
              filteredOptions.map((item) => {
                const isSelected = String(item.value) === String(value);

                return (
                  <button
                    key={`${item.kind}-${item.value || "empty"}`}
                    type="button"
                    onClick={() => handleSelect(item.value)}
                    className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left transition ${
                      isSelected ? "bg-violet-400/15" : "hover:bg-white/[0.07]"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {item.kind === "user" ? (
                        item.image ? (
                          <img
                            src={item.image}
                            alt={item.label}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/70">
                            {item.label.charAt(0).toUpperCase()}
                          </div>
                        )
                      ) : (
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${
                            item.kind === "danger"
                              ? "bg-rose-400/15 text-rose-300"
                              : "bg-white/10 text-white/55"
                          }`}
                        >
                          {item.kind === "danger" ? <FiX /> : <FiUsers />}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-white">
                          {item.label}
                        </div>

                        {item.role ? (
                          <div className="mt-1">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${roleBadgeClass(
                                item.role
                              )}`}
                            >
                              {prettyRole(item.role)}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {isSelected ? (
                      <div className="ml-3 flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-white">
                        <FiCheck size={14} />
                      </div>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TaskBulkActions({
  selectedTaskIds = [],
  selectedCount,
  bulkStatus = "",
  setBulkStatus,
  bulkPriority = "",
  setBulkPriority,
  bulkAssignee = "",
  setBulkAssignee,
  assigneeOptions = [],
  onApply,
  onDelete,
  onClear,
  onClearSelection,
  bulkUpdating = false,
  bulkDeleting = false,
  canDeleteTasks = false,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const count =
    Array.isArray(selectedTaskIds) && selectedTaskIds.length > 0
      ? selectedTaskIds.length
      : selectedCount || 0;

  if (!count) return null;

  function handleDeleteClick() {
    if (!canDeleteTasks) {
      toast.error("You do not have permission to delete tasks");
      return;
    }

    setConfirmOpen(true);
  }

  function handleApplyClick() {
    if (!bulkStatus && !bulkPriority && bulkAssignee === "") {
      toast.error("Select at least one bulk action");
      return;
    }

    onApply?.();
  }

  function handleClearClick() {
    if (typeof onClear === "function") {
      onClear();
      return;
    }

    onClearSelection?.();
  }

  return (
    <>
      <div className={`mb-4 overflow-visible ${boardCard} p-5`}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-violet-400/15 text-violet-300">
                <FiCheckSquare size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-base font-bold text-white">
                  {count} task{count > 1 ? "s" : ""} selected
                </p>
                <p className="mt-1 text-sm leading-6 text-white/50">
                  Update multiple tasks at once or remove selected tasks.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <button
                type="button"
                onClick={handleApplyClick}
                disabled={bulkUpdating}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiRefreshCw className={bulkUpdating ? "animate-spin" : ""} />
                {bulkUpdating ? "Applying..." : "Apply Changes"}
              </button>

              {canDeleteTasks && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={bulkDeleting}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-rose-400/15 px-4 text-sm font-bold text-rose-300 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiTrash2 />
                  {bulkDeleting ? "Deleting..." : "Delete Selected"}
                </button>
              )}

              <button
                type="button"
                onClick={handleClearClick}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-bold text-white/70 transition hover:bg-white/15"
              >
                <FiX />
                Clear
              </button>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-3">
            <SelectField
              label="Bulk Status"
              icon={<FiRefreshCw />}
              value={bulkStatus}
              onChange={setBulkStatus}
              options={[
                { value: "", label: "No status change" },
                { value: "todo", label: "To Do" },
                { value: "in-progress", label: "In Progress" },
                { value: "in-review", label: "In Review" },
                { value: "done", label: "Done" },
                { value: "blocked", label: "Blocked" },
              ]}
            />

            <SelectField
              label="Bulk Priority"
              icon={<FiFlag />}
              value={bulkPriority}
              onChange={setBulkPriority}
              options={[
                { value: "", label: "No priority change" },
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ]}
            />

            <PremiumAssigneeSelect
              value={bulkAssignee}
              onChange={setBulkAssignee}
              options={assigneeOptions}
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete selected tasks?"
        description={`You are about to delete ${count} selected task${
          count > 1 ? "s" : ""
        }. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete?.();
        }}
        onCancel={() => {
          if (!bulkDeleting) setConfirmOpen(false);
        }}
        loading={bulkDeleting}
      />
    </>
  );
}