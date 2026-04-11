"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLinkedin,
  FiFacebook,
  FiMessageCircle,
  FiGlobe,
  FiBriefcase,
  FiFolder,
  FiCalendar,
  FiClock,
  FiEdit3,
  FiShield,
  FiUserCheck,
} from "react-icons/fi";

export default function ViewUserPage() {
  const params = useParams();
  const userParam = params?.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userParam) return;

    const fetchUser = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/users/${userParam}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) return;

        setUser(data.user || null);
      } catch (error) {
        console.log("VIEW USER ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userParam]);

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleDateString();
  };

  const formatDateTime = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleString();
  };

  const getRoleLabel = (role) => {
    if (role === "project-manager") return "Project Manager";
    if (role === "employee") return "Employee";
    if (role === "client") return "Client";
    return "Admin";
  };

  const getRoleBadgeClass = (role) => {
    if (role === "admin") return "bg-violet-100 text-violet-700";
    if (role === "project-manager") return "bg-blue-100 text-blue-700";
    if (role === "employee") return "bg-emerald-100 text-emerald-700";
    return "bg-amber-100 text-amber-700";
  };

  const getRoleIcon = (role) => {
    if (role === "admin") return <FiShield className="text-lg" />;
    if (role === "project-manager") return <FiBriefcase className="text-lg" />;
    if (role === "employee") return <FiUserCheck className="text-lg" />;
    return <FiUser className="text-lg" />;
  };

  const getActivities = (currentUser) => {
    if (!currentUser) return [];

    if (Array.isArray(currentUser.activities) && currentUser.activities.length) {
      return currentUser.activities.slice(0, 10);
    }

    const items = [];

    if (currentUser.updatedAt) {
      items.push({
        title: "Profile updated",
        time: currentUser.updatedAt,
      });
    }

    if (currentUser.createdAt) {
      items.push({
        title: "Account created",
        time: currentUser.createdAt,
      });
    }

    if (currentUser.lastLogin) {
      items.push({
        title: "Last login",
        time: currentUser.lastLogin,
      });
    }

    return items.slice(0, 10);
  };

  const sectionClass =
    "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm";
  const fieldClass = "rounded-2xl border border-slate-200 bg-white p-4";
  const labelClass =
    "text-xs font-semibold uppercase tracking-wide text-slate-500";
  const valueClass = "mt-2 text-sm font-medium text-slate-900";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">User not found</h2>
          <p className="mt-2 text-sm text-slate-500">
            The requested user profile could not be loaded.
          </p>

          <Link
            href="/profile"
            className="mt-4 inline-flex rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  const displayName = user.fullName || user.username || "Unnamed User";
  const activities = getActivities(user);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-sm lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
            >
              <FiArrowLeft className="text-lg" />
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">User Profile</h1>
              <p className="mt-1 text-sm text-slate-500">
                View complete user information and account details.
              </p>
            </div>
          </div>

          <Link
            href={`/profile/edit-user/${user._id}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
          >
            <FiEdit3 />
            Edit User
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-slate-200 text-3xl font-bold text-slate-700">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                {displayName}
              </h2>

              <p className="mt-1 text-sm text-slate-500">{user.email}</p>

              {user.username && (
                <p className="mt-1 text-sm text-slate-500">@{user.username}</p>
              )}

              <span
                className={`mt-4 rounded-full px-4 py-1.5 text-xs font-semibold ${getRoleBadgeClass(
                  user.role
                )}`}
              >
                {getRoleLabel(user.role)}
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              <div className={fieldClass}>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  {getRoleIcon(user.role)}
                  <span>Account Status</span>
                </div>
                <p className="mt-2 text-sm font-medium capitalize text-slate-900">
                  {user.status || "active"}
                </p>
              </div>

              <div className={fieldClass}>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FiCalendar />
                  <span>Account Created</span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {formatDateTime(user.createdAt)}
                </p>
              </div>

              <div className={fieldClass}>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FiClock />
                  <span>Last Updated</span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {formatDateTime(user.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <FiClock />
              <span>Last 10 Activities</span>
            </div>

            {activities.length > 0 ? (
              <div className="mt-4 space-y-3">
                {activities.map((activity, index) => (
                  <div
                    key={`${user._id}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {activity.title || activity.action || "Activity"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDateTime(activity.time || activity.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No recent activities found.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="text-xl font-bold text-slate-900">Basic Information</h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className={fieldClass}>
                <div className="flex items-center gap-2 text-slate-700">
                  <FiUser />
                  <span className={labelClass}>Full Name</span>
                </div>
                <p className={valueClass}>{user.fullName || "Not available"}</p>
              </div>

              <div className={fieldClass}>
                <div className="flex items-center gap-2 text-slate-700">
                  <FiMail />
                  <span className={labelClass}>Email Address</span>
                </div>
                <p className={valueClass}>{user.email || "Not available"}</p>
              </div>

              <div className={fieldClass}>
                <div className="flex items-center gap-2 text-slate-700">
                  <FiUser />
                  <span className={labelClass}>Username</span>
                </div>
                <p className={valueClass}>{user.username || "Not available"}</p>
              </div>

              <div className={fieldClass}>
                <div className="flex items-center gap-2 text-slate-700">
                  {getRoleIcon(user.role)}
                  <span className={labelClass}>Role</span>
                </div>
                <p className={valueClass}>{getRoleLabel(user.role)}</p>
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <h3 className="text-xl font-bold text-slate-900">Contact Information</h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className={fieldClass}>
                <div className="flex items-center gap-2 text-slate-700">
                  <FiPhone />
                  <span className={labelClass}>Phone Number</span>
                </div>
                <p className={valueClass}>{user.phone || "Not available"}</p>
              </div>

              <div className={fieldClass}>
                <div className="flex items-center gap-2 text-slate-700">
                  <FiMapPin />
                  <span className={labelClass}>Address</span>
                </div>
                <p className={valueClass}>{user.address || "Not available"}</p>
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <h3 className="text-xl font-bold text-slate-900">Social Links</h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className={fieldClass}>
                <div className="flex items-center gap-2 text-slate-700">
                  <FiLinkedin />
                  <span className={labelClass}>LinkedIn</span>
                </div>
                <p className={valueClass}>{user.linkedin || "Not available"}</p>
              </div>

              <div className={fieldClass}>
                <div className="flex items-center gap-2 text-slate-700">
                  <FiFacebook />
                  <span className={labelClass}>Facebook</span>
                </div>
                <p className={valueClass}>{user.facebook || "Not available"}</p>
              </div>

              <div className={fieldClass}>
                <div className="flex items-center gap-2 text-slate-700">
                  <FiMessageCircle />
                  <span className={labelClass}>WhatsApp</span>
                </div>
                <p className={valueClass}>{user.whatsapp || "Not available"}</p>
              </div>

              <div className={fieldClass}>
                <div className="flex items-center gap-2 text-slate-700">
                  <FiMessageCircle />
                  <span className={labelClass}>Slack</span>
                </div>
                <p className={valueClass}>{user.slack || "Not available"}</p>
              </div>

              <div className="md:col-span-2">
                <div className={fieldClass}>
                  <div className="flex items-center gap-2 text-slate-700">
                    <FiGlobe />
                    <span className={labelClass}>Website</span>
                  </div>
                  <p className={valueClass}>{user.website || "Not available"}</p>
                </div>
              </div>
            </div>
          </div>

          {user.role === "client" && (
            <div className={sectionClass}>
              <h3 className="text-xl font-bold text-slate-900">Client Information</h3>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className={fieldClass}>
                  <div className="flex items-center gap-2 text-slate-700">
                    <FiBriefcase />
                    <span className={labelClass}>Company Name</span>
                  </div>
                  <p className={valueClass}>
                    {user.companyName || "Not available"}
                  </p>
                </div>

                <div className={fieldClass}>
                  <div className="flex items-center gap-2 text-slate-700">
                    <FiGlobe />
                    <span className={labelClass}>Company Website</span>
                  </div>
                  <p className={valueClass}>
                    {user.companyWebsite || "Not available"}
                  </p>
                </div>

                <div className={fieldClass}>
                  <div className="flex items-center gap-2 text-slate-700">
                    <FiCalendar />
                    <span className={labelClass}>Contract Start Date</span>
                  </div>
                  <p className={valueClass}>
                    {formatDate(user.contractStartDate)}
                  </p>
                </div>

                <div className={fieldClass}>
                  <div className="flex items-center gap-2 text-slate-700">
                    <FiCalendar />
                    <span className={labelClass}>Contract End Date</span>
                  </div>
                  <p className={valueClass}>
                    {formatDate(user.contractEndDate)}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <div className={fieldClass}>
                    <div className="flex items-center gap-2 text-slate-700">
                      <FiMessageCircle />
                      <span className={labelClass}>
                        Preferred Communication
                      </span>
                    </div>
                    <p className={valueClass}>
                      {user.preferredCommunication || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(user.role === "employee" || user.role === "project-manager") && (
            <div className={sectionClass}>
              <h3 className="text-xl font-bold text-slate-900">
                Professional Information
              </h3>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className={fieldClass}>
                  <div className="flex items-center gap-2 text-slate-700">
                    <FiBriefcase />
                    <span className={labelClass}>Job Title</span>
                  </div>
                  <p className={valueClass}>{user.jobTitle || "Not available"}</p>
                </div>

                <div className={fieldClass}>
                  <div className="flex items-center gap-2 text-slate-700">
                    <FiUserCheck />
                    <span className={labelClass}>Experience Level</span>
                  </div>
                  <p className={valueClass}>
                    {user.experienceLevel || "Not available"}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <div className={fieldClass}>
                    <div className="flex items-center gap-2 text-slate-700">
                      <FiBriefcase />
                      <span className={labelClass}>Skills</span>
                    </div>

                    {Array.isArray(user.skills) && user.skills.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {user.skills.map((skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className={valueClass}>Not available</p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className={fieldClass}>
                    <div className="flex items-center gap-2 text-slate-700">
                      <FiFolder />
                      <span className={labelClass}>CV File</span>
                    </div>

                    {user.cvFile ? (
                      <a
                        href={user.cvFile}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex text-sm font-medium text-violet-600 hover:text-violet-700"
                      >
                        View Uploaded CV
                      </a>
                    ) : (
                      <p className={valueClass}>Not available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={sectionClass}>
            <h3 className="text-xl font-bold text-slate-900">Assigned Projects</h3>

            {Array.isArray(user.assignedProjects) && user.assignedProjects.length > 0 ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {user.assignedProjects.map((project) => (
                  <div
                    key={project._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-center gap-2 text-slate-700">
                      <FiFolder />
                      <span className="text-sm font-semibold text-slate-900">
                        {project.title}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Status: {project.status || "In Progress"}
                    </p>

                    {project.slug && (
                      <Link
                        href={`/projects/${project.slug}`}
                        className="mt-3 inline-flex text-sm font-medium text-violet-600 hover:text-violet-700"
                      >
                        View Project
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No assigned projects found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}