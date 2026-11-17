# Snazzify store

Static storefront + two Cloudflare Pages Functions for secure Razorpay checkout.

```
public/              website (served as-is)
  index.html         the whole storefront
  products.json      live catalogue (each product is shown for 7 days from addedAt)
  img/               product photos
functions/api/
  create-order.js    prices the bag on the server, creates the Razorpay order
  verify-payment.js  checks Razorpay's payment signature
products.sample.json demo catalogue for testing
```

## Cloudflare Pages settings

- Framework preset: **None**
- Build command: *(empty)*
- Build output directory: **public**
- Environment variables (Production):
  - `RAZORPAY_KEY_ID` = your `rzp_live_...` key id (plain text)
  - `RAZORPAY_KEY_SECRET` = your key secret (**Encrypt**). Paste this yourself; never share it.

## Products

Each entry in `public/products.json`:

```json
{
  "id": "p1", "code": "AC-7110", "name": "Chinon Silk Printed Top, Palazzo & Dupatta Set",
  "cat": "Suits & Sets", "price": 2099, "img": "set.jpg",
  "addedAt": "2026-11-15T05:30:00Z",
  "sizes": ["M (38)", "L (40)"], "colours": ["Black"],
  "details": ["Pure Chinon silk", "Heavy stone work"],
  "seller": "", "cost": 1500
}
```

`cat` is one of: Sarees, Suits & Sets, Bags, Home & Festive. A product shows from `addedAt`
until 7 days later, then disappears automatically and can no longer be paid for.
Pricing rule: price = (cost + ship) × 2, rounded up to end in 9. `seller`, `cost` and `ship` are for your records and the upcoming order-to-seller automation.

## Orders

Every paid order appears in the Razorpay dashboard → Orders/Payments, with the customer's
name, phone, address and items in **Notes**.

## Admin page — snazzify.co.in/admin

Orders, status tracking, sales & profit, and adding products from your phone.
Needs these in Cloudflare Pages → Settings:
- **Bindings → KV namespace**: variable name `STORE` → namespace `snazzify-store-data`
- **Variables and secrets**: `ADMIN_PASSWORD` (Secret) and `RAZORPAY_WEBHOOK_SECRET` (Secret)
- Razorpay Dashboard → Settings → Webhooks → URL `https://www.snazzify.co.in/api/razorpay-webhook`,
  events `payment.captured` and `order.paid`, same secret as above.

Product catalogue lives in KV once you save a product in the admin page
(first load falls back to `lib/seed-products.json`). Costs and seller details are never sent to the public shop.

## Mobile app (PWA)
The shop installs as an app ("Add to Home Screen" / Install prompt): `public/manifest.webmanifest`, `public/sw.js`,
icons in `public/icons`. On phones it shows a bottom tab bar (Home · Shop · ⚡ Deals · Saved · Bag), story-style
categories, swipeable product photos and a sticky buy bar. `/api` responses are never cached, so prices and deals are always live.

## Wow features
- **✨ Try Me On**: Gemini image editing (`gemini-3.1-flash-image`) via **Firebase AI Logic** in the browser
  (Agent Platform / Vertex AI Gemini API backend, location `global`). No AI API keys anywhere: access is protected by
  **Firebase App Check (reCAPTCHA Enterprise)**. Config lives in `public/js/firebase-config.js` (public by design).
  Source: `tools/tryon-firebase.src.js`, bundled to `public/js/tryon-firebase.js` with
  `esbuild tools/tryon-firebase.src.js --bundle --format=esm --minify --external:./firebase-config.js --outfile=public/js/tryon-firebase.js`
  (firebase@13). Customer photos are sent from the browser to Google only; nothing is stored by Snazzify.
  Per-visitor daily limit (browser) is set in admin; set a Cloud Billing budget alert too.
- **🎬 Swipe feed** (`#swipe`): Reels-style full-screen product feed, double-tap to save.
- **👭 Buy or Bye?** (`/api/poll`, page `/v/#id`): WhatsApp poll for friends, one vote per device, results in Saved → Polls.
- **💍 Complete the look**: jewellery/bag/accessory bought with a suit or saree gets the look % off (admin), enforced at checkout, never stacked on a flash deal.


## Growth features (November 2026)

All of these are switched on and managed from **Admin → Grow** and **Admin → Reviews**. Busy data (votes, guesses, reviews, squads, Price Drop holds) lives in the free Cloudflare D1 database `snazzify-db`, bound to the Pages project as `DB`. Tables are created automatically on first use.

| Feature | Where | Notes |
|---|---|---|
| Google-ready product pages | `/p/<name>-<id>` (`functions/p/[slug].js`) | Real title, description, link preview and Product schema; opens the product in the app |
| Festival pages | `/festival/teej`, `gangaur`, `karva-chauth`, `wedding-season` | SEO landing pages (`lib/festivals.js`) |
| Sitemap / robots | `/sitemap.xml`, `/robots.txt` | Submit the sitemap in Google Search Console |
| Google Shopping feed | `/feed.xml` | Add as a scheduled feed in Google Merchant Center (free listings) |
| Order tracking | `#track` + `/api/track` | Customer enters order ID + phone; recent orders remembered on the device |
| Order confirmation | Admin → order → "Send order confirmation" | WhatsApp message with the tracking link |
| Unpaid-checkout reminders | Admin → Today / Orders → Unpaid | WhatsApp message with a 1-tap pay link (`/pay/#REF.token`, valid 3 days) |
| Reviews with photos | Admin → order (shipped/delivered) → "Ask for a review" → `/review/` page | Approve in Admin → Reviews; shown on home + product |
| Size guide | Product → "📏 Size guide" (Suits & Sets) | Edit the table in `sizeGuide()` |
| 🔥 Price Drop Live | Admin → Grow | One piece; price drops every minute; 10-min price lock while paying; floor ≥ seller price + shipping |
| 🎁 Mystery Box | Products → category "Mystery Box" | Shown with a 🎁 tag |
| 🎯 Guess the Price | Admin → Grow | Product hidden from the shop until the reveal hour; closest guess wins |
| 👯 Drop Squad | Admin → Grow | After paying, customers share a squad code; when the squad fills, refund the cashback in Razorpay and tap "Mark cashback paid" |
| 🏷️ Coupons | Admin → Grow | % or ₹ off, minimum bag, expiry; never on flash/look prices, never below seller cost |
