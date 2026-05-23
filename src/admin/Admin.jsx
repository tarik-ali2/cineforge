import { useState, useEffect } from 'react'

// ── API helpers ───────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('admToken') || ''
const authH = () => ({ Authorization: `Bearer ${getToken()}` })
const jsonH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` })

function handleUnauth() {
  localStorage.removeItem('adm')
  localStorage.removeItem('admToken')
  window.location.reload()
}

const api = {
  get: async (url) => {
    const r = await fetch(url, { headers: authH() })
    if (r.status === 401) { handleUnauth(); return {} }
    return r.json()
  },
  post: async (url, data) => {
    const r = await fetch(url, { method: 'POST', headers: jsonH(), body: JSON.stringify(data) })
    if (r.status === 401) { handleUnauth(); return {} }
    return r.json()
  },
  del: async (url) => {
    const r = await fetch(url, { method: 'DELETE', headers: authH() })
    if (r.status === 401) { handleUnauth(); return {} }
    return r.json()
  },
  upload: async (form) => {
    const r = await fetch('/api/upload', { method: 'POST', headers: authH(), body: form })
    if (r.status === 401) { handleUnauth(); return {} }
    return r.json()
  },
}

const NAV = [
  { id: 'dashboard', label: 'Dashboard',       icon: '📊' },
  { id: 'orders',    label: 'Orders',           icon: '📦' },
  { id: 'settings',  label: 'Settings',         icon: '⚙️' },
  { id: 'content',   label: 'Content Editor',   icon: '✏️' },
  { id: 'media',     label: 'Media Manager',    icon: '🖼️' },
]

// ── Root ──────────────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed,  setAuthed]  = useState(localStorage.getItem('adm') === '1')
  const [tab,     setTab]     = useState('dashboard')
  const [data,    setData]    = useState({ settings: {}, content: {}, orders: [] })
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [settings, orders, content] = await Promise.all([
        api.get('/api/settings/full'),
        api.get('/api/orders'),
        api.get('/api/content'),
      ])
      setData({ settings, orders, content })
    } catch { /* server waking up */ }
    finally { setLoading(false) }
  }

  useEffect(() => { if (authed) load() }, [authed])

  if (!authed) return <Login onLogin={() => { localStorage.setItem('adm', '1'); setAuthed(true) }} />

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: '#0f172a', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Admin Panel</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Market Prompt Hub</div>
        </div>
        <nav style={{ flex: 1, padding: 12 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 500,
              border: 'none', cursor: 'pointer', marginBottom: 4,
              background: tab === n.id ? '#e6382f' : 'transparent',
              color: tab === n.id ? '#fff' : '#94a3b8',
            }}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 12px 20px' }}>
          <button onClick={() => { localStorage.removeItem('adm'); setAuthed(false) }} style={{
            width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 8,
            fontSize: 13, color: '#64748b', border: 'none', background: 'transparent', cursor: 'pointer',
          }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {loading
          ? <Center>Server se connect ho raha hai... (30-50 sec wait karo)</Center>
          : <>
              {tab === 'dashboard' && <Dashboard data={data} onRefresh={load} />}
              {tab === 'orders'    && <Orders    orders={data.orders} settings={data.settings} onRefresh={load} />}
              {tab === 'settings'  && <Settings  settings={data.settings} onSave={async s => { await api.post('/api/settings', s); await load() }} />}
              {tab === 'content'   && <Content   content={data.content}   onSave={async c => { await api.post('/api/content', c);  await load() }} />}
              {tab === 'media'     && <Media     settings={data.settings} onRefresh={load} />}
            </>
        }
      </main>
    </div>
  )
}

// ── Login ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [id, setId]         = useState('')
  const [pw, setPw]         = useState('')
  const [err, setErr]       = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setErr('')
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: pw }),
      }).then(r => r.json())
      if (res.ok) {
        if (res.token) localStorage.setItem('admToken', res.token)
        onLogin()
      } else setErr('Wrong ID or password')
    } catch {
      setErr('Server se connect nahi ho pa raha, thoda wait karo')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#fff', borderRadius: 16, padding: 40, boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: '#e6382f', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22, color: '#fff', fontWeight: 900 }}>A</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Admin Login</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Market Prompt Hub</div>
        </div>
        <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
          <Inp label="Admin ID"  value={id} onChange={setId} placeholder="admin" />
          <Inp label="Password"  value={pw} onChange={setPw} placeholder="••••••••" type="password" />
          {err && <div style={{ color: '#dc2626', fontSize: 13 }}>{err}</div>}
          <button type="submit" disabled={loading} style={{ padding: '12px 0', background: loading ? '#94a3b8' : '#e6382f', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Verifying...' : 'Login'}
          </button>
          <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>Default: admin / admin123</div>
        </form>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ data, onRefresh }) {
  const { orders = [], settings = {} } = data
  const paid    = orders.filter(o => o.status === 'Paid')
  const pending = orders.filter(o => o.status !== 'Paid')
  const revenue = paid.reduce((s, o) => s + (Number(o.amount) || 0), 0)

  return (
    <Page title="Dashboard" action={<Btn onClick={onRefresh}>🔄 Refresh</Btn>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Orders', value: orders.length, color: '#3b82f6' },
          { label: 'Paid',         value: paid.length,   color: '#22c55e' },
          { label: 'Revenue',      value: `₹${revenue}`, color: '#8b5cf6' },
          { label: 'Pending',      value: pending.length, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <Card title="Recent Orders">
        <OrderTable orders={orders.slice(0, 8)} />
      </Card>
    </Page>
  )
}

// ── Orders ────────────────────────────────────────────────────────────────────
function Orders({ orders, settings, onRefresh }) {
  const [q, setQ] = useState('')
  const filtered = orders.filter(o =>
    [o.name, o.phone, o.email, o.paymentId].some(v => v?.toLowerCase().includes(q.toLowerCase()))
  )

  const exportCsv = () => {
    const rows = [['Date','Name','Phone','Email','Amount','Status','Payment ID'],
      ...orders.map(o => [new Date(o.createdAt).toLocaleString('en-IN'), o.name, o.phone, o.email, o.amount, o.status, o.paymentId])]
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'orders.csv' }).click()
  }

  const clearAll = async () => {
    if (!confirm('Sab orders delete karein?')) return
    await api.del('/api/orders')
    onRefresh()
  }

  return (
    <Page title={`Orders (${orders.length})`} action={
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn color="#22c55e" onClick={exportCsv}>⬇ Export CSV</Btn>
        <Btn color="#e6382f" onClick={clearAll}>🗑 Clear All</Btn>
      </div>
    }>
      <Card>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, phone, email..."
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 16 }} />
        <OrderTable orders={filtered} />
      </Card>
    </Page>
  )
}

// ── Settings ──────────────────────────────────────────────────────────────────
function Settings({ settings, onSave }) {
  const [form, setForm] = useState({ ...settings })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(setHealth).catch(() => {})
  }, [])

  const save = async () => {
    setSaving(true)
    await onSave(form)
    setMsg('✓ Saved!')
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <Page title="Settings" action={
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {msg && <span style={{ color: '#22c55e', fontWeight: 600 }}>{msg}</span>}
        <Btn onClick={save} disabled={saving}>{saving ? 'Saving...' : '💾 Save Settings'}</Btn>
      </div>
    }>
      <div style={{ display: 'grid', gap: 20, maxWidth: 720 }}>

        {/* MongoDB status */}
        {health && (
          <div style={{
            background: health.mongodb ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${health.mongodb ? '#86efac' : '#fca5a5'}`,
            borderRadius: 10, padding: '12px 16px', fontSize: 13,
            color: health.mongodb ? '#166534' : '#991b1b',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ fontSize: 18 }}>{health.mongodb ? '✅' : '❌'}</span>
            {health.mongodb
              ? 'MongoDB connected — data permanently save hoga, deploy ke baad bhi nahi jayega!'
              : 'MongoDB connected NAHI hai — deploy karne par data delete ho jayega! MONGO_URI Render pe sahi set karo.'}
          </div>
        )}

        {/* Quick guide */}
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: '#166534', lineHeight: 1.9 }}>
          <strong>📋 Kya kahan dalna hai — Quick Guide</strong><br />
          <strong>Product Name</strong> → Hero section + sticky buy bar par dikhta hai<br />
          <strong>Sale Price</strong> → "Buy Now — ₹199" button par dikhta hai<br />
          <strong>MRP</strong> → Strikethrough price (₹4999 ~~katke~~) hero par dikhta hai<br />
          <strong>Payment Link</strong> → Buy button click hone par yahi link khulta hai (Razorpay / Instamojo / UPI link daalo)<br />
          <strong>PDF URL</strong> → Media Manager mein daalo — customer download karega<br />
          <strong>Gmail</strong> → Purchase hone par customer ko confirmation email jayegi<br />
          <strong>Webhook</strong> → Make / Zapier / Pabbly se automation ke liye (optional)
        </div>

        <Card title="📊 Google Tag Manager (GTM)">
          <Inp label="GTM Container ID — Google Tag Manager ID (format: GTM-XXXXXXX)" value={form.gtmId} onChange={v => set('gtmId', v)} placeholder="GTM-PP97L3Q8" />
          <div style={{ background: '#f0f9ff', border: '1px solid #93c5fd', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#1e3a5f', lineHeight: 1.8 }}>
            💡 GTM ID save karo → Save Settings dabao → website refresh karo → tracking shuru ho jayegi<br />
            GTM se aap control kar sakte ho: <strong>GA4 Analytics, Meta Pixel, Google Ads Remarketing</strong> — sab bina website touch kiye
          </div>
        </Card>

        <Card title="🛍️ Product — Landing page par dikhne wali details">
          <FGrid>
            <Inp label="Product Name — Hero + buy bar par" value={form.productName} onChange={v => set('productName', v)} placeholder="10 Lakh+ AI Prompt Bundle" />
            <Inp label="Sale Price ₹ — Buy button par dikhega" value={form.price} onChange={v => set('price', v)} type="number" placeholder="199" />
            <Inp label="MRP ₹ — Katne wali price (strikethrough)" value={form.mrp} onChange={v => set('mrp', v)} type="number" placeholder="4999" />
          </FGrid>
        </Card>

        <Card title="💳 Payment Link — ⚠️ Sabse zaroori! Buy button yahi link kholega">
          <Inp label="Payment Link URL — Razorpay / Instamojo / UPI payment link yahan daalo" value={form.paymentLink} onChange={v => set('paymentLink', v)} type="url" placeholder="https://rzp.io/l/xxxxx ya https://pages.razorpay.com/..." />
          <div style={{ background: '#fef9c3', border: '1px solid #fbbf24', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400e', marginTop: 8 }}>
            💡 Razorpay Payment Link kaise banaye: Razorpay Dashboard → Payment Links → Create → Link copy karo → yahan paste karo
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Toggle checked={!!form.demoMode} onChange={v => set('demoMode', v)} />
            <span style={{ fontSize: 14, color: '#374151' }}>Demo Mode — Test ke liye ON karo (real payment nahi hoga)</span>
          </div>
        </Card>

        <Card title="📧 Email Delivery — Purchase hone par customer ko email">
          <FGrid>
            <Inp label="Gmail Address — Jis Gmail se email jayegi" value={form.emailFrom} onChange={v => set('emailFrom', v)} type="email" placeholder="yourstore@gmail.com" />
            <Inp label="Gmail App Password (16 characters)" value={form.emailPassword} onChange={v => set('emailPassword', v)} type="password" placeholder="xxxx xxxx xxxx xxxx" />
          </FGrid>
          <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>
            Gmail → myaccount.google.com → Security → 2-Step Verification ON karo → App Passwords → "Mail" select → Generate → 16-char code copy karo
          </div>
        </Card>

        <Card title="🔗 Automation Webhook (Optional — Make/Zapier/Pabbly)">
          <Inp label="Webhook URL — Purchase hone par yahan data jayega" value={form.automationWebhookUrl} onChange={v => set('automationWebhookUrl', v)} type="url" placeholder="https://hook.make.com/..." />
        </Card>

        <Card title="🛒 Checkout Page — Order Bumps (Upsell)">
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#166534', marginBottom: 4 }}>
            💡 Buy button click hone par checkout page khulega jisme 3 boxes honge. Har combination ke liye alag payment link set karo.
          </div>
          <Inp label="Main Product Items (comma separated — green box mein dikhenge)" value={form.mainItems} onChange={v => set('mainItems', v)} placeholder="Course 1,Course 2,Item 3" />
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 8, marginBottom: 4 }}>📦 Order Bump 1 (Blue Box)</div>
          <FGrid>
            <Inp label="Bump 1 Title" value={form.bump1Title} onChange={v => set('bump1Title', v)} placeholder="100,000 ChatGPT Prompts Bundle" />
            <Inp label="Bump 1 Price ₹" value={form.bump1Price} onChange={v => set('bump1Price', v)} type="number" placeholder="149" />
          </FGrid>
          <Inp label="Bump 1 Description (agar items nahi hain toh)" value={form.bump1Desc} onChange={v => set('bump1Desc', v)} placeholder="Short description..." />
          <Inp label="Bump 1 Items (optional, comma separated)" value={form.bump1Items} onChange={v => set('bump1Items', v)} placeholder="Item 1,Item 2,Item 3" />
          <Inp label="Payment Link — Main Only (₹199)" value={form.paymentLink} onChange={v => set('paymentLink', v)} type="url" placeholder="https://rzp.io/l/..." />
          <Inp label="Payment Link — Main + Bump1 (₹348)" value={form.paymentLinkBump1} onChange={v => set('paymentLinkBump1', v)} type="url" placeholder="https://rzp.io/l/..." />
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 8, marginBottom: 4 }}>📦 Order Bump 2 (Yellow Box)</div>
          <FGrid>
            <Inp label="Bump 2 Title" value={form.bump2Title} onChange={v => set('bump2Title', v)} placeholder="AI and Machine Learning Course" />
            <Inp label="Bump 2 Price ₹" value={form.bump2Price} onChange={v => set('bump2Price', v)} type="number" placeholder="147" />
          </FGrid>
          <Inp label="Bump 2 Description" value={form.bump2Desc} onChange={v => set('bump2Desc', v)} placeholder="Short description..." />
          <Inp label="Bump 2 Items (optional, comma separated)" value={form.bump2Items} onChange={v => set('bump2Items', v)} placeholder="Item 1,Item 2,Item 3" />
          <Inp label="Payment Link — Main + Bump2 (₹346)" value={form.paymentLinkBump2} onChange={v => set('paymentLinkBump2', v)} type="url" placeholder="https://rzp.io/l/..." />
          <Inp label="Payment Link — Main + Bump1 + Bump2 (₹495)" value={form.paymentLinkBoth} onChange={v => set('paymentLinkBoth', v)} type="url" placeholder="https://rzp.io/l/..." />
        </Card>

        <Card title="🔐 Admin Login Credentials Change">
          <div style={{ background: '#fef9c3', border: '1px solid #fbbf24', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400e', marginBottom: 8 }}>
            ⚠️ Naya ID aur password save karne ke baad wahi use karna hoga login ke liye. Bhool gaye toh server.js mein default 'admin' / 'admin123' restore karna padega.
          </div>
          <FGrid>
            <Inp label="Admin ID (Login username)" value={form.adminId || 'admin'} onChange={v => set('adminId', v)} placeholder="admin" />
            <Inp label="Admin Password" value={form.adminPassword || ''} onChange={v => set('adminPassword', v)} type="password" placeholder="Naya password dalein" />
          </FGrid>
        </Card>

      </div>
    </Page>
  )
}

