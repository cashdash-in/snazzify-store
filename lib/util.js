// Shared helpers for Snazzify's Cloudflare Pages Functions.
import SEED from './seed-products.json';
import { db } from './db.js';

export const LIFE_MS = 7 * 24 * 3600e3;
export const MARKUP = 2; // selling price = (seller price + seller shipping) × MARKUP
export const STATUSES = ['created', 'booked', 'video_sent', 'paid', 'sent', 'seller_paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
export const PAID_LIKE = new Set(['paid', 'sent', 'seller_paid', 'shipped', 'delivered']);

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers } });

export const clean = (s, n = 200) => String(s ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

/** Selling price = (seller price + seller shipping) × MARKUP, rounded up to end in 9. */
export function sellPrice(cost, ship = 0) {
  const x = Math.ceil((Number(cost) + Number(ship || 0)) * MARKUP);
  return x + ((9 - (x % 10)) % 10);
}

// ---------- catalogue ----------
// Catalogue = products saved from the admin page (KV), plus any new products shipped in
// lib/seed-products.json that the admin hasn't seen yet. Deleted ids are remembered so they don't come back.
export async function getCatalogue(env) {
  if (!env.STORE) return SEED.map(autoPrice);
  const kv = await env.STORE.get('products', 'json');
  if (!kv) return SEED.map(autoPrice);
  const deleted = new Set((await env.STORE.get('products:deleted', 'json')) || []);
  const have = new Set(kv.map(p => p.id));
  return [...SEED.filter(p => !have.has(p.id) && !deleted.has(p.id)), ...kv].map(autoPrice);
}
// Products with a seller price follow the markup rule automatically, unless the admin typed a price by hand.
const autoPrice = p => (p.cost != null && !p.priceManual) ? { ...p, price: sellPrice(p.cost, p.ship) } : p;
export async function saveCatalogue(env, list) {
  await env.STORE.put('products', JSON.stringify(list));
}
const PRIVATE = ['cost', 'ship', 'sellerName', 'sellerPhone', 'sellerUpi', 'notes'];
export const publicProduct = p => Object.fromEntries(Object.entries(p).filter(([k]) => !PRIVATE.includes(k)));
/** SEO-friendly product URL: /p/<name>-<id> */
export const slugify = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
export const productSlug = p => slugify(p.name) + '-' + p.id;
export const SITE = 'https://www.snazzify.co.in';
export const isLive = (p, now = Date.now()) => { const a = Date.parse(p.addedAt); return a <= now && a + LIFE_MS > now; };
/** Products customers may see right now (hides test items and the Guess-the-Price product until it's revealed). */
export async function publicCatalogue(env, now = Date.now()) {
  const [list, s] = await Promise.all([getCatalogue(env), getSettings(env)]);
  const g = guessState(s.guess, now);
  return list.filter(p => !(g.on && !g.revealed && p.id === s.guess.pid));
}
const IST_OFF = 5.5 * 3600e3;
export const istDay = (t = Date.now()) => new Date(t + IST_OFF).toISOString().slice(0, 10);
export const istTime = (day, hour) => Date.parse(day + 'T00:00:00Z') - IST_OFF + hour * 3600e3;
export function guessState(g, now = Date.now()) {
  if (!g || !g.on || !g.pid || !g.day) return { on: false };
  const closesAt = istTime(g.day, g.revealHour), endsAt = istTime(g.day, 24) + 24 * 3600e3; // reveal shown until end of next day
  if (now >= endsAt) return { on: false };
  return { on: true, open: now < closesAt, revealed: now >= closesAt, closesAt };
}

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
    try { await afterPaid(env, o); } catch (e) { console.log('afterPaid', e && e.message); }
  }
  return o;
}
/** Side effects of a successful payment: Price Drop Live item sold, Drop Squad membership. */
async function afterPaid(env, o) {
  if (o.auctionId) {
    const a = await env.STORE.get('auction', 'json');
    if (a && a.id === o.auctionId && a.status !== 'sold') {
      a.status = 'sold'; a.soldPrice = o.amount; a.soldRef = o.ref; a.soldAt = Date.now(); a.soldTo = o.customer.name.split(' ')[0] + ', ' + o.customer.city;
      await env.STORE.put('auction', JSON.stringify(a));
    }
  }
  if (o.squad) {
    const d = await db(env);
    if (d) await d.prepare('INSERT OR IGNORE INTO squad_members (code, ref, name, phone, amount, at) VALUES (?,?,?,?,?,?)')
      .bind(o.squad, o.ref, o.customer.name, o.customer.phone, o.amount, Date.now()).run();
  }
}
/** Private link tokens (review page, pay-again link) derived from a server secret. */
export const linkToken = async (env, kind, ref) => (await hmacHex(env.ADMIN_PASSWORD || env.RAZORPAY_KEY_SECRET || 'snz', kind + ':' + ref)).slice(0, 16);

