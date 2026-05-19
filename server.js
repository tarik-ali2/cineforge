import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// ── Database ─────────────────────────────────────────────────────────────────

let db = null;

async function connectDB() {
  if (!MONGO_URI) return;
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db('cineforge');
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
  }
}

// JSON file fallback (for local development)
const DATA = path.join(__dirname, 'data');
['uploads', 'data'].forEach((dir) => {
  const p = path.join(__dirname, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

const readJson = (name, def) => {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, `${name}.json`), 'utf8')); }
  catch { return def; }
};
const writeJson = (name, data) =>
  fs.writeFileSync(path.join(DATA, `${name}.json`), JSON.stringify(data, null, 2));

// ── Generic key-value store (settings, content) ───────────────────────────────

async function getDoc(name, defaults) {
  if (db) {
    const doc = await db.collection(name).findOne({ _key: 'main' });
    if (doc) {
      const { _id, _key, ...data } = doc;
      return { ...defaults, ...data };
    }
    return { ...defaults };
  }
  return { ...defaults, ...readJson(name, {}) };
}

async function setDoc(name, data) {
  if (db) {
    await db.collection(name).updateOne(
      { _key: 'main' },
      { $set: { _key: 'main', ...data } },
      { upsert: true }
    );
  } else {
    writeJson(name, data);
  }
}

// ── Orders ────────────────────────────────────────────────────────────────────

async function getOrders() {
  if (db) {
    return db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
  }
  return readJson('orders', []);
}

async function addOrder(order) {
  if (db) {
    await db.collection('orders').insertOne(order);
  } else {
    const orders = readJson('orders', []);
    orders.unshift(order);
    writeJson('orders', orders);
  }
}

async function clearOrders() {
  if (db) {
    await db.collection('orders').deleteMany({});
  } else {
    writeJson('orders', []);
  }
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  productName: '10 Lakh+ AI Prompt Bundle',
  price: 199,
  mrp: 4999,
  paymentLink: '',
  razorpayKeyId: '',
  razorpayKeySecret: '',
  automationWebhookUrl: '',
  demoMode: true,
  emailFrom: '',
  emailPassword: '',
  pdfPath: '',
  pdfName: '',
  heroImagePath: '',   heroImageName: '',
  sampleImagePath: '', sampleImageName: '',
  sampleReelPath: '',  sampleReelName: '',
  sampleProductPath: '', sampleProductName: '',
  gallery1Path: '', gallery1Name: '',
  gallery2Path: '', gallery2Name: '',
  gallery3Path: '', gallery3Name: '',
  gallery4Path: '', gallery4Name: '',
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

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json());
app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

// Serve built React app
app.use(express.static(path.join(__dirname, 'dist')));
// Serve root-level files: admin.html, admin.js, styles.css, assets/
app.use(express.static(path.join(__dirname), { index: false, dotfiles: 'ignore' }));
// Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── File Upload ───────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });

// ── Settings ──────────────────────────────────────────────────────────────────

