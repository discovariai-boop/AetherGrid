import { Layout, PageHeader } from "@/components/Layout";
import { useSystem } from "@/context/SystemContext";
import { Server, Pause, Play, Zap } from "lucide-react";
import { COLORS } from "@/lib/sim";

type Tier = "critical" | "high-priority" | "deferrable" | "training" | "data-pipeline";
interface JobLite { id: string; name: string; tier: Tier; status: "running" | "throttled" | "deferred"; gpus: number; powerKw: number; eta: string; carbonGCo2: number; }

const JOBS: JobLite[] = [
  { id: "j-001", name: "fraud-detection-prod", tier: "critical", status: "running", gpus: 4, powerKw: 28, eta: "Live", carbonGCo2: 142 },
  { id: "j-002", name: "rec-eng-inference", tier: "critical", status: "running", gpus: 2, powerKw: 14, eta: "Live", carbonGCo2: 71 },
  { id: "j-003", name: "search-rerank-svc", tier: "high-priority", status: "running", gpus: 3, powerKw: 21, eta: "Live", carbonGCo2: 105 },
  { id: "j-004", name: "llm-batch-eval-q3", tier: "deferrable", status: "throttled", gpus: 8, powerKw: 38, eta: "+47 min", carbonGCo2: 380 },
  { id: "j-005", name: "vision-research-train", tier: "training", status: "deferred", gpus: 16, powerKw: 0, eta: "+2h 14m", carbonGCo2: 0 },
  { id: "j-006", name: "embeddings-refresh", tier: "deferrable", status: "throttled", gpus: 4, powerKw: 18, eta: "+1h 12m", carbonGCo2: 195 },
  { id: "j-007", name: "diffusion-finetune", tier: "training", status: "deferred", gpus: 12, powerKw: 0, eta: "+3h 45m", carbonGCo2: 0 },
  { id: "j-008", name: "speech-to-text-prod", tier: "critical", status: "running", gpus: 1, powerKw: 7, eta: "Live", carbonGCo2: 35 },
  { id: "j-009", name: "warehouse-etl-nightly", tier: "data-pipeline", status: "deferred", gpus: 6, powerKw: 0, eta: "+18h 02m", carbonGCo2: 0 },
];

