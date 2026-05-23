const CATS = [
  { css: 'wedding-art',  badge: 'Most Popular', title: 'Indian Wedding Prompts', key: 'cat1' },
  { css: 'birthday-art', badge: 'Trending',     title: 'Birthday Celebration',   key: 'cat2' },
  { css: 'brand-art',    badge: 'Business',     title: 'Brand Campaign',         key: 'cat3' },
  { css: 'divine-art',   badge: 'Devotional',   title: 'Divine Cinematic',        key: 'cat4' },
  { css: 'fashion-art',  badge: 'Fashion',      title: 'Fashion & E-commerce',    key: 'cat5' },
  { css: 'interior-art', badge: 'Premium',      title: 'Interior & Real Estate',  key: 'cat6' },
  { css: 'jewelry-art',  badge: 'Luxury',       title: 'Jewelry Photoshoot',      key: 'cat7' },
  { css: 'mini-art',     badge: 'Creative',     title: 'Miniature & Viral',       key: 'cat8' },
]

export default function CategorySection({ content = {}, settings = {} }) {
  return (
    <section id="categories" className="py-12 sm:py-16 px-4 sm:px-10 lg:px-20 bg-[#070707]">
      <div className="text-center mb-6 sm:mb-8">
        <span className="inline-flex items-center justify-center min-h-[32px] px-4 rounded-full bg-[#ffd02a] text-black text-[11px] sm:text-xs font-black uppercase mb-3">
          {content.categoryKicker || 'Almost Every Specialized Prompt Category Included'}
        </span>
        <h2 className="text-white font-black" style={{ fontSize: 'clamp(22px, 4.5vw, 56px)' }}>
          {content.categoryHeading || 'Har niche ke liye ready prompt packs'}
        </h2>
      </div>

      {/* Horizontal slider */}
      <div className="slider-track">
        {CATS.map((cat, i) => {
          const imgPath = settings[`cat${i + 1}Path`] || ''
          const badge = content[`${cat.key}Badge`] || cat.badge
          const title = content[`${cat.key}Title`] || cat.title
          return (
            <div key={cat.key} className="w-[62vw] sm:w-[264px] lg:w-[288px]">
              <div className="border border-white/12 rounded-[14px] bg-[#121212] overflow-hidden">
                {/* Square image */}
                <div
                  className={`${imgPath ? '' : cat.css} aspect-square`}
                  style={imgPath ? { backgroundImage: `url(${imgPath})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                />
                <div className="px-3 py-2">
                  <span className="inline-flex items-center min-h-[22px] px-2 rounded-full bg-white text-black text-[10px] font-black uppercase mb-1">
                    {badge}
                  </span>
                  <p className="text-white font-black text-sm leading-tight">{title}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
