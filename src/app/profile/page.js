"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiUser,
  FiGrid,
  FiEdit2,
  FiCalendar,
  FiUserPlus,
  FiUsers,
  FiPlusSquare,
  FiAlertCircle,
  FiHelpCircle,
} from "react-icons/fi";
import ProfileSidebarItem from "@/components/ProfileSidebarItem";
import DashboardTab from "@/components/profile/DashboardTab";
import MyProfileTab from "@/components/profile/MyProfileTab";
import UserListTab from "@/components/profile/UserListTab";
import AddUserTab from "@/components/profile/AddUserTab";
import EditProfileTab from "@/components/profile/EditProfileTab";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    setMounted(true);

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectRes, issueRes] = await Promise.all([
          fetch("/api/projects", { cache: "no-store" }),
          fetch("/api/issues", { cache: "no-store" }),
        ]);

        const projectData = projectRes.ok ? await projectRes.json() : [];
        const issueData = issueRes.ok ? await issueRes.json() : [];

        setProjects(Array.isArray(projectData) ? projectData : []);
        setIssues(Array.isArray(issueData) ? issueData : []);
      } catch (error) {
        console.log("PROFILE DASHBOARD ERROR:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const firstLetter = useMemo(() => {
    return user?.name?.charAt(0)?.toUpperCase() || "U";
  }, [user]);

  const assignedProjects = useMemo(() => {
    if (!user?.assignedProjects) return [];
    return user.assignedProjects;
  }, [user]);

  const safeSection =
    user?.role === "admin"
      ? activeSection
      : ["add-user", "users"].includes(activeSection)
        ? "dashboard"
        : activeSection;

  function renderContent() {
    if (safeSection === "dashboard") {
      return <DashboardTab user={user} projects={projects} issues={issues} />;
    }

    if (safeSection === "profile") {
      return <MyProfileTab user={user} assignedProjects={assignedProjects} />;
    }

    if (safeSection === "add-user") {
      return user?.role === "admin" ? (
        <AddUserTab />
      ) : (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="mt-2 text-sm text-slate-500">
            Only administrators can add users.
          </p>
        </div>
      );
    }

    if (safeSection === "users") {
      return user?.role === "admin" ? (
        <UserListTab currentUser={user} />
      ) : (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="mt-2 text-sm text-slate-500">
            Only administrators can view the user list.
          </p>
        </div>
      );
    }

    if (safeSection === "edit-profile") {
      return <EditProfileTab user={user} onUserUpdate={setUser} />;
    }

    if (safeSection === "calendar") {
      return (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Calendar</h2>
          <p className="mt-2 text-sm text-slate-500">
            Calendar content will go here.
          </p>
        </div>
      );
    }

    if (safeSection === "help") {
      return (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Help</h2>
          <p className="mt-2 text-sm text-slate-500">
            Help and support content will go here.
          </p>
        </div>
      );
    }

    return <DashboardTab user={user} projects={projects} issues={issues} />;
  }

  if (!mounted) {
    return null;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <FiUser className="text-3xl" />
          </div>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            No User Found
          </h1>

          <p className="mt-2 text-slate-500">
            Please login first to view your profile.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-3 font-medium text-white"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">{renderContent()}</div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-violet-100 text-lg font-bold text-violet-700">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  firstLetter
                )}
              </div>

              <div>
                <p className="font-semibold text-slate-900">{user.name}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="space-y-3">
              <ProfileSidebarItem
                href="#"
                icon={<FiGrid />}
                title="Dashboard"
                subtitle="Overview"
                active={safeSection === "dashboard"}
                onClick={() => setActiveSection("dashboard")}
              />

              <ProfileSidebarItem
                href="#"
                icon={<FiUser />}
                title="My Profile"
                subtitle="Account details"
                active={safeSection === "profile"}
                onClick={() => setActiveSection("profile")}
              />

              <ProfileSidebarItem
                href="#"
                icon={<FiEdit2 />}
                title="Edit Profile"
                subtitle="Update account"
                active={safeSection === "edit-profile"}
                onClick={() => setActiveSection("edit-profile")}
              />

              <ProfileSidebarItem
                href="#"
                icon={<FiCalendar />}
                title="Calendar"
                subtitle="Schedule view"
                active={safeSection === "calendar"}
                onClick={() => setActiveSection("calendar")}
              />

              {user.role === "admin" && (
                <>
                  <ProfileSidebarItem
                    href="#"
                    icon={<FiUserPlus />}
                    title="Add User"
                    subtitle="Admin only"
                    active={safeSection === "add-user"}
                    onClick={() => setActiveSection("add-user")}
                  />

                  <ProfileSidebarItem
                    href="#"
                    icon={<FiUsers />}
                    title="User List"
                    subtitle="Admin only"
                    active={safeSection === "users"}
                    onClick={() => setActiveSection("users")}
                  />
                </>
              )}

              <ProfileSidebarItem
                href="/projects/add"
                icon={<FiPlusSquare />}
                title="Add Project"
                subtitle="Create project"
              />

              <ProfileSidebarItem
                href="/issues/new"
                icon={<FiAlertCircle />}
                title="Add Issue"
                subtitle="Create issue"
              />

              <ProfileSidebarItem
                href="#"
                icon={<FiHelpCircle />}
                title="Help"
                subtitle="Support"
                active={safeSection === "help"}
                onClick={() => setActiveSection("help")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
