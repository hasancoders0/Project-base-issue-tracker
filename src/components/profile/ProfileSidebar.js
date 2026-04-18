"use client";

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
  FiFolder,
  FiCheckSquare,
  FiBarChart2,
} from "react-icons/fi";
import ProfileSidebarItem from "@/components/ProfileSidebarItem";

export default function ProfileSidebar({
  user,
  safeSection,
  setActiveSection,
}) {
  const canManage =
    user?.role === "admin" || user?.role === "project-manager";

  return (
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
          icon={<FiFolder />}
          title="My Projects"
          subtitle="Assigned projects"
          active={safeSection === "my-projects"}
          onClick={() => setActiveSection("my-projects")}
        />

        <ProfileSidebarItem
          href="#"
          icon={<FiCheckSquare />}
          title="My Tasks"
          subtitle="Assigned issues"
          active={safeSection === "my-tasks"}
          onClick={() => setActiveSection("my-tasks")}
        />

        <ProfileSidebarItem
          href="#"
          icon={<FiCheckSquare />}
          title="ToDo List"
          subtitle="Personal tasks"
          active={safeSection === "todo"}
          onClick={() => setActiveSection("todo")}
        />

        <ProfileSidebarItem
          href="#"
          icon={<FiPlusSquare />}
          title="Add Task"
          subtitle="Create personal task"
          active={safeSection === "add-task"}
          onClick={() => setActiveSection("add-task")}
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

        {canManage && (
          <>
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
          </>
        )}

        {user?.role === "admin" && (
          <>
            <ProfileSidebarItem
              href="#"
              icon={<FiBarChart2 />}
              title="Analytics"
              subtitle="Admin only"
              active={safeSection === "analytics"}
              onClick={() => setActiveSection("analytics")}
            />

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
          href="#"
          icon={<FiHelpCircle />}
          title="Help"
          subtitle="Support"
          active={safeSection === "help"}
          onClick={() => setActiveSection("help")}
        />
      </div>
    </div>
  );
}