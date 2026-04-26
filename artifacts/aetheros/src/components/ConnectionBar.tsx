interface Conn { label: string; status: "ok" | "warn" | "err"; }
const CONNECTIONS: Conn[] = [
  { label: "SCADA Connected", status: "ok" },
  { label: "MQTT Active", status: "ok" },
  { label: "MLflow Tracking", status: "ok" },
  { label: "Open-Meteo API", status: "ok" },
  { label: "Eskom OCPI", status: "warn" },
];

export function ConnectionBar() {
  return (
    <div className="h-7 flex items-center gap-5 px-6 bg-[#060F1E] border-b border-[rgba(0,201,167,0.1)] text-[10.5px] font-mono-num text-[#7B8FAB] uppercase tracking-wider relative z-30">
      {CONNECTIONS.map((c) => (
        <div key={c.label} className="flex items-center gap-1.5">
          <span className={[
            "inline-block w-1.5 h-1.5 rounded-full",
            c.status === "ok" ? "bg-[#1D9E75]" : c.status === "warn" ? "bg-[#BA7517]" : "bg-[#E24B4A]",
          ].join(" ")} />
          <span>{c.label}</span>
        </div>
      ))}
      <div className="flex-1" />
      <span className="text-[#00C9A7]">{new Date().toLocaleString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit", day: "2-digit", month: "short" })} SAST</span>
    </div>
  );
}
