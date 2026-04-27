import { Layout, PageHeader } from "@/components/Layout";
import {
  Activity, TrendingUp, Cpu, Server, Leaf, Shield, Zap, Database, Cloud,
  CheckCircle2, ArrowRight, Building2, Workflow, GaugeCircle, Globe2,
} from "lucide-react";
import type { ReactNode } from "react";

export default function AboutPage() {
  return (
    <Layout>
      <PageHeader
        title="About AetherOS"
        subtitle="The AI-Thermal-Smart Grid OS for AI data centres operating under Eskom load-shedding"
      />

      {/* Hero block */}
      <section className="card-surface p-8 mb-6 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.18), transparent 70%)" }}
        />
        <div className="relative max-w-3xl">
          <div className="text-[11px] font-mono-num uppercase tracking-[0.18em] text-[#2563EB] mb-3">
            AetherGrid AI · Cape Town, South Africa
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#0F172A] leading-tight">
            Keep AI compute online, cool, and carbon-aware — through every load-shedding stage.
          </h1>
          <p className="mt-4 text-[15px] text-[#475569] leading-relaxed">
            AetherOS is the operating system that sits between your renewables, batteries, diesel,
            cooling and GPU schedulers. It forecasts the next 6 hours of grid stress, dispatches
            energy in 30-second cycles, routes workloads to the lowest-carbon window, and produces
            audit-grade carbon credits — all while protecting uptime during Eskom Stages 1–8.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Tag>Deep-tech infrastructure</Tag>
            <Tag>Reinforcement learning</Tag>
            <Tag>Frontend demo · v0.2.0</Tag>
            <Tag>Pilot-ready</Tag>
          </div>
        </div>
      </section>

      {/* The problem */}
      <SectionTitle eyebrow="The problem we solve" title="Three constraints, simultaneously" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <ProblemCard
          icon={<Zap size={18} />}
          title="Grid instability"
          body="Eskom Stages 1–8 force unplanned outages. Diesel-only failover burns cash and emissions."
        />
        <ProblemCard
          icon={<GaugeCircle size={18} />}
          title="Thermal & PUE"
          body="AI training loads spike rack temperatures and water use. PUE drift erodes margins fast."
        />
        <ProblemCard
          icon={<Leaf size={18} />}
          title="Carbon accountability"
          body="Hyperscale tenants demand verifiable Scope-2 reductions. Manual MRV does not scale."
        />
      </div>

      {/* Five functions */}
      <SectionTitle eyebrow="What AetherOS does" title="Six tightly-coupled functions" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <FunctionCard
          n="01"
          icon={<TrendingUp size={20} />}
          title="Predictive grid forecasting"
          desc="Eskom-stage classifier + LSTM solar (8.3% MAPE @ 6h) + GBM wind. Six-hour horizons feed every downstream module."
          tags={["LSTM", "GBM", "MAPE 8.3%"]}
        />
        <FunctionCard
          n="02"
          icon={<Zap size={20} />}
          title="AI dispatch optimization"
          desc="PPO policy via Ray RLlib runs on a 30-second cycle. Decides solar vs. BESS vs. diesel vs. grid for the next interval, prioritising uptime and carbon."
          tags={["PPO", "30s cycle", "14ms inference"]}
        />
        <FunctionCard
          n="03"
          icon={<Cpu size={20} />}
          title="Digital twin & Monte Carlo"
          desc="200+ live sensor feeds mirror the facility in real time. Stress-test 100 weather/grid scenarios before committing dispatch decisions."
          tags={["200+ feeds", "100 scenarios", "14k tags"]}
        />
        <FunctionCard
          n="04"
          icon={<Server size={20} />}
          title="Carbon-aware GPU routing"
          desc="Five-tier scheduler — critical · high-priority (15 min) · batch (2 h) · training (24 h) · data-pipeline (48 h). Defers compute into renewable-surplus windows."
          tags={["5 tiers", "SLURM", "Kubernetes"]}
        />
        <FunctionCard
          n="05"
          icon={<Leaf size={20} />}
          title="Carbon credit MRV"
          desc="Verra VM0044 + Gold Standard alignment. ISO 14064-2 conformant ledger, automated quarterly verification, on-chain anchoring of issuances."
          tags={["VM0044", "Gold Standard", "ISO 14064-2"]}
        />
        <FunctionCard
          n="06"
          icon={<Shield size={20} />}
          title="Anomaly & islanding"
          desc="Z-score + IsolationForest + hard-limit checks + BESS health. 47 historical island events resolved within 400ms in 96% of cases."
          tags={["Z-score", "IsolationForest", "400ms · 96%"]}
        />
      </div>

      {/* Outcomes */}
      <SectionTitle eyebrow="Measurable outcomes" title="What a 5 MW pilot site delivers" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <OutcomeCard label="PUE range" value="1.25–1.35" sub="vs. 1.55 industry avg" />
        <OutcomeCard label="Energy cost saving" value="R 27–52 M" sub="on R 90–130 M baseline / yr" />
        <OutcomeCard label="Water saving" value="65–78%" sub="vs. evaporative-only cooling" />
        <OutcomeCard label="Carbon abated" value="3,900 tCO₂/yr" sub="4,200–6,800 VCUs annually" />
      </div>

      {/* Integration approach */}
      <SectionTitle eyebrow="How it integrates" title="Sits beside your stack — never in front of it" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <IntegrationCard
          icon={<Database size={18} />}
          title="Operational tech"
          items={[
            "Modbus TCP polling",
            "IEC 61850 GOOSE",
            "OPC-UA bridge optional",
            "200+ sensor feeds, 14k SCADA tags",
          ]}
        />
        <IntegrationCard
          icon={<Cloud size={18} />}
          title="Compute schedulers"
          items={[
            "SLURM hooks (HPC)",
            "Kubernetes CRD operator",
            "Generic webhook router",
            "Per-tenant policy isolation",
          ]}
        />
        <IntegrationCard
          icon={<Workflow size={18} />}
          title="Reporting & finance"
          items={[
            "REST API (18 endpoints)",
            "Verra MRV ledger export",
            "ERP / billing webhooks",
            "On-chain credit anchoring",
          ]}
        />
      </div>

      {/* Build status */}
      <SectionTitle eyebrow="Build status" title="Where the platform stands today" />
      <div className="card-surface p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <BuildStat label="Version" value="v0.2.0" />
          <BuildStat label="Modules" value="34" />
          <BuildStat label="Lines of code" value="8,400" />
          <BuildStat label="API endpoints" value="18" />
          <BuildStat label="Test suites" value="9" />
        </div>
        <div className="mt-6 pt-5 border-t border-[rgba(37,99,235,0.1)] grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChecklistItem done text="Predictive forecasting + 6h horizon validated" />
          <ChecklistItem done text="PPO dispatch policy trained & live" />
          <ChecklistItem done text="Digital twin + Monte Carlo runtime" />
          <ChecklistItem done text="GPU routing across 5 priority tiers" />
          <ChecklistItem done text="MRV ledger + Verra-aligned export" />
          <ChecklistItem text="Pilot site (5 MW Cape Town) — Q3 commissioning" />
        </div>
      </div>

      {/* Founder / company block */}
      <SectionTitle eyebrow="The company" title="Built by AetherGrid AI" />
      <div className="card-surface p-6 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 space-y-3 text-[14px] text-[#475569] leading-relaxed">
            <p>
              <strong className="text-[#0F172A]">AetherGrid AI</strong> is a South-African deep-tech
              startup building the energy-management OS for the AI infrastructure era. The team
              combines power-systems engineering, reinforcement learning research, and Verra-grade
              carbon-market expertise.
            </p>
            <p>
              We exist because the African continent has the cheapest renewables, the youngest
              compute appetite, and the most fragile grid in the OECD-adjacent world. Solving here
              first means the playbook scales everywhere else.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Tag>Cape Town HQ</Tag>
              <Tag>Pilot: Western Cape</Tag>
              <Tag>Pre-seed · 2025</Tag>
            </div>
          </div>
          <div className="rounded-xl border border-[rgba(37,99,235,0.15)] bg-[rgba(37,99,235,0.04)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Globe2 size={16} className="text-[#2563EB]" />
              <div className="text-[11px] uppercase tracking-wider font-mono-num text-[#2563EB]">
                Why South Africa
              </div>
            </div>
            <ul className="space-y-2 text-[13px] text-[#475569]">
              <li className="flex gap-2"><Building2 size={13} className="mt-0.5 text-[#2563EB]" /> Hyperscalers entering market 2025–27</li>
              <li className="flex gap-2"><Activity size={13} className="mt-0.5 text-[#2563EB]" /> Stage-6 load-shedding is the design baseline</li>
              <li className="flex gap-2"><Leaf size={13} className="mt-0.5 text-[#2563EB]" /> Premium African VCU pricing</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center text-[11px] font-mono-num uppercase tracking-wider text-[#64748B] pb-2">
        AetherOS demo · live simulation · all figures derived from product spec v0.2.0
      </div>
    </Layout>
  );
}

