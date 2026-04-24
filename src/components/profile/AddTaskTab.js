"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import AddTaskForm from "@/components/tasks/AddTaskForm";

const boardCard =
  "rounded-[20px] border border-white/10 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm";

export default function AddTaskTab({ user }) {
  const [sessionUser, setSessionUser] = useState(user || null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const toastLock = useRef(false);

  useEffect(() => {
    if (user?._id) {
      setSessionUser(user);
      return;
    }

    const stored = localStorage.getItem("user");

    if (stored) {
      try {
        setSessionUser(JSON.parse(stored));
      } catch {
        setSessionUser(null);
      }
    } else {
      setSessionUser(null);
    }
  }, [user]);

  const isAdmin = sessionUser?.role === "admin";
  const isProjectManager = sessionUser?.role === "project-manager";
  const isClient = sessionUser?.role === "client";
  const isEmployee = sessionUser?.role === "employee";

  useEffect(() => {
    if (sessionUser?._id) {
      fetchProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [sessionUser?._id]);

  async function fetchProjects() {
    try {
      setLoading(true);

      const res = await fetch("/api/projects", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setProjects([]);
        toast.error(data?.message || "Failed to load projects");
        return;
      }

      const projectList = Array.isArray(data?.projects)
        ? data.projects
        : Array.isArray(data)
        ? data
        : [];

      setProjects(projectList);
    } catch {
      setProjects([]);
      toast.error("Something went wrong while loading projects");
    } finally {
      setLoading(false);
    }
  }

  const allowedProjects = useMemo(() => {
    if (!sessionUser) return [];

    if (isAdmin || isProjectManager) {
      return projects;
    }

    if (isClient) {
      return projects.filter(
        (project) =>
          String(project?.clientUserId?._id || project?.clientUserId || "") ===
          String(sessionUser._id)
      );
    }

    if (isEmployee) {
      const assignedIds = (sessionUser.assignedProjects || []).map((item) =>
        String(item?._id || item)
      );

      return projects.filter((project) =>
        assignedIds.includes(String(project._id))
      );
    }

    return [];
  }, [projects, sessionUser, isAdmin, isProjectManager, isClient, isEmployee]);

  function handleTaskCreated() {
    if (toastLock.current) return;

    toastLock.current = true;

    toast.success("Task created successfully");
    window.dispatchEvent(new Event("task-created"));

    setTimeout(() => {
      toastLock.current = false;
    }, 1000);
  }

  if (!sessionUser?._id) {
    return (
      <div className={`${boardCard} p-5`}>
        <h2 className="text-2xl font-bold">Add Task</h2>
        <p className="mt-2 text-sm text-white/55">
          User session not found. Please log in again.
        </p>
      </div>
    );
  }

  if (isEmployee) {
    return (
      <div className={`${boardCard} p-5`}>
        <h2 className="text-2xl font-bold">Add Task</h2>
        <p className="mt-2 text-sm text-white/55">
          Employees cannot create tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`${boardCard} p-5`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">
          Task Creator
        </p>

        <h2 className="mt-2 text-2xl font-bold">Add Task</h2>

        <p className="mt-1 text-sm text-white/55">
          {isClient
            ? "Create a task for one of your assigned projects."
            : "Create a new task and assign it to the right person."}
        </p>
      </div>

      {loading ? (
        <div className={`${boardCard} p-5`}>
          <p className="text-sm text-white/55">Loading projects...</p>
        </div>
      ) : isClient && allowedProjects.length === 0 ? (
        <div className={`${boardCard} p-5`}>
          <h3 className="text-lg font-bold">No assigned project found</h3>
          <p className="mt-2 text-sm text-white/55">
            This client user does not currently have any assigned project.
          </p>
        </div>
      ) : (
        <AddTaskForm
          currentUser={sessionUser}
          projects={allowedProjects}
          onSuccess={handleTaskCreated}
        />
      )}
    </div>
  );
}