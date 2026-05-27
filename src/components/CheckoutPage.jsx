import { useState } from 'react'

const META_PIXEL_ID = '1697719404699807'

function trackMetaEvent(eventName, data) {
  if (typeof window.fbq === 'function') {
    window.fbq('trackSingle', META_PIXEL_ID, eventName, data)
    return
  }

  const params = new URLSearchParams({
    id: META_PIXEL_ID,
    ev: eventName,
    dl: window.location.href,
    rl: document.referrer || '',
    if: 'false',
    ts: Date.now().toString(),
  })

  Object.entries(data).forEach(([key, value]) => {
    params.append(`cd[${key}]`, String(value))
  })

  new Image().src = `https://www.facebook.com/tr/?${params.toString()}`
}

function trackInitiateCheckoutAndRedirect(link) {
  trackMetaEvent('InitiateCheckout', {
    value: 199,
    currency: 'INR',
  })

  setTimeout(() => {
    window.location.href = link
  }, 300)
}

export default function CheckoutPage({ onClose, settings = {} }) {
  const [bump1, setBump1] = useState(true)
  const [bump2, setBump2] = useState(true)

  const mainPrice  = Number(settings.price)      || 199
  const b1Price    = Number(settings.bump1Price)  || 149
  const b2Price    = Number(settings.bump2Price)  || 147
  const total      = mainPrice + (bump1 ? b1Price : 0) + (bump2 ? b2Price : 0)

  const mainItems  = (settings.mainItems  || 'ChatGPT Mastery Course (62 Videos),Prompt Engineering Course (33 Videos),SaaS ChatGPT Course (33 Videos),ChatGPT Power Course (25 Videos),2500 Digital Product Ideas,365+ Automation Templates,1500+ AI Tools').split(',').map(s => s.trim()).filter(Boolean)
  const b1Items    = (settings.bump1Items || '').split(',').map(s => s.trim()).filter(Boolean)
  const b2Items    = (settings.bump2Items || '').split(',').map(s => s.trim()).filter(Boolean)

  const b1Title    = settings.bump1Title || '100,000 ChatGPT Prompts Bundle'
  const b1Desc     = settings.bump1Desc  || 'Smart Work Starts Here – Get 100,000+ ChatGPT Prompts for Hustlers Like You!'
  const b2Title    = settings.bump2Title || 'AI and Machine Learning Course'
  const b2Desc     = settings.bump2Desc  || 'Start building real-world AI and Machine Learning skills with step-by-step guidance, beginner-friendly explanations, practical projects, and hands-on experiences!'
  const mainTitle  = settings.productName || 'ChatGPT Course Mega Bundle 2026'

  const handlePay = () => {
    let link = settings.paymentLink
    if (bump1 && bump2 && settings.paymentLinkBoth)   link = settings.paymentLinkBoth
    else if (bump1 && settings.paymentLinkBump1)       link = settings.paymentLinkBump1
    else if (bump2 && settings.paymentLinkBump2)       link = settings.paymentLinkBump2

    if (link) {
      trackInitiateCheckoutAndRedirect(link)
      return
    }
    else alert('Payment link admin panel → Settings mein set karo')
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: '20px 12px' }}>
      <div style={{ width: '100%', maxWidth: 620, fontFamily: 'Arial, sans-serif' }}>

        {/* Header */}
        <div style={{ background: '#1a1a2e', color: '#fff', padding: '16px 20px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>🛒 You're Just One Step Away...</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ background: '#f5f5f5', padding: 16, display: 'grid', gap: 12, borderRadius: '0 0 12px 12px', color: '#1a1a1a' }}>

          {/* Box 1 — Main Product (always checked) */}
          <BumpBox
            color="#e8f5e9" border="#4caf50"
            checked={true} disabled={true}
            alertText={`${mainTitle} For ₹ ${mainPrice}/- only`}
            items={mainItems}
            desc=""
          />

          {/* Box 2 — Bump 1 */}
          {settings.bump1Enabled !== false && (
            <BumpBox
              color="#e3f2fd" border="#2196f3"
              checked={bump1} onChange={setBump1}
              alertText={`${b1Title} For ₹ ${b1Price}/- only`}
              items={b1Items}
              desc={b1Items.length === 0 ? b1Desc : ''}
            />
          )}

          {/* Box 3 — Bump 2 */}
          {settings.bump2Enabled !== false && (
            <BumpBox
              color="#fffde7" border="#f9a825"
              checked={bump2} onChange={setBump2}
              alertText={`${b2Title} For ₹ ${b2Price}/- only`}
              items={b2Items}
              desc={b2Items.length === 0 ? b2Desc : ''}
            />
          )}

          {/* Order Summary */}
          <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 10, padding: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8f8f8' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #eee' }}>Item</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid #eee' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>{mainTitle}</td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>₹{mainPrice}</td>
                </tr>
                {bump1 && settings.bump1Enabled !== false && (
                  <tr>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>{b1Title}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>₹{b1Price}</td>
                  </tr>
                )}
                {bump2 && settings.bump2Enabled !== false && (
                  <tr>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>{b2Title}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>₹{b2Price}</td>
                  </tr>
                )}
                <tr style={{ fontWeight: 800, fontSize: 16 }}>
                  <td style={{ padding: '10px 12px' }}>Total</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: '#e53935' }}>₹{total}/-</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pay Button */}
          <button onClick={handlePay} style={{
            width: '100%', padding: '16px 0', background: 'linear-gradient(135deg, #ff6b35, #e53935)',
            color: '#fff', border: 'none', borderRadius: 10, fontSize: 18, fontWeight: 800,
            cursor: 'pointer', letterSpacing: 0.5, boxShadow: '0 4px 15px rgba(229,57,53,0.4)'
          }}>
            🔒 Complete My Order — ₹{total}/-
          </button>

          {/* Trust badge */}
          <div style={{ textAlign: 'center', fontSize: 12, color: '#666', paddingBottom: 4 }}>
            🔐 100% Safe & Secure Payment · Instant Digital Delivery
          </div>

        </div>
      </div>
    </div>
  )
}

