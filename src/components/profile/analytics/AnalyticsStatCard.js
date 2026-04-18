"use client";

export default function AnalyticsStatCard({
  title,
  value,
  subtitle,
  icon,
  tone = "violet",
}) {
  const toneMap = {
    violet: "bg-violet-100 text-violet-700",
    blue: "bg-sky-100 text-sky-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">{value}</h3>
          {subtitle ? (
            <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            toneMap[tone] || toneMap.violet
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}