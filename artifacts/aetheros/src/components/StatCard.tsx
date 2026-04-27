import type { ReactNode } from "react";

export function StatCard({
  label, value, unit, sublabel, icon, accent = "white", delta,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  sublabel?: ReactNode;
  icon?: ReactNode;
  accent?: "teal" | "white" | "amber" | "green" | "red";
  delta?: { value: string; positive?: boolean };
}) {
  const valueColor =
    accent === "teal" ? "text-[#2563EB]" :
    accent === "amber" ? "text-[#60A5FA]" :
    accent === "green" ? "text-[#0EA5E9]" :
    accent === "red" ? "text-[#1E3A8A]" :
    "text-[#0F172A]";

  return (
    <div className="card-surface p-4 relative overflow-hidden group">
      <div className="flex items-start justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono-num">{label}</div>
        {icon && <div className="opacity-70 group-hover:opacity-100 transition-opacity">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-1.5">
        <div className={["font-display font-bold text-[26px] leading-none font-mono-num", valueColor].join(" ")}>{value}</div>
        {unit && <div className="text-[12px] text-[#64748B] font-mono-num">{unit}</div>}
      </div>
      <div className="flex items-center gap-2 mt-2 text-[11px]">
        {sublabel && <div className="text-[#64748B] flex-1">{sublabel}</div>}
        {delta && (
          <span className={[
            "font-mono-num font-semibold px-1.5 py-0.5 rounded",
            delta.positive ? "text-[#0EA5E9] bg-[rgba(14,165,233,0.1)]" : "text-[#1E3A8A] bg-[rgba(30,58,138,0.1)]",
          ].join(" ")}>
            {delta.value}
          </span>
        )}
      </div>
    </div>
  );
}
