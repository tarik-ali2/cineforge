import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import SampleSection from './components/SampleSection'
import GallerySection from './components/GallerySection'
import CategorySection from './components/CategorySection'
import DarkCTA from './components/DarkCTA'
import Benefits from './components/Benefits'
import Reviews from './components/Reviews'
import FAQ from './components/FAQ'
import FinalOffer from './components/FinalOffer'
import Footer from './components/Footer'
import StickyBar from './components/StickyBar'
import SampleDialog from './components/SampleDialog'
import CheckoutPage from './components/CheckoutPage'

const DEFAULT_CONTENT = {
  brandName: 'Market Prompt Hub',
  toastText: 'Someone just purchased the 10 Lakh+ Prompt Bundle',
  heroBadge: 'Bestseller Digital Bundle',
  heroMini: "India's digital creator prompt vault",
  heroLine1: '10 Lakh+ Google Gemini',
  heroLine2: 'Image & Video Creation',
  heroLine3: 'Prompt Bundle',
  heroSubheadline: 'Create viral images, reels, ads aur digital products faster.',
  heroDescription: 'Gemini, Midjourney, Sora, DALL-E, Leonardo aur almost har AI tool ke liye ready-to-copy prompt categories.',
  heroChips: 'Gemini, Midjourney, Sora, DALL-E, Leonardo',
  offerSmallText: 'Act Fast — Launch offer limited customers ke liye',
  slotText: 'Only 37 slots left today',
  mainCta: 'Get 10 Lakh+ Prompts Now',
  buyNowCta: 'Buy Now',
  instantCta: 'Get Instant Download',
  sampleKicker: 'Free Preview',
  sampleHeading: '4 sample prompts play karke dekho',
  sampleIntro: 'Buyer ko landing page par hi idea mil jayega ki PDF bundle me kis type ke ready prompts milne wale hain.',
  sample1Title: 'Viral Image Prompt',
  sample1Text: 'Hyper-realistic cinematic AI image prompt for social media posts.',
  sample1Prompt: 'A hyper-realistic cinematic portrait of an Indian woman in a golden saree, standing in a palace courtyard at sunset. Dramatic lighting, shallow depth of field, fashion editorial style, 8K resolution.',
  sample2Title: 'Reels & Shorts Prompt',
  sample2Text: 'Fast video concept, hook, camera movement aur caption prompt sample.',
  sample2Prompt: 'Create a 30-second viral reel: Open with a fast zoom-in on a product. Hook text: "Maine sirf Rs.199 mein 10 lakh prompts kharide". Add trending transition effects, upbeat background music cue, and a strong CTA in the last 5 seconds.',
  sample3Title: 'Product Ad Prompt',
  sample3Text: 'Brand product mockup, lighting, scene and ad copy prompt sample.',
  sample3Prompt: 'Premium product photography: A luxury perfume bottle placed on a black marble surface with cinematic side lighting. Smoke wisps, deep shadows, and golden reflections. Magazine cover quality, brand-ready composition.',
  sample4Title: 'Digital Product Prompt',
  sample4Text: 'Prompt sample for digital product, ad creative aur viral content ideas.',
  sample4Prompt: 'Create a premium digital product bundle mockup with glowing PDF covers, creator desk setup, cinematic lighting, yellow CTA badge, social media ad style, high-converting ecommerce composition.',
  galleryKicker: 'Bundle Preview',
  galleryHeading: 'Is PDF me aise digital product prompt packs milenge',
  gallery1Title: 'Image Creation Prompts',
  gallery2Title: 'Reels & Shorts Prompts',
  gallery3Title: 'Business Ad Prompts',
  gallery4Title: 'Festival & Event Prompts',
  categoryKicker: 'Almost Every Specialized Prompt Category Included',
  categoryHeading: 'Har niche ke liye ready prompt packs',
  cat1Badge: 'Most Popular',
  cat1Title: 'Indian Wedding Prompts',
  cat2Badge: 'Trending',
  cat2Title: 'Birthday Celebration',
  cat3Badge: 'Business',
  cat3Title: 'Brand Campaign',
  cat4Badge: 'Devotional',
  cat4Title: 'Divine Cinematic',
  cat5Badge: 'Fashion',
  cat5Title: 'Fashion & E-commerce',
  cat6Badge: 'Premium',
  cat6Title: 'Interior & Real Estate',
  cat7Badge: 'Luxury',
  cat7Title: 'Jewelry Photoshoot',
  cat8Badge: 'Creative',
  cat8Title: 'Miniature & Viral',
  darkCtaHeading: 'AI fast move kar raha hai. Ye bundle tumhe content creation me head start dega.',
  benefitHeading: 'Content banana fast, easy aur profitable.',
  reviewHeading: 'Creators ka response',
  finalOfferHeading: '10 Lakh+ AI Prompts Bundle',
  finalOfferText: 'Payment ke baad thank-you page par download button aur email delivery trigger hogi.',
  faqHeading: 'Common questions',
  footerCopyright: `Copyright © ${new Date().getFullYear()} Market Prompt Hub`,
}

