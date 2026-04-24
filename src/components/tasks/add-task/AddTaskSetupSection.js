"use client";

import {
  FiBriefcase,
  FiCheckCircle,
  FiChevronDown,
  FiEdit3,
  FiFlag,
  FiFolder,
  FiSearch,
  FiUser,
} from "react-icons/fi";

export default function AddTaskSetupSection({
  fixedProjectId,
  isClient,
  currentUser,
  formData,
  setFormData,
  selectedProject,
  projectTeamNames,
  allowedProjects,
  filteredProjects,
  projectDropdownOpen,
  setProjectDropdownOpen,
  projectDropdownRef,
  projectSearch,
  setProjectSearch,
  handleChange,
  handleProjectSelect,
  userNameMap,
  inputWrap,
  inputClass,
  textareaClass,
  labelClass,
  sectionClass,
  leftStackClass,
  rightStackClass,
}) {
  return (
    <div className={sectionClass}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white">Task Setup</h3>
          <p className="mt-1 text-sm text-white/50">
            Start with the task title, type, project, and description.
          </p>
        </div>

        <div className="rounded-full bg-violet-400/15 px-3 py-2 text-xs font-bold text-violet-300">
          Main
        </div>
      </div>

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[1fr_1.05fr]">
        <div className={leftStackClass}>
          <div>
            <label className={labelClass}>Task Title *</label>
            <div className={inputWrap}>
              <FiEdit3 className="text-white/40" />
              <input
                type="text"
                name="title"
                placeholder="Enter task title"
                value={formData.title}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </div>

          {!fixedProjectId && !isClient && (
            <div>
              <label className={labelClass}>Task Type</label>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      type: "individual",
                      projectId: "",
                      assignedTo: currentUser?._id || "",
                    }))
                  }
                  className={`rounded-[16px] border p-4 text-left text-white transition ${
                    formData.type === "individual"
                      ? "border-violet-400 bg-violet-400/15"
                      : "border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${
                        formData.type === "individual"
                          ? "bg-violet-400/15 text-violet-300"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      <FiUser />
                    </div>

                    <div>
                      <p className="font-bold text-white">Individual Task</p>
                      <p className="mt-1 text-xs leading-5 text-white/50">
                        Personal or internal task. Default assignee is for me.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      type: "project",
                      assignedTo: "",
                    }))
                  }
                  className={`rounded-[16px] border p-4 text-left text-white transition ${
                    formData.type === "project"
                      ? "border-violet-400 bg-violet-400/15"
                      : "border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${
                        formData.type === "project"
                          ? "bg-violet-400/15 text-violet-300"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      <FiBriefcase />
                    </div>

                    <div>
                      <p className="font-bold text-white">Project Task</p>
                      <p className="mt-1 text-xs leading-5 text-white/50">
                        Linked to a project and assigned from current project
                        team.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {formData.type === "project" && (
            <div ref={projectDropdownRef}>
              <label className={labelClass}>Project</label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProjectDropdownOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-[14px] border border-white/10 bg-white/[0.07] px-4 py-3 text-left text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={!!fixedProjectId}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FiFolder className="shrink-0 text-white/40" />
                    <div className="min-w-0">
                      {selectedProject ? (
                        <>
                          <p className="truncate font-bold text-white">
                            {selectedProject.title}
                          </p>
                          <p className="truncate text-xs text-white/50">
                            {selectedProject.clientName || "No client"}
                            {selectedProject.type
                              ? ` • ${selectedProject.type}`
                              : ""}
                          </p>
                          {projectTeamNames.length > 0 && (
                            <p className="truncate text-xs text-white/50">
                              Team: {projectTeamNames.join(", ")}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-white/40">Select project</p>
                      )}
                    </div>
                  </div>

                  {!fixedProjectId && (
                    <FiChevronDown
                      className={`shrink-0 text-white/40 transition ${
                        projectDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {projectDropdownOpen && !fixedProjectId && (
                  <div className="absolute z-30 mt-2 w-full rounded-[16px] border border-white/10 bg-slate-950 p-3 shadow-xl">
                    <div className={inputWrap}>
                      <FiSearch className="text-white/40" />
                      <input
                        type="text"
                        placeholder="Search project..."
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
                      {filteredProjects.length === 0 ? (
                        <p className="rounded-[14px] px-3 py-2 text-sm text-white/45">
                          No matching projects found.
                        </p>
                      ) : (
                        filteredProjects.map((project) => {
                          const isActive =
                            String(formData.projectId) === String(project._id);

                          const teamNames = (
                            project.assignedTeamMembers || []
                          )
                            .map((member) => {
                              const memberId =
                                typeof member === "string"
                                  ? member
                                  : String(member?._id);
                              return userNameMap[memberId];
                            })
                            .filter(Boolean);

                          return (
                            <button
                              key={project._id}
                              type="button"
                              onClick={() => handleProjectSelect(project._id)}
                              className={`w-full rounded-[14px] border p-3 text-left transition ${
                                isActive
                                  ? "border-violet-400 bg-violet-400/15"
                                  : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                              }`}
                            >
                              <p className="font-bold text-white">
                                {project.title}
                              </p>
                              <p className="mt-1 text-xs text-white/50">
                                {project.clientName || "No client"}
                                {project.type ? ` • ${project.type}` : ""}
                              </p>
                              <p className="mt-1 text-xs text-white/50">
                                Team:{" "}
                                {teamNames.length > 0
                                  ? teamNames.join(", ")
                                  : "No team assigned yet"}
                              </p>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {formData.type === "project" && selectedProject && (
                <p className="mt-2 text-xs text-white/45">
                  Team members in this project: {projectTeamNames.length}
                </p>
              )}

              {formData.type === "project" &&
                !selectedProject &&
                allowedProjects.length === 0 && (
                  <p className="mt-2 text-xs text-amber-300">
                    No available project found for this user.
                  </p>
                )}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Status</label>
              <div className={inputWrap}>
                <FiCheckCircle className="text-white/40" />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none"
                >
                  <option className="bg-white text-slate-900" value="todo">
                    To Do
                  </option>
                  <option
                    className="bg-white text-slate-900"
                    value="in-progress"
                  >
                    In Progress
                  </option>
                  <option
                    className="bg-white text-slate-900"
                    value="in-review"
                  >
                    In Review
                  </option>
                  <option className="bg-white text-slate-900" value="done">
                    Done
                  </option>
                  <option className="bg-white text-slate-900" value="blocked">
                    Blocked
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Priority</label>
              <div className={inputWrap}>
                <FiFlag className="text-white/40" />
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none"
                >
                  <option className="bg-white text-slate-900" value="low">
                    Low
                  </option>
                  <option className="bg-white text-slate-900" value="medium">
                    Medium
                  </option>
                  <option className="bg-white text-slate-900" value="high">
                    High
                  </option>
                  <option className="bg-white text-slate-900" value="urgent">
                    Urgent
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className={rightStackClass}>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              placeholder="Write task description"
              value={formData.description}
              onChange={handleChange}
              rows="10"
              className={textareaClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}