import { Layout, PageHeader } from "@/components/Layout";
import { useSystem } from "@/context/SystemContext";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { COLORS } from "@/lib/sim";
import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Cpu, Battery, Activity } from "lucide-react";

export default function DigitalTwinPage() {
  const { metrics, dispatch } = useSystem();
  const [scenarios, setScenarios] = useState(100);
  const monteCarlo = useMemo(() => generateMC(scenarios), [scenarios]);
  const racks = useMemo(() => generateRacks(metrics.rackTempC), [metrics.rackTempC]);

  return (
    <Layout>
      <PageHeader
        title="Digital Twin — Live Facility Model"
        subtitle="Real-time SCADA mirror · 200+ sensor feeds · 14k tags · 250ms latency"
        right={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(99,102,241,0.12)] border border-[rgba(99,102,241,0.3)]">
            <span className="pulse-dot teal" />
            <span className="text-[11px] font-mono-num text-[#6366F1] uppercase tracking-wider">Monte Carlo Active</span>
          </div>
        }
      />

      {/* Facility flow diagram */}
      <div className="card-surface p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-[#0F172A] text-base">Facility Energy Flow</h2>
          <span className="text-[10px] font-mono-num text-[#64748B] uppercase tracking-wider">Live · Total {(metrics.solarMw + metrics.windMw + metrics.biomassKw / 1000).toFixed(2)} MW</span>
        </div>
        <FlowDiagram />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Thermal map */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-[#0F172A] text-sm">Thermal Map · Rack Aisle B</h3>
            <span className="text-[10px] font-mono-num text-[#64748B]">12 racks</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {racks.map((r) => {
              const tempPct = (r.temp - 20) / 14; // 20–34°C
              const hue = 200 - tempPct * 200; // blue → red
              const isHot = r.temp >= 29;
              return (
                <div
                  key={r.id}
                  data-testid={`rack-${r.id}`}
                  className="rounded-md px-2 py-2.5 border text-center cursor-help relative overflow-hidden group"
                  style={{
                    background: `hsla(${Math.max(0, hue)}, 78%, 50%, 0.18)`,
                    borderColor: isHot ? "#1E3A8A" : `hsla(${Math.max(0, hue)}, 60%, 55%, 0.4)`,
                  }}
                  title={`${r.id} | ${r.temp.toFixed(1)}°C | ${r.power} kW | ${r.load}%`}
                >
                  <div className="text-[10px] font-mono-num text-[#64748B]">{r.id}</div>
                  <div className="text-[13px] font-mono-num font-bold text-[#0F172A]">{r.temp.toFixed(1)}°</div>
                  {isHot && <div className="text-[9px] text-[#1E3A8A] mt-0.5">⚠ {r.power}kW</div>}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] font-mono-num text-[#64748B]">
            <span>Cool 21°C</span>
            <div className="flex-1 mx-2 h-1 rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 via-yellow-500 to-red-500 opacity-60" />
            <span>Hot 34°C</span>
          </div>
        </div>

        {/* Monte Carlo */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-[#0F172A] text-sm">Monte Carlo · 24h Cost</h3>
            <span className="text-[10px] font-mono-num text-[#6366F1]">{scenarios} scenarios</span>
          </div>
          <div className="h-[180px] bg-[rgba(241,245,249,0.7)] rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monteCarlo} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="mcBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(37,99,235,0.05)" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `R${v}k`} width={42} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="p95" stroke="none" fill="url(#mcBand)" name="P5–P95 band" stackId="band" />
                <Area type="monotone" dataKey="p5" stroke="none" fill="rgba(255,255,255,0.65)" stackId="band" />
                <Area type="monotone" dataKey="p50" stroke={COLORS.purple} fill="none" strokeWidth={2} name="P50 median" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] font-mono-num text-[#64748B] mb-1">
              <span>Scenarios</span>
              <span className="text-[#0F172A]">{scenarios}</span>
            </div>
            <Slider value={[scenarios]} min={50} max={500} step={50} onValueChange={(v) => setScenarios(v[0]!)} />
            <button
              data-testid="button-run-mc"
              onClick={() => setScenarios((s) => s)}
              className="mt-3 w-full py-2 rounded-md bg-[rgba(99,102,241,0.15)] hover:bg-[rgba(99,102,241,0.25)] border border-[rgba(99,102,241,0.4)] text-[#6366F1] text-[12px] font-medium"
            >
              Run Simulation
            </button>
          </div>
        </div>

        {/* BESS Health */}
        <div className="card-surface p-4">
          <h3 className="font-display font-semibold text-[#0F172A] text-sm mb-4">BESS Health Monitor</h3>
          <div className="flex items-center gap-5">
            <BessGraphic soc={metrics.bessSoc} />
            <div className="flex-1 space-y-3">
              <HealthRow label="State of Charge" value={`${metrics.bessSoc.toFixed(1)}%`} pct={metrics.bessSoc} color={COLORS.primary} />
              <HealthRow label="State of Health" value="97.3%" pct={97.3} color={COLORS.success} />
              <div className="text-[11px] font-mono-num space-y-1.5 pt-1 border-t border-[rgba(37,99,235,0.08)]">
                <KV k="Cycles" v="142 / 6,000" />
                <KV k="Thermal risk" v={<span className="px-1.5 py-0.5 rounded bg-[rgba(14,165,233,0.15)] text-[#0EA5E9]">NONE</span>} />
                <KV k="Est. life" v="9.2 years" />
                <KV k="Round-trip eff." v="93.4%" />
                <KV k="Last calibration" v="3 days ago" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <MiniStat label="Active twin tags" value="14,287" icon={<Cpu size={14} className="text-[#2563EB]" />} />
        <MiniStat label="Sync latency" value="247 ms" icon={<Activity size={14} className="text-[#2563EB]" />} />
        <MiniStat label="Edge nodes" value="9 online" icon={<Cpu size={14} className="text-[#0EA5E9]" />} />
        <MiniStat label="BESS reserve" value={`${(metrics.bessSoc * 0.1).toFixed(2)} MWh`} icon={<Battery size={14} className="text-[#2563EB]" />} />
      </div>
    </Layout>
  );
}

function FlowDiagram() {
  return (
    <svg viewBox="0 0 900 320" className="w-full h-auto">
      {/* Grid lines */}
      <line x1="450" y1="40" x2="450" y2="280" stroke="rgba(37,99,235,0.18)" strokeWidth="6" />
      <text x="475" y="155" fill="#2563EB" fontSize="11" fontFamily="DM Mono">MAIN BUSBAR</text>
      <text x="475" y="170" fill="#64748B" fontSize="9" fontFamily="DM Mono">11 kV · 50 Hz</text>

      {/* Solar */}
      <Node x={70} y={70} label="SOLAR" sub="1.42 MW" color="#60A5FA" icon="sun" />
      <FlowArrow x1={130} y1={80} x2={446} y2={120} mw="1.42" color="#60A5FA" />

      {/* Wind */}
      <Node x={770} y={70} label="WIND" sub="0.71 MW" color="#2563EB" icon="wind" />
      <FlowArrow x1={770} y1={80} x2={454} y2={120} mw="0.71" color="#2563EB" />

      {/* Biomass */}
      <Node x={70} y={170} label="BIOMASS" sub="0.42 MW" color="#3B82F6" icon="flame" />
      <FlowArrow x1={130} y1={180} x2={446} y2={170} mw="0.42" color="#3B82F6" />

      {/* BESS bottom-left */}
      <Node x={70} y={260} label="BESS" sub="6.7 MWh · −1.8 MW" color="#6366F1" icon="battery" />
      <FlowArrow x1={130} y1={270} x2={446} y2={220} mw="-1.8" color="#6366F1" bidir />

      {/* Eskom bottom-right */}
      <Node x={770} y={260} label="ESKOM GRID" sub="STAGE 2 · ISLANDED" color="#1E3A8A" icon="zap" />
      <FlowArrow x1={770} y1={270} x2={454} y2={220} mw="0.0" color="#1E3A8A" dotted />

      {/* Data centre right */}
      <g>
        <rect x="600" y="100" width="160" height="120" rx="8" fill="rgba(255,255,255,0.65)" stroke="rgba(37,99,235,0.4)" strokeWidth="1.5" />
        <text x="680" y="123" textAnchor="middle" fill="#2563EB" fontSize="11" fontFamily="DM Mono">DATA CENTRE</text>
        <text x="680" y="138" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="DM Mono">3.6 MW LOAD</text>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={616 + (i % 4) * 32} y={150 + Math.floor(i / 4) * 30} width="22" height="22" rx="2" fill="rgba(37,99,235,0.15)" stroke="rgba(37,99,235,0.4)" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={`led-${i}`} cx={627 + (i % 4) * 32} cy={155 + Math.floor(i / 4) * 30} r="2" fill="#2563EB">
            <animate attributeName="opacity" values="0.3;1;0.3" dur={`${1 + i * 0.2}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
      <FlowArrow x1={454} y1={160} x2={600} y2={160} mw="3.6" color="#2563EB" />
    </svg>
  );
}

function Node({ x, y, label, sub, color, icon }: { x: number; y: number; label: string; sub: string; color: string; icon: string }) {
  return (
    <g>
      <rect x={x - 60} y={y - 22} width="120" height="55" rx="8" fill="rgba(255,255,255,0.65)" stroke={color} strokeWidth="1.5" opacity="0.9" />
      <circle cx={x - 40} cy={y + 5} r="13" fill={color} opacity="0.18" />
      <text x={x - 40} y={y + 9} textAnchor="middle" fill={color} fontSize="11" fontFamily="DM Mono">{iconText(icon)}</text>
      <text x={x + 5} y={y - 2} fill="#0F172A" fontSize="11" fontFamily="DM Mono" fontWeight="600">{label}</text>
      <text x={x + 5} y={y + 14} fill="#64748B" fontSize="9" fontFamily="DM Mono">{sub}</text>
    </g>
  );
}

function iconText(name: string) {
  switch (name) {
    case "sun": return "☀";
    case "wind": return "≈";
    case "flame": return "△";
    case "battery": return "▭";
    case "zap": return "⚡";
    default: return "◇";
  }
}

function FlowArrow({ x1, y1, x2, y2, mw, color, bidir, dotted }: { x1: number; y1: number; x2: number; y2: number; mw: string; color: string; bidir?: boolean; dotted?: boolean }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - 8;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" opacity="0.7" strokeDasharray={dotted ? "3 3" : undefined} className={dotted ? "" : "flow-line"} />
      <rect x={mx - 22} y={my - 8} width="44" height="14" rx="3" fill="#F1F5F9" stroke={color} strokeWidth="0.6" opacity="0.95" />
      <text x={mx} y={my + 2} textAnchor="middle" fill={color} fontSize="9" fontFamily="DM Mono" fontWeight="600">{bidir ? "⇄" : ""}{mw} MW</text>
    </g>
  );
}

function HealthRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="text-[#64748B] font-mono-num uppercase tracking-wider">{label}</span>
        <span className="text-[#0F172A] font-mono-num">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}80` }} />
      </div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between"><span className="text-[#64748B]">{k}</span><span className="text-[#0F172A]">{v}</span></div>;
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="card-surface px-3 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-md bg-[rgba(37,99,235,0.08)] flex items-center justify-center">{icon}</div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono-num">{label}</div>
        <div className="text-[#0F172A] font-mono-num font-semibold text-[13px]">{value}</div>
      </div>
    </div>
  );
}

function BessGraphic({ soc }: { soc: number }) {
  const fillH = (soc / 100) * 92;
  const color = soc > 60 ? COLORS.success : soc > 30 ? COLORS.warning : COLORS.danger;
  return (
    <svg width="62" height="120" viewBox="0 0 62 120">
      <rect x="14" y="2" width="22" height="6" rx="1.5" fill="rgba(255,255,255,0.65)" stroke="rgba(37,99,235,0.4)" />
      <rect x="2" y="10" width="46" height="108" rx="6" fill="none" stroke="#2563EB" strokeWidth="1.5" />
      <rect x="6" y={14 + (92 - fillH)} width="38" height={fillH} rx="3" fill={color} opacity="0.7">
        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2s" repeatCount="indefinite" />
      </rect>
      <text x="25" y="68" textAnchor="middle" fill="#0F172A" fontSize="13" fontFamily="DM Mono" fontWeight="700">{Math.round(soc)}%</text>
    </svg>
  );
}

function generateMC(n: number) {
  const out = [];
  for (let h = 1; h <= 24; h++) {
    const base = 12 + h * 0.4 + Math.sin(h / 4) * 3;
    const spread = 4 + (n / 500) * 2;
    out.push({
      t: `+${h}h`,
      p5: Math.max(0, Math.round((base - spread) * 10) / 10),
      p50: Math.round(base * 10) / 10,
      p95: Math.round((base + spread) * 10) / 10,
    });
  }
  return out;
}

function generateRacks(currentMean: number) {
  const racks: { id: string; temp: number; power: number; load: number }[] = [];
  const ids = ["A-01","A-02","A-03","B-04","B-05","B-06","B-07","C-08","C-09","D-10","D-11","D-12"];
  ids.forEach((id, i) => {
    const isHot = id === "B-07";
    const temp = isHot ? 31.2 : currentMean + (i % 3 - 1) * 1.2 + Math.random() * 0.8;
    racks.push({ id, temp, power: Math.round(70 + Math.random() * 60), load: Math.round(50 + Math.random() * 40) });
  });
  return racks;
}
