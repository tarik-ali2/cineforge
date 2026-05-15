const adminCredentials = { id: 'admin', password: 'admin123' };

const adminLogin = document.querySelector('#adminLogin');
const adminLoginForm = document.querySelector('#adminLoginForm');
const loginError = document.querySelector('#loginError');
const logoutAdmin = document.querySelector('#logoutAdmin');
const ordersTable = document.querySelector('#ordersTable');
const emptyState = document.querySelector('#emptyState');
const searchOrders = document.querySelector('#searchOrders');
const totalOrders = document.querySelector('#totalOrders');
const totalRevenue = document.querySelector('#totalRevenue');
const totalEmails = document.querySelector('#totalEmails');
const totalDeliveries = document.querySelector('#totalDeliveries');
const exportCsv = document.querySelector('#exportCsv');
const addDemo = document.querySelector('#addDemo');
const clearOrders = document.querySelector('#clearOrders');
const saveSettings = document.querySelector('#saveSettings');
const settingProductName = document.querySelector('#settingProductName');
const settingPrice = document.querySelector('#settingPrice');
const settingMrp = document.querySelector('#settingMrp');
const settingRazorpay = document.querySelector('#settingRazorpay');
const settingRazorpaySecret = document.querySelector('#settingRazorpaySecret');
const settingEmailFrom = document.querySelector('#settingEmailFrom');
const settingEmailPassword = document.querySelector('#settingEmailPassword');
const settingWebhook = document.querySelector('#settingWebhook');
const settingDemoMode = document.querySelector('#settingDemoMode');
const settingPdf = document.querySelector('#settingPdf');
const settingHeroImage = document.querySelector('#settingHeroImage');
const settingSampleImage = document.querySelector('#settingSampleImage');
const settingSampleReel = document.querySelector('#settingSampleReel');
const settingSampleProduct = document.querySelector('#settingSampleProduct');
const settingGallery1 = document.querySelector('#settingGallery1');
const settingGallery2 = document.querySelector('#settingGallery2');
const settingGallery3 = document.querySelector('#settingGallery3');
const settingGallery4 = document.querySelector('#settingGallery4');
const settingsNote = document.querySelector('#settingsNote');
const pdfStatus = document.querySelector('#pdfStatus');
const heroImageStatus = document.querySelector('#heroImageStatus');
const sampleImageStatus = document.querySelector('#sampleImageStatus');
const sampleReelStatus = document.querySelector('#sampleReelStatus');
const sampleProductStatus = document.querySelector('#sampleProductStatus');
const gallery1Status = document.querySelector('#gallery1Status');
const gallery2Status = document.querySelector('#gallery2Status');
const gallery3Status = document.querySelector('#gallery3Status');
const gallery4Status = document.querySelector('#gallery4Status');

const catInputs = [1,2,3,4,5,6,7,8].map((n) => document.querySelector(`#settingCat${n}`));
const catStatuses = [1,2,3,4,5,6,7,8].map((n) => document.querySelector(`#cat${n}Status`));
const saveContent = document.querySelector('#saveContent');
const contentNote = document.querySelector('#contentNote');

const contentFields = {
  brandName: '#contentBrandName', toastText: '#contentToastText', heroBadge: '#contentHeroBadge',
  heroMini: '#contentHeroMini', heroLine1: '#contentHeroLine1', heroLine2: '#contentHeroLine2',
  heroLine3: '#contentHeroLine3', heroSubheadline: '#contentHeroSubheadline',
  heroDescription: '#contentHeroDescription', heroChips: '#contentHeroChips',
  offerSmallText: '#contentOfferSmallText', slotText: '#contentSlotText',
  mainCta: '#contentMainCta', buyNowCta: '#contentBuyNowCta', instantCta: '#contentInstantCta',
  sampleKicker: '#contentSampleKicker', sampleHeading: '#contentSampleHeading',
  sampleIntro: '#contentSampleIntro', sample1Title: '#contentSample1Title',
  sample1Text: '#contentSample1Text', sample1Prompt: '#contentSample1Prompt',
  sample2Title: '#contentSample2Title', sample2Text: '#contentSample2Text',
  sample2Prompt: '#contentSample2Prompt', sample3Title: '#contentSample3Title',
  sample3Text: '#contentSample3Text', sample3Prompt: '#contentSample3Prompt',
  galleryKicker: '#contentGalleryKicker', galleryHeading: '#contentGalleryHeading',
  categoryKicker: '#contentCategoryKicker', categoryHeading: '#contentCategoryHeading',
  darkCtaHeading: '#contentDarkCtaHeading', benefitHeading: '#contentBenefitHeading',
  reviewHeading: '#contentReviewHeading', finalOfferHeading: '#contentFinalOfferHeading',
  finalOfferText: '#contentFinalOfferText', faqHeading: '#contentFaqHeading',
  footerCopyright: '#contentFooterCopyright',
};

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

let allOrders = [];
let currentSettings = {};

// ── Auth ─────────────────────────────────────────────────────────────────────

if (localStorage.getItem('promptPackAdminLoggedIn') === 'true') {
  unlockAdmin();
} else {
  lockAdmin();
}

adminLoginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(adminLoginForm);
  if (data.get('adminId').trim() === adminCredentials.id && data.get('password').trim() === adminCredentials.password) {
    localStorage.setItem('promptPackAdminLoggedIn', 'true');
    loginError.hidden = true;
    adminLoginForm.reset();
    unlockAdmin();
  } else {
    loginError.hidden = false;
  }
});

logoutAdmin.addEventListener('click', () => {
  localStorage.removeItem('promptPackAdminLoggedIn');
  lockAdmin();
});

function unlockAdmin() {
  adminLogin.hidden = true;
  document.body.classList.remove('admin-locked');
  loadAndRender();
}

function lockAdmin() {
  adminLogin.hidden = false;
  document.body.classList.add('admin-locked');
}

// ── Data loading ─────────────────────────────────────────────────────────────

async function loadAndRender() {
  try {
    const [settings, orders, content] = await Promise.all([
      fetch('/api/settings/full').then((r) => r.json()),
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/content').then((r) => r.json()),
    ]);
    currentSettings = settings;
    allOrders = orders;
    renderMetrics();
    renderOrdersTable();
    renderSettings(settings);
    renderContent(content);
  } catch {
    settingsNote.textContent = 'Server se connect nahi ho pa raha. "node server.js" chal raha hai?';
  }
}

// ── Orders ───────────────────────────────────────────────────────────────────

searchOrders.addEventListener('input', renderOrdersTable);

addDemo.addEventListener('click', async () => {
  await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Demo Customer',
      phone: '9876543210',
      email: 'customer@example.com',
      paymentId: `demo_${Date.now()}`,
      product: currentSettings.productName || '10 Lakh+ AI Prompt Bundle',
      amount: currentSettings.price || 199,
      status: 'Paid',
    }),
  });
  await loadAndRender();
});

clearOrders.addEventListener('click', async () => {
  if (!confirm('Saare records clear karne hain?')) return;
  await fetch('/api/orders', { method: 'DELETE' });
  await loadAndRender();
});

exportCsv.addEventListener('click', () => {
  const rows = getFilteredOrders();
  if (!rows.length) { alert('Export ke liye koi order nahi hai.'); return; }
  const headers = ['Date', 'Name', 'Phone', 'Email', 'Amount', 'Status', 'Payment ID'];
  const csv = [
    headers.join(','),
    ...rows.map((o) =>
      [o.createdAt ? formatDate(o.createdAt) : '-', o.name, o.phone, o.email, o.amount, o.status, o.paymentId]
        .map(csvCell).join(','),
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'prompt-pack-orders.csv';
  link.click();
  URL.revokeObjectURL(url);
});

function getFilteredOrders() {
  const q = searchOrders.value.trim().toLowerCase();
  return allOrders.filter((o) => {
    if (!q) return true;
    return [o.name, o.phone, o.email, o.paymentId].join(' ').toLowerCase().includes(q);
  });
}

function renderMetrics() {
  const uniqueEmails = new Set(allOrders.map((o) => o.email).filter(Boolean));
  const revenue = allOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  totalOrders.textContent = allOrders.length;
  totalRevenue.textContent = currency.format(revenue);
  totalEmails.textContent = uniqueEmails.size;
  totalDeliveries.textContent = allOrders.filter((o) => o.status === 'Paid').length;
}

function renderOrdersTable() {
  renderMetrics();
  const rows = getFilteredOrders();
  ordersTable.innerHTML = rows
    .map(
      (o) => `<tr>
        <td>${o.createdAt ? formatDate(o.createdAt) : '-'}</td>
        <td>${escapeHtml(o.name)}</td>
        <td>${escapeHtml(o.phone)}</td>
        <td>${escapeHtml(o.email)}</td>
        <td>${currency.format(Number(o.amount || 0))}</td>
        <td><span class="status-pill">${escapeHtml(o.status || 'Paid')}</span></td>
        <td><code>${escapeHtml(o.paymentId || '-')}</code></td>
      </tr>`,
    )
    .join('');
  emptyState.hidden = rows.length > 0;
}

// ── Settings ─────────────────────────────────────────────────────────────────

saveSettings.addEventListener('click', saveAdminSettings);

async function saveAdminSettings() {
  saveSettings.disabled = true;
  saveSettings.textContent = 'Saving...';
  showNote(settingsNote, '', 'info');

  try {
    // 1. Save text settings
    const textPayload = {
      productName: settingProductName.value.trim() || currentSettings.productName,
      price: Number(settingPrice.value) || currentSettings.price,
      mrp: Number(settingMrp.value) || currentSettings.mrp,
      razorpayKeyId: settingRazorpay.value.trim(),
      automationWebhookUrl: settingWebhook.value.trim(),
      demoMode: settingDemoMode.checked,
    };
    if (settingRazorpaySecret && settingRazorpaySecret.value.trim()) {
      textPayload.razorpayKeySecret = settingRazorpaySecret.value.trim();
    }
    if (settingEmailFrom && settingEmailFrom.value.trim()) {
      textPayload.emailFrom = settingEmailFrom.value.trim();
    }
    if (settingEmailPassword && settingEmailPassword.value.trim()) {
      textPayload.emailPassword = settingEmailPassword.value.trim();
    }

    const settingsRes = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(textPayload),
    });
    if (!settingsRes.ok) throw new Error('Settings save failed: ' + settingsRes.status);

    // 2. Upload files if selected
    const fileFields = [
      ['pdf', settingPdf],
      ['heroImage', settingHeroImage],
      ['sampleImage', settingSampleImage],
      ['sampleReel', settingSampleReel],
      ['sampleProduct', settingSampleProduct],
      ['gallery1', settingGallery1],
      ['gallery2', settingGallery2],
      ['gallery3', settingGallery3],
      ['gallery4', settingGallery4],
      ...catInputs.map((el, i) => [`cat${i + 1}`, el]),
    ];
    const hasFiles = fileFields.some(([, input]) => input && input.files && input.files.length > 0);

    if (hasFiles) {
      showNote(settingsNote, 'Files upload ho rahi hain...', 'info');
      const formData = new FormData();
      for (const [field, input] of fileFields) {
        if (input && input.files && input.files[0]) formData.append(field, input.files[0]);
      }
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadData.ok) throw new Error('File upload failed');
    }

    // 3. Refresh and show success
    const updated = await fetch('/api/settings/full').then((r) => r.json());
    currentSettings = updated;
    renderSettings(updated);
    showNote(settingsNote, '✓ Settings saved! Landing page refresh karo to changes dikhenge.', 'success');
  } catch (err) {
    showNote(settingsNote, '✗ Error: ' + err.message + ' — Server chal raha hai? Console dekho.', 'error');
  } finally {
    saveSettings.disabled = false;
    saveSettings.textContent = 'Save Settings';
  }
}