app.get('/api/settings', async (req, res) => {
  try {
    const s = await getDoc('settings', DEFAULT_SETTINGS);
    const { razorpayKeySecret, emailPassword, ...safe } = s;
    res.json({ ...safe, hasRazorpaySecret: !!razorpayKeySecret, hasEmailPassword: !!emailPassword });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/settings/full', async (req, res) => {
  try { res.json(await getDoc('settings', DEFAULT_SETTINGS)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/settings', async (req, res) => {
  try {
    const current = await getDoc('settings', DEFAULT_SETTINGS);
    await setDoc('settings', { ...current, ...req.body });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Content ───────────────────────────────────────────────────────────────────

app.get('/api/content', async (req, res) => {
  try { res.json(await getDoc('content', DEFAULT_CONTENT)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/content', async (req, res) => {
  try {
    const current = await getDoc('content', DEFAULT_CONTENT);
    await setDoc('content', { ...current, ...req.body });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Upload ────────────────────────────────────────────────────────────────────

app.post('/api/upload', upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'heroImage', maxCount: 1 },
  { name: 'sampleImage', maxCount: 1 },
  { name: 'sampleReel', maxCount: 1 },
  { name: 'sampleProduct', maxCount: 1 },
  { name: 'gallery1', maxCount: 1 }, { name: 'gallery2', maxCount: 1 },
  { name: 'gallery3', maxCount: 1 }, { name: 'gallery4', maxCount: 1 },
  { name: 'cat1', maxCount: 1 }, { name: 'cat2', maxCount: 1 },
  { name: 'cat3', maxCount: 1 }, { name: 'cat4', maxCount: 1 },
  { name: 'cat5', maxCount: 1 }, { name: 'cat6', maxCount: 1 },
  { name: 'cat7', maxCount: 1 }, { name: 'cat8', maxCount: 1 },
]), async (req, res) => {
  try {
    const settings = await getDoc('settings', DEFAULT_SETTINGS);
    const result = {};
    for (const [field, files] of Object.entries(req.files || {})) {
      const file = files[0];
      const urlPath = `/uploads/${file.filename}`;
      settings[`${field}Path`] = urlPath;
      settings[`${field}Name`] = file.originalname;
      result[field] = { path: urlPath, name: file.originalname };
    }
    await setDoc('settings', settings);
    res.json({ ok: true, files: result });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}, (err, req, res, next) => {
  res.status(400).json({ ok: false, error: err.message });
});

// ── Orders ────────────────────────────────────────────────────────────────────

app.get('/api/orders', async (req, res) => {
  try { res.json(await getOrders()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = { id: crypto.randomUUID(), ...req.body, createdAt: new Date().toISOString() };
    await addOrder(order);
    res.json({ ok: true, order });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/orders', async (req, res) => {
  try { await clearOrders(); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Razorpay ──────────────────────────────────────────────────────────────────

app.post('/api/create-order', async (req, res) => {
  const s = await getDoc('settings', DEFAULT_SETTINGS);
  if (s.demoMode) return res.json({ demoMode: true });
  if (!s.razorpayKeyId || !s.razorpayKeySecret)
    return res.status(400).json({ error: 'Razorpay keys admin panel mein configure karein.' });
  try {
    const { default: Razorpay } = await import('razorpay');
    const rzp = new Razorpay({ key_id: s.razorpayKeyId, key_secret: s.razorpayKeySecret });
    const order = await rzp.orders.create({
      amount: s.price * 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: s.razorpayKeyId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/verify-payment', async (req, res) => {
  const s = await getDoc('settings', DEFAULT_SETTINGS);
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
    : path.join(__dirname, 'public', 'ai-prompts-pack.pdf');
  const pdfFileName = s.pdfName || 'prompt-bundle.pdf';

  const order = {
    id: crypto.randomUUID(),
    ...lead,
    paymentId,
    product: s.productName,
    amount: s.price,
    status: 'Paid',
    createdAt: new Date().toISOString(),
  };
  await addOrder(order);

  if (s.emailFrom && s.emailPassword && lead?.email) {
    sendEmail(s, lead, paymentId, pdfUrl, pdfFilePath, pdfFileName)
      .catch((err) => console.warn('Email failed:', err.message));
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
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: s.emailFrom, pass: s.emailPassword },
  });
  const attachments = [];
  if (fs.existsSync(pdfFilePath)) attachments.push({ filename: pdfFileName, path: pdfFilePath });
  await transporter.sendMail({
    from: `"${s.productName}" <${s.emailFrom}>`,
    to: lead.email,
    subject: `${s.productName} - Aapka Download Ready Hai!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
        <h2 style="color:#1a1a2e;">Thank you, ${lead.name}!</h2>
        <p>Aapka payment successful raha. Neeche button se download karein:</p>
        <p style="margin:24px 0;">
          <a href="${pdfUrl}" style="background:#6c63ff;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
            Download PDF Bundle
          </a>
        </p>
        <p style="color:#666;font-size:13px;">Payment ID: <code>${paymentId}</code></p>
      </div>
    `,
    attachments,
  });
}

// ── SPA Fallback ──────────────────────────────────────────────────────────────

// /admin/* → React app (Admin component handles routing client-side)
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
app.get('/admin/*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
// Catch-all for React landing page
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(filePath)) res.sendFile(filePath);
  else res.status(404).send('Build not found. Run: npm run build');
});

// ── Start ─────────────────────────────────────────────────────────────────────

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\nServer running at http://localhost:${PORT}`);
    console.log(`  Landing page : http://localhost:${PORT}/`);
    console.log(`  Admin panel  : http://localhost:${PORT}/admin.html\n`);
  });
});
