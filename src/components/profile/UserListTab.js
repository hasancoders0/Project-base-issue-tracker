"use client";

import { useEffect, useState } from "react";
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
  FiClock,
} from "react-icons/fi";

export default function UserListTab({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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
  };

  const getRoleBadgeClass = (role) => {
    if (role === "admin") return "bg-violet-100 text-violet-700";
    if (role === "project-manager") return "bg-blue-100 text-blue-700";
    if (role === "employee") return "bg-emerald-100 text-emerald-700";
    return "bg-amber-100 text-amber-700";
  };

  const getRoleLabel = (role) => {
    if (role === "project-manager") return "Project Manager";
    if (role === "employee") return "Employee";
    if (role === "client") return "Client";
    return "Admin";
  };

  const getRoleIcon = (role) => {
    if (role === "admin") return <FiShield className="text-lg" />;
    if (role === "project-manager") return <FiBriefcase className="text-lg" />;
    if (role === "employee") return <FiUserCheck className="text-lg" />;
    return <FiUser className="text-lg" />;
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "No time";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "No time";

    return date.toLocaleString();
  };

  const getLastActivities = (user) => {
    if (Array.isArray(user.activities) && user.activities.length > 0) {
      return user.activities.slice(0, 3);
    }

    const fallback = [];

    if (user.updatedAt) {
      fallback.push({
        title: "Profile updated",
        time: user.updatedAt,
      });
    }

    if (user.createdAt) {
      fallback.push({
        title: "Account created",
        time: user.createdAt,
      });
    }

    if (user.lastLogin) {
      fallback.push({
        title: "Last login",
        time: user.lastLogin,
      });
    }

    return fallback.slice(0, 3);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-sm lg:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <FiUsers className="text-xl" />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900">User List</h2>
            <p className="mt-1 text-sm text-slate-500">
              Browse users, check recent activity, and manage account details.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-sm lg:p-8">
        {loading ? (
          <p className="text-sm text-slate-500">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-500">No users found.</p>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {users.map((user) => {
              const displayName =
                user.fullName || user.name || user.username || "Unnamed User";

              const activities = getLastActivities(user);
              const isOwnAccount = currentUser?._id === user._id;

              return (
                <div
                  key={user._id}
                  className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-200 text-slate-600">
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
                        <h3 className="truncate text-lg font-bold text-slate-900">
                          {displayName}
                        </h3>

                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <FiMail className="shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>

                        {user.username && (
                          <p className="mt-1 text-xs text-slate-500">
                            @{user.username}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(
                        user.role
                      )}`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-[140px_1fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        {getRoleIcon(user.role)}
                        <span>Account</span>
                      </div>

                      <p className="mt-3 text-sm text-slate-500">Status</p>
                      <p className="mt-1 font-semibold capitalize text-slate-900">
                        {user.status || "active"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <FiClock />
                        <span>Last 3 Activities</span>
                      </div>

                      {activities.length > 0 ? (
                        <div className="mt-3 space-y-3">
                          {activities.map((activity, index) => (
                            <div
                              key={`${user._id}-${index}`}
                              className="rounded-2xl bg-slate-50 p-3"
                            >
                              <p className="text-sm font-medium text-slate-900">
                                {activity.title || activity.action || "Activity"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {formatTime(activity.time || activity.createdAt)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-slate-500">
                          No recent activities found
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/profile/view-user/${user.username || user._id}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
                    >
                      <FiEye />
                      View Profile
                    </Link>

                    <Link
                      href={`/profile/edit-user/${user.username || user._id}`
                      }
                      className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
                    >
                      <FiEdit3 />
                      {isOwnAccount ? "Edit My Profile" : "Edit User"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}