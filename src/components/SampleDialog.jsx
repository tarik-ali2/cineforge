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

export default function SampleDialog({ sample, onClose, onBuy }) {
  const bgClass = { image: 'image-sample', reel: 'reel-sample', product: 'prod-sample' }[sample.id] || 'image-sample'
  const ytId = getYouTubeId(sample.imgPath)
  const videoFile = !ytId && isVideoFile(sample.imgPath)
  const imageFile = sample.imgPath && !ytId && !videoFile

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="relative w-[min(94vw,720px)] bg-[#111] rounded-[18px] text-white shadow-[0_30px_90px_rgba(0,0,0,0.6)] p-6 grid gap-4"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-white/20 bg-white/10 grid place-items-center text-2xl text-white cursor-pointer hover:bg-white/20"
          aria-label="Close"
        >
          ×
        </button>

        <p className="text-[#ffd02a] text-xs font-black uppercase tracking-widest">Sample Prompt</p>
        <h2 className="text-white font-black mt-0" style={{ fontSize: 'clamp(26px, 4vw, 40px)' }}>
          {sample.title}
        </h2>

        <div className={`media-screen min-h-[240px] ${sample.imgPath ? '' : bgClass} rounded-2xl overflow-hidden`}>
          {ytId && (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&origin=${encodeURIComponent(window.location.origin)}`}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          )}
          {videoFile && (
            <video
              src={sample.imgPath}
              className="absolute inset-0 w-full h-full object-cover"
              controls
              autoPlay
              muted
              playsInline
            />
          )}
          {imageFile && (
            <img
              src={sample.imgPath}
              alt={sample.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>

        {/* Sample prompt text */}
        <div className="bg-white/[0.06] border border-white/12 rounded-xl p-4">
          <p className="text-[#ffd02a] text-xs font-black uppercase tracking-widest mb-2">Sample Prompt</p>
          <p className="text-white/80 text-sm leading-relaxed font-mono">{sample.prompt}</p>
        </div>

        <button
          onClick={onBuy}
          className="cta-btn w-full min-h-[52px] rounded-xl font-black text-base"
        >
          Unlock Full PDF Bundle — Rs.199 Only
        </button>
      </div>
    </div>
  )
}
