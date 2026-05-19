import { useState } from 'react'

function SampleCard({ card, onOpen }) {
  const [playing, setPlaying] = useState(false)

  return (
    <article
      className="p-4 border border-white/12 rounded-[18px] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_24px_60px_rgba(0,0,0,0.3)] text-left cursor-pointer hover:border-[rgba(255,208,42,0.45)] hover:-translate-y-1 transition-all duration-200"
      onClick={() => !playing && onOpen(card)}
    >
      <div className={`media-screen min-h-[230px] mb-4 ${card.css} ${playing ? 'is-playing' : ''}`}>
        <button
          className="play-overlay absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[72px] h-[72px] rounded-full bg-[#ffd02a] shadow-[0_0_0_12px_rgba(255,208,42,0.18)] grid place-items-center text-black text-2xl font-black z-10 border-0 cursor-pointer hover:scale-110 transition-transform"
          onClick={(e) => { e.stopPropagation(); setPlaying(true) }}
          aria-label="Play sample"
        >
          ▶
        </button>

        <button
          className="close-overlay hidden absolute top-3 right-3 z-10 w-9 h-9 rounded-full border-0 bg-black/60 text-white text-lg cursor-pointer items-center justify-content-center backdrop-blur-sm"
          style={{ display: playing ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => { e.stopPropagation(); setPlaying(false) }}
          aria-label="Stop"
        >
          ✕
        </button>

        {playing && (
          <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center gap-2">
            <div className="flex gap-1 items-end h-8">
              {[1,2,3,4,5].map(i => (
                <span
                  key={i}
                  className="w-1.5 bg-[#ffd02a] rounded-full"
                  style={{
                    height: `${10 + i * 5}px`,
                    animation: `chip-float ${0.5 + i * 0.1}s ease-in-out infinite`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
            <span className="text-[#ffd02a] font-black text-sm">Playing Sample...</span>
          </div>
        )}
      </div>

      <h3 className="text-white font-black text-xl mb-2">{card.title}</h3>
      <p className="text-white/70 leading-relaxed text-sm">{card.desc}</p>
    </article>
  )
}

export default function SampleSection({ onBuy, onOpenSample, content = {} }) {
  const cards = [
    { id: 'image',   css: 'image-sample', title: content.sample1Title || 'Viral Image Prompt',    desc: content.sample1Text || 'Hyper-realistic cinematic AI image prompt for social media posts.',     prompt: content.sample1Prompt || '' },
    { id: 'reel',    css: 'reel-sample',  title: content.sample2Title || 'Reels & Shorts Prompt',  desc: content.sample2Text || 'Fast video concept, hook, camera movement aur caption prompt sample.', prompt: content.sample2Prompt || '' },
    { id: 'product', css: 'prod-sample',  title: content.sample3Title || 'Product Ad Prompt',      desc: content.sample3Text || 'Brand product mockup, lighting, scene and ad copy prompt sample.',    prompt: content.sample3Prompt || '' },
  ]

  return (
    <section id="samples" className="dark-section-bg py-20 px-4 sm:px-10 lg:px-20 text-center">
      <span className="inline-flex items-center justify-center min-h-[34px] px-4 rounded-full bg-[#ffd02a] text-black text-xs font-black uppercase mb-4">
        {content.sampleKicker || 'Free Preview'}
      </span>
      <h2 className="text-white font-black mb-3" style={{ fontSize: 'clamp(32px, 6vw, 68px)' }}>
        {content.sampleHeading || '3 sample prompts play karke dekho'}
      </h2>
      <p className="text-white/72 text-lg leading-relaxed max-w-[760px] mx-auto mb-10">
        {content.sampleIntro || 'Buyer ko landing page par hi idea mil jayega ki PDF bundle me kis type ke ready prompts milne wale hain.'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => (
          <SampleCard key={card.id} card={card} onOpen={onOpenSample} />
        ))}
      </div>
    </section>
  )
}
