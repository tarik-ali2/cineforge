import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Trust Render/proxy for correct IP in rate limiter
app.set('trust proxy', 1);

// ── Security Headers (helmet) ─────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,       // disabled — React inline scripts + GTM + YouTube iframes
  crossOriginEmbedderPolicy: false,   // needed for YouTube embeds
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const generalLimit = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 120,              // 120 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 login attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again after 15 minutes.' },
});

app.use('/api', generalLimit);

// ── Admin Token Store ─────────────────────────────────────────────────────────
const adminTokens = new Map(); // token -> expiry timestamp

// Clean up expired tokens every hour
setInterval(() => {
  const now = Date.now();
  for (const [t, exp] of adminTokens) {
    if (exp < now) adminTokens.delete(t);
  }
}, 60 * 60 * 1000);

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token || !adminTokens.has(token) || adminTokens.get(token) < Date.now()) {
    return res.status(401).json({ error: 'Unauthorized — please login again' });
  }
  next();
}

// ── Database ─────────────────────────────────────────────────────────────────

let db = null;

async function connectDB() {
  if (!MONGO_URI) {
    console.warn('⚠️  MONGO_URI not set — data will be lost on restart!');
    return;
  }
  console.log('🔄 Connecting to MongoDB...');
  try {
    const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    await client.connect();
    db = client.db('cineforge');
    console.log('✅ MongoDB connected successfully!');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
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
  adminId: 'admin',
  adminPassword: 'admin123',
  gtmId: '',
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
  heroImagePath: '/assets/digital_products.png', heroImageName: 'digital_products.png',
  sampleImagePath: '/fallback-media/sample-image.jpeg', sampleImageName: 'Sample image',
  sampleReelPath: '/fallback-media/sample-video.mp4', sampleReelName: 'Sample reel',
  sampleProductPath: '/fallback-media/sample-product.jpeg', sampleProductName: 'Sample product',
  sampleExtraPath: '/fallback-media/gallery-2.mp4', sampleExtraName: 'Sample extra',
  gallery1Path: '/fallback-media/gallery-1.jpeg', gallery1Name: 'Gallery 1',
  gallery2Path: '/fallback-media/gallery-2.mp4', gallery2Name: 'Gallery 2',
  gallery3Path: '/fallback-media/gallery-3.mp4', gallery3Name: 'Gallery 3',
  gallery4Path: '/fallback-media/gallery-4.mp4', gallery4Name: 'Gallery 4',
  cat1Path: '/fallback-media/cat-1.jpeg', cat1Name: 'Category 1',
  cat2Path: '/fallback-media/cat-2.jpeg', cat2Name: 'Category 2',
  cat3Path: '/fallback-media/cat-3.jpeg', cat3Name: 'Category 3',
  cat4Path: '/fallback-media/cat-4.jpeg', cat4Name: 'Category 4',
  cat5Path: '/fallback-media/cat-5.jpeg', cat5Name: 'Category 5',
  cat6Path: '/fallback-media/cat-6.jpeg', cat6Name: 'Category 6',
  cat7Path: '/fallback-media/cat-7.jpeg', cat7Name: 'Category 7',
  cat8Path: '/fallback-media/cat-8.jpeg', cat8Name: 'Category 8',
  mainItems: 'ChatGPT Mastery Course (62 Videos),Prompt Engineering Course (33 Videos),SaaS ChatGPT Course (33 Videos),ChatGPT Power Course (25 Videos),2500 Digital Product Ideas,365+ Automation Templates,1500+ AI Tools',
  bump1Enabled: true,
  bump1Title: '100,000 ChatGPT Prompts Bundle',
  bump1Desc: 'Smart Work Starts Here – Get 100,000+ ChatGPT Prompts for Hustlers Like You!',
  bump1Price: 149,
  bump1Items: '',
  bump2Enabled: true,
  bump2Title: 'AI and Machine Learning Course',
  bump2Desc: 'Start building real-world AI and Machine Learning skills with step-by-step guidance, beginner-friendly explanations, practical projects, and hands-on experiences!',
  bump2Price: 147,
  bump2Items: '',
  paymentLinkBump1: '',
  paymentLinkBump2: '',
  paymentLinkBoth: '',
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
  sampleHeading: '4 sample prompts play karke dekho',
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
  finalOfferText: 'Payment ke baad thank-you page par download button aur email delivery trigger.',
  faqHeading: 'Common questions',
  footerCopyright: 'Copyright © 2026 Market Prompt Hub',
};

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json());
app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