/* ────────────────────────── helpers ────────────────────────── */

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4 mt-2">
      <div className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#2563EB] mb-1.5">
        {eyebrow}
      </div>
      <h2 className="text-xl font-semibold text-[#0F172A]">{title}</h2>
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono-num bg-[rgba(37,99,235,0.08)] border border-[rgba(37,99,235,0.18)] text-[#2563EB]">
      {children}
    </span>
  );
}

function ProblemCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-2 text-[#2563EB] mb-2">
        {icon}
        <div className="text-[13px] font-semibold text-[#0F172A]">{title}</div>
      </div>
      <p className="text-[13px] text-[#475569] leading-relaxed">{body}</p>
    </div>
  );
}

function FunctionCard({
  n, icon, title, desc, tags,
}: { n: string; icon: ReactNode; title: string; desc: string; tags: string[] }) {
  return (
    <div className="card-surface p-5 hover:border-[rgba(37,99,235,0.3)] transition-colors">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-11 h-11 rounded-lg bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.2)] flex items-center justify-center text-[#2563EB]">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono-num text-[#64748B]">{n}</span>
            <h3 className="text-[15px] font-semibold text-[#0F172A]">{title}</h3>
          </div>
          <p className="text-[13px] text-[#475569] leading-relaxed">{desc}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono-num bg-[rgba(37,99,235,0.06)] text-[#2563EB] border border-[rgba(37,99,235,0.15)]">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OutcomeCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card-surface p-5">
      <div className="text-[10px] font-mono-num uppercase tracking-wider text-[#64748B] mb-2">
        {label}
      </div>
      <div className="text-2xl font-semibold font-mono-num text-[#0F172A]">{value}</div>
      <div className="text-[11px] text-[#64748B] mt-1">{sub}</div>
    </div>
  );
}

function IntegrationCard({
  icon, title, items,
}: { icon: ReactNode; title: string; items: string[] }) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-2 mb-3 text-[#2563EB]">
        {icon}
        <div className="text-[13px] font-semibold text-[#0F172A]">{title}</div>
      </div>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2 text-[13px] text-[#475569]">
            <ArrowRight size={12} className="mt-1 text-[#2563EB] shrink-0" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BuildStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-mono-num uppercase tracking-wider text-[#64748B] mb-1">
        {label}
      </div>
      <div className="text-xl font-semibold font-mono-num text-[#0F172A]">{value}</div>
    </div>
  );
}

function ChecklistItem({ text, done }: { text: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <CheckCircle2
        size={15}
        className={done ? "text-[#0EA5E9]" : "text-[#94A3B8]"}
        fill={done ? "rgba(14,165,233,0.15)" : "transparent"}
      />
      <span className={done ? "text-[#0F172A]" : "text-[#64748B]"}>{text}</span>
    </div>
  );
}
