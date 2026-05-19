export default function FinalOffer({ onBuy, content = {}, settings = {} }) {
  const price = settings.price || 199
  const mrp   = settings.mrp   || 4999
  return (
    <section className="dark-cta-bg py-20 px-4 sm:px-10 lg:px-20 flex flex-col items-center text-center gap-5">
      <span className="inline-flex items-center justify-center min-h-[34px] px-4 rounded-full bg-[#ffd02a] text-black text-xs font-black uppercase">
        Offer Closing Soon
      </span>
      <h2 className="text-white font-black" style={{ fontSize: 'clamp(32px, 6vw, 68px)' }}>
        {content.finalOfferHeading || '10 Lakh+ AI Prompts Bundle'}
      </h2>
      <div className="flex items-baseline justify-center gap-4">
        <span className="text-white/50 font-black line-through" style={{ fontSize: 'clamp(24px, 3.5vw, 44px)' }}>
          Rs.{mrp}
        </span>
        <b className="text-[#ffd02a] font-black leading-none" style={{ fontSize: 'clamp(52px, 7vw, 96px)' }}>
          Rs.{price}
        </b>
      </div>
      <button
        onClick={onBuy}
        className="cta-btn min-h-[64px] px-10 font-black rounded-xl text-xl"
      >
        {content.instantCta || 'Get Instant Download'}
      </button>
      <p className="text-white/60 text-sm max-w-md">
        {content.finalOfferText || 'Payment ke baad thank-you page par download button aur email delivery trigger hogi.'}
      </p>
    </section>
  )
}
