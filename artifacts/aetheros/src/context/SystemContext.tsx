import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  type EskomStage,
  type LiveMetrics,
  type FlowPoint,
  initialMetrics,
  tickMetrics,
  generateDayHistory,
  computeDispatch,
  type DispatchDecision,
  fmtR,
} from "@/lib/sim";

export interface AlertItem {
  id: string;
  severity: "emergency" | "critical" | "warning";
  signal: string;
  title: string;
  message: string;
  recommended: string;
  method: string;
  score: number;
  time: number;
  resolved?: boolean;
}

export interface DispatchHistoryItem {
  id: string;
  time: number;
  bessAction: string;
  biomassPct: number;
  gpuPct: number;
  savings: number;
}

interface SystemCtx {
  stage: EskomStage;
  setStage: (s: EskomStage) => void;
  metrics: LiveMetrics;
  history: FlowPoint[];
  dispatch: DispatchDecision;
  alerts: AlertItem[];
  acknowledgeAlert: (id: string) => void;
  dispatchHistory: DispatchHistoryItem[];
}

const Ctx = createContext<SystemCtx | null>(null);

export function SystemProvider({ children }: { children: ReactNode }) {
  const [stage, setStageInternal] = useState<EskomStage>(2);
  const [metrics, setMetrics] = useState<LiveMetrics>(() => initialMetrics());
  const [history] = useState<FlowPoint[]>(() => generateDayHistory());
  const [alerts, setAlerts] = useState<AlertItem[]>(() => initialAlerts());
  const [dispatchHistory, setDispatchHistory] = useState<DispatchHistoryItem[]>(() => initialDispatchHistory());
  const lastStageRef = useRef<EskomStage>(stage);

  // Tick every 15s
  useEffect(() => {
    const id = setInterval(() => {
      setMetrics((prev) => tickMetrics(prev, stage));
    }, 15000);
    return () => clearInterval(id);
  }, [stage]);

  // When stage changes, fire toast + maybe an alert
  const setStage = (s: EskomStage) => {
    setStageInternal(s);
  };

  useEffect(() => {
    const prev = lastStageRef.current;
    if (prev !== stage) {
      lastStageRef.current = stage;
      const goingUp = stage > prev;
      const severity: AlertItem["severity"] =
        stage >= 5 ? "emergency" : stage >= 3 ? "critical" : "warning";
      const message = stage === 0
        ? "✓ Eskom Stage cleared. Resuming grid operations."
        : `Eskom Stage ${stage} ${goingUp ? "armed" : "downgraded"}. Recalculating dispatch.`;

      toast(message, {
        description: stage === 0
          ? "Grid synchronisation re-engaged."
          : `Pre-charging BESS, deferring ${stage >= 3 ? "all training jobs" : "non-critical workloads"}, islanding protocol ${stage >= 4 ? "armed" : "ready"}.`,
        className: stage >= 3 ? "border-l-4 border-l-[#E24B4A]" : "border-l-4 border-l-[#BA7517]",
      });

      if (stage >= 2) {
        setAlerts((a) => [
          {
            id: `stage-${Date.now()}`,
            severity,
            signal: "eskom_stage",
            title: "ESKOM_STAGE_CHANGE",
            message: `Stage ${stage} ${goingUp ? "detected" : "downgraded"}. Pre-charging BESS, deferring training workloads.`,
            recommended: stage >= 4 ? "Arm islanding protocol. Verify BESS thermal limits." : "Confirm critical workload tagging. Pre-warm BESS.",
            method: "rule_engine",
            score: 0.95,
            time: Date.now(),
          },
          ...a,
        ]);
      }
    }
  }, [stage]);

  // Append a dispatch decision row every minute
  useEffect(() => {
    const id = setInterval(() => {
      setDispatchHistory((h) => [
        {
          id: `d-${Date.now()}`,
          time: Date.now(),
          bessAction: metrics.bessPower < 0 ? `Discharge ${metrics.bessPower.toFixed(1)} MW` : `Charge ${metrics.bessPower.toFixed(1)} MW`,
          biomassPct: metrics.biomassPct,
          gpuPct: 100 - metrics.gpuDeferrablePct,
          savings: Math.round(80 + Math.random() * 120),
        },
        ...h.slice(0, 9),
      ]);
    }, 60000);
    return () => clearInterval(id);
  }, [metrics]);

  const dispatch = useMemo(() => computeDispatch(metrics, stage), [metrics, stage]);

  const acknowledgeAlert = (id: string) => {
    setAlerts((a) => a.map((x) => x.id === id ? { ...x, resolved: true } : x));
  };

  const value: SystemCtx = {
    stage, setStage,
    metrics, history,
    dispatch, alerts, acknowledgeAlert,
    dispatchHistory,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSystem(): SystemCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSystem must be used inside SystemProvider");
  return v;
}

function initialAlerts(): AlertItem[] {
  const now = Date.now();
  return [
    {
      id: "a1", severity: "critical", signal: "avg_rack_temp_c",
      title: "BESS_THERMAL",
      message: "Rack temperature 31.2°C exceeds critical threshold (30°C)",
      recommended: "Check CDU flow rate. Verify no blocked hot aisles.",
      method: "hard_limit", score: 0.82, time: now - 1000 * 60 * 2,
    },
    {
      id: "a2", severity: "warning", signal: "solar_yield_mape",
      title: "FORECAST_DRIFT",
      message: "Solar yield 14% below forecast for last 45 min",
      recommended: "Inspect string inverters. Cross-check Open-Meteo cloud cover.",
      method: "isolation_forest", score: 0.61, time: now - 1000 * 60 * 18,
    },
    {
      id: "a3", severity: "emergency", signal: "grid_voltage_drop",
      title: "GRID_FAULT",
      message: "Grid voltage dropped to 215V (nominal 230V) — auto-islanded",
      recommended: "Hold islanded operation. Notify City of Cape Town SCADA.",
      method: "hard_limit", score: 0.97, time: now - 1000 * 60 * 47, resolved: true,
    },
    {
      id: "a4", severity: "warning", signal: "biomass_feedrate",
      title: "BIOMASS_UNDERFEED",
      message: "Biomass feed rate 18% below target for last 12 min",
      recommended: "Check auger torque. Refill hopper if below 30%.",
      method: "statistical", score: 0.54, time: now - 1000 * 60 * 92,
    },
  ];
}

function initialDispatchHistory(): DispatchHistoryItem[] {
  const now = Date.now();
  return Array.from({ length: 10 }, (_, i) => ({
    id: `dh-${i}`,
    time: now - i * 60000 - 30000,
    bessAction: i % 3 === 0 ? "Charge +0.6 MW" : `Discharge -${(1.2 + Math.random() * 0.8).toFixed(1)} MW`,
    biomassPct: Math.round(78 + Math.random() * 12),
    gpuPct: Math.round(40 + Math.random() * 30),
    savings: Math.round(80 + Math.random() * 140),
  }));
}

export { fmtR };
