"use client";

import { FiUser, FiMail, FiShield, FiFolder } from "react-icons/fi";

export default function MyProfileTab({ user, assignedProjects = [] }) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
        <p className="mt-2 text-sm text-slate-500">
          Manage your personal account information and assigned projects.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Account Info</h3>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <FiUser className="text-slate-500" />
              <div>
                <p className="text-xs text-slate-400">Name</p>
                <p className="text-sm font-medium text-slate-800">
                  {user?.name || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <FiMail className="text-slate-500" />
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm font-medium text-slate-800">
                  {user?.email || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <FiShield className="text-slate-500" />
              <div>
                <p className="text-xs text-slate-400">Role</p>
                <p className="text-sm font-medium uppercase text-slate-800">
                  {user?.role || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <FiFolder className="text-slate-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Assigned Projects
            </h3>
          </div>

          <div className="mt-5">
            {assignedProjects.length > 0 ? (
              <div className="space-y-3">
                {assignedProjects.map((project, index) => (
                  <div
                    key={project._id || index}
                    className="rounded-2xl border border-slate-200 px-4 py-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {project.title || "Project"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {project.slug || "No slug found"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No assigned projects found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}