import { useState, useEffect, useCallback } from 'react'
import Toast from './components/Toast'
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
import LeadDialog from './components/LeadDialog'
import ThankYou from './components/ThankYou'
import SampleDialog from './components/SampleDialog'

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
  sampleHeading: '3 sample prompts play karke dekho',
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
  galleryKicker: 'Bundle Preview',
  galleryHeading: 'Is PDF me aise digital product prompt packs milenge',
  categoryKicker: 'Almost Every Specialized Prompt Category Included',
  categoryHeading: 'Har niche ke liye ready prompt packs',
  darkCtaHeading: 'AI fast move kar raha hai. Ye bundle tumhe content creation me head start dega.',
  benefitHeading: 'Content banana fast, easy aur profitable.',
  reviewHeading: 'Creators ka response',
  finalOfferHeading: '10 Lakh+ AI Prompts Bundle',
  finalOfferText: 'Payment ke baad thank-you page par download button aur email delivery trigger hogi.',
  faqHeading: 'Common questions',
  footerCopyright: `Copyright © ${new Date().getFullYear()} Market Prompt Hub`,
}

const DEFAULT_SETTINGS = { productName: '10 Lakh+ AI Prompt Bundle', price: 199, mrp: 4999, slots: 37, pdfUrl: '/ai-prompts-pack.pdf' }

export default function App() {
  const [content,  setContent]  = useState(DEFAULT_CONTENT)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [dialogOpen, setDialogOpen]     = useState(false)
  const [thankYou, setThankYou]         = useState(false)
  const [customerName, setCustomerName] = useState('friend')
  const [pdfUrl, setPdfUrl]             = useState('/ai-prompts-pack.pdf')
  const [sampleOpen, setSampleOpen]     = useState(null)
  const [toastMsg, setToastMsg]         = useState('')
  const [toastVisible, setToastVisible] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/content').then(r => r.json()).catch(() => ({})),
      fetch('/api/settings').then(r => r.json()).catch(() => ({})),
    ]).then(([c, s]) => {
      setContent(prev => ({ ...prev, ...c }))
      setSettings(prev => ({ ...prev, ...s }))
      setToastMsg(c.toastText || DEFAULT_CONTENT.toastText)
    })
  }, [])

  useEffect(() => {
    if (!toastMsg) return
    const id = setInterval(() => {
      setToastVisible(false)
      setTimeout(() => setToastVisible(true), 400)
    }, 4500)
    return () => clearInterval(id)
  }, [toastMsg])

  const openBuy = useCallback(() => setDialogOpen(true), [])

  const handlePurchase = useCallback((name, url) => {
    setCustomerName(name || 'friend')
    if (url) setPdfUrl(url)
    setDialogOpen(false)
    setThankYou(true)
  }, [])

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

      {dialogOpen && (
        <LeadDialog
          onClose={() => setDialogOpen(false)}
          onPurchase={handlePurchase}
        />
      )}

      {thankYou && (
        <ThankYou
          name={customerName}
          pdfUrl={pdfUrl}
          onBack={() => setThankYou(false)}
        />
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