function BumpBox({ color, border, checked, disabled, onChange, alertText, items, desc }) {
  return (
    <div style={{ background: color, border: `2px solid ${border}`, borderRadius: 10, padding: 14, color: '#1a1a1a' }}>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: disabled ? 'default' : 'pointer' }}>
        <input
          type="checkbox" checked={checked} disabled={disabled}
          onChange={e => onChange && onChange(e.target.checked)}
          style={{ width: 18, height: 18, marginTop: 2, accentColor: border, flexShrink: 0, cursor: disabled ? 'default' : 'pointer' }}
        />
        <div style={{ color: '#1a1a1a' }}>
          <div style={{ background: '#ffff00', color: '#000', fontWeight: 900, fontSize: 15, display: 'inline-block', padding: '2px 8px', borderRadius: 3, marginBottom: 8 }}>
            Yes! I Want this!
          </div>
          <div style={{ fontSize: 14, marginBottom: 6, color: '#1a1a1a', fontWeight: 700 }}>
            LAST CHANCE ALERT:-{' '}
            <span style={{ color: '#e53935', fontWeight: 800 }}>{alertText}</span>
          </div>
          {items.length > 0 && (
            <div style={{ fontSize: 13, color: '#1a1a1a' }}>
              <strong style={{ color: '#1a1a1a' }}>LIMITED OFFER:</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: 18, lineHeight: 1.9, color: '#1a1a1a', fontWeight: 600 }}>
                {items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}
          {desc && (
            <div style={{ fontSize: 13, color: '#1a1a1a', fontWeight: 600 }}>
              <strong style={{ color: '#1a1a1a' }}>LIMITED OFFER:</strong> "{desc}"
            </div>
          )}
        </div>
      </label>
    </div>
  )
}