// ---------- settings (admin switches) ----------
export const DEFAULT_FLASH = { on: false, startHour: 10, endHour: 22, every: 120, minutes: 30, minPct: 5, maxPct: 25, count: 3 };
export const DEFAULT_TRYON = { on: false, perDevice: 5 };
export const DEFAULT_LOOK = { on: true, pct: 5 };
export const OUTFIT_CATS = ['Suits & Sets', 'Sarees'];
export const LOOK_CATS = ['Jewellery', 'Bags', 'Accessories'];
export const DEFAULT_SQUAD = { on: false, size: 3, cashback: 100, hours: 48 };
export const DEFAULT_GUESS = { on: false, pid: '', day: '', revealHour: 21, prize: '₹250 Snazzify voucher' };
export const DEFAULT_SETTINGS = { seeBeforePay: false, flash: DEFAULT_FLASH, tryon: DEFAULT_TRYON, look: DEFAULT_LOOK, squad: DEFAULT_SQUAD, guess: DEFAULT_GUESS, coupons: [] };
export async function getSettings(env) {
  const s = env.STORE ? await env.STORE.get('settings', 'json') : null;
  const m = (k, d) => ({ ...d, ...((s && s[k]) || {}) });
  return { ...DEFAULT_SETTINGS, ...(s || {}), flash: m('flash', DEFAULT_FLASH), tryon: m('tryon', DEFAULT_TRYON), look: m('look', DEFAULT_LOOK),
    squad: m('squad', DEFAULT_SQUAD), guess: m('guess', DEFAULT_GUESS), coupons: (s && Array.isArray(s.coupons)) ? s.coupons : [] };
}
/** Find a usable coupon. Coupons: {code, pct, amt, min, until, on} */
export function findCoupon(settings, code, now = Date.now()) {
  code = String(code || '').trim().toUpperCase();
  if (!code) return null;
  const c = settings.coupons.find(x => x.code === code);
  if (!c || c.on === false || (c.until && Date.parse(c.until) < now)) return null;
  return c;
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
export async function priceBag(env, items, code) {
  const catalogue = await getCatalogue(env);
  const now = Date.now();
  const flash = await flashDealsForCheckout(env, catalogue, now);
  const look = env.STORE ? (await getSettings(env)).look : DEFAULT_LOOK;
  const hasOutfit = Array.isArray(items) && items.some(it => { const p = catalogue.find(x => x.id === it.id); return p && OUTFIT_CATS.includes(p.cat); });
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
    const deal = flash[p.id];
    // "Complete the look": jewellery/bags/accessories bought with a suit or saree get look.pct% off (not on top of a flash deal)
    const lookOff = !deal && look.on && hasOutfit && LOOK_CATS.includes(p.cat);
    const price = deal ? deal.price : lookOff ? Math.round(p.price * (100 - look.pct) / 100) : p.price;
    amount += price * qty;
    lines.push(`${p.code}${size ? ' / ' + size : ''}${colour ? ' / ' + colour : ''} x${qty} @${price}${deal ? ' (' + deal.pct + '% flash)' : lookOff ? ' (look ' + look.pct + '%)' : ''}`);
    orderItems.push({ id: p.id, code: p.code, name: p.name, img: p.img, size, colour, qty, price, listPrice: p.price, flashPct: deal ? deal.pct : undefined, lookPct: lookOff ? look.pct : undefined,
      cost: p.cost ?? null, ship: p.ship ?? null, sellerName: p.sellerName || '', sellerPhone: p.sellerPhone || '', sellerUpi: p.sellerUpi || '' });
  }
  const out = { amount, lines, orderItems };
  // Coupon or Drop Squad code typed at checkout
  code = String(code || '').trim().toUpperCase().slice(0, 20);
  if (code) {
    const s = await getSettings(env);
    const cp = findCoupon(s, code);
    if (cp) {
      const eligible = orderItems.filter(i => !i.flashPct && !i.lookPct).reduce((a, i) => a + (i.price - (i.ship || 0)) * i.qty, 0);
      if (amount < (cp.min || 0)) return { error: `Code ${code} needs a bag of ₹${cp.min} or more.`, status: 400 };
      let off = cp.pct ? Math.round(eligible * cp.pct / 100) : Math.min(cp.amt || 0, eligible);
      const floor = orderItems.reduce((a, i) => a + (i.cost != null ? (i.cost + (i.ship || 0)) * i.qty : i.price * i.qty), 0); // never sell below what the seller costs us
      off = Math.max(0, Math.min(off, amount - floor));
      if (!off) return { error: `Code ${code} doesn't apply to the items in your bag (flash and look prices are already discounted).`, status: 400 };
      out.amount = amount - off; out.coupon = { code, off }; out.lines.push(`Coupon ${code} -${off}`);
    } else if (/^SQ[A-Z0-9]{4,8}$/.test(code) && s.squad.on) {
      const d = await db(env);
      const sq = d && await d.prepare('SELECT code, at FROM squads WHERE code = ?').bind(code).first();
      if (!sq) return { error: 'That squad code was not found.', status: 400 };
      if (Date.now() > sq.at + s.squad.hours * 3600e3) return { error: 'That Drop Squad has closed. You can start your own after you order!', status: 400 };
      out.squad = code; out.lines.push('Squad ' + code);
    } else return { error: `Code ${code} isn't valid.`, status: 400 };
  }
  return out;
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

// ---------- "Pick it up in 30 mins" flash deals ----------
// Every `every` minutes between startHour and endHour (IST), `count` live products get a random
// minPct–maxPct discount (steps of 5) for `minutes` minutes. The discount applies to the product
// part of the price only, so the delivery charge is never discounted. Picks are made on the server
// from a secret seed, so nobody can predict the next drop.
const IST_MS = 5.5 * 3600e3;
export function flashWindows(f, now = Date.now()) {
  const ist = new Date(now + IST_MS);
  const day0 = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - IST_MS; // IST midnight in UTC ms
  const starts = d => { const out = []; for (let m = f.startHour * 60; m < f.endHour * 60; m += f.every) out.push(d + m * 6e4); return out; };
  const today = starts(day0), tomorrow = starts(day0 + 864e5), yesterday = starts(day0 - 864e5);
  const all = [...yesterday, ...today, ...tomorrow];
  const dur = f.minutes * 6e4;
  const current = all.find(s => s <= now && now < s + dur) ?? null;
  const next = all.find(s => s > now) ?? null;
  const previous = [...all].reverse().find(s => s + dur <= now) ?? null;
  return { current, next, previous, dur };
}
function rng(seedHex) { // mulberry32, seeded from the secret hash
  let a = parseInt(seedHex.slice(0, 8), 16) >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export async function flashPicks(env, catalogue, start, f) {
  const seed = await hmacHex(env.ADMIN_PASSWORD || env.RAZORPAY_KEY_SECRET || 'snazzify', 'flash:' + start);
  const r = rng(seed);
  const live = catalogue.filter(p => !p.hidden && p.price > 9 && Date.parse(p.addedAt) <= start && Date.parse(p.addedAt) + LIFE_MS > start + f.minutes * 6e4);
  const pool = live.filter(p => p.cost != null).length >= f.count ? live.filter(p => p.cost != null) : live;
  const shuffled = pool.map(p => [r(), p]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const steps = []; for (let v = Math.ceil(f.minPct / 5) * 5; v <= f.maxPct; v += 5) steps.push(v);
  if (!steps.length) steps.push(f.minPct);
  const deals = {};
  for (const p of shuffled.slice(0, f.count)) {
    const pct = steps[Math.floor(r() * steps.length) % steps.length];
    const delivery = Number(p.ship || 0);
    let price = p.price - Math.round((p.price - delivery) * pct / 100);
    price = Math.max(1, Math.floor((price + 1) / 10) * 10 - 1); // end in 9
    deals[p.id] = { pct, price };
  }
  return deals;
}
export async function getFlash(env, catalogue, now = Date.now()) {
  const s = await getSettings(env);
  const f = s.flash;
  if (!f.on) return { on: false };
  const w = flashWindows(f, now);
  const out = { on: true, startHour: f.startHour, endHour: f.endHour, every: f.every, minutes: f.minutes, minPct: f.minPct, maxPct: f.maxPct, nextAt: w.next, live: false };
  if (w.current != null) {
    out.live = true; out.startedAt = w.current; out.endsAt = w.current + w.dur;
    out.deals = await flashPicks(env, catalogue || await getCatalogue(env), w.current, f);
  }
  return out;
}
/** Deals valid for checkout now, with a 5-minute grace after a drop ends (so a bag filled at 29:59 still checks out). */
export async function flashDealsForCheckout(env, catalogue, now = Date.now()) {
  if (!env.STORE) return {};
  const f = (await getSettings(env)).flash;
  if (!f.on) return {};
  const w = flashWindows(f, now);
  const start = w.current ?? (w.previous != null && now < w.previous + w.dur + 5 * 6e4 ? w.previous : null);
  return start == null ? {} : flashPicks(env, catalogue, start, f);
}
