"use client";

import {
  FiUser,
  FiMail,
  FiShield,
  FiFolder,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiInfo,
} from "react-icons/fi";

const boardCard =
  "rounded-[20px] border border-white/10 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm";

const innerCard =
  "rounded-[16px] border border-white/10 bg-white/[0.07] backdrop-blur-md";

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className={`${innerCard} flex items-center gap-3 px-4 py-3`}>
      <Icon className="text-white/45" />
      <div>
        <p className="text-xs text-white/45">{label}</p>
        <p className="text-sm font-bold text-white">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

export default function MyProfileTab({ user, assignedProjects = [] }) {
  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className={`${boardCard} p-5`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">
          Account Center
        </p>

        <h2 className="mt-2 text-2xl font-bold">My Profile</h2>

        <p className="mt-1 text-sm text-white/55">
          View and manage your complete profile information.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="space-y-4">
          {/* ACCOUNT INFO */}
          <div className={`${boardCard} p-5`}>
            <h3 className="text-lg font-bold">Account Info</h3>

            <div className="mt-5 space-y-3">
              <InfoItem
                icon={FiUser}
                label="Full Name"
                value={user?.fullName || user?.name || user?.username}
              />

              <InfoItem icon={FiMail} label="Email" value={user?.email} />

              <InfoItem icon={FiShield} label="Role" value={user?.role} />

              <InfoItem
                icon={FiInfo}
                label="Username"
                value={user?.username}
              />
            </div>
          </div>

          {/* CONTACT INFO */}
          <div className={`${boardCard} p-5`}>
            <h3 className="text-lg font-bold">Contact Info</h3>

            <div className="mt-5 space-y-3">
              <InfoItem icon={FiPhone} label="Phone" value={user?.phone} />

              <InfoItem
                icon={FiMapPin}
                label="Address"
                value={user?.address}
              />

              <InfoItem
                icon={FiGlobe}
                label="Website"
                value={user?.website}
              />
            </div>
          </div>

          {/* EXTRA INFO */}
          <div className={`${boardCard} p-5`}>
            <h3 className="text-lg font-bold">Additional Info</h3>

            <div className="mt-5 space-y-3">
              <InfoItem
                icon={FiUser}
                label="Company"
                value={user?.company}
              />

              <InfoItem
                icon={FiInfo}
                label="Bio"
                value={user?.bio}
              />

              <InfoItem
                icon={FiInfo}
                label="Created At"
                value={
                  user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : ""
                }
              />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">
          {/* PROJECTS */}
          <div className={`${boardCard} p-5`}>
            <div className="flex items-center gap-2">
              <FiFolder className="text-white/45" />
              <h3 className="text-lg font-bold">Assigned Projects</h3>
            </div>

            <div className="mt-5">
              {assignedProjects.length > 0 ? (
                <div className="space-y-3">
                  {assignedProjects.map((project, index) => (
                    <div
                      key={project._id || index}
                      className={`${innerCard} px-4 py-4`}
                    >
                      <p className="font-bold text-white">
                        {project.title || "Project"}
                      </p>

                      <p className="mt-1 text-sm text-white/50">
                        {project.slug || "No slug"}
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        {project.status || "No status"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[16px] border border-dashed border-white/15 bg-white/[0.04] px-4 py-8 text-center text-sm text-white/55">
                  No assigned projects found.
                </div>
              )}
            </div>
          </div>

          {/* ROLE-BASED EXTRA */}
          {user?.role === "client" && (
            <div className={`${boardCard} p-5`}>
              <h3 className="text-lg font-bold">Client Info</h3>

              <div className="mt-5 space-y-3">
                <InfoItem
                  icon={FiUser}
                  label="Company Name"
                  value={user?.companyName}
                />

                <InfoItem
                  icon={FiMail}
                  label="Contact Person"
                  value={user?.contactPerson}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}