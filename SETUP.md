# Landing Page Setup

## Files

- `index.html` - landing page, lead form, thank-you/download section
- `styles.css` - responsive design
- `script.js` - form, payment flow, automation webhook
- `admin.html` - demo admin panel for leads, sales, CSV export
- `admin.js` - admin dashboard logic
- `ai-prompts-pack.pdf` - sample downloadable PDF

## Live Razorpay

1. In `index.html`, add Razorpay checkout before `script.js`:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

2. In `script.js`, set:

```js
demoMode: false,
razorpayKeyId: "rzp_live_YOUR_KEY",
```

For production, create Razorpay orders from a backend and verify payment signatures before sending the final PDF link.

## Email Automation

Set `automationWebhookUrl` in `script.js` to your Make, Zapier, Pabbly, n8n, Google Apps Script, or CRM webhook URL.

The page sends this payload after payment success:

```json
{
  "name": "Customer name",
  "phone": "Customer phone",
  "email": "Customer email",
  "paymentId": "Razorpay payment id",
  "product": "AI Prompts Master Pack",
  "pdfUrl": "PDF download link"
}
```

In the automation tool, add two actions:

1. Send confirmation email to customer.
2. Include the PDF link or attach the PDF from your storage.

## Admin Panel

Open `admin.html` or visit `/admin.html` on your hosted domain.

Demo login:

- Admin ID: `admin`
- Password: `admin123`

The current admin panel uses browser `localStorage` for demo records:

- Lead details
- Payment ID
- Amount
- Status
- CSV export
- Product price and MRP settings
- Razorpay key ID
- Email automation webhook
- PDF upload
- Hero image upload
- Sample image/video upload

For production, connect the table to your backend, Google Sheet, Supabase, MySQL, CRM, or Razorpay webhook database. Do not rely on browser localStorage for real customer records.
For real security, replace this demo login with backend authentication before publishing.
For production PDF/video delivery, upload files to hosting/storage and send a public secure link in the automation email.

## Replace PDF

Replace `ai-prompts-pack.pdf` with your final prompt pack using the same filename, or update the download link in `index.html`.
