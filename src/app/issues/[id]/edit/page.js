"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditIssuePage() {
  const params = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Open",
    priority: "Medium",
    assignee: "",
    reporter: "",
    note: "",
    tags: "",
  });

  useEffect(() => {
    async function fetchIssue() {
      const res = await fetch(`/api/issues/${params.id}`);
      const data = await res.json();

      setFormData({
        title: data.title || "",
        description: data.description || "",
        status: data.status || "Open",
        priority: data.priority || "Medium",
        assignee: data.assignee || "",
        reporter: data.reporter || "",
        note: data.note || "",
        tags: data.tags?.join(", ") || "",
      });
    }

    if (params.id) {
      fetchIssue();
    }
  }, [params.id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/issues/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }),
    });

    if (res.ok) {
      router.push("/issues");
      router.refresh();
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Edit Issue</h1>

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
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-lg bg-white/5 p-3 outline-none"
          rows="4"
        />

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

        <input
          type="text"
          name="tags"
          placeholder="bug, ui, urgent"
          value={formData.tags}
          onChange={handleChange}
          className="w-full rounded-lg bg-white/5 p-3 outline-none"
        />

        <textarea
          name="note"
          placeholder="Admin note"
          value={formData.note}
          onChange={handleChange}
          className="w-full rounded-lg bg-white/5 p-3 outline-none"
          rows="3"
        />

        <button className="rounded-lg bg-blue-600 px-5 py-3 font-medium">
          Update Issue
        </button>
      </form>
    </div>
  );
}