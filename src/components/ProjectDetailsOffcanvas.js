"use client";

import {
  FiX,
  FiGlobe,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiUsers,
  FiBriefcase,
} from "react-icons/fi";

function getStatusClass(status) {
  if (status === "In Progress") return "bg-yellow-100 text-yellow-700";
  if (status === "Complete") return "bg-green-100 text-green-700";
  if (status === "Cancel") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

function getRoleClass(role) {
  if (role === "admin") return "bg-red-100 text-red-700";
  if (role === "project-manager") return "bg-violet-100 text-violet-700";
  if (role === "employee") return "bg-blue-100 text-blue-700";
  if (role === "client") return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-700";
}

export default function ProjectDetailsOffcanvas({
  project,
  open,
  onClose,
}) {
  const imageUrl =
    project.image?.trim() ||
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80";

  const assignedTeamMembers = Array.isArray(project.assignedTeamMembers)
    ? project.assignedTeamMembers
    : [];

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
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Project Details
            </h2>
            <p className="text-sm text-slate-500">
              Project #{project.projectNumber || "N/A"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border p-2 text-slate-600 transition hover:bg-slate-100"
          >
            <FiX />
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
              {project.status}
            </span>

            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              {project.type || "Other"}
            </span>

            {project.projectPhase && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {project.projectPhase}
              </span>
            )}
          </div>

          <h3 className="text-2xl font-bold text-slate-900">{project.title}</h3>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            {project.details || "No details added yet."}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoCard
              icon={<FiUser />}
              label="Client"
              value={project.clientName || "N/A"}
            />

            <InfoCard
              icon={<FiGlobe />}
              label="Country"
              value={project.country || "N/A"}
            />

            <InfoCard
              icon={<FiDollarSign />}
              label="Budget"
              value={`$${project.value || 0}`}
            />

            <InfoCard
              icon={<FiGlobe />}
              label="Website"
              value={project.website || "N/A"}
            />

            <InfoCard
              icon={<FiCalendar />}
              label="Start Date"
              value={
                project.startDate
                  ? new Date(project.startDate).toLocaleDateString("en-GB")
                  : "N/A"
              }
            />

            <InfoCard
              icon={<FiCalendar />}
              label="Completion Date"
              value={
                project.completeDate
                  ? new Date(project.completeDate).toLocaleDateString("en-GB")
                  : "N/A"
              }
            />

            <InfoCard
              icon={<FiCalendar />}
              label="Estimated Time"
              value={project.estimatedTime || "N/A"}
            />

            <InfoCard
              icon={<FiCalendar />}
              label="Payment Status"
              value={project.paymentStatus || "Pending"}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <FiUsers />
              <p className="text-xs font-semibold uppercase">Assigned Team</p>
            </div>

            {assignedTeamMembers.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No team members assigned yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {assignedTeamMembers.map((member, index) => {
                  const memberName =
                    member?.fullName || member?.username || "Unknown User";
                  const memberRole = member?.role || "member";
                  const memberImage = member?.image || "";

                  return (
                    <div
                      key={member?._id || index}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-violet-100 text-violet-700">
                        {memberImage ? (
                          <img
                            src={memberImage}
                            alt={memberName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FiBriefcase />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-900">
                          {memberName}
                        </p>
                        <p className="truncate text-sm text-slate-500">
                          {member?.email || member?.username || "No contact info"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getRoleClass(memberRole)}`}
                      >
                        {memberRole}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
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

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <p className="text-xs font-semibold uppercase">{label}</p>
      </div>
      <p className="mt-2 break-words text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}