"use client";

import Link from "next/link";

export default function ProfileSidebarItem({
  href = "#",
  icon,
  title,
  subtitle,
  active = false,
  onClick,
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
        active
          ? "border-violet-600 bg-violet-600 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold">{title}</p>
        {subtitle && (
          <p
            className={`text-xs ${
              active ? "text-white/80" : "text-slate-400"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}