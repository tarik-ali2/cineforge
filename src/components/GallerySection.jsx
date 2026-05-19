import { useState } from 'react'

const ITEMS = [
  { id: 1, css: 'g-one',   title: 'Image Creation Prompts' },
  { id: 2, css: 'g-two',   title: 'Video & Reels Prompts' },
  { id: 3, css: 'g-three', title: 'Business Ad Prompts' },
  { id: 4, css: 'g-four',  title: 'Festival & Event Prompts' },
]

function GalleryCard({ item }) {
  const [playing, setPlaying] = useState(false)

  return (
    <article className="p-4 border border-white/12 rounded-[18px] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_24px_60px_rgba(0,0,0,0.3)] text-left hover:border-[rgba(255,208,42,0.45)] hover:-translate-y-1 transition-all duration-200">
      <div className={`media-screen min-h-[250px] mb-4 ${item.css} ${playing ? 'is-playing' : ''}`}>
        <button
          className="play-overlay absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/55 border-2 border-white/70 text-white text-lg grid place-items-center z-10 cursor-pointer backdrop-blur-sm hover:bg-[rgba(255,208,42,0.8)] hover:text-black hover:scale-110 transition-all border-solid"
          onClick={() => setPlaying(p => !p)}
          aria-label="Preview"
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <button
          className="close-overlay hidden absolute top-3 right-3 z-10 w-8 h-8 rounded-full border-0 bg-black/60 text-white text-sm cursor-pointer items-center justify-content-center backdrop-blur-sm"
          style={{ display: playing ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setPlaying(false)}
          aria-label="Close"
        >
          ✕
        </button>
        {playing && (
          <div className="absolute inset-0 z-[3] flex items-center justify-center">
            <div className="flex gap-1 items-end h-8">
              {[1,2,3,4].map(i => (
                <span
                  key={i}
                  className="w-1.5 bg-[#ffd02a] rounded-full"
                  style={{
                    height: `${12 + i * 6}px`,
                    animation: `chip-float ${0.5 + i * 0.12}s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <h3 className="text-white font-black text-xl">{item.title}</h3>
    </article>
  )
}

export default function GallerySection({ content = {} }) {
  return (
    <section className="dark-section-bg py-20 px-4 sm:px-10 lg:px-20 text-center">
      <span className="inline-flex items-center justify-center min-h-[34px] px-4 rounded-full bg-[#ffd02a] text-black text-xs font-black uppercase mb-4">
        {content.galleryKicker || 'Bundle Preview'}
      </span>
      <h2 className="text-white font-black mb-10" style={{ fontSize: 'clamp(32px, 6vw, 68px)' }}>
        {content.galleryHeading || 'Is PDF me aise digital product prompt packs milenge'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ITEMS.map(item => <GalleryCard key={item.id} item={item} />)}
      </div>
    </section>
  )
}
