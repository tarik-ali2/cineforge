import { useState } from 'react'

const FALLBACK = [
  { id: 1, css: 'g-one',   title: 'Image Creation Prompts' },
  { id: 2, css: 'g-two',   title: 'Video & Reels Prompts' },
  { id: 3, css: 'g-three', title: 'Business Ad Prompts' },
  { id: 4, css: 'g-four',  title: 'Festival & Event Prompts' },
]

const isVideo = src => /\.(mp4|mov|webm|avi)$/i.test(src || '')

function GalleryCard({ item }) {
  const [playing, setPlaying] = useState(false)
  const hasMedia = !!item.imgPath
  const video    = hasMedia && isVideo(item.imgPath)

  const bgStyle = hasMedia && !video
    ? { backgroundImage: `url(${item.imgPath})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}

  return (
    <article className="p-4 border border-white/12 rounded-[18px] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_24px_60px_rgba(0,0,0,0.3)] text-left hover:border-[rgba(255,208,42,0.45)] hover:-translate-y-1 transition-all duration-200">
      <div
        className={`media-screen min-h-[250px] mb-4 ${!hasMedia || video ? item.css : ''} ${playing ? 'is-playing' : ''}`}
        style={bgStyle}
      >
        {video && (
          <video
            src={item.imgPath}
            autoPlay muted loop playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
          />
        )}

        <button
          className="play-overlay absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/55 border-2 border-white/70 text-white text-lg grid place-items-center z-10 cursor-pointer backdrop-blur-sm hover:bg-[rgba(255,208,42,0.8)] hover:text-black hover:scale-110 transition-all border-solid"
          onClick={() => setPlaying(p => !p)}
          aria-label="Preview"
        >
          {playing ? '❚❚' : '▶'}
        </button>

        {playing && (
          <>
            <button
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full border-0 bg-black/60 text-white text-sm cursor-pointer backdrop-blur-sm flex items-center justify-center"
              onClick={e => { e.stopPropagation(); setPlaying(false) }}
            >✕</button>
            <div className="absolute inset-0 z-[3] flex items-center justify-center">
              <div className="flex gap-1 items-end h-8">
                {[1,2,3,4].map(i => (
                  <span key={i} className="w-1.5 bg-[#ffd02a] rounded-full"
                    style={{ height: `${12 + i * 6}px`, animation: `chip-float ${0.5 + i * 0.12}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <h3 className="text-white font-black text-lg sm:text-xl">{item.title}</h3>
    </article>
  )
}

export default function GallerySection({ content = {}, settings = {} }) {
  const items = FALLBACK.map((f, i) => ({
    ...f,
    imgPath: settings[`gallery${i + 1}Path`] || '',
  }))

  return (
    <section className="dark-section-bg py-16 sm:py-20 px-4 sm:px-10 lg:px-20 text-center">
      <span className="inline-flex items-center justify-center min-h-[34px] px-4 rounded-full bg-[#ffd02a] text-black text-xs font-black uppercase mb-4">
        {content.galleryKicker || 'Bundle Preview'}
      </span>
      <h2 className="text-white font-black mb-8 sm:mb-10" style={{ fontSize: 'clamp(26px, 5vw, 68px)' }}>
        {content.galleryHeading || 'Is PDF me aise digital product prompt packs milenge'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(item => <GalleryCard key={item.id} item={item} />)}
      </div>
    </section>
  )
}
