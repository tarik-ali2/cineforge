export default function Hero({ onBuy, content = {}, settings = {} }) {
  const tools = (content.heroChips || 'Gemini, Midjourney, Sora, DALL-E, Leonardo')
    .split(',').map(t => t.trim()).filter(Boolean)

  const price = settings.price || 199
  const mrp   = settings.mrp   || 4999

  return (
    <section className="hero-bg py-24 px-4 sm:px-10 lg:px-20 flex flex-col items-center text-center pb-20">

      <span className="inline-flex items-center justify-center min-h-[34px] px-4 rounded-full bg-[#ffd02a] text-black text-xs font-black uppercase mb-5">
        {content.heroBadge || 'Bestseller Digital Bundle'}
      </span>

      <div className="w-full max-w-[1120px] animate-hero-rise">
        <p className="hero-mini">{content.heroMini || "India's digital creator prompt vault"}</p>

        <h1 className="font-black uppercase mx-auto mb-3 max-w-[1100px]"
          style={{ fontSize: 'clamp(42px, 7.5vw, 92px)', lineHeight: '0.94' }}>
          <span className="gradient-text">{content.heroLine1 || '10 Lakh+ Google Gemini'}</span>
          <span className="gradient-text">{content.heroLine2 || 'Image & Video Creation'}</span>
          <span className="gradient-text">{content.heroLine3 || 'Prompt Bundle'}</span>
        </h1>

        <h2 className="inline-flex justify-center max-w-[980px] mx-auto px-4 py-2 border border-[rgba(255,208,42,0.28)] rounded-full bg-[rgba(255,208,42,0.08)] text-[#ffd02a] font-black mb-4"
          style={{ fontSize: 'clamp(20px, 3.6vw, 44px)' }}>
          {content.heroSubheadline || 'Create viral images, reels, ads aur digital products faster.'}
        </h2>

        <p className="animate-hero-fade max-w-[910px] mx-auto px-3 text-white/75 text-lg leading-relaxed">
          {content.heroDescription || 'Gemini, Midjourney, Sora, DALL-E, Leonardo aur almost har AI tool ke liye ready-to-copy prompt categories.'}
        </p>

        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {tools.map((t) => (
            <span
              key={t}
              className="chip-float inline-flex items-center min-h-[38px] px-4 border border-[rgba(126,232,255,0.28)] rounded-full text-white bg-white/[0.07] shadow-[0_0_22px_rgba(126,232,255,0.08)] font-black text-sm"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <figure className="w-full max-w-[860px] mt-10 mb-6 p-2 border border-[rgba(255,208,42,0.28)] rounded-3xl product-img-wrap">
        <img
          src="/assets/digital_products.png"
          alt="10 Lakh AI Prompt Bundle"
          className="w-full block rounded-[18px]"
        />
      </figure>

      <div className="relative w-full max-w-[760px] min-h-[360px] my-4 max-sm:min-h-[260px]">
        <div className="absolute inset-x-[12%] inset-y-0 bundle-cover-bg border-2 border-[rgba(255,208,42,0.52)] rounded-[18px] shadow-[0_34px_80px_rgba(0,0,0,0.48)] flex flex-col justify-between p-8 sm:p-10 text-left max-sm:inset-x-0">
          <div className="flex justify-between items-start text-[#ffe9a2] font-black">
            <span style={{ fontSize: 'clamp(28px, 5.5vw, 64px)' }}>10 Lakh+</span>
            <small className="font-black text-sm mt-1">Prompt Vault</small>
          </div>
          <strong className="text-white leading-[0.94] max-w-[520px]"
            style={{ fontSize: 'clamp(28px, 5.5vw, 72px)' }}>
            AI Viral Content Bundle
          </strong>
          <em className="text-[#fff0b9] not-italic font-black text-base sm:text-lg">
            Images • Reels • Ads • Sales • Branding
          </em>
        </div>
        <div className="absolute left-0 top-[50px] max-sm:hidden w-[142px] h-[112px] bg-gradient-to-br from-[#fff2f8] to-[#ff7fb3] rounded-2xl border border-white/20 shadow-[0_22px_44px_rgba(0,0,0,0.36)] grid place-items-center font-black text-black text-sm">Wedding</div>
        <div className="absolute right-0 top-[88px] max-sm:hidden w-[142px] h-[112px] bg-gradient-to-br from-[#fff4c8] to-[#ff9d19] rounded-2xl border border-white/20 shadow-[0_22px_44px_rgba(0,0,0,0.36)] grid place-items-center font-black text-black text-sm">Brand Ads</div>
        <div className="absolute left-[54%] -bottom-[18px] max-sm:hidden w-[142px] h-[112px] bg-gradient-to-br from-[#dff7ff] to-[#5bbcff] rounded-2xl border border-white/20 shadow-[0_22px_44px_rgba(0,0,0,0.36)] grid place-items-center font-black text-black text-sm">Reels</div>
      </div>

      <div className="w-full max-w-[780px] mt-8 p-6 sm:p-8 border border-[rgba(255,208,42,0.34)] rounded-[18px] bg-gradient-to-b from-[rgba(255,208,42,0.1)] to-[rgba(255,47,47,0.08)]">
        <p className="text-white font-black mb-2 text-base">
          {content.offerSmallText || 'Act Fast — Launch offer limited customers ke liye'}
        </p>
        <strong className="block text-[#ffd02a] font-black" style={{ fontSize: 'clamp(22px, 4vw, 36px)' }}>
          {content.slotText || 'Only 37 slots left today'}
        </strong>
        <div className="flex items-baseline justify-center gap-4 my-4 max-sm:flex-col max-sm:items-center max-sm:gap-1">
          <span className="text-white/50 font-black line-through" style={{ fontSize: 'clamp(26px, 4vw, 48px)' }}>
            Rs.{mrp}
          </span>
          <b className="text-[#ffd02a] font-black leading-none" style={{ fontSize: 'clamp(52px, 8vw, 100px)' }}>
            Rs.{price}
          </b>
        </div>
        <button
          onClick={onBuy}
          className="cta-btn w-full min-h-[62px] font-black rounded-xl"
          style={{ fontSize: 'clamp(17px, 2.6vw, 22px)' }}
        >
          {content.mainCta || 'Get 10 Lakh+ Prompts Now'}
        </button>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {['✓ Instant Download', '✓ 100% Secure Payment', '✓ Email Delivery'].map(s => (
            <span key={s} className="text-[#fff8d6] font-black text-sm">{s}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
