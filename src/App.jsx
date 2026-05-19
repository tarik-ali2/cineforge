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

export const PRODUCT = {
  brand: 'Market Prompt Hub',
  name: '10 Lakh+ AI Prompt Bundle',
  price: 199,
  mrp: 4999,
  slots: 37,
  pdfUrl: '/ai-prompts-pack.pdf',
}

const TOASTS = [
  'Priya from Mumbai just purchased!',
  'Rohan from Delhi just purchased!',
  'Nisha from Kolkata just purchased!',
  'Amit from Bangalore just purchased!',
  'Sneha from Pune just purchased!',
  'Rahul from Hyderabad just purchased!',
]

export default function App() {
  const [dialogOpen, setDialogOpen]       = useState(false)
  const [thankYou, setThankYou]           = useState(false)
  const [customerName, setCustomerName]   = useState('friend')
  const [pdfUrl, setPdfUrl]               = useState('/ai-prompts-pack.pdf')
  const [sampleOpen, setSampleOpen]       = useState(null)
  const [toastMsg, setToastMsg]           = useState(TOASTS[0])
  const [toastVisible, setToastVisible]   = useState(true)

  useEffect(() => {
    let idx = 0
    const id = setInterval(() => {
      setToastVisible(false)
      setTimeout(() => {
        idx = (idx + 1) % TOASTS.length
        setToastMsg(TOASTS[idx])
        setToastVisible(true)
      }, 400)
    }, 4500)
    return () => clearInterval(id)
  }, [])

  const openBuy = useCallback(() => setDialogOpen(true), [])

  const handlePurchase = useCallback((name, url) => {
    setCustomerName(name || 'friend')
    if (url) setPdfUrl(url)
    setDialogOpen(false)
    setThankYou(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#070707] text-white" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <Toast msg={toastMsg} visible={toastVisible} />
      <Header onBuy={openBuy} />

      <main id="top">
        <Hero onBuy={openBuy} />
        <SampleSection onBuy={openBuy} onOpenSample={setSampleOpen} />
        <GallerySection />
        <CategorySection />
        <DarkCTA onBuy={openBuy} />
        <Benefits />
        <Reviews />
        <FAQ />
        <FinalOffer onBuy={openBuy} />
      </main>

      <Footer />
      <StickyBar onBuy={openBuy} />

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
