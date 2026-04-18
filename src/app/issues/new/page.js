"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiEdit3,
  FiFlag,
  FiFolder,
  FiHash,
  FiPaperclip,
  FiTag,
  FiUser,
  FiUsers,
} from "react-icons/fi";

export default function NewIssuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get("projectId");

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [files, setFiles] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    priority: "Medium",
    status: "Open",
    assignee: "",
    reporter: "",
    tags: "",
    note: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setLoggedInUser(parsedUser);

      setFormData((prev) => ({
        ...prev,
        reporter: parsedUser.fullName || parsedUser.username || "",
      }));
    } catch (error) {
      localStorage.removeItem("user");
      toast.error("Invalid login session");
      router.push("/login");
    } finally {
      setAuthLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!loggedInUser) return;

    const fetchData = async () => {
      try {
        setProjectsLoading(true);

        const [projectsRes, usersRes] = await Promise.all([
          fetch("/api/projects", { cache: "no-store" }),
          fetch("/api/users", { cache: "no-store" }),
        ]);

        const projectsData = await projectsRes.json();
        const usersData = await usersRes.json();

        if (!projectsRes.ok) {
          toast.error(projectsData.message || "Failed to fetch projects");
          return;
        }

        const projectList = Array.isArray(projectsData) ? projectsData : [];
        const userList = Array.isArray(usersData?.users)
          ? usersData.users
          : Array.isArray(usersData)
            ? usersData
            : [];

        setAllUsers(userList);

        let allowedProjects = projectList;

        if (
          loggedInUser.role === "employee" ||
          loggedInUser.role === "client"
        ) {
          allowedProjects = projectList.filter((project) => {
            const assignedMembers = Array.isArray(project.assignedTeamMembers)
              ? project.assignedTeamMembers.map((member) =>
                  typeof member === "string" ? member : String(member._id)
                )
              : [];

            return assignedMembers.includes(String(loggedInUser._id));
          });
        }

        setProjects(allowedProjects);

        const hasSelectedProject =
          selectedProjectId &&
          allowedProjects.some((project) => project._id === selectedProjectId);

        const fallbackProjectId =
          allowedProjects.length > 0 ? allowedProjects[0]._id : "";

        setFormData((prev) => ({
          ...prev,
          projectId: hasSelectedProject
            ? selectedProjectId
            : prev.projectId &&
                allowedProjects.some((p) => p._id === prev.projectId)
              ? prev.projectId
              : fallbackProjectId,
        }));
      } catch (error) {
        toast.error("Something went wrong");
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchData();
  }, [loggedInUser, selectedProjectId]);

  const selectedProject = useMemo(() => {
    return projects.find((project) => project._id === formData.projectId) || null;
  }, [projects, formData.projectId]);

  const assigneeOptions = useMemo(() => {
    if (!selectedProject) return [];

    const assignedIds = Array.isArray(selectedProject.assignedTeamMembers)
      ? selectedProject.assignedTeamMembers.map((member) =>
          typeof member === "string" ? member : String(member._id)
        )
      : [];

    return allUsers.filter((user) => assignedIds.includes(String(user._id)));
  }, [selectedProject, allUsers]);

  useEffect(() => {
    if (!formData.projectId) return;

    if (
      formData.assignee &&
      !assigneeOptions.some(
        (user) => (user.fullName || user.username || "") === formData.assignee
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        assignee: "",
      }));
    }
  }, [formData.projectId, formData.assignee, assigneeOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const combinedFiles = [...files, ...selectedFiles];

    if (combinedFiles.length > 2) {
      toast.error("Maximum 2 files allowed");
      e.target.value = "";
      return;
    }

    setFiles(combinedFiles);
    e.target.value = "";
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loggedInUser) {
      toast.error("Login required");
      return;
    }

    if (!formData.projectId) {
      toast.error("Please select a project");
      return;
    }

    if (files.length > 2) {
      toast.error("Maximum 2 files allowed");
      return;
    }

    try {
      setSubmitting(true);

      let uploadedAttachments = [];

      if (files.length > 0) {
        for (const file of files) {
          const uploadFormData = new FormData();
          uploadFormData.append("file", file);
          uploadFormData.append("type", "issue");

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: uploadFormData,
          });

          const uploadData = await uploadRes.json();

          if (!uploadRes.ok) {
            toast.error(uploadData.message || `Failed to upload ${file.name}`);
            setSubmitting(false);
            return;
          }

          uploadedAttachments.push({
            name: file.name,
            url: uploadData.filePath,
            type: uploadData.fileType || file.type,
            size: uploadData.fileSize || file.size,
          });
        }
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        projectId: formData.projectId,
        priority: formData.priority,
        status: formData.status,
        assignee: formData.assignee,
        reporter: formData.reporter,
        createdBy: loggedInUser.username || loggedInUser.fullName || "user",
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        note: formData.note,
        attachments: uploadedAttachments,
      };

      const res = await fetch("/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": loggedInUser._id || "",
          "x-user-email": loggedInUser.email || "",
          "x-user-username": loggedInUser.username || "",
          "x-user-role": loggedInUser.role || "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create issue");
        return;
      }

      toast.success("Issue created successfully");

      if (selectedProject?.slug) {
        router.push(`/projects/${selectedProject.slug}`);
      } else {
        router.push("/issues");
      }

      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const inputWrap =
    "flex items-center rounded-2xl border border-slate-300 bg-white px-3 shadow-sm transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100";
  const inputClass =
    "w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400";
  const textareaClass =
    "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  if (authLoading || projectsLoading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Loading issue form...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">No Project Found</h2>
          <p className="mt-2 text-sm text-slate-500">
            You do not have any available project to create an issue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-sm lg:p-8">
        <h1 className="text-3xl font-bold text-slate-900">Add New Issue</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create a new issue with project, assignee, priority, and tracking details.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-3xl bg-white p-6 text-slate-800 shadow-sm lg:p-8"
      >
        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
          <h3 className="text-xl font-bold text-slate-900">Issue Info</h3>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass}>Title</label>
              <div className={inputWrap}>
                <FiEdit3 className="text-slate-400" />
                <input
                  type="text"
                  name="title"
                  placeholder="Enter issue title"
                  value={formData.title}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                placeholder="Write issue description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={textareaClass}
              />
            </div>

            <div>
              <label className={labelClass}>Project</label>
              <div className={inputWrap}>
                <FiFolder className="text-slate-400" />
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
                  required
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProject?.projectNumber && (
                <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <FiHash />
                  Project Code: #P-{selectedProject.projectNumber}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <div className={inputWrap}>
                <FiAlertCircle className="text-slate-400" />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Priority</label>
              <div className={inputWrap}>
                <FiFlag className="text-slate-400" />
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Assignee</label>
              <div className={inputWrap}>
                <FiUsers className="text-slate-400" />
                <select
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="">Select assignee</option>
                  {assigneeOptions.map((user) => (
                    <option
                      key={user._id}
                      value={user.fullName || user.username || ""}
                    >
                      {user.fullName || user.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Reporter</label>
              <div className={inputWrap}>
                <FiUser className="text-slate-400" />
                <input
                  type="text"
                  name="reporter"
                  placeholder="Reporter name"
                  value={formData.reporter}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Tags</label>
              <div className={inputWrap}>
                <FiTag className="text-slate-400" />
                <input
                  type="text"
                  name="tags"
                  placeholder="payment, bug, ui"
                  value={formData.tags}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Note</label>
              <textarea
                name="note"
                placeholder="Write extra note"
                value={formData.note}
                onChange={handleChange}
                rows="4"
                className={textareaClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Attachments (Max 2)</label>

              <div className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FiPaperclip className="text-slate-400" />
                  <span>Upload JPG, PNG, WEBP, or PDF</span>
                </div>

                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleFileChange}
                  className="mt-3 block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-violet-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-200"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Maximum 2 files.
                </p>

                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"
                      >
                        <div>
                          <p className="font-medium text-slate-700">{file.name}</p>
                          <p>{Math.round(file.size / 1024)} KB</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create Issue"}
        </button>
      </form>
    </div>
  );
}