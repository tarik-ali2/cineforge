export default function StickyBar({ onBuy, content = {}, settings = {} }) {
  const price = settings.price || 199
  const mrp   = settings.mrp   || 4999

  return (
    <>
      {/* Mobile sticky bar — full width, attached to bottom edge */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 pt-3 border-t border-[rgba(255,208,42,0.35)] bg-[rgba(10,10,10,0.97)] backdrop-blur-xl"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div className="shrink-0">
          <strong className="block text-white text-xs font-black leading-tight">Only {price > 0 ? `Rs.${mrp}` : ''}</strong>
          <span className="flex items-baseline gap-1.5 mt-0.5">
            <del className="text-white/50 font-black text-sm">Rs.{mrp}</del>
            <b className="text-[#ffd02a] text-2xl font-black">Rs.{price}</b>
          </span>
        </div>
        <button
          onClick={onBuy}
          className="cta-btn flex-1 min-h-[50px] font-black rounded-xl text-sm"
        >
          Buy Now — Rs.{price}
        </button>
      </div>

      {/* Desktop sticky bar — floating centered */}
      <div className="hidden sm:flex fixed bottom-4 left-1/2 -translate-x-1/2 z-50 items-center justify-between gap-4 w-[min(calc(100vw-48px),960px)] px-5 py-3 rounded-2xl border border-[rgba(255,208,42,0.42)] bg-[rgba(11,11,11,0.94)] shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div>
          <strong className="block text-white text-sm font-black">
            {content.slotText || 'Only 37 slots left today'}
          </strong>
          <span className="flex items-baseline gap-2 mt-0.5">
            <del className="text-white/55 font-black text-lg">Rs.{mrp}</del>
            <b className="text-[#ffd02a] text-2xl font-black">Rs.{price}</b>
          </span>
        </div>
        <button
          onClick={onBuy}
          className="cta-btn min-h-[52px] px-7 font-black rounded-xl text-base whitespace-nowrap shrink-0"
        >
          {content.mainCta || 'Get 10 Lakh+ Prompts Now'}
        </button>
      </div>
    </>
  )
}
