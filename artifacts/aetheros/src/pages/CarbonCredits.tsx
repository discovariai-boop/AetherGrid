import { Layout, PageHeader } from "@/components/Layout";
import { useSystem } from "@/context/SystemContext";
import { Leaf, Hash, FileCheck, ExternalLink } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";
import { COLORS, fmtR } from "@/lib/sim";

const TXS = [
  { id: "0x7a3...8e2f", time: "14:22 today", credits: 0.42, value: 71.4, status: "verified", method: "Verra VM0044", batch: "BATCH-04" },
  { id: "0x9c1...4d8a", time: "08:15 today", credits: 1.18, value: 200.6, status: "verified", method: "Verra VM0044", batch: "BATCH-03" },
  { id: "0x4e2...9b1c", time: "Yesterday 19:42", credits: 0.84, value: 142.8, status: "verified", method: "Verra VM0044", batch: "BATCH-02" },
  { id: "0x1f8...6a3e", time: "Yesterday 11:08", credits: 1.61, value: 273.7, status: "pending", method: "Verra VM0044", batch: "BATCH-01" },
  { id: "0x8b4...2c7d", time: "2d ago", credits: 0.93, value: 158.1, status: "verified", method: "Gold Standard", batch: "BATCH-00" },
];

export default function CarbonCreditsPage() {
  const { metrics } = useSystem();
  const ytdCredits = 47.3;
  const ytdValue = ytdCredits * 170;

  const monthly = [
    { m: "Sep", credits: 5.2 }, { m: "Oct", credits: 6.8 }, { m: "Nov", credits: 7.4 },
    { m: "Dec", credits: 8.1 }, { m: "Jan", credits: 6.9 }, { m: "Feb", credits: 7.6 },
    { m: "Mar", credits: 9.1 }, { m: "Apr", credits: metrics.co2AvoidedT * 5 + 4 },
  ];

  return (
    <Layout>
      <PageHeader
        title="Carbon Credits — Tokenisation Pipeline"
        subtitle="Verra-aligned MRV · ERC-1155 on Polygon · Stage 0 prototype"
        right={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(14,165,233,0.12)] border border-[rgba(14,165,233,0.3)]">
            <span className="pulse-dot" />
            <span className="text-[11px] font-mono-num text-[#0EA5E9] uppercase tracking-wider">Pipeline Active</span>
          </div>
        }
      />

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <BigStat label="CO₂ Avoided · Today" value={metrics.co2AvoidedT.toFixed(2)} unit="tCO₂e" icon={<Leaf size={18} className="text-[#0EA5E9]" />} />
        <BigStat label="Credits · YTD" value={ytdCredits.toFixed(1)} unit="tCO₂e" sub="≈ 47 verified credits" icon={<FileCheck size={18} className="text-[#2563EB]" />} />
        <BigStat label="Revenue · YTD" value={fmtR(ytdValue)} sub="@ R170 / tCO₂" icon={<Hash size={18} className="text-[#60A5FA]" />} />
        <BigStat label="Pending Verification" value="2.79" unit="tCO₂e" sub="Auditor: 4Sight (mock)" icon={<FileCheck size={18} className="text-[#64748B]" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Pipeline */}
        <div className="card-surface p-4 xl:col-span-2">
          <h3 className="font-display font-semibold text-[#0F172A] text-sm mb-4">MRV → Tokenisation Pipeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <PipeStep n="1" label="Sense" desc="SCADA + smart meters · 14k tags · 1s resolution" active />
            <PipeStep n="2" label="Compute" desc="ΔCO₂ vs Eskom baseline · IPCC Tier 2 emission factors" active />
            <PipeStep n="3" label="Verify" desc="Internal audit hash + 3rd-party MRV (Verra VM0044)" active />
            <PipeStep n="4" label="Mint" desc="ERC-1155 batch on Polygon · auditor signature required" pending />
            <PipeStep n="5" label="Trade" desc="Off-chain registry sync · CSX, Climate Impact X" />
          </div>

          {/* Monthly trend */}
          <div className="mt-5 h-[180px] bg-[rgba(241,245,249,0.7)] rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider font-mono-num text-[#64748B] mb-2">Monthly issuance · last 8 months</div>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ccGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.success} stopOpacity={0.55} />
                    <stop offset="100%" stopColor={COLORS.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(37,99,235,0.05)" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit=" tCO₂" width={48} />
                <Tooltip />
                <Area type="monotone" dataKey="credits" stroke={COLORS.success} fill="url(#ccGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Methodology */}
        <div className="card-surface p-4">
          <h3 className="font-display font-semibold text-[#0F172A] text-sm mb-3">Calculation Methodology</h3>
          <div className="space-y-3 text-[11.5px] leading-relaxed">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#2563EB] font-mono-num mb-1">Baseline</div>
              <div className="text-[#475569]">Eskom grid emission factor: <span className="font-mono-num text-[#2563EB]">0.95 kg CO₂/kWh</span> (DFFE 2024).</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#2563EB] font-mono-num mb-1">Project</div>
              <div className="text-[#475569]">AetherOS metered load served by solar+wind+BESS round-trip.</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#2563EB] font-mono-num mb-1">Verifier</div>
              <div className="text-[#475569]">Verra VM0044 + ISO 14064-2 conformance check.</div>
            </div>
            <div className="pt-2 border-t border-[rgba(37,99,235,0.1)]">
              <button className="w-full py-2 rounded-md bg-[rgba(37,99,235,0.1)] hover:bg-[rgba(37,99,235,0.2)] border border-[rgba(37,99,235,0.3)] text-[#2563EB] text-[11px] font-medium flex items-center justify-center gap-1.5" data-testid="button-view-mrv">
                View MRV report <ExternalLink size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tx ledger */}
      <div className="card-surface mt-5 overflow-hidden">
        <div className="px-4 py-3 border-b border-[rgba(37,99,235,0.1)] flex items-center justify-between">
          <h3 className="font-display font-semibold text-[#0F172A] text-sm">On-chain Transactions · Polygon Mumbai (testnet)</h3>
          <span className="text-[10px] font-mono-num text-[#64748B] uppercase tracking-wider">ERC-1155 · CarbonAetherV1</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono-num">
              <tr className="border-b border-[rgba(37,99,235,0.08)]">
                <th className="text-left px-4 py-2.5">Tx Hash</th>
                <th className="text-left px-4 py-2.5">When</th>
                <th className="text-left px-4 py-2.5">Methodology</th>
                <th className="text-left px-4 py-2.5">Batch</th>
                <th className="text-right px-4 py-2.5">Credits</th>
                <th className="text-right px-4 py-2.5">Value (R)</th>
                <th className="text-right px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="font-mono-num">
              {TXS.map((tx) => (
                <tr key={tx.id} className="border-b border-[rgba(37,99,235,0.04)] last:border-0 hover:bg-[rgba(37,99,235,0.03)]">
                  <td className="px-4 py-2.5 text-[#2563EB]">{tx.id}</td>
                  <td className="px-4 py-2.5 text-[#64748B]">{tx.time}</td>
                  <td className="px-4 py-2.5 text-[#0F172A]">{tx.method}</td>
                  <td className="px-4 py-2.5 text-[#64748B]">{tx.batch}</td>
                  <td className="px-4 py-2.5 text-right text-[#0F172A]">{tx.credits.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-[#0EA5E9]">R {tx.value.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={tx.status === "verified" ? "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[rgba(14,165,233,0.15)] text-[#0EA5E9] border border-[#0EA5E9]/30" : "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[rgba(96,165,250,0.15)] text-[#60A5FA] border border-[#60A5FA]/30"}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

function BigStat({ label, value, unit, sub, icon }: { label: string; value: string; unit?: string; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="card-surface p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono-num">{label}</div>
        <div className="w-7 h-7 rounded-md bg-[rgba(14,165,233,0.1)] flex items-center justify-center">{icon}</div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <div className="font-display font-bold font-mono-num text-[24px] text-[#0F172A] leading-none">{value}</div>
        {unit && <div className="text-[12px] text-[#64748B] font-mono-num">{unit}</div>}
      </div>
      {sub && <div className="text-[11px] text-[#64748B] mt-1.5">{sub}</div>}
    </div>
  );
}

function PipeStep({ n, label, desc, active, pending }: { n: string; label: string; desc: string; active?: boolean; pending?: boolean }) {
  const color = active ? "#0EA5E9" : pending ? "#60A5FA" : "#64748B";
  return (
    <div className="bg-[#F1F5F9] rounded-md p-3 border" style={{ borderColor: `${color}40` }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono-num font-bold text-[#0F172A]" style={{ background: color }}>{n}</span>
        <span className="text-[12px] font-display font-semibold" style={{ color }}>{label}</span>
        {active && <span className="pulse-dot ml-auto" />}
      </div>
      <div className="text-[10.5px] text-[#64748B] leading-snug">{desc}</div>
    </div>
  );
}
