"use client";

export default function MyTasksTab() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">My Tasks</h2>

      <p className="mt-2 text-sm text-slate-500">
        Your assigned issues will appear here.
      </p>

      <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
        🚧 This section is under development.  
        Task list and filters will be added here later.
      </div>
    </div>
  );
}