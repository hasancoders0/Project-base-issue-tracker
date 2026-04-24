"use client";

import { FiLayers, FiClock, FiFlag, FiCheckCircle } from "react-icons/fi";

const boardCard =
  "rounded-[20px] border border-white/10 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm";

export default function TaskManagementStats({ stats }) {
  const items = [
    {
      label: "Active Tasks",
      value: stats?.total || 0,
      icon: <FiLayers />,
      color: "text-violet-300",
    },
    {
      label: "In Progress",
      value: stats?.inProgress || 0,
      icon: <FiClock />,
      color: "text-sky-300",
    },
    {
      label: "Overdue",
      value: stats?.overdue || 0,
      icon: <FiFlag />,
      color: "text-rose-300",
    },
    {
      label: "Done Now",
      value: stats?.doneCount || 0,
      icon: <FiCheckCircle />,
      color: "text-emerald-300",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className={`${boardCard} p-4`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/55">{item.label}</p>
              <h3 className="mt-2 text-3xl font-bold">{item.value}</h3>
            </div>

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-[14px] bg-white/10 text-xl ${item.color}`}
            >
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}