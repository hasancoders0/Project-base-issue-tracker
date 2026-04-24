"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiRefreshCw,
  FiSearch,
  FiFolder,
  FiAlertCircle,
  FiCheckSquare,
  FiUser,
  FiPlusCircle,
  FiTrash2,
  FiUserPlus,
  FiClock,
  FiCheckCircle,
  FiFlag,
  FiLayers,
} from "react-icons/fi";

const boardCard =
  "rounded-[20px] border border-white/10 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm";

const innerCard =
  "rounded-[16px] border border-white/10 bg-white/[0.07] backdrop-blur-md";

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
          .replace(/\b\w/g, (c) => c.toUpperCase());
      })
      .join(", ");
  }

  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "None";

  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

function getEntityIcon(entityType, action, field) {
  if (entityType === "project") return <FiFolder className="text-base" />;
  if (entityType === "issue") return <FiAlertCircle className="text-base" />;
  if (entityType === "task") return <FiCheckSquare className="text-base" />;
  if (entityType === "user") return <FiUser className="text-base" />;

  if (action === "created") return <FiPlusCircle className="text-base" />;
  if (action === "deleted") return <FiTrash2 className="text-base" />;
  if (action === "assigned" || action === "assignee_changed") {
    return <FiUserPlus className="text-base" />;
  }

  if (field === "status") return <FiCheckCircle className="text-base" />;
  if (field === "priority") return <FiFlag className="text-base" />;
  if (field === "projectPhase") return <FiLayers className="text-base" />;

  return <FiActivity className="text-base" />;
}

function getEntityIconClass(entityType, action, field) {
  if (entityType === "project") return "bg-violet-400/15 text-violet-300";
  if (entityType === "issue") return "bg-amber-400/15 text-amber-300";
  if (entityType === "task") return "bg-emerald-400/15 text-emerald-300";
  if (entityType === "user") return "bg-sky-400/15 text-sky-300";

  if (action === "deleted") return "bg-rose-400/15 text-rose-300";
  if (action === "assigned" || action === "assignee_changed") {
    return "bg-fuchsia-400/15 text-fuchsia-300";
  }

  if (field === "status") return "bg-amber-400/15 text-amber-300";
  if (field === "priority") return "bg-rose-400/15 text-rose-300";

  return "bg-white/10 text-white/70";
}

function getActivityTitle(item) {
  const entityType = item.entityType || "item";
  const action = item.action || "updated";

  if (action === "created") return `You created ${entityType}`;
  if (action === "deleted") return `You deleted ${entityType}`;
  if (action === "status_changed") return `You changed ${entityType} status`;
  if (action === "phase_changed") return `You changed ${entityType} phase`;
  if (action === "priority_changed") return `You changed ${entityType} priority`;
  if (action === "review_changed") return `You updated ${entityType} review`;
  if (action === "assigned") return `You updated ${entityType} assignment`;
  if (action === "assignee_changed") return `You changed ${entityType} assignee`;

  if (item.field) return `You updated ${entityType} ${formatValue(item.field)}`;

  return `You updated ${entityType}`;
}

function getActivityDescription(item) {
  const action = item.action || "updated";
  const fromValue = formatValue(item.from);
  const toValue = formatValue(item.to);
  const projectTitle = item.projectTitle || "";

  let text = "";

  if (action === "created") {
    text = `Created: ${toValue}`;
  } else if (action === "deleted") {
    text = `Deleted: ${fromValue}`;
  } else if (
    action === "status_changed" ||
    action === "phase_changed" ||
    action === "priority_changed" ||
    action === "review_changed" ||
    action === "assignee_changed"
  ) {
    text = `${fromValue} → ${toValue}`;
  } else if (action === "assigned") {
    text = `Assigned to ${toValue}`;
  } else if (item.field) {
    text = `${formatValue(item.field)}: ${fromValue} → ${toValue}`;
  } else {
    text = `${fromValue} → ${toValue}`;
  }

  if (projectTitle) return `${text} • ${projectTitle}`;
  return text;
}

function groupActivities(activities) {
  const today = [];
  const yesterday = [];
  const older = [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);

  activities.forEach((a) => {
    const d = new Date(a.createdAt);

    if (Number.isNaN(d.getTime())) {
      older.push(a);
      return;
    }

    if (d >= todayStart) {
      today.push(a);
      return;
    }

    if (d >= yesterdayStart && d < todayStart) {
      yesterday.push(a);
      return;
    }

    older.push(a);
  });

  return { today, yesterday, older };
}

