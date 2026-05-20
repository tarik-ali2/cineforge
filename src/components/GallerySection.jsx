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

  const ytId     = getYouTubeId(item.imgPath)
  const vidFile  = !ytId && isVideoFile(item.imgPath)
  const isImage  = item.imgPath && !ytId && !vidFile

  // Thumbnail shown when not playing
  const thumbStyle = ytId
    ? { backgroundImage: `url(https://img.youtube.com/vi/${ytId}/hqdefault.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : isImage
      ? { backgroundImage: `url(${item.imgPath})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : {}

  const fallbackCss = item.imgPath ? '' : item.css
  const mediaSizeClass = (ytId || vidFile) ? 'aspect-[9/16]' : 'min-h-[250px]'

  return (
    <article className="p-4 border border-white/12 rounded-[18px] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_24px_60px_rgba(0,0,0,0.3)] text-left hover:border-[rgba(255,208,42,0.45)] hover:-translate-y-1 transition-all duration-200">
      <div
        className={`media-screen ${mediaSizeClass} mb-4 ${fallbackCss}`}
        style={!playing ? thumbStyle : {}}
      >
        {/* YouTube embed when playing */}
        {playing && ytId && (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', zIndex: 5 }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        )}

        {/* Direct video file when playing */}
        {playing && vidFile && (
          <video src={item.imgPath} autoPlay controls
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 5 }} />
        )}

        {/* Play button — hide when playing with actual media */}
        {!(playing && (ytId || vidFile)) && (
          <button
            className="play-overlay absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/55 border-2 border-white/70 text-white text-lg grid place-items-center z-10 cursor-pointer backdrop-blur-sm hover:bg-[rgba(255,208,42,0.8)] hover:text-black hover:scale-110 transition-all border-solid"
            onClick={() => setPlaying(p => !p)}
          >
            {playing ? '❚❚' : '▶'}
          </button>
        )}

        {/* Close button */}
        {playing && (
          <button
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full border-0 bg-black/70 text-white text-sm cursor-pointer flex items-center justify-center"
            onClick={() => setPlaying(false)}
          >✕</button>
        )}

        {/* Bars animation — only when playing without real media */}
        {playing && !ytId && !vidFile && (
          <div className="absolute inset-0 z-[3] flex items-center justify-center">
            <div className="flex gap-1 items-end h-8">
              {[1,2,3,4].map(i => (
                <span key={i} className="w-1.5 bg-[#ffd02a] rounded-full"
                  style={{ height: `${12 + i * 6}px`, animation: `chip-float ${0.5 + i * 0.12}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
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
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(item => <GalleryCard key={item.id} item={item} />)}
      </div>
    </section>
  )
}
