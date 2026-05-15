const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// No-cache for all API responses
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

['uploads', 'data'].forEach((dir) => {
  const p = path.join(__dirname, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });

const DATA = path.join(__dirname, 'data');
const readData = (name, def) => {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, `${name}.json`), 'utf8')); }
  catch { return def; }
};
const writeData = (name, data) =>
  fs.writeFileSync(path.join(DATA, `${name}.json`), JSON.stringify(data, null, 2));

const DEFAULT_SETTINGS = {
  productName: '10 Lakh+ AI Prompt Bundle',
  price: 199,
  mrp: 4999,
  razorpayKeyId: '',
  razorpayKeySecret: '',
  automationWebhookUrl: '',
  demoMode: true,
  emailFrom: '',
  emailPassword: '',
  pdfPath: '',
  pdfName: '',
  heroImagePath: '',
  heroImageName: '',
  sampleImagePath: '',
  sampleImageName: '',
  sampleReelPath: '',
  sampleReelName: '',
  sampleProductPath: '',
  sampleProductName: '',
  gallery1Path: '',
  gallery1Name: '',
  gallery2Path: '',
  gallery2Name: '',
  gallery3Path: '',
  gallery3Name: '',
  gallery4Path: '',
  gallery4Name: '',
  cat1Path: '', cat1Name: '',
  cat2Path: '', cat2Name: '',
  cat3Path: '', cat3Name: '',
  cat4Path: '', cat4Name: '',
  cat5Path: '', cat5Name: '',
  cat6Path: '', cat6Name: '',
  cat7Path: '', cat7Name: '',
  cat8Path: '', cat8Name: '',
};

const DEFAULT_CONTENT = {
  brandName: 'Market Prompt Hub',
  toastText: 'Someone just purchased the 10 Lakh+ Prompt Bundle',
  heroBadge: 'Bestseller Digital Bundle',
  heroMini: "India's digital creator prompt vault",
  heroLine1: '10 Lakh+ Google Gemini',
  heroLine2: 'Image & Video Creation',
  heroLine3: 'Prompt Bundle',
  heroSubheadline: 'Create viral images, reels, ads aur digital products faster.',
  heroDescription: 'Gemini, Midjourney, Sora, DALL-E, Leonardo aur almost har AI tool ke liye ready-to-copy prompt categories. Creators, agencies, freelancers aur business owners ke liye ek complete prompt system.',
  heroChips: 'Gemini, Midjourney, Sora, DALL-E, Leonardo',
  offerSmallText: 'Act Fast - Launch offer limited customers ke liye',
  slotText: 'Only 37 slots left today',
  mainCta: 'Get 10 Lakh+ Prompts Now',
  buyNowCta: 'Buy Now',
  instantCta: 'Get Instant Download',
  sampleKicker: 'Free Preview',
  sampleHeading: '3 sample prompts play karke dekho',
  sampleIntro: 'Buyer ko landing page par hi idea mil jayega ki PDF bundle me kis type ke ready prompts milne wale hain.',
  sample1Title: 'Viral Image Prompt',
  sample1Text: 'Hyper-realistic cinematic AI image prompt for social media posts.',
  sample1Prompt: 'Create a hyper-realistic cinematic poster of a futuristic AI creator desk, neon blue and gold lighting, premium product box in foreground, social media viral style, ultra-detailed, 8k.',
  sample2Title: 'Reels & Shorts Prompt',
  sample2Text: 'Fast video concept, hook, camera movement aur caption prompt sample.',
  sample2Prompt: 'Generate a 15-second vertical video concept: hook in first 2 seconds, fast zoom transitions, AI product reveal, before-after result, energetic caption and clear CTA.',
  sample3Title: 'Product Ad Prompt',
  sample3Text: 'Brand product mockup, lighting, scene and ad copy prompt sample.',
  sample3Prompt: 'Create a luxury ecommerce ad creative for a digital prompt bundle, glowing laptop screen, PDF mockup, dark premium background, yellow CTA badge, high-converting ad layout.',
  galleryKicker: 'Bundle Preview',
  galleryHeading: 'Is PDF me aise digital product prompt packs milenge',
  categoryKicker: 'Almost Every Specialized Prompt Category Included',
  categoryHeading: 'Har niche ke liye ready prompt packs',
  darkCtaHeading: 'AI fast move kar raha hai. Ye bundle tumhe content creation me head start dega.',
  benefitHeading: 'Content banana fast, easy aur profitable.',
  reviewHeading: 'Creators ka response',
  finalOfferHeading: '10 Lakh+ AI Prompts Bundle',
  finalOfferText: 'Payment ke baad thank-you page par download button aur email delivery trigger.',
  faqHeading: 'Common questions',
  footerCopyright: 'Copyright © 2026 Market Prompt Hub',
};

