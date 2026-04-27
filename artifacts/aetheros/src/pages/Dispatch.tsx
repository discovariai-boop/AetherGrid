import { useState } from "react";
import { Layout, PageHeader } from "@/components/Layout";
import { useSystem } from "@/context/SystemContext";
import { Slider } from "@/components/ui/slider";
import { Loader2, Zap, Flame, Server } from "lucide-react";
import { COLORS, computeDispatch, type EskomStage, type LiveMetrics, fmtR } from "@/lib/sim";

export default function DispatchPage() {
  const { stage, metrics, dispatch, dispatchHistory } = useSystem();
  const [inputs, setInputs] = useState<LiveMetrics & { stage: EskomStage }>(() => ({
    ...metrics,
    stage,
  }));
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof computeDispatch> | null>(null);

  function calculate() {
    setCalculating(true);
    setTimeout(() => {
      setResult(computeDispatch(inputs as LiveMetrics, inputs.stage));
      setCalculating(false);
    }, 700);
  }

  const shown = result ?? dispatch;
  const showAlert = inputs.stage > 2;

  const forecast = [
    { horizon: "+1h", stage: 2, solar: 1.35, wind: 0.71 },
    { horizon: "+6h", stage: 1, solar: 0.82, wind: 0.64 },
    { horizon: "+12h", stage: 0, solar: 0.00, wind: 0.58 },
    { horizon: "+24h", stage: 3, solar: 1.21, wind: 0.73 },
  ];

  return (
    <Layout>
      <PageHeader
        title="AI Dispatch Control"
        subtitle="PPO via Ray RLlib · 30s dispatch cycle · 14ms inference"
        right={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(14,165,233,0.12)] border border-[rgba(14,165,233,0.3)]">
            <span className="pulse-dot" />
            <span className="text-[11px] font-mono-num text-[#0EA5E9] uppercase tracking-wider">System Active</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Sensor inputs */}
        <div className="xl:col-span-2 card-surface p-5">
          <h2 className="font-display font-semibold text-[#0F172A] text-base mb-4">Sensor Inputs</h2>
          <div className="space-y-5">
            <SliderRow label="BESS SoC" unit="%" value={inputs.bessSoc} min={0} max={100} step={1}
              onChange={(v) => setInputs({ ...inputs, bessSoc: v })} />
            <SliderRow label="Solar Generation" unit="MW" value={inputs.solarMw} min={0} max={2} step={0.05}
              onChange={(v) => setInputs({ ...inputs, solarMw: v })} />
            <SliderRow label="Wind Generation" unit="MW" value={inputs.windMw} min={0} max={1} step={0.05}
              onChange={(v) => setInputs({ ...inputs, windMw: v })} />
            <SliderRow label="Eskom Stage" unit="" value={inputs.stage} min={0} max={8} step={1}
              onChange={(v) => setInputs({ ...inputs, stage: v as EskomStage })} integer />
            <SliderRow label="Rack Temperature" unit="°C" value={inputs.rackTempC} min={15} max={45} step={0.5}
              onChange={(v) => setInputs({ ...inputs, rackTempC: v })} />
          </div>

          <button
            onClick={calculate}
            disabled={calculating}
            data-testid="button-calculate-dispatch"
            className="mt-6 w-full py-3 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-[#F1F5F9] font-display font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.25)]"
          >
            {calculating ? <><Loader2 size={14} className="animate-spin" /> Calculating…</> : <><Zap size={14} /> Get Dispatch Decision</>}
          </button>
        </div>

        {/* Decision output */}
        <div className="xl:col-span-3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ActionBadge
              icon={<Zap size={16} className="text-[#1E3A8A]" />}
              title="BESS Action"
              value={shown.bessDirection === "discharge" ? `Discharge ${shown.bessPctAction.toFixed(0)}%` : shown.bessDirection === "charge" ? `Charge ${shown.bessPctAction.toFixed(0)}%` : "Idle"}
              detail={`${(metrics.bessPower).toFixed(1)} MW`}
              color="#1E3A8A"
            />
            <ActionBadge
              icon={<Flame size={16} className="text-[#60A5FA]" />}
              title="Biomass"
              value={`${shown.biomassPct}% Rated`}
              detail={`${Math.round((shown.biomassPct / 100) * 500)} kW`}
              color="#60A5FA"
            />
            <ActionBadge
              icon={<Server size={16} className="text-[#2563EB]" />}
              title="GPU Routing"
              value={`${shown.gpuDeferrablePct}% Deferrable`}
              detail={shown.gpuRouting === "RUN_FULL" ? "Front-load now" : shown.gpuRouting === "THROTTLE_25" ? "Light throttle" : shown.gpuRouting === "PAUSE_DEFERRABLE" ? "Pause deferrable" : "Critical only"}
              color="#2563EB"
            />
          </div>

          {/* Forecast table */}
          <div className="card-surface overflow-hidden">
            <div className="px-4 py-3 border-b border-[rgba(37,99,235,0.1)] flex items-center justify-between">
              <h3 className="font-display font-semibold text-[#0F172A] text-sm">24h Forecast Horizon</h3>
              <span className="text-[10px] font-mono-num text-[#64748B] uppercase tracking-wider">LSTM v0.4 · Open-Meteo</span>
            </div>
            <table className="w-full text-[12px]">
              <thead className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono-num">
                <tr className="border-b border-[rgba(37,99,235,0.08)]">
                  <th className="text-left px-4 py-2">Horizon</th>
                  <th className="text-left px-4 py-2">Stage</th>
                  <th className="text-right px-4 py-2">Solar MW</th>
                  <th className="text-right px-4 py-2">Wind MW</th>
                </tr>
              </thead>
              <tbody className="font-mono-num">
                {forecast.map((f) => (
                  <tr key={f.horizon} className="border-b border-[rgba(37,99,235,0.05)] last:border-0">
                    <td className="px-4 py-2.5 text-[#0F172A]">{f.horizon}</td>
                    <td className="px-4 py-2.5">
                      <span className={`stage-${f.stage} text-white px-2 py-0.5 rounded text-[11px] font-semibold`}>S{f.stage}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-[#60A5FA]">{f.solar.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right text-[#2563EB]">{f.wind.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Anomaly alert */}
          {showAlert && (
            <div className="border-l-4 border-l-[#1E3A8A] bg-[rgba(30,58,138,0.08)] rounded-r-lg p-4">
              <div className="flex items-center gap-2 text-[#1E3A8A] text-[11px] uppercase tracking-wider font-mono-num mb-1">
                <span className="pulse-dot red" /> CRITICAL
              </div>
              <div className="text-[#0F172A] text-sm font-semibold">Stage {inputs.stage} detected</div>
              <div className="text-[#0F172A]/80 text-[12px] mt-1 leading-relaxed">
                Pre-charging BESS. Deferring all training jobs. Islanding protocol armed. Estimated grid recovery in 145 min.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dispatch history */}
      <div className="card-surface mt-6 overflow-hidden">
        <div className="px-4 py-3 border-b border-[rgba(37,99,235,0.1)] flex items-center justify-between">
          <h3 className="font-display font-semibold text-[#0F172A] text-sm">Recent Dispatch Decisions</h3>
          <span className="text-[10px] font-mono-num text-[#64748B] uppercase tracking-wider">Last 10 actions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono-num">
              <tr className="border-b border-[rgba(37,99,235,0.08)]">
                <th className="text-left px-4 py-2">Time</th>
                <th className="text-left px-4 py-2">BESS Action</th>
                <th className="text-right px-4 py-2">Biomass</th>
                <th className="text-right px-4 py-2">GPU Active</th>
                <th className="text-right px-4 py-2">Savings</th>
              </tr>
            </thead>
            <tbody className="font-mono-num">
              {dispatchHistory.map((h) => (
                <tr key={h.id} className="border-b border-[rgba(37,99,235,0.04)] last:border-0">
                  <td className="px-4 py-2.5 text-[#64748B]">{new Date(h.time).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-4 py-2.5 text-[#0F172A]">{h.bessAction}</td>
                  <td className="px-4 py-2.5 text-right text-[#60A5FA]">{h.biomassPct}%</td>
                  <td className="px-4 py-2.5 text-right text-[#2563EB]">{h.gpuPct}%</td>
                  <td className="px-4 py-2.5 text-right text-[#0EA5E9]">{fmtR(h.savings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

function SliderRow({
  label, unit, value, min, max, step, onChange, integer,
}: { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; integer?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-mono-num uppercase tracking-wider text-[#64748B]">{label}</label>
        <div className="font-mono-num text-[#0F172A] text-[13px]">{integer ? Math.round(value) : value.toFixed(2)} <span className="text-[#64748B] text-[10px]">{unit}</span></div>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0]!)} />
    </div>
  );
}

function ActionBadge({ icon, title, value, detail, color }: { icon: React.ReactNode; title: string; value: string; detail: string; color: string }) {
  return (
    <div className="card-surface p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-mono-num text-[#64748B]">{title}</span>
      </div>
      <div className="font-display font-bold text-[#0F172A] text-base mb-1">{value}</div>
      <div className="text-[11px] font-mono-num" style={{ color }}>{detail}</div>
    </div>
  );
}
