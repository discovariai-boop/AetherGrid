# AetherOS — AetherGrid AI Dashboard

Polished frontend-only demo dashboard for **AetherGrid AI**, a South African deep-tech startup
building an AI-Thermal-Smart Grid OS for AI data centres operating during Eskom load-shedding.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (in `src/components/ui/`)
- Recharts for all charts
- wouter for routing
- sonner for toasts
- lucide-react for icons
- Fonts: Syne (display), DM Sans (body), DM Mono (numerics) — loaded from Google Fonts

## Architecture

- **Frontend-only.** No backend, no API, no codegen. All data is simulated client-side
  in `src/lib/sim.ts` and orchestrated by `src/context/SystemContext.tsx`.
- `SystemProvider` ticks live metrics every 15 s, exposes the current Eskom stage,
  generates dispatch decisions, manages alerts, and pushes toasts on stage changes.
- The Eskom Stage simulator widget (bottom-right) lets the demo viewer change the
  stage at any time; the change cascades through every page (dispatch, GPU routing,
  alerts, islanding score, etc.).
- The shell (`Sidebar`, `ConnectionBar`, `EskomStageWidget`, `Footer`) lives in
  `src/components/Layout.tsx`.

## Pages

| Path             | Component        | Purpose                                          |
|------------------|------------------|--------------------------------------------------|
| `/`              | `Overview`       | Live KPI grid, energy flow, dispatch, gauges     |
| `/dispatch`      | `Dispatch`       | RL dispatch sliders + decision badges + history  |
| `/forecasting`   | `Forecasting`    | 24 h Eskom forecast + 48 h renewable yield       |
| `/digital-twin`  | `DigitalTwin`    | Facility flow diagram, thermal map, Monte Carlo  |
| `/gpu-routing`   | `GpuRouting`     | Carbon-aware GPU job scheduler                   |
| `/carbon-credits`| `CarbonCredits`  | MRV → tokenisation pipeline + on-chain ledger    |
| `/alerts`        | `Alerts`         | Anomaly center with severity filtering           |
| `/reports`       | `Reports`        | YTD trends, energy mix, generated reports        |

## Design tokens

- Light glassmorphic theme — page bg slate-100 `#F1F5F9` with radial blue/indigo/sky
  gradients. Surfaces are translucent white (`rgba(255,255,255,0.65)`) with backdrop blur.
- **Blue-only palette** (no teal/green/orange/red/gold/purple). Accents: primary
  blue-600 `#2563EB`, secondary blue-700 `#1D4ED8`, sky-500 `#0EA5E9`, blue-300/400
  `#60A5FA`/`#93C5FD`, indigo-500 `#6366F1`, deep blue-900 `#1E3A8A` (used in place
  of any "danger" red), slate-600 `#475569` (used in place of any "warning" amber).
- Stage palette (Eskom): all blues — sky (S0), blue-300 (S1–2), blue-500 (S3–4),
  blue-900 (S5+). See `stageColor()` in `src/lib/sim.ts`.
- Body text slate-900 `#0F172A`; muted slate-500 `#64748B`.
- Custom CSS utilities in `src/index.css`: `card-surface` (glass), `pulse-dot`,
  `glow-orb`, `flow-line`, `font-display`, `font-mono-num`, `stage-N`.
- App is always light — `<html>` carries no `class="dark"`.

## Founder / contact (rendered in footer)

AetherGrid AI · Pfunzo Ramudingana · martin19pr@gmail.com · +27 60 752 4049 ·
Polokwane, Limpopo, South Africa · AetherOS v0.2.0 — Early Stage · Seed Round Open
