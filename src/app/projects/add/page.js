"use client";

import { useState } from "react";

export default function AddProject() {
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        clientName,
      }),
    });

    const data = await res.json();
    alert("Project Created!");
    console.log(data);

    setTitle("");
    setClientName("");
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add Project</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Project Title"
          className="w-full p-2 rounded bg-gray-800"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Client Name"
          className="w-full p-2 rounded bg-gray-800"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />

        <button className="bg-blue-600 px-4 py-2 rounded">
          Create Project
        </button>
      </form>
    </div>
  );
}