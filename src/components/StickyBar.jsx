import { PRODUCT } from '../App'

export default function StickyBar({ onBuy }) {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-4 w-[min(calc(100vw-24px),960px)] px-4 py-3 rounded-2xl border border-[rgba(255,208,42,0.42)] bg-[rgba(11,11,11,0.92)] shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <div>
        <strong className="block text-white text-sm font-black">Only {PRODUCT.slots} slots left today</strong>
        <span className="flex items-baseline gap-2 mt-0.5">
          <del className="text-white/55 font-black text-lg">Rs.{PRODUCT.mrp}</del>
          <b className="text-[#ffd02a] text-2xl font-black">Rs.{PRODUCT.price}</b>
        </span>
      </div>
      <button
        onClick={onBuy}
        className="cta-btn min-h-[54px] px-5 sm:px-6 text-sm sm:text-base font-black rounded-xl whitespace-nowrap shrink-0"
      >
        Get 10 Lakh+ Prompts Now
      </button>
    </div>
  )
}