function ActivityCard({ item }) {
  return (
    <div className={`${innerCard} p-4 transition hover:bg-white/10`}>
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${getEntityIconClass(
            item.entityType,
            item.action,
            item.field
          )}`}
        >
          {getEntityIcon(item.entityType, item.action, item.field)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-sm font-bold text-white">
              {getActivityTitle(item)}
            </p>

            <p className="shrink-0 text-xs text-white/40">
              {formatTime(item.createdAt)}
            </p>
          </div>

          <p className="mt-2 text-sm text-white/65">
            {getActivityDescription(item)}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {item.entityType && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold capitalize text-white/65">
                {item.entityType}
              </span>
            )}

            {item.action && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/65">
                {formatValue(item.action)}
              </span>
            )}

            {item.field && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/65">
                {formatValue(item.field)}
              </span>
            )}

            {item.projectTitle && (
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                {item.projectTitle}
              </span>
            )}
          </div>

          {(item.from !== null && item.from !== undefined) ||
          (item.to !== null && item.to !== undefined) ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.from !== null && item.from !== undefined && (
                <span className="rounded-full bg-rose-400/15 px-3 py-1 text-xs font-bold text-rose-300">
                  From: {formatValue(item.from)}
                </span>
              )}

              {item.to !== null && item.to !== undefined && (
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                  To: {formatValue(item.to)}
                </span>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function MyActivitiesTab({ user }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const limit = 20;

  useEffect(() => {
    if (!user?._id) return;
    setPage(1);
    fetchActivities({ nextPage: 1, append: false });
  }, [user?._id]);

  async function fetchActivities({ nextPage = 1, append = false } = {}) {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const params = new URLSearchParams({
        userId: user._id,
        limit: String(limit),
        page: String(nextPage),
      });

      const res = await fetch(`/api/activities?${params.toString()}`, {
        cache: "no-store",
        headers: {
          "x-user-id": user._id || "",
          "x-user-role": user.role || "",
        },
      });

      const data = await res.json();
      const next = Array.isArray(data.activities) ? data.activities : [];

      setActivities((prev) => (append ? [...prev, ...next] : next));
      setHasMore(Boolean(data?.pagination?.hasMore));
      setPage(nextPage);
    } catch (e) {
      console.log("MY ACTIVITY ERROR:", e);
      if (!append) setActivities([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const filteredActivities = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return activities;

    return activities.filter((item) => {
      const haystack = [
        item.entityType,
        item.action,
        item.field,
        item.projectTitle,
        formatValue(item.from),
        formatValue(item.to),
        getActivityTitle(item),
        getActivityDescription(item),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [activities, searchTerm]);

  const grouped = useMemo(() => {
    return groupActivities(filteredActivities);
  }, [filteredActivities]);

  const groups = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "older", label: "Older" },
  ];

  return (
    <div className={`${boardCard} p-5`}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-emerald-400/15 text-emerald-300">
            <FiActivity className="text-xl" />
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">
              Personal Activity
            </p>

            <h2 className="mt-1 text-2xl font-bold text-white">
              My Activities
            </h2>

            <p className="mt-1 text-sm text-white/55">
              Your personal activity history.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setPage(1);
            fetchActivities({ nextPage: 1, append: false });
          }}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-white/90"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      <div className="mt-5 flex items-center rounded-[14px] border border-white/10 bg-white/[0.07] px-4">
        <FiSearch className="text-white/40" />

        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search activities..."
          className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/35"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
          Showing: {filteredActivities.length}
        </span>

        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/60">
          Page: {page}
        </span>

        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/60">
          Per Page: {limit}
        </span>
      </div>

      <div className="mt-6 space-y-6">
        {loading ? (
          <div className="rounded-[16px] border border-dashed border-white/15 bg-white/[0.04] px-4 py-8 text-center text-sm text-white/55">
            Loading activities...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-white/15 bg-white/[0.04] px-4 py-8 text-center text-sm text-white/55">
            No activities found.
          </div>
        ) : (
          <>
            {groups.map((g) => {
              const items = grouped[g.key];
              if (!items.length) return null;

              return (
                <div key={g.key}>
                  <div className="mb-3 flex items-center gap-2">
                    <FiClock className="text-white/40" />

                    <h3 className="text-sm font-bold uppercase tracking-wide text-white/50">
                      {g.label}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <ActivityCard key={item._id} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() =>
                    fetchActivities({ nextPage: page + 1, append: true })
                  }
                  disabled={loadingMore}
                  className="rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingMore ? "Loading..." : "View More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}