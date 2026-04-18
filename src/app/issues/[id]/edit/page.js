"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function EditIssuePage() {
  const params = useParams();
  const router = useRouter();

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [issue, setIssue] = useState(null);

  const [existingAttachments, setExistingAttachments] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    status: "Open",
    priority: "Medium",
    assignee: "",
    reporter: "",
    note: "",
    tags: "",
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
    } catch (error) {
      localStorage.removeItem("user");
      toast.error("Invalid login session");
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!params.id || !loggedInUser) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setProjectsLoading(true);

        const [issueRes, projectsRes, usersRes] = await Promise.all([
          fetch(`/api/issues/${params.id}`, { cache: "no-store" }),
          fetch("/api/projects", { cache: "no-store" }),
          fetch("/api/users", { cache: "no-store" }),
        ]);

        const issueData = await issueRes.json();
        const projectsData = await projectsRes.json();
        const usersData = await usersRes.json();

        if (!issueRes.ok) {
          toast.error(issueData.message || "Failed to fetch issue");
          return;
        }

        const projectList = Array.isArray(projectsData) ? projectsData : [];
        const userList = Array.isArray(usersData?.users)
          ? usersData.users
          : Array.isArray(usersData)
            ? usersData
            : [];

        setIssue(issueData);
        setExistingAttachments(issueData.attachments || []);
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

        const currentIssueProjectId =
          issueData.projectId?._id || issueData.projectId || "";

        const issueProjectExists = allowedProjects.some(
          (project) => project._id === currentIssueProjectId
        );

        if (!issueProjectExists && issueData.projectId?._id) {
          allowedProjects = [issueData.projectId, ...allowedProjects];
        }

        const uniqueProjects = allowedProjects.filter(
          (project, index, self) =>
            index === self.findIndex((item) => item._id === project._id)
        );

        setProjects(uniqueProjects);

        setFormData({
          title: issueData.title || "",
          description: issueData.description || "",
          projectId: currentIssueProjectId,
          status: issueData.status || "Open",
          priority: issueData.priority || "Medium",
          assignee: issueData.assignee || "",
          reporter: issueData.reporter || "",
          note: issueData.note || "",
          tags: issueData.tags?.join(", ") || "",
        });
      } catch (error) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
        setProjectsLoading(false);
      }
    };

    fetchData();
  }, [params.id, loggedInUser]);

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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const totalFiles =
      existingAttachments.length + newFiles.length + selectedFiles.length;

    if (totalFiles > 2) {
      toast.error("Maximum 2 files allowed");
      e.target.value = "";
      return;
    }

    setNewFiles((prev) => [...prev, ...selectedFiles]);
    e.target.value = "";
  };

  const handleRemoveExisting = (index) => {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNew = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loggedInUser) {
      toast.error("Login required");
      return;
    }

    try {
      setSaving(true);

      let uploadedAttachments = [];

      if (newFiles.length > 0) {
        for (const file of newFiles) {
          const formDataUpload = new FormData();
          formDataUpload.append("file", file);
          formDataUpload.append("type", "issue");

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formDataUpload,
          });

          const uploadData = await uploadRes.json();

          if (!uploadRes.ok) {
            toast.error(uploadData.message || "Upload failed");
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

      const finalAttachments = [...existingAttachments, ...uploadedAttachments];

      if (finalAttachments.length > 2) {
        toast.error("Maximum 2 files allowed");
        return;
      }

      const res = await fetch(`/api/issues/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": loggedInUser._id || "",
          "x-user-email": loggedInUser.email || "",
          "x-user-username": loggedInUser.username || "",
          "x-user-role": loggedInUser.role || "",
        },
        body: JSON.stringify({
          ...formData,
          attachments: finalAttachments,
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update issue");
        return;
      }

      toast.success("Issue updated successfully");

      if (selectedProject?.slug) {
        router.push(`/projects/${selectedProject.slug}`);
      } else {
        router.push("/issues");
      }

      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const inputWrap =
    "flex items-center rounded-2xl border border-slate-300 bg-white px-3 shadow-sm transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100";
  const inputClass =
    "w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400";
  const textareaClass =
    "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  if (loading || projectsLoading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Loading issue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-sm lg:p-8">
        <h1 className="text-3xl font-bold text-slate-900">Edit Issue</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update issue details, project, assignee, reporter, and tracking information.
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
                  placeholder="Issue title"
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
                placeholder="Description"
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
                  placeholder="Reporter"
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
                  placeholder="bug, ui, urgent"
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
                placeholder="Admin note"
                value={formData.note}
                onChange={handleChange}
                rows="3"
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
                  Total allowed files: 2
                </p>

                {existingAttachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Existing Files
                    </p>

                    {existingAttachments.map((file, index) => (
                      <div
                        key={`${file.url}-${index}`}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"
                      >
                        <div className="min-w-0">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate font-medium text-blue-600 underline"
                          >
                            {file.name}
                          </a>
                          <p>{file.size ? `${Math.round(file.size / 1024)} KB` : "File"}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveExisting(index)}
                          className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {newFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      New Files
                    </p>

                    {newFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-700">
                            {file.name}
                          </p>
                          <p>{Math.round(file.size / 1024)} KB</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveNew(index)}
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
          disabled={saving}
          className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Updating..." : "Update Issue"}
        </button>
      </form>
    </div>
  );
}