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
  FiClipboard,
  FiActivity,
} from "react-icons/fi";
import ProfileSidebarItem from "@/components/ProfileSidebarItem";

const sidebarCard =
  "rounded-[20px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.25)]";

export default function ProfileSidebar({
  user,
  safeSection,
  setActiveSection,
}) {
  const canManage =
    user?.role === "admin" || user?.role === "project-manager";

  const canUseTasks =
    user?.role === "admin" ||
    user?.role === "project-manager" ||
    user?.role === "employee";

  const canViewAllActivities =
    user?.role === "admin" || user?.role === "project-manager";

  return (
    <div className={sidebarCard}>
      <div className="space-y-2">
        <ProfileSidebarItem
          icon={<FiGrid />}
          title="Dashboard"
          subtitle="Overview"
          active={safeSection === "dashboard"}
          onClick={() => setActiveSection("dashboard")}
        />

        <ProfileSidebarItem
          icon={<FiFolder />}
          title="My Projects"
          subtitle="Assigned projects"
          active={safeSection === "my-projects"}
          onClick={() => setActiveSection("my-projects")}
        />

        {canUseTasks && (
          <ProfileSidebarItem
            icon={<FiCheckSquare />}
            title="My Tasks"
            subtitle="Assigned tasks"
            active={safeSection === "my-tasks"}
            onClick={() => setActiveSection("my-tasks")}
          />
        )}

        {canManage && (
          <ProfileSidebarItem
            icon={<FiClipboard />}
            title="Task Management"
            subtitle="Manage all tasks"
            active={safeSection === "task-management"}
            onClick={() => setActiveSection("task-management")}
          />
        )}

        {canViewAllActivities && (
          <ProfileSidebarItem
            icon={<FiActivity />}
            title="All Activities"
            subtitle="System activity log"
            active={safeSection === "all-activities"}
            onClick={() => setActiveSection("all-activities")}
          />
        )}

        <ProfileSidebarItem
          icon={<FiActivity />}
          title="My Activities"
          subtitle="Your activity"
          active={safeSection === "my-activities"}
          onClick={() => setActiveSection("my-activities")}
        />

        <ProfileSidebarItem
          icon={<FiCheckSquare />}
          title="ToDo List"
          subtitle="Personal tasks"
          active={safeSection === "todo"}
          onClick={() => setActiveSection("todo")}
        />

        {canManage && (
          <ProfileSidebarItem
            icon={<FiPlusSquare />}
            title="Add Task"
            subtitle="Create task"
            active={safeSection === "add-task"}
            onClick={() => setActiveSection("add-task")}
          />
        )}

        <ProfileSidebarItem
          icon={<FiUser />}
          title="My Profile"
          subtitle="Account details"
          active={safeSection === "profile"}
          onClick={() => setActiveSection("profile")}
        />

        <ProfileSidebarItem
          icon={<FiEdit2 />}
          title="Edit Profile"
          subtitle="Update account"
          active={safeSection === "edit-profile"}
          onClick={() => setActiveSection("edit-profile")}
        />

        <ProfileSidebarItem
          icon={<FiCalendar />}
          title="Calendar"
          subtitle="Schedule"
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
              icon={<FiBarChart2 />}
              title="Analytics"
              subtitle="Admin only"
              active={safeSection === "analytics"}
              onClick={() => setActiveSection("analytics")}
            />

            <ProfileSidebarItem
              icon={<FiUserPlus />}
              title="Add User"
              subtitle="Admin only"
              active={safeSection === "add-user"}
              onClick={() => setActiveSection("add-user")}
            />

            <ProfileSidebarItem
              icon={<FiUsers />}
              title="User List"
              subtitle="Admin only"
              active={safeSection === "users"}
              onClick={() => setActiveSection("users")}
            />
          </>
        )}

        <ProfileSidebarItem
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