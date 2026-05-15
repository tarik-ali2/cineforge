let config = {
  demoMode: true,
  price: 199,
  mrp: 4999,
  productName: '10 Lakh+ AI Prompt Bundle',
  razorpayKeyId: '',
  pdfPath: '',
  pdfName: '',
  heroImagePath: '',
  sampleImagePath: '',
  sampleReelPath: '',
  sampleProductPath: '',
};

let content = {
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

const leadDialog = document.querySelector('#leadDialog');
const leadForm = document.querySelector('#leadForm');
const thankYou = document.querySelector('#thankYou');
const customerName = document.querySelector('#customerName');
const backHome = document.querySelector('#backHome');
const downloadPdf = document.querySelector('#downloadPdf');
const heroProductImage = document.querySelector('#heroProductImage');
const sampleDialog = document.querySelector('#sampleDialog');
const closeSample = document.querySelector('#closeSample');
const sampleType = document.querySelector('#sampleType');
const sampleTitle = document.querySelector('#sampleTitle');
const samplePlayer = document.querySelector('#samplePlayer');
const samplePrompt = document.querySelector('#samplePrompt');

async function init() {
  try {
    const [cfg, cnt] = await Promise.all([
      fetch('/api/settings').then((r) => r.json()),
      fetch('/api/content').then((r) => r.json()),
    ]);
    config = { ...config, ...cfg };
    content = { ...content, ...cnt };
  } catch {
    // Server unavailable, use defaults
  }

  const samples = {
    image: { type: 'Image Creation', title: content.sample1Title, mediaPath: config.sampleImagePath, prompt: content.sample1Prompt },
    reel: { type: 'Reels & Shorts', title: content.sample2Title, mediaPath: config.sampleReelPath, prompt: content.sample2Prompt },
    product: { type: 'Product Ads', title: content.sample3Title, mediaPath: config.sampleProductPath, prompt: content.sample3Prompt },
  };

  applyStorefrontSettings();
  applyLandingContent();

  document.querySelectorAll('[data-buy]').forEach((btn) => {
    btn.addEventListener('click', () => leadDialog.showModal());
  });

  document.querySelector('[data-close]').addEventListener('click', () => leadDialog.close());

  // Sample cards: inject media + inline play logic
  const sampleCardMap = {
    image: config.sampleImagePath,
    reel: config.sampleReelPath,
    product: config.sampleProductPath,
  };

  document.querySelectorAll('.sample-card').forEach((card) => {
    const mediaPath = sampleCardMap[card.dataset.sample];
    const screen = card.querySelector('.sample-screen');
    const playBtn = card.querySelector('.play-btn');
    if (!screen) return;

    const isVideo = mediaPath && /\.(mp4|webm|ogg|mov)$/i.test(mediaPath);
    let inlineVideo = null;

    if (mediaPath && isVideo) {
      // Build inline video (muted loop as thumbnail)
      const vid = document.createElement('video');
      vid.src = mediaPath;
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:8px;z-index:0;';
      screen.style.background = '#000';
      screen.insertBefore(vid, screen.firstChild);
      vid.play();
      inlineVideo = vid;

      // × close button (hidden until playing)
      const closeBtn = document.createElement('button');
      closeBtn.className = 'inline-close-btn';
      closeBtn.innerHTML = '&#x2715;';
      closeBtn.setAttribute('aria-label', 'Band karo');
      screen.appendChild(closeBtn);

      const stopInline = () => {
        screen.classList.remove('is-playing-inline');
        vid.muted = true;
        vid.controls = false;
        vid.style.objectFit = 'cover';
        vid.currentTime = 0;
        vid.play();
      };

      // Play button → sound on, controls on
      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          screen.classList.add('is-playing-inline');
          vid.muted = false;
          vid.controls = true;
          vid.style.objectFit = 'contain';
          vid.play();
        });
      }

      closeBtn.addEventListener('click', (e) => { e.stopPropagation(); stopInline(); });
      vid.addEventListener('ended', stopInline);

    } else if (mediaPath) {
      // Image: set as background
      screen.style.background = `url('${mediaPath}') center/cover no-repeat`;
    }

    // Card body click (not play/close) → open prompt popup
    card.addEventListener('click', (e) => {
      if (e.target.closest('.play-btn') || e.target.closest('.inline-close-btn')) return;
      if (screen.classList.contains('is-playing-inline')) return;
      const sample = samples[card.dataset.sample];
      if (!sample) return;
      sampleType.textContent = sample.type;
      sampleTitle.textContent = sample.title;
      samplePrompt.textContent = sample.prompt;
      samplePlayer.className = 'sample-player';
      samplePlayer.innerHTML = '';
      sampleDialog.showModal();
    });
  });

  const galleryTitles = {
    1: document.querySelector('#galleryTitle1')?.textContent || 'Image Creation Prompts',
    2: document.querySelector('#galleryTitle2')?.textContent || 'Video & Reels Prompts',
    3: document.querySelector('#galleryTitle3')?.textContent || 'Business Ad Prompts',
    4: document.querySelector('#galleryTitle4')?.textContent || 'Festival & Event Prompts',
  };

  // Inject media + inline play for gallery cards
  [1, 2, 3, 4].forEach((n) => {
    const mediaPath = config[`gallery${n}Path`];
    const container = document.querySelector(`#galleryMedia${n}`);
    const playBtn = container && container.querySelector('.gallery-play-btn');
    if (!container) return;

    const isVideo = mediaPath && /\.(mp4|webm|ogg|mov)$/i.test(mediaPath);

    if (mediaPath && isVideo) {
      const vid = document.createElement('video');
      vid.src = mediaPath;
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:8px;z-index:0;';
      container.style.background = '#000';
      container.insertBefore(vid, container.firstChild);
      vid.play();

      const closeBtn = document.createElement('button');
      closeBtn.className = 'inline-close-btn';
      closeBtn.innerHTML = '&#x2715;';
      container.appendChild(closeBtn);

      const stopInline = () => {
        container.classList.remove('is-playing-inline');
        vid.muted = true;
        vid.controls = false;
        vid.style.objectFit = 'cover';
        vid.currentTime = 0;
        vid.play();
      };

      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          container.classList.add('is-playing-inline');
          vid.muted = false;
          vid.controls = true;
          vid.style.objectFit = 'contain';
          vid.play();
        });
      }
      closeBtn.addEventListener('click', (e) => { e.stopPropagation(); stopInline(); });
      vid.addEventListener('ended', stopInline);

    } else if (mediaPath) {
      const img = document.createElement('img');
      img.src = mediaPath;
      img.alt = galleryTitles[n] || '';
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:8px;z-index:0;';
      container.style.background = 'none';
      container.insertBefore(img, container.firstChild);
    }
  });

  // Category cards: inject images (non-clickable)
  [1,2,3,4,5,6,7,8].forEach((n) => {
    const imgPath = config[`cat${n}Path`];
    if (!imgPath) return;
    const el = document.querySelector(`#catImg${n}`);
    if (!el) return;
    el.style.backgroundImage = `url('${imgPath}')`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
  });

  closeSample.addEventListener('click', () => sampleDialog.close());

  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(leadForm);
    const lead = {
      name: data.get('name').trim(),
      phone: data.get('phone').trim(),
      email: data.get('email').trim(),
    };

    if (config.demoMode) {
      await completePurchase(lead, null);
      return;
    }

    await startRazorpayCheckout(lead);
  });

  backHome.addEventListener('click', () => {
    thankYou.hidden = true;
    document.body.style.overflow = '';
  });
}

