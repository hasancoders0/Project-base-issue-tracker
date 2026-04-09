"use client";

import { useEffect, useState } from "react";

export default function NewIssuePage() {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    priority: "Medium",
    status: "Open",
    assignee: "",
    reporter: "",
  });

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, projectId: data[0]._id }));
        }
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/issues", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("Issue created");
      setFormData({
        title: "",
        description: "",
        projectId: projects[0]?._id || "",
        priority: "Medium",
        status: "Open",
        assignee: "",
        reporter: "",
      });
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Add New Issue</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Issue title"
          value={formData.title}
          onChange={handleChange}
          className="w-full rounded-lg bg-white/5 p-3 outline-none"
          required
        />

        <textarea
          name="description"
          placeholder="Issue description"
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-lg bg-white/5 p-3 outline-none"
          rows="4"
        />

        <select
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          className="w-full rounded-lg bg-white/5 p-3 outline-none"
          required
        >
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.title}
            </option>
          ))}
        </select>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full rounded-lg bg-white/5 p-3 outline-none"
        >
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full rounded-lg bg-white/5 p-3 outline-none"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <input
          type="text"
          name="assignee"
          placeholder="Assignee"
          value={formData.assignee}
          onChange={handleChange}
          className="w-full rounded-lg bg-white/5 p-3 outline-none"
        />

        <input
          type="text"
          name="reporter"
          placeholder="Reporter"
          value={formData.reporter}
          onChange={handleChange}
          className="w-full rounded-lg bg-white/5 p-3 outline-none"
        />

        <button className="rounded-lg bg-blue-600 px-5 py-3 font-medium">
          Create Issue
        </button>
      </form>
    </div>
  );
}