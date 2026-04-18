"use client";

export default function TodoTab() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">ToDo List</h2>

      <p className="mt-2 text-sm text-slate-500">
        Manage your personal tasks here.
      </p>

      <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
        🚧 This section is under development.  
        Add / remove tasks feature coming next.
      </div>
    </div>
  );
}