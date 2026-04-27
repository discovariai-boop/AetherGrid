// Shared simulation utilities for AetherOS demo data.

export type EskomStage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface LiveMetrics {
  bessSoc: number;        // %
  bessPower: number;      // MW (negative = discharging, positive = charging)
  solarMw: number;        // MW (0..2)
  windMw: number;         // MW (0..1)
  biomassPct: number;     // %
  biomassKw: number;      // kW
  gridImportMw: number;   // MW
  loadMw: number;         // MW (data centre total load)
  pue: number;            // 1.0..2.0
  rackTempC: number;      // average rack temp
  gpuDeferrablePct: number; // %
  islandingScore: number; // 0..100
  energySavingsR: number; // R today
  co2AvoidedT: number;    // tonnes today
  updatedAt: number;      // epoch ms
}

export interface FlowPoint {
  t: string;          // hour label "HH:00"
  hour: number;       // 0..23
  solar: number;
  wind: number;
  grid: number;
  bess: number;       // can be negative (discharging)
  load: number;
}

export const COLORS = {
  bg: "#F1F5F9",
  surface: "rgba(255,255,255,0.65)",
  primary: "#2563EB",
  secondary: "#1D4ED8",
  text: "#0F172A",
  muted: "#64748B",
  danger: "#1E3A8A",
  warning: "#475569",
  success: "#0EA5E9",
  gold: "#60A5FA",
  purple: "#6366F1",
  orange: "#3B82F6",
};

const SOLAR_CAP = 2.0;
const WIND_CAP = 1.0;
const BIOMASS_CAP_KW = 500;

// Solar curve: sine shape peaking at noon, max ~1.8 MW
export function solarAtHour(hour: number, jitter = 0): number {
  if (hour < 5 || hour > 19) return 0;
  const phase = ((hour - 5) / 14) * Math.PI; // 5am..7pm
  const base = Math.sin(phase) * 1.85;
  return Math.max(0, Math.min(SOLAR_CAP, base + jitter));
}

// Wind: random walk between 0.3 and 0.9 with mild drift
export function windAtHour(hour: number, seed = 0): number {
  // deterministic-ish wave for the daily history
  const v = 0.6 + Math.sin((hour + seed) * 0.7) * 0.25 + Math.cos(hour * 1.3) * 0.08;
  return Math.max(0.05, Math.min(WIND_CAP, v));
}

// Data centre base load curve (MW). Slight diurnal pattern around 3.6 MW.
export function loadAtHour(hour: number): number {
  const base = 3.6;
  const wave = Math.sin(((hour - 3) / 24) * Math.PI * 2) * 0.35;
  return base + wave;
}

// Generate the last 24h of operating data ending "now".
export function generateDayHistory(nowHour: number = new Date().getHours()): FlowPoint[] {
  const out: FlowPoint[] = [];
  for (let i = 23; i >= 0; i--) {
    const h = (nowHour - i + 24) % 24;
    const solar = solarAtHour(h);
    const wind = windAtHour(h);
    const load = loadAtHour(h);

    // BESS charges midday when surplus, discharges evening
    let bess = 0;
    const surplus = solar + wind - load;
    if (surplus > 0.4) bess = Math.min(1.5, surplus * 0.6); // charging (positive draw)
    else if (h >= 17 && h <= 21) bess = -Math.min(2.0, Math.max(0.5, load * 0.4));

    const gridRaw = load - solar - wind - (bess > 0 ? -bess : -bess);
    // grid provides whatever remains; biomass covers ~0.4 baseline
    const biomass = 0.42;
    const grid = Math.max(0, load - solar - wind - biomass + (bess > 0 ? bess : 0) + (bess < 0 ? bess : 0));

    out.push({
      t: `${String(h).padStart(2, "0")}:00`,
      hour: h,
      solar: round(solar, 2),
      wind: round(wind, 2),
      grid: round(Math.max(0, grid), 2),
      bess: round(bess, 2),
      load: round(load, 2),
    });
  }
  return out;
}

// 24h forecast Eskom stage: random walk seeded by current stage
export interface StageForecastBar { hour: number; label: string; stage: EskomStage; probability: number; }
export function generateStageForecast(currentStage: EskomStage, nowHour = new Date().getHours()): StageForecastBar[] {
  const bars: StageForecastBar[] = [];
  let stage = currentStage;
  for (let i = 1; i <= 24; i++) {
    const h = (nowHour + i) % 24;
    // increase stage chance during peak (17-21), decrease overnight
    let drift = 0;
    if (h >= 17 && h <= 21) drift = 1;
    else if (h >= 0 && h <= 5) drift = -2;
    const target = Math.max(0, Math.min(6, currentStage + drift + (Math.sin(i * 0.7) > 0.3 ? 1 : 0)));
    stage = clampStage(target);
    bars.push({
      hour: h,
      label: `${String(h).padStart(2, "0")}:00`,
      stage,
      probability: Math.min(0.95, 0.4 + (stage / 8) * 0.55),
    });
  }
  return bars;
}

