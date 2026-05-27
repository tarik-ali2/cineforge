import { useState } from 'react'

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

export default function LeadDialog({ onClose, onPurchase }) {
  const [form, setForm]       = useState({ name: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Naam likhna zaroori hai')
    if (!/^\d{10}$/.test(form.phone)) return setError('10 digit mobile number likhein')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Valid email likhein')
    setError('')
    setLoading(true)

    try {
      // Save lead to backend
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status: 'Pending',
          paymentId: `lead_${Date.now()}`,
          product: '10 Lakh+ AI Prompt Bundle',
          amount: 199,
        }),
      })

      // Get payment link from settings
      const settings = await fetch('/api/settings').then(r => r.json())

      if (settings.paymentLink) {
        trackInitiateCheckoutAndRedirect(settings.paymentLink)
      } else if (settings.demoMode) {
        // Demo mode fallback
        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead: form }),
        })
        const verifyData = await verifyRes.json()
        setLoading(false)
        onPurchase(form.name, verifyData.pdfUrl)
      } else {
        // Live Razorpay fallback
        const orderRes = await fetch('/api/create-order', { method: 'POST' })
        const orderData = await orderRes.json()
        if (orderData.error) { setError(orderData.error); setLoading(false); return }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          order_id: orderData.orderId,
          name: 'Market Prompt Hub',
          description: '10 Lakh+ AI Prompt Bundle',
          prefill: { name: form.name, email: form.email, contact: form.phone },
          theme: { color: '#e6382f' },
          modal: { ondismiss: () => setLoading(false) },
          handler: async (response) => {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                lead: form,
              }),
            })
            const verifyData = await verifyRes.json()
            setLoading(false)
            if (verifyData.ok) onPurchase(form.name, verifyData.pdfUrl)
            else setError('Payment verification failed.')
          },
        }
        new window.Razorpay(options).open()
      }
    } catch {
      setError('Network error. Internet check karein.')
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="relative w-[min(94vw,520px)] bg-white rounded-xl shadow-[0_30px_80px_rgba(0,0,0,0.4)] p-7 grid gap-4"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full border border-[#e8dece] bg-white grid place-items-center text-2xl text-gray-500 cursor-pointer hover:bg-gray-50"
          aria-label="Close"
        >
          ×
        </button>

        <p className="text-[#e6382f] text-xs font-black uppercase tracking-widest mb-0">Customer Details</p>
        <h2 className="text-gray-900 font-black text-2xl leading-tight mt-0">
          Access unlock karne ke liye details bhariye
        </h2>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {[
            { label: 'Name',          name: 'name',  type: 'text',  placeholder: 'Aapka naam' },
            { label: 'Mobile Number', name: 'phone', type: 'tel',   placeholder: '10 digit mobile number' },
            { label: 'Email ID',      name: 'email', type: 'email', placeholder: 'you@example.com' },
          ].map(f => (
            <label key={f.name} className="grid gap-1.5 font-black text-gray-900 text-sm">
              {f.label}
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                className="w-full min-h-[48px] px-4 border border-[#e8dece] rounded-lg outline-none font-normal text-base focus:border-[#e6382f] focus:shadow-[0_0_0_4px_rgba(230,56,47,0.12)] transition"
              />
            </label>
          ))}

          {error && <p className="text-[#b91f18] font-black text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[52px] rounded-lg bg-[#e6382f] text-white font-black text-base cursor-pointer border-0 hover:bg-[#b91f18] disabled:opacity-60 transition-colors"
          >
            {loading ? 'Processing...' : 'Proceed To Payment — ₹199'}
          </button>
        </form>
      </div>
    </div>
  )
}
