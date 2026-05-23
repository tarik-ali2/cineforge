import { useState, useRef, useEffect, useCallback } from 'react'

const FALLBACK = [
  { id: 1, css: 'g-one',   defaultTitle: 'Image Creation Prompts',   settingsKey: 'gallery1Path', contentKey: 'gallery1Title' },
  { id: 2, css: 'g-two',   defaultTitle: 'Reels & Shorts Prompts',   settingsKey: 'gallery2Path', contentKey: 'gallery2Title' },
  { id: 3, css: 'g-three', defaultTitle: 'Business Ad Prompts',      settingsKey: 'gallery3Path', contentKey: 'gallery3Title' },
  { id: 4, css: 'g-four',  defaultTitle: 'Festival & Event Prompts', settingsKey: 'gallery4Path', contentKey: 'gallery4Title' },
]

function getYouTubeId(url) {
  if (!url) return null
  try {
    const parsed = new URL(url, window.location.origin)
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/shorts/') || parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/')[2] || null
      }
      return parsed.searchParams.get('v')
    }
    if (parsed.hostname.includes('youtu.be')) return parsed.pathname.replace('/', '') || null
  } catch {}
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
  return m ? m[1] : null
}
const isVideoFile = src =>
  /\.(mp4|mov|webm|avi|mkv)(\?|#|$)/i.test(src || '') ||
  /^data:video\//i.test(src || '') ||
  /\/video\/upload\//i.test(src || '')

function GalleryCard({ item, onPlayChange }) {
  const [playing, setPlaying] = useState(false)

  const ytId    = getYouTubeId(item.imgPath)
  const vidFile = !ytId && isVideoFile(item.imgPath)
  const isImage = item.imgPath && !ytId && !vidFile
  const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : ''

  const thumbStyle = isImage
      ? { backgroundImage: `url(${item.imgPath})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : {}

  const fallbackCss = item.imgPath ? '' : item.css
  const aspectClass = (ytId || vidFile) ? 'aspect-[9/16]' : 'aspect-square'

  const startPlay = () => { setPlaying(true); onPlayChange(true) }
  const stopPlay  = () => { setPlaying(false); onPlayChange(false) }

  return (
    <div className="border border-white/12 rounded-[16px] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden hover:border-[rgba(255,208,42,0.45)] transition-all duration-200">
      <div
        className={`media-screen ${aspectClass} ${fallbackCss}`}
        style={!playing ? thumbStyle : {}}
      >
        {!playing && ytId && (
          <img
            src={ytThumb}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {!playing && vidFile && (
          <video
            src={item.imgPath}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
          />
        )}
        {playing && ytId && (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&origin=${encodeURIComponent(window.location.origin)}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', zIndex: 5 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        )}
        {playing && vidFile && (
          <video src={item.imgPath} autoPlay controls playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 5 }} />
        )}

        {!(playing && (ytId || vidFile)) && (
          <button
            className="play-overlay absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/55 border-2 border-white/70 text-white text-base grid place-items-center z-10 cursor-pointer backdrop-blur-sm hover:bg-[rgba(255,208,42,0.8)] hover:text-black hover:scale-110 transition-all border-solid"
            onClick={startPlay}
          >▶</button>
        )}
        {playing && (
          <button className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/70 text-white text-xs cursor-pointer flex items-center justify-center border-0"
            onClick={stopPlay}>✕</button>
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
  const [activeIdx, setActiveIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const trackRef = useRef(null)
  const activeIdxRef = useRef(0)

  const items = FALLBACK.map(f => ({
    ...f,
    imgPath: settings[f.settingsKey] || '',
    title: content[f.contentKey] || f.defaultTitle,
  }))

  const goTo = useCallback((idx) => {
    const track = trackRef.current
    if (!track || !track.firstChild) return
    const cardWidth = track.firstChild.offsetWidth + 14
    track.scrollTo({ left: idx * cardWidth, behavior: 'smooth' })
    activeIdxRef.current = idx
    setActiveIdx(idx)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const onScroll = () => {
      const card = track.firstChild
      if (!card) return
      const idx = Math.round(track.scrollLeft / (card.offsetWidth + 14))
      activeIdxRef.current = idx
      setActiveIdx(idx)
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (isPlaying) return
    const interval = setInterval(() => {
      const next = (activeIdxRef.current + 1) % items.length
      goTo(next)
    }, 3500)
    return () => clearInterval(interval)
  }, [isPlaying, items.length, goTo])

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

      <div ref={trackRef} className="slider-track">
        {items.map(item => (
          <div key={item.id} className="w-[92vw] sm:w-[380px] lg:w-[420px]">
            <GalleryCard item={item} onPlayChange={setIsPlaying} />
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-2 mt-4">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full border-0 cursor-pointer transition-all duration-300 ${i === activeIdx ? 'bg-[#ffd02a] w-5' : 'bg-white/30 w-2'}`}
          />
        ))}
      </div>
    </section>
  )
}
