export function Footer() {
  return (
    <footer className="mt-10 border-t border-[rgba(0,201,167,0.12)] py-5 px-6 text-[11px] text-[#7B8FAB] font-mono-num leading-relaxed">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="text-[#00C9A7] font-semibold">AetherGrid AI</span>
        <span className="text-[#7B8FAB]/40">|</span>
        <span>Pfunzo Ramudingana</span>
        <span className="text-[#7B8FAB]/40">|</span>
        <a href="mailto:martin19pr@gmail.com" className="hover:text-[#00C9A7]">martin19pr@gmail.com</a>
        <span className="text-[#7B8FAB]/40">|</span>
        <a href="tel:+27607524049" className="hover:text-[#00C9A7]">+27 60 752 4049</a>
        <span className="text-[#7B8FAB]/40">|</span>
        <span>Polokwane, Limpopo, South Africa</span>
        <span className="text-[#7B8FAB]/40">|</span>
        <span className="text-[#00C9A7]">AetherOS v0.2.0 — Early Stage · Seed Round Open</span>
      </div>
    </footer>
  );
}
