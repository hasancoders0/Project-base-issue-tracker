"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiEdit3,
  FiFileText,
  FiFlag,
  FiFolder,
  FiHash,
  FiPaperclip,
  FiSearch,
  FiTag,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

const COMMON_TAGS = [
  "bug",
  "ui",
  "backend",
  "frontend",
  "payment",
  "api",
  "database",
  "auth",
  "design",
  "urgent",
];

export default function NewIssuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get("projectId");

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showAssignmentDetails, setShowAssignmentDetails] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);

  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [files, setFiles] = useState([]);

  const [projectSearch, setProjectSearch] = useState("");
  const [assigneeSearch, setAssigneeSearch] = useState("");

  const projectDropdownRef = useRef(null);
  const assigneeDropdownRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target)
      ) {
        setProjectDropdownOpen(false);
      }

      if (
        assigneeDropdownRef.current &&
        !assigneeDropdownRef.current.contains(event.target)
      ) {
        setAssigneeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedProject = useMemo(() => {
    return projects.find((project) => project._id === formData.projectId) || null;
  }, [projects, formData.projectId]);

  const filteredProjects = useMemo(() => {
    const keyword = projectSearch.trim().toLowerCase();

    if (!keyword) return projects;

    return projects.filter((project) => {
      const title = project.title?.toLowerCase() || "";
      const slug = project.slug?.toLowerCase() || "";
      const clientName = project.clientName?.toLowerCase() || "";
      const type = project.type?.toLowerCase() || "";
      const status = project.status?.toLowerCase() || "";

      return (
        title.includes(keyword) ||
        slug.includes(keyword) ||
        clientName.includes(keyword) ||
        type.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [projectSearch, projects]);

  const assigneeOptions = useMemo(() => {
    if (!selectedProject) return [];

    const assignedIds = Array.isArray(selectedProject.assignedTeamMembers)
      ? selectedProject.assignedTeamMembers.map((member) =>
          typeof member === "string" ? member : String(member._id)
        )
      : [];

    return allUsers.filter((user) => assignedIds.includes(String(user._id)));
  }, [selectedProject, allUsers]);

  const filteredAssignees = useMemo(() => {
    const keyword = assigneeSearch.trim().toLowerCase();

    if (!keyword) return assigneeOptions;

    return assigneeOptions.filter((user) => {
      const fullName = user.fullName?.toLowerCase() || "";
      const username = user.username?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      const role = user.role?.toLowerCase() || "";

      return (
        fullName.includes(keyword) ||
        username.includes(keyword) ||
        email.includes(keyword) ||
        role.includes(keyword)
      );
    });
  }, [assigneeSearch, assigneeOptions]);

  const selectedAssignee = useMemo(() => {
    return (
      assigneeOptions.find(
        (user) => (user.fullName || user.username || "") === formData.assignee
      ) || null
    );
  }, [assigneeOptions, formData.assignee]);

  const selectedTags = useMemo(() => {
    return formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [formData.tags]);

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

  const handleProjectSelect = (projectId) => {
    setFormData((prev) => ({
      ...prev,
      projectId,
      assignee: "",
    }));
    setProjectDropdownOpen(false);
    setProjectSearch("");
    setAssigneeSearch("");
  };

  const handleAssigneeSelect = (userName) => {
    setFormData((prev) => ({
      ...prev,
      assignee: userName,
    }));
    setAssigneeDropdownOpen(false);
    setAssigneeSearch("");
  };

  const addTag = (tag) => {
    const currentTags = formData.tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (currentTags.includes(tag)) return;

    const updatedTags = [...currentTags, tag].join(", ");

    setFormData((prev) => ({
      ...prev,
      tags: updatedTags,
    }));
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = formData.tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((tag) => tag !== tagToRemove)
      .join(", ");

    setFormData((prev) => ({
      ...prev,
      tags: updatedTags,
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

    if (!formData.title.trim()) {
      toast.error("Issue title is required");
      return;
    }

    if (files.length > 2) {
      toast.error("Maximum 2 files allowed");
      return;
    }

    try {
      setSubmitting(true);

      const uploadedAttachments = [];

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
  const sectionClass =
    "rounded-3xl border border-slate-200 bg-slate-50/70 p-5";
  const leftStackClass = "space-y-5";
  const rightStackClass = "space-y-5";

  if (authLoading || projectsLoading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Loading issue form...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="mx-auto max-w-5xl p-6">
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
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div className="rounded-3xl bg-white p-6 text-slate-800 shadow-sm lg:p-8">
        <h1 className="text-3xl font-bold text-slate-900">Add New Issue</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create a new issue with a cleaner workflow and better structure.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-3xl bg-white p-6 text-slate-800 shadow-sm lg:p-8"
      >
        <div className={sectionClass}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Issue Info</h3>
              <p className="mt-1 text-sm text-slate-500">
                Start with the issue title, project, status, and description.
              </p>
            </div>

            <div className="rounded-xl bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-700">
              Main
            </div>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
            <div className={leftStackClass}>
              <div>
                <label className={labelClass}>Issue Title *</label>
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

              <div ref={projectDropdownRef}>
                <label className={labelClass}>Project</label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setProjectDropdownOpen((prev) => !prev);
                      setAssigneeDropdownOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-300 bg-white px-4 py-3 text-left text-sm text-slate-900 shadow-sm transition hover:border-violet-300"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <FiFolder className="shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        {selectedProject ? (
                          <>
                            <p className="truncate font-medium text-slate-900">
                              {selectedProject.title}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {selectedProject.clientName || "No client"}
                              {selectedProject.type
                                ? ` • ${selectedProject.type}`
                                : ""}
                            </p>
                          </>
                        ) : (
                          <p className="text-slate-400">Select project</p>
                        )}
                      </div>
                    </div>

                    <FiChevronDown
                      className={`shrink-0 text-slate-400 transition ${
                        projectDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {projectDropdownOpen && (
                    <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                      <div className={inputWrap}>
                        <FiSearch className="text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search project..."
                          value={projectSearch}
                          onChange={(e) => setProjectSearch(e.target.value)}
                          className={inputClass}
                        />
                      </div>

                      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                        {filteredProjects.length === 0 ? (
                          <p className="rounded-xl px-3 py-2 text-sm text-slate-500">
                            No matching projects found.
                          </p>
                        ) : (
                          filteredProjects.map((project) => {
                            const isActive = formData.projectId === project._id;

                            return (
                              <button
                                key={project._id}
                                type="button"
                                onClick={() => handleProjectSelect(project._id)}
                                className={`w-full rounded-2xl border p-3 text-left transition ${
                                  isActive
                                    ? "border-violet-500 bg-violet-50"
                                    : "border-slate-200 hover:border-violet-300 hover:bg-slate-50"
                                }`}
                              >
                                <p className="font-medium text-slate-900">
                                  {project.title}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {project.clientName || "No client"}
                                  {project.type ? ` • ${project.type}` : ""}
                                </p>
                                {project.projectNumber && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    #P-{project.projectNumber}
                                  </p>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedProject?.projectNumber && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <FiHash />
                    Project Code: #P-{selectedProject.projectNumber}
                  </p>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
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
              </div>
            </div>

            <div className={rightStackClass}>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  placeholder="Write issue description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="12"
                  className={textareaClass}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={sectionClass}>
          <button
            type="button"
            onClick={() => setShowAssignmentDetails((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3"
          >
            <div className="text-left">
              <h3 className="text-xl font-bold text-slate-900">
                Assignment & Details
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Select assignee, reporter, tags, and internal note.
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
              {showAssignmentDetails ? <FiChevronUp /> : <FiChevronDown />}
            </div>
          </button>

          {showAssignmentDetails && (
            <div className="mt-5 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className={leftStackClass}>
                <div ref={assigneeDropdownRef}>
                  <label className={labelClass}>Assignee</label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedProject) {
                          toast.error("Please select a project first");
                          return;
                        }
                        setAssigneeDropdownOpen((prev) => !prev);
                        setProjectDropdownOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-300 bg-white px-4 py-3 text-left text-sm text-slate-900 shadow-sm transition hover:border-violet-300"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FiUsers className="shrink-0 text-slate-400" />
                        <div className="min-w-0">
                          {selectedAssignee ? (
                            <>
                              <p className="truncate font-medium text-slate-900">
                                {selectedAssignee.fullName ||
                                  selectedAssignee.username}
                              </p>
                              <p className="truncate text-xs text-slate-500 capitalize">
                                {selectedAssignee.role || "Team member"}
                              </p>
                            </>
                          ) : (
                            <p className="text-slate-400">Select assignee</p>
                          )}
                        </div>
                      </div>

                      <FiChevronDown
                        className={`shrink-0 text-slate-400 transition ${
                          assigneeDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {assigneeDropdownOpen && (
                      <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                        <div className={inputWrap}>
                          <FiSearch className="text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search assignee..."
                            value={assigneeSearch}
                            onChange={(e) => setAssigneeSearch(e.target.value)}
                            className={inputClass}
                          />
                        </div>

                        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                          {filteredAssignees.length === 0 ? (
                            <p className="rounded-xl px-3 py-2 text-sm text-slate-500">
                              No matching assignee found.
                            </p>
                          ) : (
                            filteredAssignees.map((user) => {
                              const userName =
                                user.fullName || user.username || "";
                              const isActive = formData.assignee === userName;

                              return (
                                <button
                                  key={user._id}
                                  type="button"
                                  onClick={() => handleAssigneeSelect(userName)}
                                  className={`w-full rounded-2xl border p-3 text-left transition ${
                                    isActive
                                      ? "border-violet-500 bg-violet-50"
                                      : "border-slate-200 hover:border-violet-300 hover:bg-slate-50"
                                  }`}
                                >
                                  <p className="font-medium text-slate-900">
                                    {userName}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {user.email || "No email"}
                                  </p>
                                  {user.role && (
                                    <p className="mt-1 text-xs capitalize text-slate-500">
                                      {user.role}
                                    </p>
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
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
              </div>

              <div className={rightStackClass}>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <FiTag className="text-slate-400" />
                    <h4 className="text-sm font-semibold text-slate-900">
                      Tags
                    </h4>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {COMMON_TAGS.map((tag) => {
                      const active = selectedTags.includes(tag);

                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            active
                              ? "bg-violet-100 text-violet-700"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <label className={labelClass}>Custom Tags</label>
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

                  {selectedTags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <div
                          key={tag}
                          className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="rounded-full text-violet-700 hover:text-red-600"
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Note</label>
                  <textarea
                    name="note"
                    placeholder="Write extra note"
                    value={formData.note}
                    onChange={handleChange}
                    rows="6"
                    className={textareaClass}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={sectionClass}>
          <button
            type="button"
            onClick={() => setShowAttachments((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3"
          >
            <div className="text-left">
              <h3 className="text-xl font-bold text-slate-900">Attachments</h3>
              <p className="mt-1 text-sm text-slate-500">
                Add up to 2 files. Supports image and PDF.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-100 px-3 py-2 text-sm font-medium text-violet-700">
                {files.length}/2
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                {showAttachments ? <FiChevronUp /> : <FiChevronDown />}
              </div>
            </div>
          </button>

          {showAttachments && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FiPaperclip className="text-slate-400" />
                <span>Upload JPG, PNG, WEBP, or PDF</span>
              </div>

              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
                className="mt-4 block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-violet-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-200"
              />

              <p className="mt-2 text-xs text-slate-500">Maximum 2 files.</p>

              {files.length > 0 ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-start justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                          <FiFileText />
                        </div>

                        <div className="min-w-0">
                          <p className="line-clamp-1 font-medium text-slate-700">
                            {file.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {Math.round(file.size / 1024)} KB
                          </p>
                        </div>
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
              ) : (
                <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                  No files selected yet
                </div>
              )}
            </div>
          )}
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