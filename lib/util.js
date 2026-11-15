// Shared helpers for Snazzify's Cloudflare Pages Functions.
import SEED from './seed-products.json';

export const LIFE_MS = 7 * 24 * 3600e3;
export const MARKUP = 1.3;
export const STATUSES = ['created', 'paid', 'sent', 'seller_paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
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
  if (o.status === 'created') {
    o.status = 'paid'; o.paidAt = new Date().toISOString(); o.paymentId = paymentId;
    o.history = [...(o.history || []), { at: o.paidAt, status: 'paid', note: 'Payment confirmed (' + via + ')' }];
    await putOrder(env, o);
  }
  return o;
}
