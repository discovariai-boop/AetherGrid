import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { ConnectionBar } from "./ConnectionBar";
import { EskomStageWidget } from "./EskomStageWidget";
import { Footer } from "./Footer";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <div className="glow-orb" />
      <Sidebar />
      <div className="lg:pl-[220px] relative z-10">
        <ConnectionBar />
        <main className="px-6 py-6">
          {children}
        </main>
        <Footer />
      </div>
      <EskomStageWidget />
    </div>
  );
}

export function PageHeader({
  title, subtitle, badge, right,
}: { title: string; subtitle?: string; badge?: ReactNode; right?: ReactNode }) {
  return (
    <header className="flex items-start justify-between mb-6 gap-6 flex-wrap">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-[26px] text-white leading-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-[13px] text-[#7B8FAB] mt-1">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-3">{right}</div>}
    </header>
  );
}