// ── Settings ────────────────────────────────────────────────────────────────

app.get('/api/settings', (req, res) => {
  const s = { ...DEFAULT_SETTINGS, ...readData('settings', {}) };
  const { razorpayKeySecret, emailPassword, ...safe } = s;
  res.json({ ...safe, hasRazorpaySecret: !!razorpayKeySecret, hasEmailPassword: !!emailPassword });
});

app.get('/api/settings/full', (req, res) => {
  res.json({ ...DEFAULT_SETTINGS, ...readData('settings', {}) });
});

app.post('/api/settings', (req, res) => {
  const current = { ...DEFAULT_SETTINGS, ...readData('settings', {}) };
  writeData('settings', { ...current, ...req.body });
  res.json({ ok: true });
});

// ── Content ─────────────────────────────────────────────────────────────────

app.get('/api/content', (req, res) => {
  res.json({ ...DEFAULT_CONTENT, ...readData('content', {}) });
});

app.post('/api/content', (req, res) => {
  writeData('content', { ...DEFAULT_CONTENT, ...readData('content', {}), ...req.body });
  res.json({ ok: true });
});

// ── File Upload ──────────────────────────────────────────────────────────────

app.post('/api/upload', upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'heroImage', maxCount: 1 },
  { name: 'sampleImage', maxCount: 1 },
  { name: 'sampleReel', maxCount: 1 },
  { name: 'sampleProduct', maxCount: 1 },
  { name: 'gallery1', maxCount: 1 },
  { name: 'gallery2', maxCount: 1 },
  { name: 'gallery3', maxCount: 1 },
  { name: 'gallery4', maxCount: 1 },
  { name: 'cat1', maxCount: 1 },
  { name: 'cat2', maxCount: 1 },
  { name: 'cat3', maxCount: 1 },
  { name: 'cat4', maxCount: 1 },
  { name: 'cat5', maxCount: 1 },
  { name: 'cat6', maxCount: 1 },
  { name: 'cat7', maxCount: 1 },
  { name: 'cat8', maxCount: 1 },
]), (req, res) => {
  try {
    const settings = { ...DEFAULT_SETTINGS, ...readData('settings', {}) };
    const result = {};

    for (const [field, files] of Object.entries(req.files || {})) {
      const file = files[0];
      const urlPath = `/uploads/${file.filename}`;
      settings[`${field}Path`] = urlPath;
      settings[`${field}Name`] = file.originalname;
      result[field] = { path: urlPath, name: file.originalname };
    }

    writeData('settings', settings);
    res.json({ ok: true, files: result });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}, (err, req, res, next) => {
  console.error('Multer error:', err);
  res.status(400).json({ ok: false, error: err.message });
});

// ── Orders ──────────────────────────────────────────────────────────────────

app.get('/api/orders', (req, res) => {
  res.json(readData('orders', []));
});

app.post('/api/orders', (req, res) => {
  const orders = readData('orders', []);
  const order = { id: crypto.randomUUID(), ...req.body, createdAt: new Date().toISOString() };
  orders.unshift(order);
  writeData('orders', orders);
  res.json({ ok: true, order });
});

