import { Layout, PageHeader } from "@/components/Layout";
import { useSystem } from "@/context/SystemContext";
import { CheckCircle2, XCircle, AlertCircle, Bell } from "lucide-react";
import { useState } from "react";

const SEVERITY_COLORS = {
  emergency: { bg: "rgba(30,58,138,0.10)", border: "#1E3A8A", text: "#1E3A8A" },
  critical:  { bg: "rgba(30,58,138,0.06)", border: "#1E3A8A", text: "#1E3A8A" },
  warning:   { bg: "rgba(96,165,250,0.08)", border: "#60A5FA", text: "#60A5FA" },
} as const;

export default function AlertsPage() {
  const { alerts, acknowledgeAlert } = useSystem();
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">("unresolved");

  const filtered = alerts.filter((a) =>
    filter === "all" ? true : filter === "unresolved" ? !a.resolved : a.resolved
  );

  const counts = {
    emergency: alerts.filter((a) => a.severity === "emergency" && !a.resolved).length,
    critical: alerts.filter((a) => a.severity === "critical" && !a.resolved).length,
    warning: alerts.filter((a) => a.severity === "warning" && !a.resolved).length,
  };

  return (
    <Layout>
      <PageHeader
        title="Alerts & Anomaly Center"
        subtitle="Rolling Z-score + IsolationForest multivariate + hard-limit checks · BESS health monitor"
        right={
          <div className="flex items-center gap-3">
            <SeverityChip color="#1E3A8A" count={counts.emergency} label="Emergency" />
            <SeverityChip color="#1E3A8A" count={counts.critical} label="Critical" />
            <SeverityChip color="#60A5FA" count={counts.warning} label="Warning" />
          </div>
        }
      />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(["unresolved", "all", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            data-testid={`button-filter-${f}`}
            className={[
              "px-3 py-1.5 rounded-md text-[12px] font-medium border transition-colors",
              filter === f
                ? "bg-[rgba(37,99,235,0.15)] border-[#2563EB] text-[#2563EB]"
                : "bg-[rgba(255,255,255,0.65)] border-[rgba(37,99,235,0.15)] text-[#64748B] hover:text-[#0F172A]",
            ].join(" ")}
          >
            {f === "unresolved" ? `Unresolved (${alerts.filter((a) => !a.resolved).length})` : f === "all" ? `All (${alerts.length})` : `Resolved (${alerts.filter((a) => a.resolved).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filtered.length === 0 && (
          <div className="card-surface p-10 text-center">
            <CheckCircle2 size={32} className="mx-auto text-[#0EA5E9] mb-3" />
            <div className="text-[#0F172A] font-display font-semibold">No {filter} alerts</div>
            <div className="text-[12px] text-[#64748B] mt-1">All systems nominal · {new Date().toLocaleString("en-ZA")}</div>
          </div>
        )}
        {filtered.map((a) => {
          const sev = SEVERITY_COLORS[a.severity];
          const Icon = a.severity === "emergency" ? XCircle : a.severity === "critical" ? AlertCircle : Bell;
          return (
            <div
              key={a.id}
              data-testid={`alert-${a.id}`}
              className="rounded-lg border-l-4 p-4 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-4 items-start"
              style={{
                borderLeftColor: sev.border,
                background: sev.bg,
                borderTop: `1px solid ${sev.border}30`,
                borderRight: `1px solid ${sev.border}30`,
                borderBottom: `1px solid ${sev.border}30`,
              }}
            >
              <div className="flex items-center gap-2">
                <Icon size={20} style={{ color: sev.text }} />
                <div className="text-[10px] uppercase tracking-wider font-mono-num" style={{ color: sev.text }}>{a.severity}</div>
              </div>
              <div>
                <div className="text-[#0F172A] font-display font-semibold text-[14px]">{a.title}</div>
                <div className="text-[12px] text-[#475569] mt-1 leading-relaxed">{a.message}</div>
                {a.recommended && (
                  <div className="text-[11.5px] text-[#2563EB] mt-2 font-mono-num">→ {a.recommended}</div>
                )}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-[#64748B] font-mono-num uppercase tracking-wider flex-wrap">
                  <span>{a.signal}</span>
                  <span>·</span>
                  <span>{a.method}</span>
                  <span>·</span>
                  <span>{new Date(a.time).toLocaleString("en-ZA", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}</span>
                  <span>·</span>
                  <span>Score {a.score.toFixed(2)}</span>
                </div>
              </div>
              <div>
                {a.resolved ? (
                  <span className="text-[11px] uppercase tracking-wider px-2 py-1 rounded bg-[rgba(14,165,233,0.15)] text-[#0EA5E9] font-mono-num">Resolved</span>
                ) : (
                  <button
                    onClick={() => acknowledgeAlert(a.id)}
                    data-testid={`button-resolve-${a.id}`}
                    className="px-3 py-1.5 rounded-md bg-[rgba(37,99,235,0.15)] hover:bg-[rgba(37,99,235,0.3)] border border-[#2563EB]/40 text-[#2563EB] text-[11px] font-medium"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}

function SeverityChip({ color, count, label }: { color: string; count: number; label: string }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono-num" style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}>
      <span className="font-bold">{count}</span>
      <span className="opacity-80 uppercase tracking-wider">{label}</span>
    </div>
  );
}
