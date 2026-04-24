"use client";

import toast from "react-hot-toast";
import {
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiSearch,
  FiUser,
  FiUsers,
} from "react-icons/fi";

export default function TaskAssignmentSection({
  formData,
  currentUser,
  selectedProject,
  selectedAssignee,
  projectTeamUsers,
  filteredAssignees,
  usersLoading,
  showAssignmentDetails,
  setShowAssignmentDetails,
  assigneeDropdownOpen,
  setAssigneeDropdownOpen,
  setProjectDropdownOpen,
  assigneeSearch,
  setAssigneeSearch,
  handleAssigneeSelect,
  assigneeDropdownRef,
  inputWrap,
  inputClass,
  labelClass,
  sectionClass,
  leftStackClass,
  rightStackClass,
}) {
  const isProjectTask = formData.type === "project";
  const canOpenAssigneeList =
    formData.type === "individual" || (isProjectTask && selectedProject);

  return (
    <div className={sectionClass}>
      <button
        type="button"
        onClick={() => setShowAssignmentDetails((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3"
      >
        <div className="text-left">
          <h3 className="text-xl font-bold text-white">Assignment</h3>
          <p className="mt-1 text-sm text-white/50">
            Select the assignee and review task ownership.
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/10 text-white/70">
          {showAssignmentDetails ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </button>

      {showAssignmentDetails && (
        <div className="mt-5 grid items-start gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className={leftStackClass}>
            <div ref={assigneeDropdownRef}>
              <label className={labelClass}>Assign To</label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (!canOpenAssigneeList) {
                      toast.error("Please select a project first");
                      return;
                    }

                    setAssigneeDropdownOpen((prev) => !prev);
                    setProjectDropdownOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-[14px] border border-white/10 bg-white/[0.07] px-4 py-3 text-left text-sm text-white transition hover:bg-white/10"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FiUsers className="shrink-0 text-white/40" />

                    <div className="min-w-0">
                      {selectedAssignee ? (
                        <>
                          <p className="truncate font-bold text-white">
                            {String(selectedAssignee._id) ===
                            String(currentUser?._id)
                              ? "For me"
                              : selectedAssignee.fullName ||
                                selectedAssignee.name ||
                                selectedAssignee.username ||
                                "Unknown User"}
                          </p>

                          <p className="truncate text-xs capitalize text-white/50">
                            {selectedAssignee.role || "Team member"}
                          </p>
                        </>
                      ) : formData.type === "individual" ? (
                        <>
                          <p className="truncate font-bold text-white">
                            For me
                          </p>

                          <p className="truncate text-xs capitalize text-white/50">
                            {currentUser?.role || "user"}
                          </p>
                        </>
                      ) : (
                        <p className="text-white/40">Select assignee</p>
                      )}
                    </div>
                  </div>

                  <FiChevronDown
                    className={`shrink-0 text-white/40 transition ${
                      assigneeDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {assigneeDropdownOpen && (
                  <div className="absolute z-30 mt-2 w-full rounded-[16px] border border-white/10 bg-slate-950 p-3 shadow-xl">
                    <div className={inputWrap}>
                      <FiSearch className="text-white/40" />

                      <input
                        type="text"
                        placeholder="Search assignee..."
                        value={assigneeSearch}
                        onChange={(e) => setAssigneeSearch(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                      {usersLoading ? (
                        <p className="rounded-[14px] px-3 py-2 text-sm text-white/45">
                          Loading assignees...
                        </p>
                      ) : filteredAssignees.length === 0 ? (
                        <p className="rounded-[14px] px-3 py-2 text-sm text-white/45">
                          No matching assignee found.
                        </p>
                      ) : (
                        filteredAssignees.map((user) => {
                          const isActive =
                            String(formData.assignedTo) === String(user._id);

                          return (
                            <button
                              key={String(user._id)}
                              type="button"
                              onClick={() =>
                                handleAssigneeSelect(String(user._id))
                              }
                              className={`w-full rounded-[14px] border p-3 text-left transition ${
                                isActive
                                  ? "border-violet-400 bg-violet-400/15"
                                  : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                              }`}
                            >
                              <p className="font-bold text-white">
                                {String(user._id) === String(currentUser?._id)
                                  ? "For me"
                                  : user.fullName ||
                                    user.name ||
                                    user.username ||
                                    "Unknown User"}
                              </p>

                              <p className="mt-1 text-xs text-white/50">
                                {user.email || "No email"}
                              </p>

                              {user.role && (
                                <p className="mt-1 text-xs capitalize text-white/50">
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

            <div className="rounded-[16px] border border-white/10 bg-white/[0.07] p-4">
              <div className="flex items-center gap-2">
                <FiFileText className="text-white/40" />
                <h4 className="text-sm font-bold text-white">
                  Assignment Hint
                </h4>
              </div>

              <div className="mt-3 space-y-2 text-sm leading-6 text-white/55">
                {formData.type === "project" ? (
                  <>
                    <p>
                      Project task assignee list depends on the selected project
                      and current role permissions.
                    </p>
                    <p>
                      {projectTeamUsers.length === 0
                        ? "No assignable users are available for this project."
                        : "Choose one person from the list above."}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Individual task usually defaults to{" "}
                      <span className="font-bold text-white">For me</span>.
                    </p>
                    <p>You can reassign it if your role permissions allow.</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={rightStackClass}>
            <div className="rounded-[16px] border border-white/10 bg-white/[0.07] p-4">
              <div className="flex items-center gap-2">
                <FiUser className="text-white/40" />
                <h4 className="text-sm font-bold text-white">
                  Task Ownership
                </h4>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-[14px] bg-white/10 p-4">
                  <p className="text-xs text-white/45">Created By</p>
                  <p className="mt-1 font-bold text-white">
                    {currentUser?.fullName ||
                      currentUser?.name ||
                      currentUser?.username ||
                      "Unknown"}
                  </p>
                  <p className="mt-1 text-xs capitalize text-white/45">
                    {currentUser?.role || "user"}
                  </p>
                </div>

                <div className="rounded-[14px] bg-white/10 p-4">
                  <p className="text-xs text-white/45">Assigned To</p>
                  <p className="mt-1 font-bold text-white">
                    {selectedAssignee
                      ? String(selectedAssignee._id) === String(currentUser?._id)
                        ? "For me"
                        : selectedAssignee.fullName ||
                          selectedAssignee.name ||
                          selectedAssignee.username ||
                          "Unknown User"
                      : formData.type === "individual"
                      ? "For me"
                      : "Not selected"}
                  </p>
                  <p className="mt-1 text-xs capitalize text-white/45">
                    {selectedAssignee?.role ||
                      (formData.type === "individual"
                        ? currentUser?.role || "user"
                        : "No assignee yet")}
                  </p>
                </div>

                <div className="rounded-[14px] bg-white/10 p-4">
                  <p className="text-xs text-white/45">Task Scope</p>
                  <p className="mt-1 font-bold text-white">
                    {formData.type === "project"
                      ? selectedProject?.title || "Project task"
                      : "Individual task"}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    {formData.type === "project"
                      ? "Visible inside the related project workflow"
                      : "Used for internal or personal work"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}