app.delete('/api/orders', (req, res) => {
  writeData('orders', []);
  res.json({ ok: true });
});

// ── Razorpay ─────────────────────────────────────────────────────────────────

app.post('/api/create-order', async (req, res) => {
  const s = { ...DEFAULT_SETTINGS, ...readData('settings', {}) };

  if (s.demoMode) return res.json({ demoMode: true });
  if (!s.razorpayKeyId || !s.razorpayKeySecret)
    return res.status(400).json({ error: 'Razorpay keys admin panel mein configure karein.' });

  try {
    const Razorpay = require('razorpay');
    const rzp = new Razorpay({ key_id: s.razorpayKeyId, key_secret: s.razorpayKeySecret });
    const order = await rzp.orders.create({
      amount: s.price * 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: s.razorpayKeyId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  const s = { ...DEFAULT_SETTINGS, ...readData('settings', {}) };
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, lead } = req.body;

  if (!s.demoMode && s.razorpayKeySecret) {
    const expected = crypto
      .createHmac('sha256', s.razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expected !== razorpay_signature)
      return res.status(400).json({ error: 'Payment verification failed' });
  }

  const paymentId = razorpay_payment_id || `demo_${Date.now()}`;
  const pdfUrl = s.pdfPath
    ? `${req.protocol}://${req.get('host')}${s.pdfPath}`
    : `${req.protocol}://${req.get('host')}/ai-prompts-pack.pdf`;
  const pdfFilePath = s.pdfPath
    ? path.join(__dirname, s.pdfPath.replace(/^\//, ''))
    : path.join(__dirname, 'ai-prompts-pack.pdf');
  const pdfFileName = s.pdfName || 'prompt-bundle.pdf';

  const orders = readData('orders', []);
  const order = {
    id: crypto.randomUUID(),
    ...lead,
    paymentId,
    product: s.productName,
    amount: s.price,
    status: 'Paid',
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);
  writeData('orders', orders);

  if (s.emailFrom && s.emailPassword && lead && lead.email) {
    sendEmail(s, lead, paymentId, pdfUrl, pdfFilePath, pdfFileName).catch((err) =>
      console.warn('Email failed:', err.message),
    );
  }

  if (s.automationWebhookUrl) {
    fetch(s.automationWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lead, paymentId, product: s.productName, pdfUrl }),
    }).catch(console.warn);
  }

  res.json({ ok: true, pdfUrl, pdfName: pdfFileName });
});

async function sendEmail(s, lead, paymentId, pdfUrl, pdfFilePath, pdfFileName) {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: { user: s.emailFrom, pass: s.emailPassword },
  });

  const attachments = [];
  if (fs.existsSync(pdfFilePath)) {
    attachments.push({ filename: pdfFileName, path: pdfFilePath });
  }

  await transporter.sendMail({
    from: `"${s.productName}" <${s.emailFrom}>`,
    to: lead.email,
    subject: `${s.productName} - Aapka Download Ready Hai!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
        <h2 style="color:#1a1a2e;">Thank you, ${lead.name}!</h2>
        <p>Aapka payment successful raha. Neeche button se apna AI Prompt Bundle download karein:</p>
        <p style="margin:24px 0;">
          <a href="${pdfUrl}" style="background:#6c63ff;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
            Download PDF Bundle
          </a>
        </p>
        ${attachments.length ? '<p>PDF is also attached to this email.</p>' : ''}
        <p style="color:#666;font-size:13px;">Payment ID: <code>${paymentId}</code></p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="color:#999;font-size:12px;">Koi bhi problem ho toh is email par reply karein.</p>
      </div>
    `,
    attachments,
  });
}

app.listen(PORT, () => {
  console.log(`\nServer running at http://localhost:${PORT}`);
  console.log(`  Landing page : http://localhost:${PORT}/`);
  console.log(`  Admin panel  : http://localhost:${PORT}/admin.html\n`);
});