// Serve static assets (JS, CSS, images) — but NOT index.html (we inject GTM server-side)
app.use(express.static(path.join(__dirname, 'dist'), { index: false }));
// Serve root-level files: admin.html, admin.js, styles.css, assets/
app.use(express.static(path.join(__dirname), { index: false, dotfiles: 'ignore' }));
// Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const UPLOAD_FALLBACKS = {
  sampleImage: '/fallback-media/sample-image.jpeg',
  sampleReel: '/fallback-media/sample-video.mp4',
  sampleProduct: '/fallback-media/sample-product.jpeg',
  sampleExtra: '/fallback-media/gallery-2.mp4',
  gallery1: '/fallback-media/gallery-1.jpeg',
  gallery2: '/fallback-media/gallery-2.mp4',
  gallery3: '/fallback-media/gallery-3.mp4',
  gallery4: '/fallback-media/gallery-4.mp4',
  cat1: '/fallback-media/cat-1.jpeg',
  cat2: '/fallback-media/cat-2.jpeg',
  cat3: '/fallback-media/cat-3.jpeg',
  cat4: '/fallback-media/cat-4.jpeg',
  cat5: '/fallback-media/cat-5.jpeg',
  cat6: '/fallback-media/cat-6.jpeg',
  cat7: '/fallback-media/cat-7.jpeg',
  cat8: '/fallback-media/cat-8.jpeg',
};
const VIDEO_UPLOAD_FALLBACK = '/fallback-media/sample-video.mp4';
const isVideoUploadPath = (value = '') => /\.(mp4|mov|webm|avi|mkv)(\?|#|$)/i.test(value);
const fallbackFilePath = (urlPath) => {
  const relativePath = urlPath.replace(/^\//, '');
  const builtPath = path.join(__dirname, 'dist', relativePath);
  if (fs.existsSync(builtPath)) return builtPath;
  return path.join(__dirname, 'public', relativePath);
};

app.use('/uploads', (req, res, next) => {
  const requested = req.path.replace(/^\//, '');
  const key = Object.keys(UPLOAD_FALLBACKS).find((name) => requested.startsWith(`${name}-`));
  if (!key) return next();

  const fallback = isVideoUploadPath(requested) ? VIDEO_UPLOAD_FALLBACK : UPLOAD_FALLBACKS[key];
  const fallbackPath = fallbackFilePath(fallback);
  if (fs.existsSync(fallbackPath)) return res.sendFile(fallbackPath);
  next();
});

// ── Cloudinary setup ──────────────────────────────────────────────────────────

const CLOUDINARY_OK = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (CLOUDINARY_OK) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary configured ✓');
} else {
  console.warn('Cloudinary not configured — uploads saved to local disk (ephemeral on Render)');
}

// ── File Upload ───────────────────────────────────────────────────────────────

// Always use memory storage; we save to disk or Cloudinary in the route handler
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

async function saveFile(file) {
  if (CLOUDINARY_OK) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'cineforge', resource_type: 'auto' },
        (err, r) => (err ? reject(err) : resolve(r))
      );
      stream.end(file.buffer);
    });
    return result.secure_url;
  }
  // Local fallback (files lost on Render restart)
  const ext = path.extname(file.originalname);
  const filename = `${file.fieldname}-${Date.now()}${ext}`;
  const filepath = path.join(__dirname, 'uploads', filename);
  fs.writeFileSync(filepath, file.buffer);
  return `/uploads/${filename}`;
}

// ── Admin Auth ────────────────────────────────────────────────────────────────

