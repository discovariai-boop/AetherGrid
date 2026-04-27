export function Footer() {
  return (
    <footer className="mt-10 border-t border-[rgba(37,99,235,0.12)] py-5 px-6 text-[11px] text-[#64748B] font-mono-num leading-relaxed">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="text-[#2563EB] font-semibold">AetherGrid AI</span>
        <span className="text-[#64748B]/40">|</span>
        <span>Pfunzo Ramudingana</span>
        <span className="text-[#64748B]/40">|</span>
        <a href="mailto:martin19pr@gmail.com" className="hover:text-[#2563EB]">martin19pr@gmail.com</a>
        <span className="text-[#64748B]/40">|</span>
        <a href="tel:+27607524049" className="hover:text-[#2563EB]">+27 60 752 4049</a>
        <span className="text-[#64748B]/40">|</span>
        <span>Polokwane, Limpopo, South Africa</span>
        <span className="text-[#64748B]/40">|</span>
        <span className="text-[#2563EB]">AetherOS v0.2.0 — Early Stage · Seed Round Open</span>
      </div>
    </footer>
  );
}
