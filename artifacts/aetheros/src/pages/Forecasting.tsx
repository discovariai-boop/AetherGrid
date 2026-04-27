import { Layout, PageHeader } from "@/components/Layout";
import { useSystem } from "@/context/SystemContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell,
  LineChart, Line, Legend, ReferenceLine,
} from "recharts";
import { COLORS, generateStageForecast, generateRenewableForecast, stageColor } from "@/lib/sim";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useMemo } from "react";

export default function ForecastingPage() {
  const { stage } = useSystem();
  const stageForecast = useMemo(() => generateStageForecast(stage), [stage]);
  const renewable = useMemo(() => generateRenewableForecast(), []);

  const peakWindow = stageForecast.slice(13, 21).filter((s) => s.stage >= 3);
  const peakLabel = peakWindow.length
    ? `${peakWindow[0]!.label}–${peakWindow[peakWindow.length - 1]!.label} (Stage ${Math.max(...peakWindow.map((p) => p.stage))} probable, ${Math.round(peakWindow.reduce((a, b) => a + b.probability, 0) / peakWindow.length * 100)}% confidence)`
    : "No high-risk windows in next 24h";

  return (
    <Layout>
      <PageHeader
        title="Forecasting"
        subtitle="Eskom + renewable yield · 24–48h outlook"
        right={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(37,99,235,0.08)] border border-[rgba(37,99,235,0.25)]">
            <span className="text-[11px] font-mono-num text-[#2563EB] uppercase tracking-wider">LSTM v0.4 + Open-Meteo</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Eskom forecast */}
        <div className="card-surface p-4">
          <div className="mb-3">
            <h2 className="font-display font-semibold text-[#0F172A] text-base">24h Eskom Stage Forecast</h2>
            <p className="text-[11px] text-[#64748B] font-mono-num">Cape Town · LSTM ensemble</p>
          </div>

          <div className="h-[280px] bg-[rgba(241,245,249,0.7)] rounded-lg p-3 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageForecast} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(37,99,235,0.06)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 8]} ticks={[0,2,4,6,8]} width={32} />
                <Tooltip
                  cursor={{ fill: "rgba(37,99,235,0.05)" }}
                  formatter={(v: number, _: string, p: { payload?: { probability?: number } }) => [`Stage ${v} (${Math.round((p.payload?.probability ?? 0) * 100)}%)`, "Forecast"]}
                />
                <Bar dataKey="stage" radius={[3, 3, 0, 0]}>
                  {stageForecast.map((d, i) => <Cell key={i} fill={stageColor(d.stage)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Probability strip */}
          <div className="flex h-2 rounded-full overflow-hidden mb-3">
            {stageForecast.map((d, i) => (
              <div key={i} className="flex-1" style={{ background: stageColor(d.stage), opacity: 0.4 + d.probability * 0.6 }} />
            ))}
          </div>

          {peakWindow.length > 0 && (
            <div className="border border-[#475569]/40 bg-[rgba(71,85,105,0.08)] rounded-md p-3 flex items-start gap-3">
              <AlertTriangle size={18} className="text-[#475569] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[#60A5FA] text-[12px] font-semibold">⚠ High risk window</div>
                <div className="text-[11px] text-[#475569] font-mono-num mt-0.5">{peakLabel}</div>
              </div>
            </div>
          )}
        </div>

        {/* Renewable forecast */}
        <div className="card-surface p-4">
          <div className="mb-3">
            <h2 className="font-display font-semibold text-[#0F172A] text-base">Renewable Yield Forecast · 48h</h2>
            <p className="text-[11px] text-[#64748B] font-mono-num">Solar + wind · forecast vs actual</p>
          </div>

          <div className="h-[280px] bg-[rgba(241,245,249,0.7)] rounded-lg p-3 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={renewable} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(37,99,235,0.06)" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 9 }} interval={5} />
                <YAxis tick={{ fontSize: 10 }} unit=" MW" width={48} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine x="+0h" stroke={COLORS.primary} strokeDasharray="3 3" label={{ value: "now", fill: COLORS.primary, fontSize: 10 }} />
                <Line type="monotone" dataKey="solarForecast" stroke={COLORS.gold} dot={false} strokeWidth={2} name="Solar (forecast)" />
                <Line type="monotone" dataKey="solarActual" stroke={COLORS.gold} dot={false} strokeWidth={1.4} strokeDasharray="4 3" name="Solar (actual)" />
                <Line type="monotone" dataKey="windForecast" stroke={COLORS.primary} dot={false} strokeWidth={2} name="Wind (forecast)" />
                <Line type="monotone" dataKey="windActual" stroke={COLORS.primary} dot={false} strokeWidth={1.4} strokeDasharray="4 3" name="Wind (actual)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Model accuracy */}
          <div className="space-y-2">
            <ModelGate name="Load-shedding LSTM" gates={[
              { metric: "MAE", value: "0.31 stages", passed: true },
              { metric: "Stage accuracy", value: "81.2%", passed: true },
              { metric: "Within ±1 stage", value: "94.7%", passed: true },
            ]} />
            <ModelGate name="Solar LSTM" gates={[
              { metric: "MAPE", value: "7.8%", passed: true },
              { metric: "R²", value: "0.914", passed: true },
            ]} />
            <ModelGate name="Wind GBM" gates={[
              { metric: "MAPE", value: "11.3%", passed: true },
              { metric: "R²", value: "0.876", passed: true },
            ]} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ModelGate({ name, gates }: { name: string; gates: { metric: string; value: string; passed: boolean }[] }) {
  return (
    <div className="bg-[#F1F5F9] rounded-md px-3 py-2.5 border border-[rgba(37,99,235,0.08)]">
      <div className="text-[12px] text-[#0F172A] font-semibold mb-1.5">{name}</div>
      <div className="space-y-1">
        {gates.map((g) => (
          <div key={g.metric} className="flex items-center justify-between text-[11px] font-mono-num">
            <span className="text-[#64748B]">{g.metric}</span>
            <span className="text-[#0F172A] flex items-center gap-1.5">
              {g.value}
              {g.passed
                ? <CheckCircle2 size={12} className="text-[#0EA5E9]" />
                : <span className="text-[#1E3A8A]">✗</span>}
              <span className={g.passed ? "text-[#0EA5E9] text-[10px]" : "text-[#1E3A8A] text-[10px]"}>
                {g.passed ? "Gate passed" : "Gate failed"}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