export default function GpuRoutingPage() {
  const { stage, dispatch } = useSystem();
  const totalActiveKw = JOBS.filter((j) => j.status === "running").reduce((a, b) => a + b.powerKw, 0);
  const totalDeferredGpus = JOBS.filter((j) => j.status !== "running").reduce((a, b) => a + b.gpus, 0);
  const carbonAvoidedKg = (JOBS.filter((j) => j.status === "deferred").reduce((a, b) => a + (b.gpus * 350), 0)) / 1000;

  return (
    <Layout>
      <PageHeader
        title="GPU Workload Routing"
        subtitle="Carbon-aware scheduler · Real-time tier orchestration"
        right={
          <div className="flex items-center gap-3 flex-wrap">
            <Pill color={COLORS.success} dot>{JOBS.filter((j) => j.status === "running").length} Running</Pill>
            <Pill color={COLORS.primary}>{JOBS.filter((j) => j.status === "throttled").length} Throttled</Pill>
            <Pill color={COLORS.danger}>{JOBS.filter((j) => j.status === "deferred").length} Deferred</Pill>
            <Pill color={COLORS.muted}>5-tier policy</Pill>
          </div>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Active GPU power" value={`${totalActiveKw} kW`} icon={<Zap size={14} className="text-[#2563EB]" />} />
        <Kpi label="Deferred GPUs" value={`${totalDeferredGpus}`} icon={<Pause size={14} className="text-[#475569]" />} />
        <Kpi label="Carbon-aware deferred" value={`${carbonAvoidedKg.toFixed(1)} kg CO₂`} icon={<Server size={14} className="text-[#0EA5E9]" />} accent="green" />
        <Kpi label="Eskom Stage" value={`S${stage}`} icon={<span className="pulse-dot amber" />} accent="amber" />
      </div>

      {/* Strategy banner */}
      <div className="card-surface p-4 mb-4 border-l-4 border-l-[#2563EB]">
        <div className="text-[10px] uppercase tracking-wider font-mono-num text-[#2563EB] mb-1">Active Strategy · {dispatch.gpuRouting}</div>
        <div className="text-[#0F172A] text-sm">
          Stage {stage} active — {dispatch.gpuDeferrablePct}% of deferrable workload paused. Critical inference protected. Carbon-optimal training rescheduled to renewable peak window.
        </div>
      </div>

      {/* Job table */}
      <div className="card-surface overflow-hidden">
        <div className="px-4 py-3 border-b border-[rgba(37,99,235,0.1)] flex items-center justify-between">
          <h3 className="font-display font-semibold text-[#0F172A] text-sm">Active Workload Queue</h3>
          <span className="text-[10px] font-mono-num text-[#64748B] uppercase tracking-wider">{JOBS.length} jobs · NVIDIA H100 fleet</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono-num">
              <tr className="border-b border-[rgba(37,99,235,0.08)]">
                <th className="text-left px-4 py-2.5">Job</th>
                <th className="text-left px-4 py-2.5">Tier</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="text-right px-4 py-2.5">GPUs</th>
                <th className="text-right px-4 py-2.5">Power</th>
                <th className="text-right px-4 py-2.5">ETA</th>
                <th className="text-right px-4 py-2.5">CO₂ rate</th>
                <th className="text-right px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="font-mono-num">
              {JOBS.map((j) => (
                <tr key={j.id} data-testid={`row-job-${j.id}`} className="border-b border-[rgba(37,99,235,0.04)] last:border-0 hover:bg-[rgba(37,99,235,0.03)]">
                  <td className="px-4 py-3 text-[#0F172A]">{j.name}</td>
                  <td className="px-4 py-3"><TierBadge tier={j.tier} /></td>
                  <td className="px-4 py-3"><StatusBadge status={j.status} /></td>
                  <td className="px-4 py-3 text-right text-[#0F172A]">{j.gpus}</td>
                  <td className="px-4 py-3 text-right text-[#2563EB]">{j.powerKw} kW</td>
                  <td className="px-4 py-3 text-right text-[#64748B]">{j.eta}</td>
                  <td className="px-4 py-3 text-right text-[#64748B]">{j.carbonGCo2} g/h</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-[#2563EB] hover:text-[#1D4ED8] text-[11px]" data-testid={`button-job-action-${j.id}`}>
                      {j.status === "running" ? "Throttle" : j.status === "throttled" ? "Resume" : "Force run"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scheduler explanation — 5 tiers per spec */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3 mt-5">
        <Explainer title="Critical" desc="Real-time inference. Cannot defer. Protected through all stages." />
        <Explainer title="High-priority" desc="Serving workloads. Tolerates ≤15 min delay. Throttled at S3+." />
        <Explainer title="Deferrable" desc="Batch inference. Defer up to 2h. Resumes in low-carbon windows." />
        <Explainer title="Training" desc="Defer up to 24h. Front-loaded into renewable surplus periods." />
        <Explainer title="Data-pipeline" desc="ETL & data prep. Defer up to 48h. Lowest cost, off-peak only." />
      </div>
    </Layout>
  );
}

function Pill({ color, children, dot }: { color: string; children: React.ReactNode; dot?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono-num font-semibold" style={{ background: `${color}20`, color, border: `1px solid ${color}50` }}>
      {dot && <span className="pulse-dot" />}
      {children}
    </div>
  );
}

function Kpi({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: "green" | "amber" }) {
  const c = accent === "green" ? "text-[#0EA5E9]" : accent === "amber" ? "text-[#60A5FA]" : "text-[#0F172A]";
  return (
    <div className="card-surface px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-md bg-[rgba(37,99,235,0.08)] flex items-center justify-center">{icon}</div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono-num">{label}</div>
        <div className={`font-display font-bold font-mono-num text-base ${c}`}>{value}</div>
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: JobLite["tier"] }) {
  const map = {
    critical: { c: "#1E3A8A", l: "Critical" },
    "high-priority": { c: "#2563EB", l: "High-priority" },
    deferrable: { c: "#60A5FA", l: "Deferrable" },
    training: { c: "#0EA5E9", l: "Training" },
    "data-pipeline": { c: "#6366F1", l: "Data-pipeline" },
  } as const;
  const m = map[tier];
  return <span className="px-2 py-0.5 rounded text-[10px] font-mono-num font-semibold" style={{ background: `${m.c}20`, color: m.c, border: `1px solid ${m.c}50` }}>{m.l}</span>;
}

function StatusBadge({ status }: { status: JobLite["status"] }) {
  if (status === "running") return <span className="flex items-center gap-1.5 text-[#0EA5E9] text-[11px]"><Play size={11} fill="#0EA5E9" /> Running</span>;
  if (status === "throttled") return <span className="flex items-center gap-1.5 text-[#60A5FA] text-[11px]">⚡ Throttled</span>;
  return <span className="flex items-center gap-1.5 text-[#64748B] text-[11px]"><Pause size={11} /> Deferred</span>;
}

function Explainer({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card-surface p-4">
      <div className="text-[12px] font-display font-semibold text-[#0F172A] mb-1">{title}</div>
      <div className="text-[11.5px] text-[#64748B] leading-relaxed">{desc}</div>
    </div>
  );
}
