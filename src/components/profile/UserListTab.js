"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FiUsers,
  FiMail,
  FiShield,
  FiUserCheck,
  FiBriefcase,
  FiUser,
  FiEye,
  FiEdit3,
  FiFolder,
  FiCheckSquare,
  FiCalendar,
  FiCheckCircle,
  FiSearch,
  FiFilter,
  FiGlobe,
  FiMessageCircle,
  FiClock,
} from "react-icons/fi";
import UserActivityModal from "./UserActivityModal";

const boardCard =
  "rounded-[20px] border border-white/10 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm";

const innerCard =
  "rounded-[16px] border border-white/10 bg-white/[0.06] backdrop-blur-md";

const smallCard =
  "rounded-[16px] border border-white/10 bg-white/[0.07] p-4";

export default function UserListTab({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [activityModalUser, setActivityModalUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);

      const res = await fetch("/api/users", { cache: "no-store" });
      const data = res.ok ? await res.json() : [];

      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("USER LIST ERROR:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = currentUser?.role === "admin";

  const getRoleBadgeClass = (role) => {
    if (role === "admin") {
      return "border-violet-400/20 bg-violet-400/15 text-violet-300";
    }

    if (role === "project-manager") {
      return "border-blue-400/20 bg-blue-400/15 text-blue-300";
    }

    if (role === "employee") {
      return "border-emerald-400/20 bg-emerald-400/15 text-emerald-300";
    }

    return "border-amber-400/20 bg-amber-400/15 text-amber-300";
  };

  const getRoleLabel = (role) => {
    if (role === "project-manager") return "Project Manager";
    if (role === "employee") return "Employee";
    if (role === "client") return "Client";
    return "Admin";
  };

  const getRoleIcon = (role) => {
    if (role === "admin") return <FiShield className="text-sm" />;
    if (role === "project-manager") return <FiBriefcase className="text-sm" />;
    if (role === "employee") return <FiUserCheck className="text-sm" />;
    return <FiUser className="text-sm" />;
  };

  const getDesignationPreview = (user) => {
    if (!Array.isArray(user.designations) || user.designations.length === 0) {
      return [];
    }

    return user.designations.slice(0, 3);
  };

  const getPrimaryRoleText = (user) => {
    if (user.jobTitle?.trim()) return user.jobTitle.trim();

    if (Array.isArray(user.designations) && user.designations.length > 0) {
      return user.designations[0];
    }

    return getRoleLabel(user.role);
  };

  const isClientUser = (user) => user.role === "client";

  const hasClientMeta = (user) => {
    return Boolean(
      user.companyName?.trim() ||
        user.website?.trim() ||
        user.preferredCommunication?.trim()
    );
  };

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole =
        roleFilter === "all" ? true : user.role === roleFilter;

      if (!matchesRole) return false;

      if (!normalizedSearch) return true;

      const searchableText = [
        user.fullName,
        user.name,
        user.username,
        user.email,
        user.jobTitle,
        user.companyName,
        user.website,
        user.preferredCommunication,
        ...(Array.isArray(user.designations) ? user.designations : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [users, searchTerm, roleFilter]);

  return (
    <>
      <div className="space-y-4">
        <div className={`${boardCard} p-5 lg:p-6`}>
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-violet-400/15 text-violet-300">
                <FiUsers className="text-xl" />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">
                  Team Directory
                </p>
                <h2 className="mt-1 text-3xl font-bold text-white">
                  User List
                </h2>
                <p className="mt-1 text-sm text-white/55">
                  Browse team members and manage important account details.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex min-w-[280px] items-center rounded-[14px] border border-white/10 bg-white/[0.07] px-4">
                <FiSearch className="text-white/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, username..."
                  className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/35"
                />
              </div>

              <div className="flex items-center rounded-[14px] border border-white/10 bg-white/[0.07] px-4">
                <FiFilter className="text-white/40" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-transparent px-3 py-3 text-sm font-bold text-white outline-none"
                >
                  <option className="bg-white text-slate-900" value="all">
                    All Roles
                  </option>
                  <option className="bg-white text-slate-900" value="admin">
                    Admin
                  </option>
                  <option
                    className="bg-white text-slate-900"
                    value="project-manager"
                  >
                    Project Manager
                  </option>
                  <option className="bg-white text-slate-900" value="employee">
                    Employee
                  </option>
                  <option className="bg-white text-slate-900" value="client">
                    Client
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <div className="rounded-full bg-violet-400/15 px-3 py-1 text-xs font-bold text-violet-300">
              Total Users: {users.length}
            </div>

            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/60">
              Showing: {filteredUsers.length}
            </div>
          </div>
        </div>

        <div className={`${boardCard} p-5 lg:p-6`}>
          {loading ? (
            <div className="rounded-[16px] border border-dashed border-white/15 bg-white/[0.04] px-4 py-8 text-center text-sm text-white/55">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-white/15 bg-white/[0.04] px-4 py-8 text-center text-sm text-white/55">
              No users found.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => {
                const displayName =
                  user.fullName || user.name || user.username || "Unnamed User";

                const isOwnAccount = currentUser?._id === user._id;
                const designationPreview = getDesignationPreview(user);
                const clientMetaVisible =
                  isClientUser(user) && hasClientMeta(user);

                return (
                  <div
                    key={user._id}
                    className={`${innerCard} p-5 transition hover:bg-white/[0.08]`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-white/10 text-white/70">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={displayName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold">
                              {displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-xl font-bold text-white">
                              {displayName}
                            </h3>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${getRoleBadgeClass(
                                user.role
                              )}`}
                            >
                              {getRoleIcon(user.role)}
                              {getRoleLabel(user.role)}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-sm text-white/50">
                            <FiMail className="shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>

                          {user.username && (
                            <p className="mt-1 text-xs text-white/45">
                              @{user.username}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setActivityModalUser(user)}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-bold text-white/70 transition hover:bg-white/15 hover:text-white"
                          >
                            <FiClock />
                            View Activities
                          </button>
                        )}

                        <Link
                          href={`/profile/view-user/${user.username || user._id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-bold text-white/70 transition hover:bg-white/15 hover:text-white"
                        >
                          <FiEye />
                          View Profile
                        </Link>

                        <Link
                          href={`/profile/edit-user/${user.username || user._id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-white/90"
                        >
                          <FiEdit3 />
                          {isOwnAccount ? "Edit My Profile" : "Edit User"}
                        </Link>
                      </div>
                    </div>

                    {(isClientUser(user) ? clientMetaVisible : true) && (
                      <div className="mt-5 border-t border-white/10 pt-4">
                        {isClientUser(user) ? (
                          <div className="flex flex-wrap items-center gap-2 text-sm text-white/60">
                            {user.companyName?.trim() && (
                              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
                                <FiBriefcase className="text-sm" />
                                {user.companyName}
                              </div>
                            )}

                            {user.website?.trim() && (
                              <a
                                href={user.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70 transition hover:bg-white/15"
                              >
                                <FiGlobe className="text-sm" />
                                {user.website.replace(/^https?:\/\//, "")}
                              </a>
                            )}

                            {user.preferredCommunication?.trim() && (
                              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
                                <FiMessageCircle className="text-sm" />
                                {user.preferredCommunication}
                              </div>
                            )}

                            <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/50">
                              {user.activeProjectsCount || 0} Active •{" "}
                              {user.completedProjectsCount || 0} Completed
                            </div>
                          </div>
                        ) : (
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white/80">
                              {getPrimaryRoleText(user)}
                            </p>

                            {designationPreview.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {designationPreview.map((designation) => (
                                  <span
                                    key={`${user._id}-${designation}`}
                                    title={designation}
                                    className="max-w-[220px] truncate rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/65"
                                  >
                                    {designation}
                                  </span>
                                ))}

                                {Array.isArray(user.designations) &&
                                  user.designations.length > 3 && (
                                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/45">
                                      +{user.designations.length - 3} more
                                    </span>
                                  )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-5 border-t border-white/10 pt-4">
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className={smallCard}>
                          <div className="flex items-center gap-2 text-xs font-bold text-white/45">
                            <FiFolder className="text-sm" />
                            <span>Active Projects</span>
                          </div>
                          <p className="mt-3 text-2xl font-bold text-white">
                            {user.activeProjectsCount || 0}
                          </p>
                        </div>

                        {isClientUser(user) ? (
                          <div className={smallCard}>
                            <div className="flex items-center gap-2 text-xs font-bold text-white/45">
                              <FiCheckCircle className="text-sm" />
                              <span>Completed Projects</span>
                            </div>
                            <p className="mt-3 text-2xl font-bold text-white">
                              {user.completedProjectsCount || 0}
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className={smallCard}>
                              <div className="flex items-center gap-2 text-xs font-bold text-white/45">
                                <FiCheckSquare className="text-sm" />
                                <span>Active Tasks</span>
                              </div>
                              <p className="mt-3 text-2xl font-bold text-white">
                                {user.activeTasksCount || 0}
                              </p>
                            </div>

                            <div className={smallCard}>
                              <div className="flex items-center gap-2 text-xs font-bold text-white/45">
                                <FiCalendar className="text-sm" />
                                <span>This Month</span>
                              </div>
                              <p className="mt-3 text-2xl font-bold text-white">
                                {user.monthAssignedTasks || 0}
                              </p>
                            </div>

                            <div className={smallCard}>
                              <div className="flex items-center gap-2 text-xs font-bold text-white/45">
                                <FiCheckCircle className="text-sm" />
                                <span>Completed</span>
                              </div>
                              <p className="mt-3 text-2xl font-bold text-white">
                                {user.monthCompletedTasks || 0}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <UserActivityModal
          user={activityModalUser}
          currentUser={currentUser}
          open={Boolean(activityModalUser)}
          onClose={() => setActivityModalUser(null)}
        />
      )}
    </>
  );
}