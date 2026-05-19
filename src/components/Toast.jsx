export default function Toast({ msg, visible }) {
  return (
    <div
      className="fixed top-20 left-1/2 z-50 -translate-x-1/2 inline-flex items-center gap-3 max-w-[min(92vw,560px)] px-4 py-3 rounded-full border border-[rgba(255,208,42,0.35)] bg-[rgba(16,16,16,0.9)] shadow-[0_18px_44px_rgba(0,0,0,0.35)] font-black text-[#fff8d9] backdrop-blur-md transition-all duration-300"
      style={{ opacity: visible ? 1 : 0, transform: `translateX(-50%) translateY(${visible ? 0 : -8}px)` }}
    >
      <span className="w-2.5 h-2.5 rounded-full bg-[#35d17f] shadow-[0_0_0_6px_rgba(53,209,127,0.16)] shrink-0" />
      {msg}
    </div>
  )
}
