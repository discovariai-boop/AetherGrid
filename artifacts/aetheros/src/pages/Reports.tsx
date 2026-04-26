import { Layout, PageHeader } from "@/components/Layout";
import { useSystem } from "@/context/SystemContext";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { COLORS, fmtR } from "@/lib/sim";
import { Download, FileText, TrendingUp } from "lucide-react";
import { useMemo } from "react";

export default function ReportsPage() {
  const { metrics } = useSystem();

  const monthly = useMemo(() => {
    const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
    return months.map((m, i) => ({
      m,
      savings: 28000 + i * 4500 + Math.round(Math.random() * 8000),
      co2: 4.2 + i * 0.6 + Math.random() * 1.2,
      uptime: 99.2 + Math.random() * 0.7,
    }));
  }, []);

  const energyMix = [
    { name: "Solar", v: 41, color: COLORS.gold },
    { name: "Wind", v: 18, color: COLORS.primary },
    { name: "BESS round-trip", v: 24, color: COLORS.purple },
    { name: "Biomass", v: 11, color: "#FF6B35" },
    { name: "Eskom (peak)", v: 6, color: COLORS.danger },
  ];

  const ytdSavings = monthly.reduce((a, b) => a + b.savings, 0);
  const ytdCo2 = monthly.reduce((a, b) => a + b.co2, 0);

  const reports = [
    { name: "Monthly Operational Report — April 2026", date: "1 May 2026", size: "2.4 MB", type: "PDF" },
    { name: "B-BBEE Procurement Compliance Q1 2026", date: "12 Apr 2026", size: "1.1 MB", type: "PDF" },
    { name: "Verra MRV Submission · BATCH-04", date: "8 Apr 2026", size: "3.8 MB", type: "ZIP" },
    { name: "Eskom Distribution Compliance — March", date: "2 Apr 2026", size: "0.8 MB", type: "PDF" },
    { name: "ISO 14064-2 Audit Trail · Q1 2026", date: "29 Mar 2026", size: "5.2 MB", type: "PDF" },
  ];

  return (
    <Layout>
      <PageHeader
        title="Reports & Compliance"
        subtitle="ESG, financial, and operational reporting · Auto-generated monthly"
        right={
          <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#00C9A7] hover:bg-[#00A389] text-[#0A1628] text-[12px] font-display font-semibold" data-testid="button-generate-report">
            <FileText size={14} /> Generate Report
          </button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="YTD Energy Savings" value={fmtR(ytdSavings)} delta="+18% YoY" icon={<TrendingUp size={16} className="text-[#1D9E75]" />} accent="green" />
        <Kpi label="YTD CO₂ Avoided" value={`${ytdCo2.toFixed(1)} t`} delta="+22% YoY" icon={<TrendingUp size={16} className="text-[#1D9E75]" />} accent="green" />
        <Kpi label="Avg PUE" value={metrics.pue.toFixed(2)} delta="−0.21 vs SA avg" icon={<TrendingUp size={16} className="text-[#00C9A7]" />} accent="teal" />
        <Kpi label="Uptime SLA" value="99.94%" delta="+0.04 vs target" icon={<TrendingUp size={16} className="text-[#1D9E75]" />} accent="green" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Savings trend */}
        <div className="card-surface p-4 xl:col-span-2">
          <h3 className="font-display font-semibold text-white text-sm mb-3">Monthly Savings Trend</h3>
          <div className="h-[260px] bg-[#060F1E] rounded-lg p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="sgrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.success} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={COLORS.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(0,201,167,0.05)" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `R${(v/1000).toFixed(0)}k`} width={56} />
                <Tooltip formatter={(v: number) => fmtR(v)} />
                <Area type="monotone" dataKey="savings" stroke={COLORS.success} strokeWidth={2} fill="url(#sgrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy mix */}
        <div className="card-surface p-4">
          <h3 className="font-display font-semibold text-white text-sm mb-3">Energy Mix · YTD</h3>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={energyMix} dataKey="v" nameKey="name" innerRadius={50} outerRadius={80} stroke="#0A1628" strokeWidth={2}>
                  {energyMix.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-[#7B8FAB] text-center mt-1">94% renewable + storage</div>
        </div>
      </div>

      {/* Reports table */}
      <div className="card-surface mt-5 overflow-hidden">
        <div className="px-4 py-3 border-b border-[rgba(0,201,167,0.1)] flex items-center justify-between">
          <h3 className="font-display font-semibold text-white text-sm">Generated Reports</h3>
          <span className="text-[10px] font-mono-num text-[#7B8FAB] uppercase tracking-wider">Auto-archived · S3 cold storage</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#7B8FAB] font-mono-num">
              <tr className="border-b border-[rgba(0,201,167,0.08)]">
                <th className="text-left px-4 py-2.5">Report</th>
                <th className="text-left px-4 py-2.5">Generated</th>
                <th className="text-left px-4 py-2.5">Size</th>
                <th className="text-left px-4 py-2.5">Format</th>
                <th className="text-right px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="font-mono-num">
              {reports.map((r) => (
                <tr key={r.name} className="border-b border-[rgba(0,201,167,0.04)] last:border-0 hover:bg-[rgba(0,201,167,0.03)]">
                  <td className="px-4 py-3 text-white">{r.name}</td>
                  <td className="px-4 py-3 text-[#7B8FAB]">{r.date}</td>
                  <td className="px-4 py-3 text-[#7B8FAB]">{r.size}</td>
                  <td className="px-4 py-3"><span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[rgba(0,201,167,0.1)] text-[#00C9A7] border border-[#00C9A7]/30">{r.type}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-[#00C9A7] hover:text-white text-[11px] flex items-center gap-1 ml-auto" data-testid={`button-download-${r.name}`}>
                      <Download size={11} /> Download
                    </button>
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

function Kpi({ label, value, delta, icon, accent }: { label: string; value: string; delta: string; icon: React.ReactNode; accent: "green" | "teal" }) {
  const c = accent === "green" ? "text-[#1D9E75]" : "text-[#00C9A7]";
  return (
    <div className="card-surface px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[10px] uppercase tracking-wider text-[#7B8FAB] font-mono-num">{label}</div>
        {icon}
      </div>
      <div className="font-display font-bold font-mono-num text-[22px] text-white leading-tight">{value}</div>
      <div className={`text-[11px] font-mono-num ${c} mt-0.5`}>{delta}</div>
    </div>
  );
}