export function clampStage(n: number): EskomStage {
  return Math.max(0, Math.min(8, Math.round(n))) as EskomStage;
}

// 48h renewable forecast vs actual (last 24 + next 24)
export interface RenewableForecastPoint {
  t: string;
  hour: number;
  solarForecast: number;
  solarActual?: number;
  windForecast: number;
  windActual?: number;
  isFuture: boolean;
}
export function generateRenewableForecast(nowHour = new Date().getHours()): RenewableForecastPoint[] {
  const out: RenewableForecastPoint[] = [];
  for (let i = -24; i <= 24; i++) {
    const h = (nowHour + i + 48) % 24;
    const isFuture = i > 0;
    const sf = solarAtHour(h);
    const wf = windAtHour(h, isFuture ? 1 : 0);
    out.push({
      t: `${i >= 0 ? "+" : ""}${i}h`,
      hour: h,
      solarForecast: round(sf, 2),
      windForecast: round(wf, 2),
      solarActual: isFuture ? undefined : round(sf * (0.9 + Math.random() * 0.2), 2),
      windActual: isFuture ? undefined : round(wf * (0.85 + Math.random() * 0.25), 2),
      isFuture,
    });
  }
  return out;
}

// Initial live metrics state
export function initialMetrics(): LiveMetrics {
  const hour = new Date().getHours();
  const solar = solarAtHour(hour);
  const wind = windAtHour(hour);
  const load = loadAtHour(hour);
  return {
    bessSoc: 67.3,
    bessPower: -1.8,
    solarMw: 1.42,
    windMw: 0.71,
    biomassPct: 85,
    biomassKw: 425,
    gridImportMw: Math.max(0, load - solar - wind - 0.4),
    loadMw: load,
    pue: 1.28,
    rackTempC: 24.7,
    gpuDeferrablePct: 35,
    islandingScore: 72,
    energySavingsR: 8420,
    co2AvoidedT: 3.2,
    updatedAt: Date.now(),
  };
}

// Tick: small fluctuations (±3%)
export function tickMetrics(prev: LiveMetrics, stage: EskomStage): LiveMetrics {
  const hour = new Date().getHours();
  const j = () => (Math.random() - 0.5) * 0.06; // ±3%
  const newSolar = clamp(solarAtHour(hour) * (1 + j()), 0, SOLAR_CAP);
  const newWind  = clamp(windAtHour(hour) * (1 + j() * 1.5), 0.05, WIND_CAP);
  const newLoad  = clamp(loadAtHour(hour) * (1 + j() * 0.5), 1.5, 5);
  const biomassPct = clamp(prev.biomassPct + (Math.random() - 0.5) * 4, 60, 100);
  const biomassMw = (biomassPct / 100) * (BIOMASS_CAP_KW / 1000);

  // BESS: discharges during stage > 0 evenings; charges from surplus
  const surplus = newSolar + newWind + biomassMw - newLoad;
  let bessPower: number;
  if (stage >= 2 && (hour >= 17 || hour <= 6)) {
    bessPower = -Math.min(2.0, Math.max(0.5, newLoad * 0.45));
  } else if (surplus > 0.3) {
    bessPower = Math.min(1.2, surplus * 0.7);
  } else {
    bessPower = prev.bessPower * 0.9 + (Math.random() - 0.5) * 0.2;
  }
  // SoC drift
  const socDrift = (-bessPower / 10) * (15 / 3600); // tick is 15s
  const bessSoc = clamp(prev.bessSoc + socDrift * 100, 12, 99);

  // Grid: only used if islanding not possible; reduces during high renewable
  const gridImport = stage >= 2
    ? Math.max(0, newLoad - newSolar - newWind - biomassMw + bessPower) * 0.15 // mostly islanded
    : Math.max(0, newLoad - newSolar - newWind - biomassMw + (bessPower > 0 ? bessPower : 0));

  // PUE drifts a bit with rack temp
  const rackTempC = clamp(prev.rackTempC + (Math.random() - 0.5) * 0.4, 21, 30);
  const pue = clamp(1.25 + (rackTempC - 22) * 0.01, 1.20, 1.45);

  // GPU deferrable changes with stage
  const gpuDeferrablePct = stage === 0 ? 5 : stage <= 2 ? 35 : stage <= 4 ? 65 : 90;

  // Islanding score tracks SoC + renewable mix
  const renewMix = (newSolar + newWind + biomassMw) / Math.max(1, newLoad);
  const islandingScore = clamp(bessSoc * 0.5 + renewMix * 50, 10, 99);

  // Cumulative metrics drift up
  const energySavingsR = prev.energySavingsR + Math.round(Math.random() * 15);
  const co2AvoidedT = prev.co2AvoidedT + Math.random() * 0.005;

  return {
    bessSoc: round(bessSoc, 1),
    bessPower: round(bessPower, 2),
    solarMw: round(newSolar, 2),
    windMw: round(newWind, 2),
    biomassPct: round(biomassPct, 0),
    biomassKw: Math.round(biomassMw * 1000),
    gridImportMw: round(gridImport, 2),
    loadMw: round(newLoad, 2),
    pue: round(pue, 2),
    rackTempC: round(rackTempC, 1),
    gpuDeferrablePct,
    islandingScore: round(islandingScore, 0),
    energySavingsR,
    co2AvoidedT: round(co2AvoidedT, 2),
    updatedAt: Date.now(),
  };
}

