import { useState } from 'react'

const FALLBACK = [
  { id: 1, css: 'g-one',   title: 'Image Creation Prompts' },
  { id: 2, css: 'g-two',   title: 'Video & Reels Prompts' },
  { id: 3, css: 'g-three', title: 'Business Ad Prompts' },
  { id: 4, css: 'g-four',  title: 'Festival & Event Prompts' },
]

function getYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)
  return m ? m[1] : null
}
const isVideoFile = src => /\.(mp4|mov|webm|avi|mkv)$/i.test(src || '')

function GalleryCard({ item }) {
  const [playing, setPlaying] = useState(false)

  const ytId    = getYouTubeId(item.imgPath)
  const vidFile = !ytId && isVideoFile(item.imgPath)
  const isImage = item.imgPath && !ytId && !vidFile

  const thumbStyle = ytId
    ? { backgroundImage: `url(https://img.youtube.com/vi/${ytId}/hqdefault.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : isImage
      ? { backgroundImage: `url(${item.imgPath})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : {}

  const fallbackCss = item.imgPath ? '' : item.css

  return (
    <div className="border border-white/12 rounded-[16px] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden hover:border-[rgba(255,208,42,0.45)] transition-all duration-200">
      {/* Square media area */}
      <div
        className={`media-screen aspect-square ${fallbackCss}`}
        style={!playing ? thumbStyle : {}}
      >
        {playing && ytId && (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', zIndex: 5 }}
            allow="autoplay; encrypted-media" allowFullScreen
          />
        )}
        {playing && vidFile && (
          <video src={item.imgPath} autoPlay controls
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 5 }} />
        )}

        {!(playing && (ytId || vidFile)) && (
          <button
            className="play-overlay absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/55 border-2 border-white/70 text-white text-base grid place-items-center z-10 cursor-pointer backdrop-blur-sm hover:bg-[rgba(255,208,42,0.8)] hover:text-black hover:scale-110 transition-all border-solid"
            onClick={() => setPlaying(p => !p)}
          >{playing ? '❚❚' : '▶'}</button>
        )}
        {playing && (
          <button className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/70 text-white text-xs cursor-pointer flex items-center justify-center border-0"
            onClick={() => setPlaying(false)}>✕</button>
        )}
        {playing && !ytId && !vidFile && (
          <div className="absolute inset-0 z-[3] flex items-center justify-center">
            <div className="flex gap-1 items-end h-6">
              {[1,2,3,4].map(i => (
                <span key={i} className="w-1 bg-[#ffd02a] rounded-full"
                  style={{ height: `${8 + i * 5}px`, animation: `chip-float ${0.5 + i * 0.12}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>
      <p className="text-white font-black text-sm px-3 py-2">{item.title}</p>
    </div>
  )
}

export default function GallerySection({ content = {}, settings = {} }) {
  const items = FALLBACK.map((f, i) => ({
    ...f,
    imgPath: settings[`gallery${i + 1}Path`] || '',
  }))

  return (
    <section className="dark-section-bg py-12 sm:py-16 px-4 sm:px-10 lg:px-20">
      <div className="text-center mb-6 sm:mb-8">
        <span className="inline-flex items-center justify-center min-h-[32px] px-4 rounded-full bg-[#ffd02a] text-black text-xs font-black uppercase mb-3">
          {content.galleryKicker || 'Bundle Preview'}
        </span>
        <h2 className="text-white font-black" style={{ fontSize: 'clamp(22px, 4.5vw, 56px)' }}>
          {content.galleryHeading || 'Is PDF me aise digital product prompt packs milenge'}
        </h2>
      </div>

      {/* Horizontal slider */}
      <div className="slider-track">
        {items.map(item => (
          <div key={item.id} className="w-[72vw] sm:w-[280px] lg:w-[300px]">
            <GalleryCard item={item} />
          </div>
        ))}
      </div>
    </section>
  )
}
