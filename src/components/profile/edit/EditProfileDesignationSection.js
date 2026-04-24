"use client";

import { FiBriefcase, FiChevronDown, FiPlus, FiX } from "react-icons/fi";

const DESIGNATION_GROUPS = {
  leadership: {
    title: "Management & Leadership",
    items: [
      "CEO (Chief Executive Officer)",
      "CTO (Chief Technology Officer)",
      "COO (Chief Operating Officer)",
      "VP of Engineering",
      "Engineering Manager",
      "Project Manager",
      "Product Manager",
      "Delivery Manager",
    ],
  },
  development: {
    title: "Development Team",
    items: [
      "Software Engineer",
      "Junior Software Developer",
      "Senior Software Developer",
      "Full Stack Developer",
      "Frontend Developer",
      "Backend Developer",
      "Mobile App Developer",
      "DevOps Engineer",
    ],
  },
  design: {
    title: "Design Team",
    items: [
      "UI Designer",
      "UX Designer",
      "Product Designer",
      "Graphic Designer",
    ],
  },
  qa: {
    title: "Quality Assurance (QA)",
    items: [
      "QA Engineer",
      "Software Tester",
      "Automation Test Engineer",
      "QA Lead",
    ],
  },
  productBusiness: {
    title: "Product & Business",
    items: ["Business Analyst", "Product Owner", "Scrum Master"],
  },
  support: {
    title: "Support & Operations",
    items: [
      "Technical Support Engineer",
      "System Administrator",
      "Network Engineer",
      "IT Support Specialist",
    ],
  },
  sales: {
    title: "Sales & Marketing",
    items: [
      "Sales Executive",
      "Digital Marketing Specialist",
      "SEO Specialist",
      "Content Writer",
      "Marketing Manager",
    ],
  },
  client: {
    title: "Client & Account Management",
    items: [
      "Account Manager",
      "Client Success Manager",
      "Customer Support Executive",
    ],
  },
  hr: {
    title: "HR & Admin",
    items: ["HR Manager", "Recruiter", "Office Administrator"],
  },
};

const ROLE_CATEGORY_MAP = {
  admin: [
    "leadership",
    "development",
    "design",
    "qa",
    "productBusiness",
    "support",
    "sales",
    "client",
    "hr",
  ],
  "project-manager": [
    "leadership",
    "productBusiness",
    "client",
    "development",
  ],
  employee: [
    "development",
    "design",
    "qa",
    "productBusiness",
    "support",
    "sales",
    "hr",
  ],
  client: [],
};

export default function EditProfileDesignationSection({
  role,
  formData,
  setFormData,
}) {
  const selectedDesignations = Array.isArray(formData.designations)
    ? formData.designations
    : [];

  const customDesignation = formData.customDesignation || "";
  const canUseDesignation =
    role === "admin" || role === "project-manager" || role === "employee";

  const visibleCategoryKeys = ROLE_CATEGORY_MAP[role] || [];
  const visibleGroups = visibleCategoryKeys.map((key) => ({
    key,
    ...DESIGNATION_GROUPS[key],
  }));

  const inputWrap =
    "flex items-center rounded-2xl border border-slate-300 bg-white px-3 shadow-sm transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100";
  const inputClass =
    "w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400";

  const handleToggleDesignation = (designation) => {
    if (!designation) return;

    const alreadySelected = selectedDesignations.includes(designation);

    if (alreadySelected) {
      setFormData((prev) => ({
        ...prev,
        designations: prev.designations.filter((item) => item !== designation),
      }));
      return;
    }

    if (selectedDesignations.length >= 5) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      designations: [...prev.designations, designation],
    }));
  };

  const handleRemoveDesignation = (designation) => {
    setFormData((prev) => ({
      ...prev,
      designations: prev.designations.filter((item) => item !== designation),
    }));
  };

  const handleCustomDesignationAdd = () => {
    const cleanedValue = customDesignation.trim();

    if (!cleanedValue) return;

    if (selectedDesignations.includes(cleanedValue)) {
      setFormData((prev) => ({
        ...prev,
        customDesignation: "",
      }));
      return;
    }

    if (selectedDesignations.length >= 5) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      designations: [...prev.designations, cleanedValue],
      customDesignation: "",
    }));
  };

  if (!canUseDesignation) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Designation</h3>
          <p className="text-sm text-slate-500">
            Select up to 5 designations for this user.
          </p>
        </div>

        <div className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
          {selectedDesignations.length}/5 selected
        </div>
      </div>

      {selectedDesignations.length > 0 && (
        <div className="mt-5">
          <div className="flex flex-wrap gap-2.5">
            {selectedDesignations.map((designation) => (
              <div
                key={designation}
                className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700"
              >
                <span>{designation}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDesignation(designation)}
                  className="rounded-full p-0.5 text-violet-500 transition hover:bg-violet-100 hover:text-violet-700"
                  aria-label={`Remove ${designation}`}
                >
                  <FiX size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {visibleGroups.map((group) => {
          const selectedInGroup = group.items.filter((item) =>
            selectedDesignations.includes(item),
          ).length;

          return (
            <details
              key={group.key}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {group.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {group.items.length} options
                    {selectedInGroup > 0 ? ` • ${selectedInGroup} selected` : ""}
                  </p>
                </div>

                <FiChevronDown className="shrink-0 text-slate-400 transition group-open:rotate-180" />
              </summary>

              <div className="border-t border-slate-100 px-4 py-4">
                <div className="flex flex-wrap gap-2.5">
                  {group.items.map((designation) => {
                    const isSelected =
                      selectedDesignations.includes(designation);
                    const isDisabled =
                      !isSelected && selectedDesignations.length >= 5;

                    return (
                      <button
                        key={designation}
                        type="button"
                        onClick={() => handleToggleDesignation(designation)}
                        disabled={isDisabled}
                        className={[
                          "rounded-full border px-3 py-2 text-xs font-medium transition",
                          isSelected
                            ? "border-violet-600 bg-violet-600 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-violet-300 hover:text-violet-700",
                          isDisabled ? "cursor-not-allowed opacity-50" : "",
                        ].join(" ")}
                      >
                        {designation}
                      </button>
                    );
                  })}
                </div>
              </div>
            </details>
          );
        })}

        <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Custom Designation
              </p>
              <p className="text-xs text-slate-500">
                Add a designation not listed above
              </p>
            </div>

            <FiChevronDown className="shrink-0 text-slate-400 transition group-open:rotate-180" />
          </summary>

          <div className="border-t border-slate-100 px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className={`${inputWrap} flex-1`}>
                <FiBriefcase className="text-slate-400" />
                <input
                  type="text"
                  value={customDesignation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customDesignation: e.target.value,
                    }))
                  }
                  placeholder="Enter custom designation"
                  className={inputClass}
                />
              </div>

              <button
                type="button"
                onClick={handleCustomDesignationAdd}
                disabled={
                  !customDesignation.trim() || selectedDesignations.length >= 5
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiPlus />
                Add
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Use this only when the correct designation is not available in the categories.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}