export default function Footer({ content = {} }) {
  return (
    <footer className="grid gap-3 px-4 sm:px-12 py-8 border-t border-white/10 bg-[#050505] text-center text-white/60 text-sm">
      <p className="font-black text-white/80">
        {content.footerCopyright || `Copyright © ${new Date().getFullYear()} Market Prompt Hub`}
      </p>
      <div className="flex justify-center gap-5">
        <a href="#" className="text-white font-black hover:text-[#ffd02a] transition-colors">Privacy Policy</a>
        <a href="#" className="text-white font-black hover:text-[#ffd02a] transition-colors">Terms</a>
        <a href="#" className="text-white font-black hover:text-[#ffd02a] transition-colors">Refund Policy</a>
      </div>
      <small className="text-white/40 leading-relaxed max-w-2xl mx-auto">
        This site is not endorsed by Facebook, Meta, Google, OpenAI or any AI platform. All trademarks belong to their respective owners.
      </small>
    </footer>
  )
}
