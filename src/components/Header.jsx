export default function Header({ onBuy, content = {} }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-4 sm:px-10 lg:px-[70px] py-4 border-b border-white/10 bg-[rgba(7,7,7,0.88)] backdrop-blur-xl">
      <a href="#top" className="text-[#ffd02a] font-black text-xl tracking-tight">
        {content.brandName || 'Market Prompt Hub'}
      </a>

      <nav className="flex items-center gap-5">
        <a href="#categories" className="hidden sm:block text-white/75 font-black hover:text-white transition-colors">Categories</a>
        <a href="#reviews"    className="hidden sm:block text-white/75 font-black hover:text-white transition-colors">Reviews</a>
        <a href="#faq"        className="hidden sm:block text-white/75 font-black hover:text-white transition-colors">FAQ</a>
        <button
          onClick={onBuy}
          className="cta-btn min-h-[42px] px-5 text-sm font-black rounded-lg"
        >
          Get Access
        </button>
      </nav>
    </header>
  )
}
