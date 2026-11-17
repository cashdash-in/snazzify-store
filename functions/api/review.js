// Reviews with photos, from customers whose order was delivered.
// GET  /api/review?ref=…&t=…  → the order's items (for the review page)
// POST /api/review {ref, t, pid, stars, text, city, photo?: dataURL}  → saved as "pending" until approved in admin
import { json, clean, getOrder, linkToken, safeEqual } from '../../lib/util.js';
import { db } from '../../lib/db.js';

async function load(env, ref, t) {
  ref = clean(ref, 30);
  if (!env.STORE || !ref || !t || !safeEqual(String(t), await linkToken(env, 'review', ref))) return null;
  const o = await getOrder(env, ref);
  return o && ['shipped', 'delivered'].includes(o.status) ? o : null;
}
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  const o = await load(env, u.searchParams.get('ref'), u.searchParams.get('t'));
  if (!o) return json({ error: 'This review link is not valid.' }, 404);
  const d = await db(env);
  const done = d ? (await d.prepare('SELECT pid FROM reviews WHERE ref = ?').bind(o.ref).all()).results.map(r => r.pid) : [];
  const items = []; const seen = new Set();
  for (const i of o.items) if (!seen.has(i.id)) { seen.add(i.id); items.push({ id: i.id, name: i.name, img: i.img, done: done.includes(i.id) }); }
  return json({ ref: o.ref, firstName: o.customer.name.split(' ')[0], city: o.customer.city, items });
}
export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const o = await load(env, b.ref, b.t);
  if (!o) return json({ error: 'This review link is not valid.' }, 404);
  const it = o.items.find(i => i.id === b.pid);
  if (!it) return json({ error: 'Pick the product you are reviewing.' }, 400);
  const stars = Math.round(Number(b.stars));
  if (!(stars >= 1 && stars <= 5)) return json({ error: 'Please choose 1 to 5 stars.' }, 400);
  const text = clean(b.text, 600);
  if (text.length < 3) return json({ error: 'Please write a few words.' }, 400);
  const d = await db(env);
  if (!d) return json({ error: 'Reviews are not available right now.' }, 503);
  if (await d.prepare('SELECT id FROM reviews WHERE ref = ? AND pid = ?').bind(o.ref, it.id).first()) return json({ error: 'You already reviewed this piece. Thank you!' }, 409);
  let img = '';
  const m = typeof b.photo === 'string' && b.photo.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (m) {
    const bin = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0));
    if (bin.byteLength > 1.5 * 1024 * 1024) return json({ error: 'Photo is too large.' }, 400);
    const name = 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + '.' + m[1].replace('jpeg', 'jpg');
    await env.STORE.put('img:' + name, bin, { metadata: { type: 'image/' + m[1] } });
    img = 'u/' + name;
  }
  await d.prepare('INSERT INTO reviews (ref, pid, pname, pimg, name, city, stars, text, img, status, at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .bind(o.ref, it.id, it.name, it.img, o.customer.name.split(' ')[0], clean(b.city, 40) || o.customer.city, stars, text, img, 'pending', Date.now()).run();
  return json({ ok: true });
}
