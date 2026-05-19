import { useState, useEffect } from 'react'

// ── API helpers ───────────────────────────────────────────────────────────────
const api = {
  get:    (url)       => fetch(url).then(r => r.json()),
  post:   (url, data) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  del:    (url)       => fetch(url, { method: 'DELETE' }).then(r => r.json()),
  upload: (form)      => fetch('/api/upload', { method: 'POST', body: form }).then(r => r.json()),
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
  const [id, setId]       = useState('')
  const [pw, setPw]       = useState('')
  const [err, setErr]     = useState('')

  const submit = e => {
    e.preventDefault()
    if (id === 'admin' && pw === 'admin123') onLogin()
    else setErr('Wrong ID or password')
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
          <button type="submit" style={{ padding: '12px 0', background: '#e6382f', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Login
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

        <Card title="🛍️ Product">
          <FGrid>
            <Inp label="Product Name" value={form.productName} onChange={v => set('productName', v)} placeholder="10 Lakh+ AI Prompt Bundle" />
            <Inp label="Sale Price (₹)" value={form.price} onChange={v => set('price', v)} type="number" placeholder="199" />
            <Inp label="MRP / Cut Price (₹)" value={form.mrp} onChange={v => set('mrp', v)} type="number" placeholder="4999" />
          </FGrid>
        </Card>

        <Card title="💳 Payment Link">
          <Inp label="Payment Link URL — Yahan apna Razorpay / Instamojo / UPI link daalo" value={form.paymentLink} onChange={v => set('paymentLink', v)} type="url" placeholder="https://rzp.io/l/xxxxx" />
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Toggle checked={!!form.demoMode} onChange={v => set('demoMode', v)} />
            <span style={{ fontSize: 14, color: '#374151' }}>Demo Mode (real payment skip hoga, test ke liye)</span>
          </div>
        </Card>

        <Card title="🔑 Razorpay Keys (Optional — sirf Razorpay checkout ke liye)">
          <FGrid>
            <Inp label="Razorpay Key ID" value={form.razorpayKeyId} onChange={v => set('razorpayKeyId', v)} placeholder="rzp_live_xxxxx" />
            <Inp label="Razorpay Key Secret" value={form.razorpayKeySecret} onChange={v => set('razorpayKeySecret', v)} type="password" placeholder="Secret key" />
          </FGrid>
        </Card>

        <Card title="📧 Email Delivery (Gmail)">
          <FGrid>
            <Inp label="Gmail Address" value={form.emailFrom} onChange={v => set('emailFrom', v)} type="email" placeholder="yourstore@gmail.com" />
            <Inp label="Gmail App Password (16-char)" value={form.emailPassword} onChange={v => set('emailPassword', v)} type="password" placeholder="xxxx xxxx xxxx xxxx" />
          </FGrid>
          <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>
            Gmail → Settings → Security → 2-Step Verification ON → App Passwords → Generate karo
          </div>
        </Card>

        <Card title="🔗 Automation Webhook">
          <Inp label="Webhook URL (Make / Zapier / Pabbly / n8n)" value={form.automationWebhookUrl} onChange={v => set('automationWebhookUrl', v)} type="url" placeholder="https://hook.make.com/..." />
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
          <FGrid>
            <F label="Category Kicker" name="categoryKicker" />
            <F label="Category Heading" name="categoryHeading" />
          </FGrid>
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

// ── Media ─────────────────────────────────────────────────────────────────────
function Media({ settings, onRefresh }) {
  const [uploading, setUploading] = useState({})
  const [msg, setMsg] = useState('')

  const upload = async (field, file) => {
    setUploading(p => ({ ...p, [field]: true }))
    const fd = new FormData()
    fd.append(field, file)
    const res = await api.upload(fd)
    setUploading(p => ({ ...p, [field]: false }))
    if (res.ok) { setMsg(`✓ ${field} uploaded!`); setTimeout(() => setMsg(''), 3000); onRefresh() }
    else setMsg(`✗ Upload failed: ${res.error}`)
  }

  const MF = ({ label, field, accept, hint }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{label}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{hint}</div>
        {settings[`${field}Name`] && (
          <div style={{ fontSize: 12, color: '#22c55e', marginTop: 4 }}>✓ {settings[`${field}Name`]}</div>
        )}
      </div>
      <label style={{ position: 'relative', padding: '8px 18px', background: '#0f172a', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
        {uploading[field] ? 'Uploading...' : '⬆ Upload'}
        <input type="file" accept={accept} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
          onChange={e => e.target.files[0] && upload(field, e.target.files[0])} />
      </label>
    </div>
  )

  return (
    <Page title="Media Manager" action={msg && <span style={{ color: msg.startsWith('✓') ? '#22c55e' : '#dc2626', fontWeight: 600 }}>{msg}</span>}>
      <div style={{ display: 'grid', gap: 20, maxWidth: 760 }}>

        <Card title="📄 PDF Bundle">
          <MF label="PDF File" field="pdf" accept=".pdf" hint="Customer download karega · max 25MB" />
        </Card>

        <Card title="🖼️ Hero Image">
          <MF label="Main Banner Image" field="heroImage" accept="image/*" hint="1280×720px JPG/PNG · max 3MB" />
        </Card>

        <Card title="🎬 Sample Cards (3)">
          <MF label="Sample 1 — Viral Image Prompt" field="sampleImage"   accept="image/*,video/*" hint="Image ya Video · max 50MB" />
          <MF label="Sample 2 — Reels & Shorts"     field="sampleReel"    accept="video/*"         hint="MP4 video · max 50MB" />
          <MF label="Sample 3 — Product Ad"          field="sampleProduct" accept="image/*,video/*" hint="Image ya Video · max 50MB" />
        </Card>

        <Card title="🖼️ Gallery Cards (4)">
          {[1,2,3,4].map(n => (
            <MF key={n} label={`Gallery ${n}`} field={`gallery${n}`} accept="image/*,video/*" hint="1280×720 ya 1080×1920 · JPG/MP4 · max 50MB" />
          ))}
        </Card>

        <Card title="📂 Category Images (8)">
          {[1,2,3,4,5,6,7,8].map(n => (
            <MF key={n} label={`Category ${n}`} field={`cat${n}`} accept="image/*" hint="1280×720 JPG · max 3MB" />
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
