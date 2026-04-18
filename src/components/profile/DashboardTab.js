"use client";

import AdminDashboardTab from "@/components/profile/dashboards/AdminDashboardTab";
import ProjectManagerDashboardTab from "@/components/profile/dashboards/ProjectManagerDashboardTab";
import EmployeeDashboardTab from "@/components/profile/dashboards/EmployeeDashboardTab";
import ClientDashboardTab from "@/components/profile/dashboards/ClientDashboardTab";

export default function DashboardTab({ user, projects = [], issues = [] }) {
  if (user?.role === "admin") {
    return <AdminDashboardTab user={user} projects={projects} issues={issues} />;
  }

  if (user?.role === "project-manager") {
    return (
      <ProjectManagerDashboardTab
        user={user}
        projects={projects}
        issues={issues}
      />
    );
  }

  if (user?.role === "employee") {
    return (
      <EmployeeDashboardTab user={user} projects={projects} issues={issues} />
    );
  }

  if (user?.role === "client") {
    return <ClientDashboardTab user={user} projects={projects} issues={issues} />;
  }

  return <AdminDashboardTab user={user} projects={projects} issues={issues} />;
}