const DEFAULT_SETTINGS = {
  productName: '10 Lakh+ AI Prompt Bundle',
  price: 199,
  mrp: 4999,
  slots: 37,
  pdfUrl: '/ai-prompts-pack.pdf',
  heroImagePath: '/assets/digital_products.png',
  sampleImagePath: '/fallback-media/sample-image.jpeg',
  sampleReelPath: '/fallback-media/sample-video.mp4',
  sampleProductPath: '/fallback-media/sample-product.jpeg',
  sampleExtraPath: '/fallback-media/gallery-2.mp4',
  gallery1Path: '/fallback-media/gallery-1.jpeg',
  gallery2Path: '/fallback-media/gallery-2.mp4',
  gallery3Path: '/fallback-media/gallery-3.mp4',
  gallery4Path: '/fallback-media/gallery-4.mp4',
  cat1Path: '/fallback-media/cat-1.jpeg',
  cat2Path: '/fallback-media/cat-2.jpeg',
  cat3Path: '/fallback-media/cat-3.jpeg',
  cat4Path: '/fallback-media/cat-4.jpeg',
  cat5Path: '/fallback-media/cat-5.jpeg',
  cat6Path: '/fallback-media/cat-6.jpeg',
  cat7Path: '/fallback-media/cat-7.jpeg',
  cat8Path: '/fallback-media/cat-8.jpeg',
}

const removeEmptyValues = (data = {}) =>
  Object.fromEntries(Object.entries(data).filter(([, value]) => value !== '' && value !== null && value !== undefined))

function trackInitiateCheckoutAndRedirect(link) {
  if (typeof fbq === 'function') {
    fbq('track', 'InitiateCheckout', {
      value: 199,
      currency: 'INR',
    })
  }

  setTimeout(() => {
    window.location.href = link
  }, 300)
}

function trackPurchaseOnce() {
  const purchasePaths = ['/thank-you', '/thankyou', '/success', '/payment-success']
  const params = new URLSearchParams(window.location.search)
  const shouldTrackPurchase =
    purchasePaths.some(path => window.location.pathname.startsWith(path)) ||
    params.get('purchase') === '1' ||
    params.get('payment') === 'success'

  if (!shouldTrackPurchase || sessionStorage.getItem('purchase_tracked') === '1') return

  if (typeof fbq === 'function') {
    fbq('track', 'Purchase', {
      value: 199,
      currency: 'INR',
    })
    sessionStorage.setItem('purchase_tracked', '1')
  }
}

export default function App() {
  const [content,  setContent]  = useState(DEFAULT_CONTENT)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [sampleOpen, setSampleOpen] = useState(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const openCheckout = useCallback(() => {
    setCheckoutOpen(true)
    window.history.pushState({}, '', '/checkout')
    if (window.dataLayer) window.dataLayer.push({ event: 'virtualPageview', page_path: '/checkout', page_title: 'Checkout' })
  }, [])

  const closeCheckout = useCallback(() => {
    setCheckoutOpen(false)
    window.history.pushState({}, '', '/')
  }, [])
  useEffect(() => {
    trackPurchaseOnce()

    Promise.all([
      fetch('/api/content').then(r => r.json()).catch(() => ({})),
      fetch('/api/settings').then(r => r.json()).catch(() => ({})),
    ]).then(([c, s]) => {
      setContent(prev => ({ ...prev, ...removeEmptyValues(c) }))
      setSettings(prev => ({ ...prev, ...removeEmptyValues(s) }))
    })
  }, [])

  const openBuy = useCallback(() => {
    if (settings.paymentLink) {
      trackInitiateCheckoutAndRedirect(settings.paymentLink)
      return
    }

    openCheckout()
  }, [openCheckout, settings.paymentLink])

  return (
    <div className="min-h-screen bg-[#070707] text-white" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>

      <Header onBuy={openBuy} content={content} />

      <main id="top" className="pb-28 sm:pb-32">
        <Hero onBuy={openBuy} content={content} settings={settings} />
        <SampleSection onBuy={openBuy} onOpenSample={setSampleOpen} content={content} settings={settings} />
        <GallerySection content={content} settings={settings} />
        <CategorySection content={content} settings={settings} />
        <DarkCTA onBuy={openBuy} content={content} settings={settings} />
        <Benefits content={content} />
        <Reviews content={content} />
        <FAQ content={content} />
        <FinalOffer onBuy={openBuy} content={content} settings={settings} />
      </main>

      <Footer content={content} />
      <StickyBar onBuy={openBuy} content={content} settings={settings} />

      {checkoutOpen && (
        <CheckoutPage settings={settings} onClose={closeCheckout} />
      )}

      {sampleOpen && (
        <SampleDialog
          sample={sampleOpen}
          onClose={() => setSampleOpen(null)}
          onBuy={() => { setSampleOpen(null); openBuy() }}
        />
      )}
    </div>
  )
}