function renderSettings(s) {
  settingProductName.value = s.productName || '';
  settingPrice.value = s.price || '';
  settingMrp.value = s.mrp || '';
  settingRazorpay.value = s.razorpayKeyId || '';
  settingWebhook.value = s.automationWebhookUrl || '';
  settingDemoMode.checked = !!s.demoMode;
  if (settingRazorpaySecret) settingRazorpaySecret.placeholder = s.razorpayKeySecret ? '(saved — update karne ke liye type karo)' : 'rzp_secret_xxxxx';
  if (settingEmailFrom) settingEmailFrom.value = s.emailFrom || '';
  if (settingEmailPassword) settingEmailPassword.placeholder = s.emailPassword ? '(saved — update karne ke liye type karo)' : 'Google App Password (16-char)';
  pdfStatus.textContent = s.pdfName ? `Uploaded: ${s.pdfName}` : 'No custom PDF (default ai-prompts-pack.pdf use hoga)';
  heroImageStatus.textContent = s.heroImageName ? `Uploaded: ${s.heroImageName}` : 'Default image active';
  sampleImageStatus.textContent = s.sampleImageName ? `Uploaded: ${s.sampleImageName}` : 'Default sample active';
  sampleReelStatus.textContent = s.sampleReelName ? `Uploaded: ${s.sampleReelName}` : 'Default sample active';
  sampleProductStatus.textContent = s.sampleProductName ? `Uploaded: ${s.sampleProductName}` : 'Default sample active';
  if (gallery1Status) gallery1Status.textContent = s.gallery1Name ? `Uploaded: ${s.gallery1Name}` : 'CSS art (default)';
  if (gallery2Status) gallery2Status.textContent = s.gallery2Name ? `Uploaded: ${s.gallery2Name}` : 'CSS art (default)';
  if (gallery3Status) gallery3Status.textContent = s.gallery3Name ? `Uploaded: ${s.gallery3Name}` : 'CSS art (default)';
  if (gallery4Status) gallery4Status.textContent = s.gallery4Name ? `Uploaded: ${s.gallery4Name}` : 'CSS art (default)';
  catStatuses.forEach((el, i) => {
    if (el) el.textContent = s[`cat${i + 1}Name`] ? `Uploaded: ${s[`cat${i + 1}Name`]}` : 'CSS art (default)';
  });
}

// ── Content editor ────────────────────────────────────────────────────────────

saveContent.addEventListener('click', async () => {
  saveContent.disabled = true;
  saveContent.textContent = 'Saving...';
  try {
    const payload = {};
    Object.entries(contentFields).forEach(([key, selector]) => {
      const el = document.querySelector(selector);
      if (el) payload[key] = el.value.trim();
    });
    const res = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Server error ' + res.status);
    showNote(contentNote, '✓ Content saved! Landing page refresh karo to changes dikhenge.', 'success');
  } catch (err) {
    showNote(contentNote, '✗ Error: ' + err.message, 'error');
  } finally {
    saveContent.disabled = false;
    saveContent.textContent = 'Save Content';
  }
});

function renderContent(content) {
  Object.entries(contentFields).forEach(([key, selector]) => {
    const el = document.querySelector(selector);
    if (el) el.value = content[key] || '';
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function showNote(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.style.color = type === 'success' ? '#186b4f' : type === 'error' ? '#b91f18' : '#64615a';
  el.style.fontWeight = '700';
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
