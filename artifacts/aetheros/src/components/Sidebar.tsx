import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Zap, TrendingUp, Cpu, Server, Leaf, Bell, FileText, Info,
} from "lucide-react";
import { useSystem } from "@/context/SystemContext";

const NAV = [
  { path: "/", label: "Overview", icon: LayoutDashboard },
  { path: "/dispatch", label: "Dispatch", icon: Zap },
  { path: "/forecasting", label: "Forecasting", icon: TrendingUp },
  { path: "/digital-twin", label: "Digital Twin", icon: Cpu },
  { path: "/gpu-routing", label: "GPU Routing", icon: Server },
  { path: "/carbon-credits", label: "Carbon Credits", icon: Leaf },
  { path: "/alerts", label: "Alerts", icon: Bell },
  { path: "/reports", label: "Reports", icon: FileText },
  { path: "/about", label: "About & How It Works", icon: Info },
];

export function Sidebar() {
  const [loc] = useLocation();
  const { alerts, metrics } = useSystem();
  const unresolved = alerts.filter((a) => !a.resolved).length;

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[220px] bg-[#F1F5F9] border-r border-[rgba(37,99,235,0.1)] z-40">
      {/* Logo */}
      <div className="px-5 pt-6 pb-7 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#2563EB] flex items-center justify-center font-mono-num font-bold text-[#F1F5F9] text-base shadow-[0_0_20px_rgba(37,99,235,0.4)]">
          AG
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display font-bold text-[#0F172A] text-[15px]">AetherGrid AI</span>
          <span className="font-mono-num text-[10px] text-[#2563EB] mt-0.5 tracking-wider">AetherOS v0.2.0</span>
        </div>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = path === "/" ? loc === "/" : loc.startsWith(path);
          return (
            <Link
              key={path}
              href={path}
              data-testid={`link-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className={[
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-all",
                active
                  ? "bg-[rgba(37,99,235,0.1)] text-[#2563EB] border-l-[3px] border-l-[#2563EB] pl-[9px]"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-[rgba(37,99,235,0.05)]",
              ].join(" ")}
            >
              <Icon size={16} strokeWidth={active ? 2.4 : 2} />
              <span className="flex-1">{label}</span>
              {label === "Alerts" && unresolved > 0 && (
                <span className="bg-[#1E3A8A] text-white text-[10px] font-mono-num px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unresolved}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Site selector */}
      <div className="p-3 mx-3 mb-4 mt-4 rounded-md bg-[rgba(255,255,255,0.65)] border border-[rgba(37,99,235,0.15)]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="pulse-dot" />
          <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono-num">Site</span>
        </div>
        <div className="text-[12px] font-semibold text-[#0F172A] leading-tight">Cape Town Pilot</div>
        <div className="text-[11px] text-[#2563EB] font-mono-num mt-0.5">5 MW · {metrics.loadMw.toFixed(2)} MW load</div>
      </div>
    </aside>
  );
}
