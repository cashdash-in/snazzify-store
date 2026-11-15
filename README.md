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
Pricing rule: price = (cost + ship) × 1.3, rounded up to end in 9. `seller`, `cost` and `ship` are for your records and the upcoming order-to-seller automation.

## Orders

Every paid order appears in the Razorpay dashboard → Orders/Payments, with the customer's
name, phone, address and items in **Notes**.
