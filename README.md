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
