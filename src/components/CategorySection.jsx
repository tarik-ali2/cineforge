const CATS = [
  { css: 'wedding-art',  badge: 'Most Popular', title: 'Indian Wedding Prompts',       desc: 'Invitation, couple shoot, pre-wedding, haldi, mehndi aur cinematic wedding scenes.' },
  { css: 'birthday-art', badge: 'Trending',     title: 'Birthday Celebration Prompts', desc: 'Kids, family, luxury party, cake shots aur social media celebration visuals.' },
  { css: 'brand-art',    badge: 'Business',     title: 'Commercial Brand Campaign',    desc: 'Product launch, ad creative, thumbnails, banners aur high-converting brand visuals.' },
  { css: 'divine-art',   badge: 'Devotional',   title: 'Divine Cinematic Prompts',     desc: 'Spiritual, festival, temple, devotional posters aur hyper-realistic divine content.' },
  { css: 'fashion-art',  badge: 'Fashion',      title: 'Fashion & E-commerce Shoot',   desc: 'Model shoots, catalogue photos, apparel creatives aur premium product frames.' },
  { css: 'interior-art', badge: 'Premium',      title: 'Interior & Real Estate',       desc: 'Room makeover, property ads, architecture visuals aur home decor concepts.' },
  { css: 'jewelry-art',  badge: 'Luxury',       title: 'Jewelry Photoshoot Prompts',   desc: 'Gold, diamond, bridal jewelry, macro shots aur premium lighting prompt styles.' },
  { css: 'mini-art',     badge: 'Creative',     title: 'Miniature & Viral Concepts',   desc: 'Surreal miniature worlds, viral scene ideas aur unique scroll-stopping concepts.' },
]

export default function CategorySection({ content = {}, settings = {} }) {
  return (
    <section id="categories" className="py-20 px-4 sm:px-10 lg:px-20 text-center bg-[#070707]">
      <span className="inline-flex items-center justify-center min-h-[34px] px-4 rounded-full bg-[#ffd02a] text-black text-xs font-black uppercase mb-4">
        {content.categoryKicker || 'Almost Every Specialized Prompt Category Included'}
      </span>
      <h2 className="text-white font-black mb-10" style={{ fontSize: 'clamp(32px, 6vw, 68px)' }}>
        {content.categoryHeading || 'Har niche ke liye ready prompt packs'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATS.map((cat, i) => {
          const imgPath = settings[`cat${i + 1}Path`] || ''
          return (
            <article
              key={cat.title}
              className="p-4 border border-white/12 rounded-[18px] bg-[#121212] shadow-[0_22px_50px_rgba(0,0,0,0.24)] text-left"
            >
              <span className="inline-flex items-center justify-center min-h-[28px] px-3 rounded-full bg-white text-black text-[11px] font-black uppercase mb-3">
                {cat.badge}
              </span>
              <div
                className={`${imgPath ? '' : cat.css} h-[220px] mb-4 rounded-2xl`}
                style={imgPath ? {
                  backgroundImage: `url(${imgPath})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                } : {}}
              />
              <h3 className="text-white font-black text-xl mb-2">{cat.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{cat.desc}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
