export default function StickyBar({ onBuy, content = {}, settings = {} }) {
  const price = settings.price || 199
  const mrp   = settings.mrp   || 4999
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-3 w-[calc(100vw-16px)] sm:w-[min(calc(100vw-24px),960px)] px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-[rgba(255,208,42,0.42)] bg-[rgba(11,11,11,0.94)] shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <div>
        <strong className="block text-white text-xs sm:text-sm font-black">
          {content.slotText || 'Only 37 slots left today'}
        </strong>
        <span className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5">
          <del className="text-white/55 font-black text-base sm:text-lg">Rs.{mrp}</del>
          <b className="text-[#ffd02a] text-xl sm:text-2xl font-black">Rs.{price}</b>
        </span>
      </div>
      <button
        onClick={onBuy}
        className="cta-btn min-h-[46px] sm:min-h-[54px] px-4 sm:px-6 text-xs sm:text-base font-black rounded-xl whitespace-nowrap shrink-0"
      >
        {content.mainCta || 'Get 10 Lakh+ Prompts Now'}
      </button>
    </div>
  )
}
