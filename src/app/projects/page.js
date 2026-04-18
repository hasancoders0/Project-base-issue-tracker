"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiSearch,
  FiTag,
  FiHash,
  FiLayers,
  FiGrid,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";

function getStatusClass(status) {
  if (status === "In Progress") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "Complete") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Cancel") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}

function getTypeClass(type) {
  if (type === "Shopify") {
    return "bg-violet-100 text-violet-700";
  }

  if (type === "WordPress") {
    return "bg-blue-100 text-blue-700";
  }

  if (type === "Laravel") {
    return "bg-red-100 text-red-700";
  }

  if (type === "Node.js") {
    return "bg-green-100 text-green-700";
  }

  return "bg-slate-100 text-slate-700";
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch projects");
        }

        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log("PROJECT FETCH ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let filtered = [...projects];

    if (keyword) {
      filtered = filtered.filter((project) => {
        return (
          project.title?.toLowerCase().includes(keyword) ||
          project.details?.toLowerCase().includes(keyword) ||
          project.type?.toLowerCase().includes(keyword) ||
          project.status?.toLowerCase().includes(keyword)
        );
      });
    }

    if (activeTab !== "all") {
      filtered = filtered.filter((project) => project.status === activeTab);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((project) => {
        const projectType = project.type || "Other";
        return projectType === typeFilter;
      });
    }

    if (sortBy === "newest") {
      filtered.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    }

    if (sortBy === "oldest") {
      filtered.sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
      );
    }

    if (sortBy === "title-asc") {
      filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    if (sortBy === "title-desc") {
      filtered.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    }

    return filtered;
  }, [projects, search, sortBy, typeFilter, activeTab]);

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <div className="mb-8 rounded-3xl bg-white p-6 text-slate-800 shadow-sm">
        <h1 className="text-3xl font-bold">All Projects</h1>
        <p className="mt-1 text-slate-500">Manage and track all projects</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {[
            {
              label: "All",
              value: "all",
              icon: <FiGrid className="text-[14px]" />,
            },
            {
              label: "In Progress",
              value: "In Progress",
              icon: <FiClock className="text-[14px]" />,
            },
            {
              label: "Complete",
              value: "Complete",
              icon: <FiCheckCircle className="text-[14px]" />,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_220px_180px]">
          <div className="flex items-center rounded-2xl border border-slate-300 bg-white px-3 shadow-sm focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100">
            <FiSearch className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, details, type, or status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center rounded-2xl border border-slate-300 bg-white px-3 shadow-sm focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100">
            <FiTag className="text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
            >
              <option value="all">All Type</option>
              <option value="Shopify">Shopify</option>
              <option value="WordPress">WordPress</option>
              <option value="Laravel">Laravel</option>
              <option value="Node.js">Node.js</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-center rounded-2xl border border-slate-300 bg-white px-3 shadow-sm focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100">
            <FiLayers className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSortBy("newest");
              setTypeFilter("all");
              setActiveTab("all");
            }}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700"
          >
            Clear Filters
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Showing {filteredProjects.length} project
          {filteredProjects.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="text-slate-500">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="text-slate-500">No projects found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredProjects.map((project) => {
            const imageUrl =
              project.image?.trim() ||
              "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80";

            return (
              <Link
                key={project._id}
                href={`/projects/${project.slug}`}
                className="group flex overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        <FiHash className="text-[12px]" />
                        {project.projectNumber ?? "N/A"}
                      </span>

                      <span
                        className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          project.status,
                        )}`}
                      >
                        <FiLayers className="text-[12px]" />
                        {project.status}
                      </span>

                      <span
                        className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getTypeClass(
                          project.type || "Other",
                        )}`}
                      >
                        <FiTag className="text-[12px]" />
                        {project.type || "Other"}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 transition group-hover:text-violet-700">
                      {project.title}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {project.details || "No description"}
                    </p>
                  </div>
                </div>

                <div className="relative w-40 shrink-0 overflow-hidden md:w-48">
                  <img
                    src={imageUrl}
                    alt={project.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
