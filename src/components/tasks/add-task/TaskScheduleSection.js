"use client";

import {
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
} from "react-icons/fi";

export default function TaskScheduleSection({
  formData,
  selectedProject,
  showTimelineNote,
  setShowTimelineNote,
  handleChange,
  textareaClass,
  labelClass,
  sectionClass,
  leftStackClass,
  rightStackClass,
  inputWrap,
  inputClass,
}) {
  return (
    <div className={sectionClass}>
      <button
        type="button"
        onClick={() => setShowTimelineNote((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3"
      >
        <div className="text-left">
          <h3 className="text-xl font-bold text-white">Schedule & Notes</h3>
          <p className="mt-1 text-sm text-white/50">
            Set due date and add internal note for better tracking.
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/10 text-white/70">
          {showTimelineNote ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </button>

      {showTimelineNote && (
        <div className="mt-5 grid items-start gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className={leftStackClass}>
            <div>
              <label className={labelClass}>Due Date</label>
              <div className={inputWrap}>
                <FiCalendar className="text-white/40" />
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="rounded-[16px] border border-white/10 bg-white/[0.07] p-4">
              <div className="flex items-center gap-2">
                <FiFileText className="text-white/40" />
                <h4 className="text-sm font-bold text-white">
                  Quick Summary
                </h4>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/45">Type</span>
                  <span className="font-bold capitalize text-white">
                    {formData.type}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/45">Status</span>
                  <span className="font-bold capitalize text-white">
                    {formData.status.replace("-", " ")}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/45">Priority</span>
                  <span className="font-bold capitalize text-white">
                    {formData.priority}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/45">Project</span>
                  <span className="truncate font-bold text-white">
                    {selectedProject?.title || "Not linked"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={rightStackClass}>
            <div>
              <label className={labelClass}>Note</label>
              <textarea
                name="note"
                placeholder="Write internal task note"
                value={formData.note}
                onChange={handleChange}
                rows="8"
                className={textareaClass}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}