// ── Content ───────────────────────────────────────────────────────────────────
function Content({ content, onSave }) {
  const [form, setForm] = useState({ ...content })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const save = async () => {
    setSaving(true)
    await onSave(form)
    setMsg('✓ Saved!')
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const F = ({ label, name, big }) => (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      {big
        ? <textarea value={form[name] || ''} onChange={e => set(name, e.target.value)} rows={3}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
        : <input value={form[name] || ''} onChange={e => set(name, e.target.value)}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
      }
    </label>
  )

  return (
    <Page title="Content Editor" action={
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {msg && <span style={{ color: '#22c55e', fontWeight: 600 }}>{msg}</span>}
        <Btn onClick={save} disabled={saving}>{saving ? 'Saving...' : '💾 Save All Content'}</Btn>
      </div>
    }>
      <div style={{ display: 'grid', gap: 20, maxWidth: 800 }}>

        <Card title="🏷️ Brand & Footer">
          <FGrid>
            <F label="Brand Name" name="brandName" />
            <F label="Footer Copyright" name="footerCopyright" />
          </FGrid>
          <F label="Toast Popup Text (purchase notification)" name="toastText" />
        </Card>

        <Card title="🦸 Hero Section">
          <FGrid>
            <F label="Badge Text" name="heroBadge" />
            <F label="Mini Tagline" name="heroMini" />
          </FGrid>
          <FGrid>
            <F label="Headline Line 1" name="heroLine1" />
            <F label="Headline Line 2" name="heroLine2" />
            <F label="Headline Line 3" name="heroLine3" />
          </FGrid>
          <F label="Sub Headline" name="heroSubheadline" big />
          <F label="Description" name="heroDescription" big />
          <F label="Chips / Tags (comma separated)" name="heroChips" />
        </Card>

        <Card title="🎯 Offer & Buttons">
          <FGrid>
            <F label="Offer Small Text" name="offerSmallText" />
            <F label="Slots Text" name="slotText" />
          </FGrid>
          <FGrid>
            <F label="Main CTA Button" name="mainCta" />
            <F label="Buy Now Button" name="buyNowCta" />
            <F label="Instant CTA Button" name="instantCta" />
          </FGrid>
        </Card>

        <Card title="🎬 Sample Section">
          <FGrid>
            <F label="Section Kicker" name="sampleKicker" />
            <F label="Section Heading" name="sampleHeading" />
          </FGrid>
          <F label="Section Intro" name="sampleIntro" big />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[1,2,3].map(n => (
              <div key={n} style={{ display: 'grid', gap: 10 }}>
                <F label={`Sample ${n} Title`} name={`sample${n}Title`} />
                <F label={`Sample ${n} Text`} name={`sample${n}Text`} />
                <F label={`Sample ${n} Prompt`} name={`sample${n}Prompt`} big />
              </div>
            ))}
          </div>
        </Card>

        <Card title="🖼️ Gallery & Categories">
          <FGrid>
            <F label="Gallery Kicker" name="galleryKicker" />
            <F label="Gallery Heading" name="galleryHeading" />
          </FGrid>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Gallery Card Titles (niche dikhne wale naam)</div>
          <FGrid>
            <F label="Gallery Card 1 Title — Image Creation" name="gallery1Title" />
            <F label="Gallery Card 2 Title — Reels/Shorts" name="gallery2Title" />
            <F label="Gallery Card 3 Title — Business Ad" name="gallery3Title" />
            <F label="Gallery Card 4 Title — Festival & Event" name="gallery4Title" />
          </FGrid>
          <FGrid>
            <F label="Category Kicker" name="categoryKicker" />
            <F label="Category Heading" name="categoryHeading" />
          </FGrid>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Category Card Badge + Name</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {[1,2,3,4,5,6,7,8].map(n => (
              <div key={n} style={{ display: 'grid', gap: 10, padding: 12, border: '1px solid #e2e8f0', borderRadius: 10 }}>
                <F label={`Category ${n} Badge`} name={`cat${n}Badge`} />
                <F label={`Category ${n} Card Name`} name={`cat${n}Title`} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="📋 Other Sections">
          <F label="Dark CTA Heading" name="darkCtaHeading" big />
          <FGrid>
            <F label="Benefits Heading" name="benefitHeading" />
            <F label="Reviews Heading" name="reviewHeading" />
            <F label="FAQ Heading" name="faqHeading" />
          </FGrid>
          <FGrid>
            <F label="Final Offer Heading" name="finalOfferHeading" />
            <F label="Final Offer Text" name="finalOfferText" />
          </FGrid>
        </Card>

      </div>
    </Page>
  )
}

// ── MediaField — standalone component so it can use hooks ────────────────────
function MediaField({ label, field, accept, hint, settings, uploading, onUpload, onSaveUrl }) {
  const [urlInput, setUrlInput] = useState('')
  const currentPath = settings[`${field}Path`] || ''
  const isImage = currentPath && !currentPath.endsWith('.pdf') && !currentPath.endsWith('.mp4') && !currentPath.endsWith('.mov') && !currentPath.endsWith('.webm')

  const handleSave = async () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    await onSaveUrl(field, trimmed)
    setUrlInput('')
  }

  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {isImage && (
          <img src={currentPath} alt="" onError={e => { e.target.style.display = 'none' }}
            style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid #e2e8f0' }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{label}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{hint}</div>
          {currentPath && (
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>✓ Saved</div>
              <div style={{ fontSize: 10, color: '#64748b', wordBreak: 'break-all', marginTop: 2 }}>{currentPath.length > 60 ? currentPath.slice(0, 60) + '...' : currentPath}</div>
            </div>
          )}
        </div>
        <label style={{ position: 'relative', padding: '8px 16px', background: '#0f172a', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
          {uploading[field] ? 'Uploading...' : '⬆ Upload'}
          <input type="file" accept={accept} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
            onChange={e => e.target.files[0] && onUpload(field, e.target.files[0])} />
        </label>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
          placeholder="Image URL (imgbb.com) ya YouTube URL paste karo"
          style={{ flex: 1, padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none' }}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
        <button onClick={handleSave}
          style={{ padding: '7px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          URL Save
        </button>
      </div>
    </div>
  )
}

// ── Media ─────────────────────────────────────────────────────────────────────
function Media({ settings, onRefresh }) {
  const [uploading, setUploading] = useState({})
  const [msg, setMsg] = useState('')

  const handleUpload = async (field, file) => {
    setUploading(p => ({ ...p, [field]: true }))
    const fd = new FormData()
    fd.append(field, file)
    const res = await api.upload(fd)
    setUploading(p => ({ ...p, [field]: false }))
    if (res.ok) {
      setMsg(res.cloudinary ? '✓ Uploaded to Cloudinary!' : '⚠️ Uploaded locally (set Cloudinary env vars for permanent storage)')
      setTimeout(() => setMsg(''), 5000)
      onRefresh()
    } else {
      setMsg(`✗ Upload failed: ${res.error}`)
    }
  }

  const handleSaveUrl = async (field, url) => {
    const res = await api.post('/api/settings', { [`${field}Path`]: url, [`${field}Name`]: url.split('/').pop().split('?')[0] || 'external' })
    if (res.ok) { setMsg('✓ URL saved!'); setTimeout(() => setMsg(''), 3000); onRefresh() }
    else setMsg('✗ Save failed')
  }

  const mfProps = { settings, uploading, onUpload: handleUpload, onSaveUrl: handleSaveUrl }

  return (
    <Page title="Media Manager" action={msg && <span style={{ color: msg.startsWith('✓') ? '#22c55e' : msg.startsWith('⚠') ? '#f59e0b' : '#dc2626', fontWeight: 600 }}>{msg}</span>}>
      {/* Size Guide */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>📐 Recommended Sizes</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { icon: '🖼️', label: 'Image (Hero / Gallery / Category)', size: '1280×720px ya 1080×1080px · JPG/PNG · max 3MB' },
            { icon: '📹', label: 'Video (Sample / Gallery cards)', size: '1080×1920px (vertical reel) ya 1280×720px · MP4 · max 50MB' },
            { icon: '📄', label: 'PDF', size: 'Koi bhi size · max 25MB' },
          ].map(r => (
            <div key={r.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{r.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{r.label}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{r.size}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How to add */}
      <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#1e3a5f', lineHeight: 1.8 }}>
        <strong>📌 Image:</strong> <a href="https://imgbb.com" target="_blank" rel="noreferrer" style={{ color: '#1d4ed8' }}>imgbb.com</a> → upload → "Direct link" copy → URL box paste → <strong>URL Save</strong><br />
        <strong>🎬 Video:</strong> YouTube par upload karo → URL copy (<code>youtube.com/watch?v=...</code>) → URL box paste → <strong>URL Save</strong> → card mein ▶ click pe play hogi<br />
        <strong>⚠️</strong> File upload se files server restart pe delete ho jaati hain — URL method recommended hai.
      </div>

      <div style={{ display: 'grid', gap: 20, maxWidth: 760 }}>

        <Card title="📄 PDF Bundle">
          <MediaField {...mfProps} label="PDF File — Customer yahi download karega" field="pdf" accept=".pdf" hint="Google Drive public link ya direct PDF URL" />
        </Card>

        <Card title="🖼️ Hero Section — Sabse upar ki image">
          <MediaField {...mfProps} label="Hero Banner Image — Landing page ke top par dikhti hai" field="heroImage" accept="image/*" hint="imgbb.com se URL paste karo · 1280×720px recommended" />
        </Card>

        <Card title="🎬 Free Preview — 3 Sample Cards (landing page par 'Free Preview' section)">
          <div style={{ background: '#fef9c3', border: '1px solid #fbbf24', borderRadius: 8, padding: '10px 14px', marginBottom: 8, fontSize: 13, color: '#92400e' }}>
            💡 <strong>Tip:</strong> YouTube URL paste karo → URL Save → landing page refresh karo → card pe ▶ click karo
          </div>
          <MediaField {...mfProps} label="Card 1 — 'Viral Image Prompt' (left card)" field="sampleImage" accept="image/*,video/*" hint="imgbb.com image URL ya YouTube URL" />
          <MediaField {...mfProps} label="Card 2 — 'Reels & Shorts Prompt' (middle card)" field="sampleReel" accept="video/*" hint="YouTube video URL paste karo (watch?v= ya /shorts/ dono kaam karenge)" />
          <MediaField {...mfProps} label="Card 3 — 'Product Ad Prompt' (right card)" field="sampleProduct" accept="image/*,video/*" hint="imgbb.com image URL ya YouTube URL" />
        </Card>

        <Card title="🖼️ Bundle Preview — 3 Gallery Cards ('Bundle Preview' section mein slider)">
          <div style={{ background: '#f0f9ff', border: '1px solid #93c5fd', borderRadius: 8, padding: '10px 14px', marginBottom: 8, fontSize: 13, color: '#1e3a5f' }}>
            ℹ️ Gallery mein sirf <strong>Card 1, Card 3, Card 4</strong> use hote hain. Card 2 skip hota hai.
          </div>
          <MediaField {...mfProps} label="Gallery Card 1 — 'Image Creation Prompts'" field="gallery1" accept="image/*,video/*" hint="imgbb.com image URL ya YouTube URL" />
          <MediaField {...mfProps} label="Gallery Card 2 — (Is waqt use nahi ho raha)" field="gallery2" accept="image/*,video/*" hint="Abhi landing page par nahi dikhega" />
          <MediaField {...mfProps} label="Gallery Card 3 — 'Business Ad Prompts'" field="gallery3" accept="image/*,video/*" hint="imgbb.com image URL ya YouTube URL" />
          <MediaField {...mfProps} label="Gallery Card 4 — 'Festival & Event Prompts'" field="gallery4" accept="image/*,video/*" hint="imgbb.com image URL ya YouTube URL" />
        </Card>

        <Card title="📂 Category Section — 8 Images ('Har niche ke liye' section mein slider)">
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>📐 Image Size Guide</div>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.7 }}>
              ✅ <strong>Recommended:</strong> 1080×1080px (square / 1:1 ratio)<br />
              ✅ <strong>Format:</strong> JPG ya PNG · Max size: 3MB<br />
              ✅ <strong>Kaise upload karein:</strong> <a href="https://imgbb.com" target="_blank" rel="noreferrer" style={{ color: '#1d4ed8' }}>imgbb.com</a> → Image upload → "Direct link" copy → URL box mein paste → URL Save
            </div>
          </div>
          {[
            { n: 1, name: 'Indian Wedding Prompts' },
            { n: 2, name: 'Birthday Celebration' },
            { n: 3, name: 'Brand Campaign' },
            { n: 4, name: 'Divine Cinematic' },
            { n: 5, name: 'Fashion & E-commerce' },
            { n: 6, name: 'Interior & Real Estate' },
            { n: 7, name: 'Jewelry Photoshoot' },
            { n: 8, name: 'Miniature & Viral' },
          ].map(({ n, name }) => (
            <MediaField key={n} {...mfProps} label={`Category ${n} — "${name}" card`} field={`cat${n}`} accept="image/*" hint="1080×1080px square · imgbb.com se URL paste karo" />
          ))}
        </Card>

      </div>
    </Page>
  )
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function OrderTable({ orders }) {
  if (!orders.length) return <div style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8' }}>No orders yet</div>
  const cols = ['Date','Name','Phone','Email','Amount','Status','Payment ID']
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {cols.map(c => <th key={c} style={{ textAlign: 'left', padding: '10px 14px', color: '#64748b', fontWeight: 600, fontSize: 12 }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => (
            <tr key={o.id || i} style={{ borderTop: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 14px', color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
              <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>{o.name}</td>
              <td style={{ padding: '12px 14px', color: '#475569' }}>{o.phone}</td>
              <td style={{ padding: '12px 14px', color: '#475569' }}>{o.email}</td>
              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>₹{o.amount}</td>
              <td style={{ padding: '12px 14px' }}>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: o.status === 'Paid' ? '#dcfce7' : '#fef9c3',
                  color: o.status === 'Paid' ? '#15803d' : '#92400e' }}>
                  {o.status}
                </span>
              </td>
              <td style={{ padding: '12px 14px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>{(o.paymentId || '').slice(0, 22)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Page({ title, action, children }) {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      {title && <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>{title}</div>}
      <div style={{ display: 'grid', gap: 14 }}>{children}</div>
    </div>
  )
}

function FGrid({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>{children}</div>
}

function Inp({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label style={{ display: 'block' }}>
      {label && <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</div>}
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
    </label>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ width: 44, height: 24, borderRadius: 12, background: checked ? '#e6382f' : '#cbd5e1', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: checked ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

function Btn({ children, onClick, color = '#e6382f', disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: '9px 18px', background: disabled ? '#94a3b8' : color, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: disabled ? 'not-allowed' : 'pointer' }}>
      {children}
    </button>
  )
}

function Center({ children }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: 15 }}>{children}</div>
}
