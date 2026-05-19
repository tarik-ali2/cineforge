const ITEMS = [
  { title: 'Grow Faster',          desc: 'Instagram, YouTube, Facebook aur ads ke liye daily content ideas ready milte hain.' },
  { title: 'Earn With AI',         desc: 'Client creatives, digital products, courses aur services ke liye prompt library use karo.' },
  { title: 'No More Blank Screen', desc: 'Har category me copy-paste prompt format hai, beginner bhi easily use kar sakta hai.' },
  { title: 'Works Everywhere',     desc: 'Gemini, Midjourney, Sora, DALL-E, Leonardo aur other AI tools ke saath compatible.' },
]

export default function Benefits() {
  return (
    <section className="py-20 px-4 sm:px-10 lg:px-20 text-center bg-[#070707]">
      <span className="inline-flex items-center justify-center min-h-[34px] px-4 rounded-full bg-[#ffd02a] text-black text-xs font-black uppercase mb-4">
        Why Creators Love This Bundle
      </span>
      <h2 className="text-white font-black mb-10" style={{ fontSize: 'clamp(32px, 6vw, 68px)' }}>
        Content banana fast, easy aur profitable.
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ITEMS.map((item) => (
          <article
            key={item.title}
            className="p-5 border border-white/12 rounded-[18px] bg-[#121212] shadow-[0_22px_50px_rgba(0,0,0,0.24)] text-left"
          >
            <h3 className="text-white font-black text-xl mb-3">{item.title}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