async function startRazorpayCheckout(lead) {
  let orderData;
  try {
    orderData = await fetch('/api/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }).then((r) => r.json());
  } catch {
    alert('Server connect nahi ho pa raha. Demo mode use karo ya server chalao.');
    return;
  }

  if (orderData.error) { alert(orderData.error); return; }
  if (orderData.demoMode) { await completePurchase(lead, null); return; }

  if (!window.Razorpay) {
    alert('Razorpay script load nahi hua. Internet connection check karo.');
    return;
  }

  const options = {
    key: orderData.keyId,
    amount: orderData.amount,
    currency: orderData.currency,
    name: config.productName,
    description: 'Instant PDF download',
    order_id: orderData.orderId,
    prefill: { name: lead.name, email: lead.email, contact: lead.phone },
    notes: { product: config.productName },
    handler: async (response) => {
      await completePurchase(lead, response);
    },
    modal: { ondismiss: () => leadDialog.showModal() },
  };

  leadDialog.close();
  const rzp = new window.Razorpay(options);
  rzp.open();
}

async function completePurchase(lead, razorpayResponse) {
  try {
    const body = {
      lead,
      razorpay_order_id: razorpayResponse?.razorpay_order_id || '',
      razorpay_payment_id: razorpayResponse?.razorpay_payment_id || '',
      razorpay_signature: razorpayResponse?.razorpay_signature || '',
    };
    const result = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json());

    if (result.ok) {
      const pdfHref = result.pdfUrl || 'ai-prompts-pack.pdf';
      downloadPdf.href = pdfHref;
      downloadPdf.download = result.pdfName || 'prompt-bundle.pdf';
    }
  } catch {
    downloadPdf.href = 'ai-prompts-pack.pdf';
    downloadPdf.download = 'prompt-bundle.pdf';
  }

  showThankYou(lead);
}

