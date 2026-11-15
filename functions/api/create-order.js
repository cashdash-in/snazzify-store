// POST /api/create-order
// Builds the order on the server from /products.json (so customers can't change prices),
// then creates a Razorpay order. Customer and item details are saved in the order's notes,
// so every order is visible in your Razorpay dashboard.
//
// Needs these Cloudflare Pages environment variables:
//   RAZORPAY_KEY_ID      (rzp_live_...)   — plain text
//   RAZORPAY_KEY_SECRET  (secret)         — encrypted

const LIFE_MS = 7 * 24 * 3600e3;
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
const clean = (s, n = 200) => String(s ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET)
    return json({ error: 'Payments are not set up yet. Please try again shortly.' }, 503);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const { items = [], customer = {} } = body;

  // --- validate customer
  const c = {
    name: clean(customer.name, 80), phone: clean(customer.phone, 10), email: clean(customer.email, 120),
    addr: clean(customer.addr, 250), pin: clean(customer.pin, 6), city: clean(customer.city, 60), state: clean(customer.state, 60),
  };
  if (!c.name || !/^[6-9]\d{9}$/.test(c.phone) || !c.addr || !/^[1-9]\d{5}$/.test(c.pin) || !c.city || !c.state)
    return json({ error: 'Please check your delivery details.' }, 400);

  // --- price the bag from the server copy of the catalogue
  const catalogue = await env.ASSETS.fetch(new URL('/products.json', request.url)).then(r => r.json());
  const now = Date.now();
  if (!Array.isArray(items) || !items.length || items.length > 20) return json({ error: 'Your bag is empty.' }, 400);
  let amount = 0; const lines = [];
  for (const it of items) {
    const p = catalogue.find(x => x.id === it.id);
    const qty = Math.max(1, Math.min(5, parseInt(it.qty, 10) || 1));
    if (!p) return json({ error: 'An item in your bag is no longer available.' }, 409);
    const added = Date.parse(p.addedAt);
    if (!(added <= now && added + LIFE_MS > now)) return json({ error: `"${p.name}" has left the shop. Please remove it from your bag.` }, 409);
    if (it.size && p.sizes && !p.sizes.includes(it.size)) return json({ error: 'Please choose a valid size.' }, 400);
    if (it.colour && p.colours && !p.colours.includes(it.colour)) return json({ error: 'Please choose a valid colour.' }, 400);
    amount += p.price * qty;
    lines.push(`${p.code}${it.size ? ' / ' + clean(it.size, 20) : ''}${it.colour ? ' / ' + clean(it.colour, 20) : ''} x${qty} @${p.price}`);
  }

  const ref = 'SNZ-' + now.toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 90 + 10);
  const itemsText = lines.join('; ');
  const notes = {
    ref, name: c.name, phone: '+91' + c.phone, email: c.email || '-',
    address: c.addr, pincode: c.pin, city: c.city, state: c.state,
    items: itemsText.slice(0, 250), items_2: itemsText.slice(250, 500) || '-',
  };

  let rz, order;
  try {
  rz = await fetch((env.RAZORPAY_API_BASE || 'https://api.razorpay.com') + '/v1/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Basic ' + btoa(env.RAZORPAY_KEY_ID + ':' + env.RAZORPAY_KEY_SECRET) },
    body: JSON.stringify({ amount: amount * 100, currency: 'INR', receipt: ref, notes }),
  });
  order = await rz.json();
  } catch (e) { return json({ error: 'Could not reach the payment gateway. Please try again.' }, 502); }
  if (!rz.ok) return json({ error: 'Could not start payment. Please try again.' }, 502);

  return json({ orderId: order.id, keyId: env.RAZORPAY_KEY_ID, amount: order.amount, ref });
}