app.post('/api/admin/verify', loginLimit, async (req, res) => {
  try {
    const { id, password } = req.body;
    const s = await getDoc('settings', DEFAULT_SETTINGS);
    if (id === (s.adminId || 'admin') && password === (s.adminPassword || 'admin123')) {
      const token = crypto.randomBytes(32).toString('hex');
      adminTokens.set(token, Date.now() + 24 * 60 * 60 * 1000); // 24h expiry
      res.json({ ok: true, token });
    } else {
      res.json({ ok: false });
    }
  } catch { res.json({ ok: false }); }
});

app.get('/api/health', (req, res) => {
  res.json({ mongodb: !!db, mongoUri: MONGO_URI ? 'set' : 'missing' });
});

// ── Settings ──────────────────────────────────────────────────────────────────

app.get('/api/settings', async (req, res) => {
  try {
    const s = await getDoc('settings', DEFAULT_SETTINGS);
    const { razorpayKeySecret, emailPassword, adminPassword, ...safe } = s;
    res.json({ ...safe, hasRazorpaySecret: !!razorpayKeySecret, hasEmailPassword: !!emailPassword });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/settings/full', requireAdmin, async (req, res) => {
  try {
    const s = await getDoc('settings', DEFAULT_SETTINGS);
    const { adminPassword, ...safe } = s;
    res.json(safe); // never send adminPassword to client
  }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/settings', requireAdmin, async (req, res) => {
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

app.post('/api/content', requireAdmin, async (req, res) => {
  try {
    const current = await getDoc('content', DEFAULT_CONTENT);
    await setDoc('content', { ...current, ...req.body });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Upload ────────────────────────────────────────────────────────────────────

app.post('/api/upload', requireAdmin, upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'heroImage', maxCount: 1 },
  { name: 'sampleImage', maxCount: 1 },
  { name: 'sampleReel', maxCount: 1 },
  { name: 'sampleProduct', maxCount: 1 },
  { name: 'sampleExtra', maxCount: 1 },
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
      file.fieldname = field;
      const urlPath = await saveFile(file);
      settings[`${field}Path`] = urlPath;
      settings[`${field}Name`] = file.originalname;
      result[field] = { path: urlPath, name: file.originalname };
    }
    await setDoc('settings', settings);
    res.json({ ok: true, files: result, cloudinary: CLOUDINARY_OK });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}, (err, req, res, next) => {
  res.status(400).json({ ok: false, error: err.message });
});

// ── Orders ────────────────────────────────────────────────────────────────────

app.get('/api/orders', requireAdmin, async (req, res) => {
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

app.delete('/api/orders', requireAdmin, async (req, res) => {
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

// ── SPA Fallback with server-side GTM injection ───────────────────────────────

async function serveApp(req, res) {
  const filePath = path.join(__dirname, 'dist', 'index.html');
  if (!fs.existsSync(filePath)) return res.status(404).send('Build not found. Run: npm run build');

  let html = fs.readFileSync(filePath, 'utf8');
  try {
    const s = await getDoc('settings', DEFAULT_SETTINGS);
    if (s.gtmId) {
      const gtmHead = `<!-- Google Tag Manager --><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${s.gtmId}');</script><!-- End Google Tag Manager -->`;
      const gtmBody = `<!-- Google Tag Manager (noscript) --><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${s.gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><!-- End Google Tag Manager (noscript) -->`;
      html = html.replace('</head>', `${gtmHead}</head>`);
      html = html.replace('<body>', `<body>${gtmBody}`);
    }
    // Checkout page — noindex (don't show in Google)
    if (req.path === '/checkout') {
      html = html.replace('<meta name="robots" content="index, follow" />', '<meta name="robots" content="noindex, nofollow" />');
    }
  } catch { /* serve html as-is if db error */ }

  res.send(html);
}

app.get('/admin', serveApp);
app.get('/admin/*', serveApp);
app.get('*', serveApp);

// ── Start ─────────────────────────────────────────────────────────────────────

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\nServer running at http://localhost:${PORT}`);
    console.log(`  Landing page : http://localhost:${PORT}/`);
    console.log(`  Admin panel  : http://localhost:${PORT}/admin.html\n`);
  });
});