function showThankYou(lead) {
  customerName.textContent = lead.name || 'friend';
  leadDialog.close();
  thankYou.hidden = false;
  document.body.style.overflow = 'hidden';
}

function applyStorefrontSettings() {
  document.querySelectorAll('.js-price').forEach((el) => { el.textContent = `Rs.${config.price}`; });
  document.querySelectorAll('.js-mrp').forEach((el) => { el.textContent = `Rs.${config.mrp}`; });

  if (config.heroImagePath) heroProductImage.src = config.heroImagePath;
}

function applyLandingContent() {
  setText('#brandName', content.brandName);
  setText('#toastText', content.toastText);
  setText('#heroBadge', content.heroBadge);
  setText('#heroMini', content.heroMini);
  setText('#heroLine1', content.heroLine1);
  setText('#heroLine2', content.heroLine2);
  setText('#heroLine3', content.heroLine3);
  setText('#heroSubheadline', content.heroSubheadline);
  setText('#heroDescription', content.heroDescription);
  setText('#offerSmallText', content.offerSmallText);
  setText('#slotText', content.slotText);
  setText('#stickySlotText', content.slotText);
  setText('#sampleKicker', content.sampleKicker);
  setText('#sampleHeading', content.sampleHeading);
  setText('#sampleIntro', content.sampleIntro);
  setText('#sampleCard1Title', content.sample1Title);
  setText('#sampleCard1Text', content.sample1Text);
  setText('#sampleCard2Title', content.sample2Title);
  setText('#sampleCard2Text', content.sample2Text);
  setText('#sampleCard3Title', content.sample3Title);
  setText('#sampleCard3Text', content.sample3Text);
  setText('#galleryKicker', content.galleryKicker);
  setText('#galleryHeading', content.galleryHeading);
  setText('#categoryKicker', content.categoryKicker);
  setText('#categoryHeading', content.categoryHeading);
  setText('#darkCtaHeading', content.darkCtaHeading);
  setText('#benefitHeading', content.benefitHeading);
  setText('#reviewHeading', content.reviewHeading);
  setText('#finalOfferHeading', content.finalOfferHeading);
  setText('#finalOfferText', content.finalOfferText);
  setText('#faqHeading', content.faqHeading);
  setText('#footerCopyright', content.footerCopyright);

  document.querySelectorAll('.main-cta-text').forEach((btn) => { btn.textContent = content.mainCta; });
  document.querySelectorAll('.instant-download-text').forEach((btn) => { btn.textContent = content.instantCta; });
  const navCta = document.querySelector('#navCta');
  if (navCta) navCta.textContent = content.mainCta;

  document.querySelectorAll('.buy-now-text').forEach((btn) => {
    btn.textContent = `${content.buyNowCta} Rs.${config.price}`;
  });

  const chipRow = document.querySelector('.hero-chip-row');
  if (chipRow) {
    chipRow.innerHTML = content.heroChips
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => `<span>${escapeHtml(c)}</span>`)
      .join('');
  }
}

function renderSampleMedia(mediaPath) {
  if (!mediaPath) return '';
  const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(mediaPath);
  if (isVideo) {
    return `<video src="${mediaPath}" controls autoplay muted playsinline style="width:100%;border-radius:8px;"></video>`;
  }
  return `<img src="${mediaPath}" alt="Sample preview" style="width:100%;border-radius:8px;" />`;
}

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el && value) el.textContent = value;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

init();
