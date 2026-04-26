import { useSystem } from "@/context/SystemContext";
import { Layout, PageHeader } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar, Cell,
} from "recharts";
import { Battery, Sun, Wind, Leaf, Activity, Zap, Cpu } from "lucide-react";
import { COLORS, fmtR } from "@/lib/sim";

export default function OverviewPage() {
  const { metrics, history, dispatch, stage } = useSystem();
  const renewablePct = ((metrics.solarMw + metrics.windMw) / Math.max(1, metrics.loadMw)) * 100;

  const sheddingRisk = [
    { h: "+1h", p: 15 }, { h: "+2h", p: 28 }, { h: "+3h", p: 65 },
    { h: "+4h", p: 72 }, { h: "+5h", p: 44 }, { h: "+6h", p: 18 },
  ];
  const riskColor = (p: number) => p < 30 ? COLORS.success : p < 60 ? COLORS.warning : COLORS.danger;

  return (
    <Layout>
      <PageHeader
        title="Overview"
        subtitle="Cape Town Pilot · Live operations"
        right={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(0,201,167,0.08)] border border-[rgba(0,201,167,0.25)]">
            <span className="pulse-dot teal" />
            <span className="text-[11px] font-mono-num text-[#00C9A7] uppercase tracking-wider">System Active</span>
          </div>
        }
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <StatCard
          label="BESS State of Charge"
          value={`${metrics.bessSoc.toFixed(1)}`}
          unit="%"
          accent="teal"
          icon={<BatteryAnim soc={metrics.bessSoc} />}
          sublabel={`${(metrics.bessSoc / 10).toFixed(2)} MWh available · 10 MWh pack`}
        />
        <StatCard
          label="PUE"
          value={metrics.pue.toFixed(2)}
          sublabel="vs 1.85 SA average"
          delta={{ value: "−31% better", positive: true }}
          icon={<Activity size={16} className="text-[#00C9A7]" />}
        />
        <StatCard
          label="Eskom Stage"
          value={
            <span className="flex items-center gap-2">
              <span className="pulse-dot amber relative -top-0.5" /> Stage {stage}
            </span>
          }
          sublabel={stage > 0 ? "Load-shedding active" : "Grid stable"}
          icon={<span className="text-[10px] font-mono-num uppercase tracking-wider px-2 py-1 rounded-full bg-[rgba(0,201,167,0.15)] text-[#00C9A7] border border-[rgba(0,201,167,0.3)]">Islanded ✓</span>}
        />
        <StatCard
          label="Active Solar"
          value={metrics.solarMw.toFixed(2)}
          unit="MW"
          accent="amber"
          icon={<Sun size={16} className="text-[#FFB300]" />}
          sublabel={`${Math.round((metrics.solarMw / 2) * 100)}% of 2 MW capacity`}
        />
        <StatCard
          label="Energy Savings Today"
          value={fmtR(metrics.energySavingsR)}
          accent="green"
          icon={<Zap size={16} className="text-[#1D9E75]" />}
          sublabel="vs baseline grid cost"
        />
        <StatCard
          label="CO₂ Avoided"
          value={metrics.co2AvoidedT.toFixed(2)}
          unit="t"
          accent="green"
          icon={<Leaf size={16} className="text-[#1D9E75]" />}
          sublabel="this session"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Left: live energy flow */}
        <div className="xl:col-span-3 card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display font-semibold text-white text-base">Live Energy Flow</h2>
              <p className="text-[11px] text-[#7B8FAB] font-mono-num">Last 24 hours · MW</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono-num text-[#7B8FAB]">
              <span className="pulse-dot teal" /> Live · {new Date(metrics.updatedAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          </div>
          <div className="h-[330px] w-full bg-[#060F1E] rounded-lg p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={COLORS.gold} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gridGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.danger} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={COLORS.danger} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(0,201,167,0.07)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} interval={3} />
                <YAxis tick={{ fontSize: 10 }} unit=" MW" width={50} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
                <Area type="monotone" dataKey="solar" stroke={COLORS.gold} strokeWidth={2} fill="url(#solarGrad)" name="Solar" />
                <Area type="monotone" dataKey="wind" stroke={COLORS.primary} strokeWidth={2} fill="url(#windGrad)" name="Wind" />
                <Area type="monotone" dataKey="grid" stroke={COLORS.danger} strokeWidth={2} fill="url(#gridGrad)" name="Grid Import" />
                <Area type="monotone" dataKey="bess" stroke={COLORS.purple} strokeWidth={2} fill="url(#bessGrad)" name="BESS" />
                <Area type="monotone" dataKey="load" stroke="#F0F4FF" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={0} name="Total Load" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: 3 stacked panels */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {/* Dispatch decision */}
          <div className="card-surface p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display font-semibold text-white text-sm">Dispatch Decision</h3>
                <p className="text-[10px] text-[#7B8FAB] font-mono-num mt-0.5">Updated {Math.round((Date.now() - metrics.updatedAt) / 1000)}s ago</p>
              </div>
              <span className="text-[9px] font-mono-num uppercase tracking-wider px-2 py-1 rounded bg-[rgba(0,201,167,0.15)] text-[#00C9A7]">AI Decision</span>
            </div>
            <DecisionRow label="BESS" value={dispatch.bessAction} pct={dispatch.bessPctAction} color={COLORS.danger} />
            <DecisionRow label="Biomass" value={`${dispatch.biomassPct}% rated capacity`} pct={dispatch.biomassPct} color={COLORS.success} />
            <DecisionRow label="GPU Load" value={`${dispatch.gpuDeferrablePct}% deferrable`} pct={dispatch.gpuDeferrablePct} color={COLORS.warning} />
          </div>

          {/* Islanding gauge */}
          <div className="card-surface p-4">
            <h3 className="font-display font-semibold text-white text-sm mb-3">Islanding Readiness Score</h3>
            <div className="flex items-center justify-center">
              <Gauge value={metrics.islandingScore} />
            </div>
            <div className="mt-3 flex justify-between text-[11px] font-mono-num">
              <span className="text-[#1D9E75]">Can sustain 4h ✓</span>
              <span className={metrics.islandingScore >= 80 ? "text-[#1D9E75]" : "text-[#E24B4A]"}>
                Can sustain 8h {metrics.islandingScore >= 80 ? "✓" : "✗"}
              </span>
            </div>
          </div>

          {/* Shedding risk */}
          <div className="card-surface p-4">
            <h3 className="font-display font-semibold text-white text-sm mb-3">Next Shedding Risk · 6h</h3>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sheddingRisk} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(0,201,167,0.05)" vertical={false} />
                  <XAxis dataKey="h" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} unit="%" width={40} />
                  <Tooltip cursor={{ fill: "rgba(0,201,167,0.05)" }} />
                  <Bar dataKey="p" radius={[3,3,0,0]}>
                    {sheddingRisk.map((d, i) => <Cell key={i} fill={riskColor(d.p)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-mono-num text-[#7B8FAB]">
              {sheddingRisk.map((d) => <span key={d.h}>{d.h} {d.p}%</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Side context strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <MiniCard label="Renewable fraction" value={`${renewablePct.toFixed(1)}%`} icon={<Sun size={14} className="text-[#FFB300]" />} />
        <MiniCard label="Grid import" value={`${metrics.gridImportMw.toFixed(2)} MW`} icon={<Zap size={14} className="text-[#E24B4A]" />} />
        <MiniCard label="Wind generation" value={`${metrics.windMw.toFixed(2)} MW`} icon={<Wind size={14} className="text-[#00C9A7]" />} />
      </div>
    </Layout>
  );
}

function DecisionRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="flex items-center justify-between text-[11.5px] mb-1">
        <span className="text-[#7B8FAB] font-mono-num uppercase tracking-wider">{label}</span>
        <span className="text-white font-medium">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#0A1628] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.abs(pct)}%`, background: color, boxShadow: `0 0 8px ${color}80` }} />
      </div>
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  const r = 56;
  const circ = Math.PI * r; // semicircle
  const dash = circ * (value / 100);
  const color = value >= 75 ? COLORS.success : value >= 50 ? COLORS.primary : value >= 25 ? COLORS.warning : COLORS.danger;
  return (
    <svg viewBox="0 0 160 96" className="w-44 h-28">
      <path d={`M 16 80 A ${r} ${r} 0 0 1 144 80`} stroke="#0A1628" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path
        d={`M 16 80 A ${r} ${r} 0 0 1 144 80`}
        stroke={color}
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 700ms ease, stroke 300ms" }}
      />
      <text x="80" y="74" textAnchor="middle" fill="#F0F4FF" fontSize="26" fontWeight="700" fontFamily="DM Mono">{Math.round(value)}</text>
      <text x="80" y="90" textAnchor="middle" fill="#7B8FAB" fontSize="10" fontFamily="DM Mono">/ 100</text>
    </svg>
  );
}

function BatteryAnim({ soc }: { soc: number }) {
  const fillColor = soc > 60 ? COLORS.success : soc > 30 ? COLORS.warning : COLORS.danger;
  return (
    <svg width="22" height="14" viewBox="0 0 22 14">
      <rect x="0.5" y="0.5" width="18" height="13" rx="2" fill="none" stroke={COLORS.primary} strokeWidth="1" />
      <rect x="19" y="4" width="2.5" height="6" rx="1" fill={COLORS.primary} />
      <rect x="2" y="2" width={(soc / 100) * 15} height="10" rx="1" fill={fillColor} style={{ transition: "width 700ms ease" }} />
    </svg>
  );
}

function MiniCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="card-surface px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-md bg-[rgba(0,201,167,0.08)] flex items-center justify-center">{icon}</div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-[#7B8FAB] font-mono-num">{label}</div>
        <div className="text-white font-display font-semibold font-mono-num text-base">{value}</div>
      </div>
    </div>
  );
}
