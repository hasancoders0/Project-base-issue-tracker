"use client";

function getStatusClass(status) {
  if (status === "In Progress") return "bg-yellow-100 text-yellow-700";
  if (status === "Complete") return "bg-green-100 text-green-700";
  if (status === "Cancel") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

export default function ProjectDetailsOffcanvas({
  project,
  open,
  onClose,
}) {
  const imageUrl =
    project.image?.trim() ||
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80";

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto bg-white text-slate-800 shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/90 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="text-xl font-bold">Project Details</h2>
            <p className="text-sm text-slate-500">
              Project #{project.projectNumber || "N/A"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="p-6">
          <img
            src={imageUrl}
            alt={project.title}
            className="mb-6 h-52 w-full rounded-2xl object-cover"
          />

          <div className="mb-4 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(project.status)}`}
            >
              {project.status || "N/A"}
            </span>

            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              {project.type || "Other"}
            </span>
          </div>

          <h3 className="text-2xl font-bold">{project.title}</h3>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            {project.details || "No details added yet."}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Client Name
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">
                {project.clientName || "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Country
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">
                {project.country || "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Value
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">
                ${project.value || 0}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Website
              </p>
              <p className="mt-2 break-all text-sm font-medium text-slate-700">
                {project.website || "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Start Date
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">
                {project.startDate
                  ? new Date(project.startDate).toLocaleDateString("en-GB")
                  : "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Complete Date
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">
                {project.completeDate
                  ? new Date(project.completeDate).toLocaleDateString("en-GB")
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Admin Note
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {project.note || "No note added yet."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}