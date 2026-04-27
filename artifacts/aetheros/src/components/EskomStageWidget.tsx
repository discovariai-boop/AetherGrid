import { useState } from "react";
import { useSystem } from "@/context/SystemContext";
import { ChevronUp, ChevronDown, Power, X } from "lucide-react";
import { stageColor, stageLabel, type EskomStage } from "@/lib/sim";

export function EskomStageWidget() {
  const { stage, setStage } = useSystem();
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        data-testid="button-eskom-widget-open"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center font-mono-num font-bold text-white border border-[rgba(37,99,235,0.3)] shadow-xl"
        style={{ background: stageColor(stage) }}
      >
        S{stage}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 rounded-xl bg-[rgba(255,255,255,0.65)] border border-[rgba(37,99,235,0.25)] shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1F5F9] border-b border-[rgba(37,99,235,0.15)]">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono-num text-[#2563EB]">
          <Power size={12} /> Eskom Stage Simulator
        </div>
        <button onClick={() => setOpen(false)} data-testid="button-eskom-widget-close" className="text-[#64748B] hover:text-[#0F172A]">
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono-num">Current</div>
            <div className="font-display font-bold text-2xl text-[#0F172A]" data-testid="text-current-stage">Stage {stage}</div>
            <div className="text-[11px] text-[#64748B]">{stageLabel(stage)}</div>
          </div>
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-mono-num font-bold text-lg"
            style={{ background: stageColor(stage) }}
          >
            {stage}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStage(Math.max(0, stage - 1) as EskomStage)}
            data-testid="button-stage-down"
            className="flex-1 py-2 rounded-md bg-[#F1F5F9] hover:bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.2)] flex items-center justify-center gap-1 text-[#2563EB] text-xs font-medium"
          >
            <ChevronDown size={14} /> Lower
          </button>
          <button
            onClick={() => setStage(Math.min(8, stage + 1) as EskomStage)}
            data-testid="button-stage-up"
            className="flex-1 py-2 rounded-md bg-[#F1F5F9] hover:bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.2)] flex items-center justify-center gap-1 text-[#2563EB] text-xs font-medium"
          >
            <ChevronUp size={14} /> Raise
          </button>
        </div>

        <div className="grid grid-cols-9 gap-1">
          {[0,1,2,3,4,5,6,7,8].map((s) => (
            <button
              key={s}
              data-testid={`button-stage-${s}`}
              onClick={() => setStage(s as EskomStage)}
              className={[
                "h-7 rounded text-[11px] font-mono-num font-semibold transition-all",
                s === stage ? "ring-2 ring-white scale-110 text-white" : "text-white/80 hover:scale-105",
              ].join(" ")}
              style={{ background: stageColor(s as EskomStage) }}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="text-[10px] text-[#64748B] font-mono-num leading-snug pt-1 border-t border-[rgba(37,99,235,0.1)]">
          Changing stage cascades to dispatch, GPU routing, alerts, and islanding score system-wide.
        </div>
      </div>
    </div>
  );
}
