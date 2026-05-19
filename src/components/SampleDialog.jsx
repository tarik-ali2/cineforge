export default function SampleDialog({ sample, onClose, onBuy }) {
  const bgClass = { image: 'image-sample', reel: 'reel-sample', product: 'prod-sample' }[sample.id] || 'image-sample'

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="relative w-[min(94vw,720px)] bg-[#111] rounded-[18px] text-white shadow-[0_30px_90px_rgba(0,0,0,0.6)] p-6 grid gap-4"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-white/20 bg-white/10 grid place-items-center text-2xl text-white cursor-pointer hover:bg-white/20"
          aria-label="Close"
        >
          ×
        </button>

        <p className="text-[#ffd02a] text-xs font-black uppercase tracking-widest">Sample Prompt</p>
        <h2 className="text-white font-black mt-0" style={{ fontSize: 'clamp(26px, 4vw, 40px)' }}>
          {sample.title}
        </h2>

        {/* Visual preview */}
        <div className={`media-screen min-h-[200px] ${bgClass} rounded-2xl`} />

        {/* Sample prompt text */}
        <div className="bg-white/[0.06] border border-white/12 rounded-xl p-4">
          <p className="text-[#ffd02a] text-xs font-black uppercase tracking-widest mb-2">Sample Prompt</p>
          <p className="text-white/80 text-sm leading-relaxed font-mono">{sample.prompt}</p>
        </div>

        <button
          onClick={onBuy}
          className="cta-btn w-full min-h-[52px] rounded-xl font-black text-base"
        >
          Unlock Full PDF Bundle — Rs.199 Only
        </button>
      </div>
    </div>
  )
}
