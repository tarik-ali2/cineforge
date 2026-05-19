export default function DarkCTA({ onBuy, content = {}, settings = {} }) {
  const price = settings.price || 199
  return (
    <section className="dark-cta-bg py-20 px-4 sm:px-10 lg:px-20 flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
      <div>
        <span className="inline-flex items-center justify-center min-h-[34px] px-4 rounded-full bg-[#ffd02a] text-black text-xs font-black uppercase mb-4">
          Instant Access
        </span>
        <h2 className="text-white font-black max-w-[700px]" style={{ fontSize: 'clamp(28px, 5vw, 56px)' }}>
          {content.darkCtaHeading || 'AI fast move kar raha hai. Ye bundle tumhe content creation me head start dega.'}
        </h2>
      </div>
      <button
        onClick={onBuy}
        className="cta-btn min-h-[62px] px-8 font-black rounded-xl text-xl shrink-0"
      >
        {content.buyNowCta || 'Buy Now'} Rs.{price}
      </button>
    </section>
  )
}