export function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
export function round(v: number, d: number) { const f = Math.pow(10, d); return Math.round(v * f) / f; }
export function fmtR(n: number): string { return "R " + n.toLocaleString("en-ZA", { maximumFractionDigits: 0 }); }
export function fmtNum(n: number, d = 2): string { return n.toLocaleString("en-ZA", { minimumFractionDigits: d, maximumFractionDigits: d }); }

// Stage utilities
export function stageColor(s: EskomStage): string {
  if (s === 0) return COLORS.success;
  if (s <= 2) return COLORS.gold;
  if (s <= 4) return COLORS.orange;
  return COLORS.danger;
}
export function stageLabel(s: EskomStage): string {
  return s === 0 ? "No load-shedding" : `Stage ${s}`;
}

// Dispatch decision (computed from metrics + stage)
export interface DispatchDecision {
  bessAction: string;
  bessPctAction: number;        // 0-100 magnitude
  bessDirection: "discharge" | "charge" | "idle";
  biomassPct: number;
  gpuRouting: "RUN_FULL" | "THROTTLE_25" | "PAUSE_DEFERRABLE" | "EMERGENCY_MINIMUM";
  gpuMessage: string;
  gpuDeferrablePct: number;
  reasoning: string[];
}
export function computeDispatch(m: LiveMetrics, stage: EskomStage): DispatchDecision {
  let gpuRouting: DispatchDecision["gpuRouting"] = "RUN_FULL";
  let gpuMessage = "🚀 FULL THROUGHPUT — Renewable surplus. Maximising training jobs.";
  if (stage === 1) { gpuRouting = "THROTTLE_25"; gpuMessage = "⚡ LIGHT THROTTLE — Conserving for incoming shedding."; }
  if (stage >= 2 && stage <= 4) { gpuRouting = "PAUSE_DEFERRABLE"; gpuMessage = `⏸ DEFERRABLE PAUSED — Stage ${stage} active. Inference only.`; }
  if (stage >= 5) { gpuRouting = "EMERGENCY_MINIMUM"; gpuMessage = "🚨 EMERGENCY MINIMUM — Critical loads only."; }

  const bessDirection = m.bessPower < -0.1 ? "discharge" : m.bessPower > 0.1 ? "charge" : "idle";
  const bessPctAction = clamp(Math.abs(m.bessPower) / 2.5 * 100, 0, 100);

  return {
    bessAction: bessDirection === "discharge" ? `Discharging at ${m.bessPower.toFixed(1)} MW` : bessDirection === "charge" ? `Charging at +${m.bessPower.toFixed(1)} MW` : "Idle",
    bessPctAction,
    bessDirection,
    biomassPct: m.biomassPct,
    gpuRouting,
    gpuMessage,
    gpuDeferrablePct: m.gpuDeferrablePct,
    reasoning: [
      `Eskom Stage ${stage}`,
      `BESS SoC ${m.bessSoc.toFixed(1)}%`,
      `Renewable fraction ${(((m.solarMw + m.windMw) / Math.max(1, m.loadMw)) * 100).toFixed(0)}%`,
      `Rack temp ${m.rackTempC.toFixed(1)}°C`,
    ],
  };
}
