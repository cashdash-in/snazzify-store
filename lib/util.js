// Shared helpers for Snazzify's Cloudflare Pages Functions.
import SEED from './seed-products.json';

export const LIFE_MS = 7 * 24 * 3600e3;
export const MARKUP = 1.3;
export const STATUSES = ['created', 'booked', 'video_sent', 'paid', 'sent', 'seller_paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
export const PAID_LIKE = new Set(['paid', 'sent', 'seller_paid', 'shipped', 'delivered']);

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers } });

export const clean = (s, n = 200) => String(s ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

/** Selling price = (seller price + seller shipping) × 1.3, rounded up to end in 9. */
export function sellPrice(cost, ship = 0) {
  const x = Math.ceil((Number(cost) + Number(ship || 0)) * MARKUP);
  return x + ((9 - (x % 10)) % 10);
}

// ---------- catalogue ----------
export async function getCatalogue(env) {
  if (env.STORE) {
    const kv = await env.STORE.get('products', 'json');
    if (kv) return kv;
  }
  return SEED;
}
export async function saveCatalogue(env, list) {
  await env.STORE.put('products', JSON.stringify(list));
}
const PRIVATE = ['cost', 'ship', 'sellerName', 'sellerPhone', 'sellerUpi', 'notes'];
export const publicProduct = p => Object.fromEntries(Object.entries(p).filter(([k]) => !PRIVATE.includes(k)));

// ---------- crypto ----------
export async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, typeof msg === 'string' ? new TextEncoder().encode(msg) : msg);
  return [...new Uint8Array(mac)].map(x => x.toString(16).padStart(2, '0')).join('');
}
export function safeEqual(a = '', b = '') {
  let d = a.length ^ b.length;
  for (let i = 0; i < Math.min(a.length, b.length); i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// ---------- admin session ----------
const COOKIE = 'snz_admin';
export async function makeSession(env) {
  const exp = Date.now() + 30 * 24 * 3600e3;
  const sig = await hmacHex(env.ADMIN_PASSWORD, 'admin:' + exp);
  return `${COOKIE}=${exp}.${sig}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${30 * 24 * 3600}`;
}
export const clearSession = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
export async function isAdmin(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const m = (request.headers.get('cookie') || '').match(new RegExp(COOKIE + '=(\\d+)\\.([0-9a-f]+)'));
  if (!m || Number(m[1]) < Date.now()) return false;
  return safeEqual(await hmacHex(env.ADMIN_PASSWORD, 'admin:' + m[1]), m[2]);
}

// ---------- orders ----------
export const getOrder = (env, ref) => env.STORE.get('order:' + ref, 'json');
export async function putOrder(env, o) {
  o.updatedAt = new Date().toISOString();
  await env.STORE.put('order:' + o.ref, JSON.stringify(o));
}
export async function addToIndex(env, ref) {
  const idx = (await env.STORE.get('orders:index', 'json')) || [];
  if (!idx.includes(ref)) { idx.unshift(ref); await env.STORE.put('orders:index', JSON.stringify(idx.slice(0, 5000))); }
}
export async function listOrders(env, limit = 500) {
  const idx = ((await env.STORE.get('orders:index', 'json')) || []).slice(0, limit);
  const all = await Promise.all(idx.map(r => getOrder(env, r)));
  return all.filter(Boolean);
}
/** Mark an order paid (idempotent). Used by verify-payment and the Razorpay webhook. */
export async function markPaid(env, rzpOrderId, paymentId, via) {
  if (!env.STORE) return null;
  const ref = await env.STORE.get('rzp:' + rzpOrderId);
  if (!ref) return null;
  const o = await getOrder(env, ref);
  if (!o) return null;
  if (['created', 'booked', 'video_sent'].includes(o.status)) {
    o.status = 'paid'; o.paidAt = new Date().toISOString(); o.paymentId = paymentId;
    o.history = [...(o.history || []), { at: o.paidAt, status: 'paid', note: 'Payment confirmed (' + via + ')' }];
    await putOrder(env, o);
  }
  return o;
}

// ---------- settings (admin switches) ----------
export const DEFAULT_SETTINGS = { seeBeforePay: false };
export async function getSettings(env) {
  const s = env.STORE ? await env.STORE.get('settings', 'json') : null;
  return { ...DEFAULT_SETTINGS, ...(s || {}) };
}

// ---------- bag pricing (shared by pay-now checkout and see-before-you-pay booking) ----------
export function checkCustomer(customer = {}) {
  const c = {
    name: clean(customer.name, 80), phone: clean(customer.phone, 10), email: clean(customer.email, 120),
    addr: clean(customer.addr, 250), pin: clean(customer.pin, 6), city: clean(customer.city, 60), state: clean(customer.state, 60),
  };
  const ok = c.name && /^[6-9]\d{9}$/.test(c.phone) && c.addr && /^[1-9]\d{5}$/.test(c.pin) && c.city && c.state;
  return ok ? c : null;
}
export async function priceBag(env, items) {
  const catalogue = await getCatalogue(env);
  const now = Date.now();
  if (!Array.isArray(items) || !items.length || items.length > 20) return { error: 'Your bag is empty.', status: 400 };
  let amount = 0; const lines = []; const orderItems = [];
  for (const it of items) {
    const p = catalogue.find(x => x.id === it.id);
    const qty = Math.max(1, Math.min(5, parseInt(it.qty, 10) || 1));
    if (!p) return { error: 'An item in your bag is no longer available.', status: 409 };
    const added = Date.parse(p.addedAt);
    if (!(added <= now && added + LIFE_MS > now)) return { error: `"${p.name}" has left the shop. Please remove it from your bag.`, status: 409 };
    if (it.size && p.sizes && !p.sizes.includes(it.size)) return { error: 'Please choose a valid size.', status: 400 };
    if (it.colour && p.colours && !p.colours.includes(it.colour)) return { error: 'Please choose a valid colour.', status: 400 };
    const size = it.size ? clean(it.size, 20) : '', colour = it.colour ? clean(it.colour, 20) : '';
    amount += p.price * qty;
    lines.push(`${p.code}${size ? ' / ' + size : ''}${colour ? ' / ' + colour : ''} x${qty} @${p.price}`);
    orderItems.push({ id: p.id, code: p.code, name: p.name, img: p.img, size, colour, qty, price: p.price,
      cost: p.cost ?? null, ship: p.ship ?? null, sellerName: p.sellerName || '', sellerPhone: p.sellerPhone || '', sellerUpi: p.sellerUpi || '' });
  }
  return { amount, lines, orderItems };
}
export const newRef = () => 'SNZ-' + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 90 + 10);

/** Create a Razorpay order; notes carry customer + items so they also show in the Razorpay dashboard. */
export async function razorpayOrder(env, { amount, ref, c, lines }) {
  const itemsText = lines.join('; ');
  const notes = { ref, name: c.name, phone: '+91' + c.phone, email: c.email || '-', address: c.addr, pincode: c.pin,
    city: c.city, state: c.state, items: itemsText.slice(0, 250), items_2: itemsText.slice(250, 500) || '-' };
  try {
    const rz = await fetch((env.RAZORPAY_API_BASE || 'https://api.razorpay.com') + '/v1/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Basic ' + btoa(env.RAZORPAY_KEY_ID + ':' + env.RAZORPAY_KEY_SECRET) },
      body: JSON.stringify({ amount: amount * 100, currency: 'INR', receipt: ref, notes }),
    });
    const order = await rz.json();
    return rz.ok ? { order } : { error: 'Could not start payment. Please try again.' };
  } catch { return { error: 'Could not reach the payment gateway. Please try again.' }; }
}
