const REVIEWS = [
  { text: '"Prompt structure itna clear hai ki images aur reels ideas minutes me ready ho jate hain."', name: 'Priya S., Mumbai' },
  { text: '"Ads creatives, thumbnails aur product shots ke liye daily use kar raha hoon. Value solid hai."', name: 'Rohan V., Delhi' },
  { text: '"Client work fast deliver ho raha hai. Beginners ke liye bhi prompts easy language me hain."', name: 'Nisha B., Kolkata' },
]

export default function Reviews() {
  return (
    <section id="reviews" className="py-20 px-4 sm:px-10 lg:px-20 text-center bg-[#0a0a0d]">
      <span className="inline-flex items-center justify-center min-h-[34px] px-4 rounded-full bg-[#ffd02a] text-black text-xs font-black uppercase mb-4">
        Happy Customers
      </span>
      <h2 className="text-white font-black mb-10" style={{ fontSize: 'clamp(32px, 6vw, 68px)' }}>
        Creators ka response
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REVIEWS.map((r) => (
          <article
            key={r.name}
            className="p-6 border border-white/12 rounded-[18px] bg-white shadow-[0_22px_50px_rgba(0,0,0,0.24)] text-left"
          >
            <p className="text-[#2d2921] text-base leading-relaxed mb-4">{r.text}</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#ffd02a] grid place-items-center font-black text-black text-sm shrink-0">
                {r.name[0]}
              </div>
              <strong className="text-black font-black text-sm">{r.name}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
