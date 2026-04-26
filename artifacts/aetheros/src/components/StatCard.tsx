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
    accent === "teal" ? "text-[#00C9A7]" :
    accent === "amber" ? "text-[#FFB300]" :
    accent === "green" ? "text-[#1D9E75]" :
    accent === "red" ? "text-[#E24B4A]" :
    "text-white";

  return (
    <div className="card-surface p-4 relative overflow-hidden group">
      <div className="flex items-start justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wider text-[#7B8FAB] font-mono-num">{label}</div>
        {icon && <div className="opacity-70 group-hover:opacity-100 transition-opacity">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-1.5">
        <div className={["font-display font-bold text-[26px] leading-none font-mono-num", valueColor].join(" ")}>{value}</div>
        {unit && <div className="text-[12px] text-[#7B8FAB] font-mono-num">{unit}</div>}
      </div>
      <div className="flex items-center gap-2 mt-2 text-[11px]">
        {sublabel && <div className="text-[#7B8FAB] flex-1">{sublabel}</div>}
        {delta && (
          <span className={[
            "font-mono-num font-semibold px-1.5 py-0.5 rounded",
            delta.positive ? "text-[#1D9E75] bg-[rgba(29,158,117,0.1)]" : "text-[#E24B4A] bg-[rgba(226,75,74,0.1)]",
          ].join(" ")}>
            {delta.value}
          </span>
        )}
      </div>
    </div>
  );
}
