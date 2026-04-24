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
      className={`group relative flex items-center gap-3 overflow-hidden rounded-[16px] border px-3.5 py-3 transition duration-200 ${
        active
          ? "border-violet-400/40 bg-gradient-to-r from-violet-500/25 via-fuchsia-500/15 to-cyan-400/10 text-white shadow-[0_12px_35px_rgba(139,92,246,0.22)]"
          : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-9 w-1 -translate-y-1/2 rounded-r-full bg-cyan-300" />
      )}

      <div
        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] text-base transition ${
          active
            ? "bg-white/15 text-cyan-200 ring-1 ring-white/15"
            : "bg-white/10 text-white/50 group-hover:bg-white/15 group-hover:text-white"
        }`}
      >
        {icon}
      </div>

      <div className="relative z-10 min-w-0">
        <p className="truncate text-sm font-bold">{title}</p>

        {subtitle && (
          <p
            className={`mt-0.5 truncate text-xs ${
              active ? "text-white/70" : "text-white/35 group-hover:text-white/50"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {active && (
        <span className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-cyan-300/10 to-transparent" />
      )}
    </Link>
  );
}