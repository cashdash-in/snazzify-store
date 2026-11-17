// 🔥 Price Drop Live
// GET  /api/auction                 → live state (price now, held?, sold?)
// POST /api/auction {customer}      → locks the current price for 10 minutes and opens Razorpay
import { json, checkCustomer, newRef, razorpayOrder, putOrder, addToIndex, getCatalogue } from '../../lib/util.js';
import { auctionView, auctionPrice, HOLD_MIN } from '../../lib/auction.js';
import { db } from '../../lib/db.js';

export const onRequestGet = async ({ env }) => json(await auctionView(env));

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return json({ error: 'Payments are not set up yet.' }, 503);
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const c = checkCustomer(b.customer);
  if (!c) return json({ error: 'Please check your delivery details.' }, 400);
  const a = await env.STORE.get('auction', 'json');
  const now = Date.now();
  if (!a || a.status !== 'live' || now < a.startAt) return json({ error: 'This Price Drop is not live right now.' }, 409);
  const d = await db(env);
  if (!d) return json({ error: 'Not available right now.' }, 503);
  const other = await d.prepare('SELECT until FROM auction_holds WHERE aid = ? AND until > ? AND phone <> ? LIMIT 1').bind(a.id, now, c.phone).first();
  if (other) return json({ error: 'Someone is paying for it right now! If they don\'t finish in time, it comes back. Keep watching 👀', heldUntil: other.until }, 409);
  const mine = await d.prepare('SELECT price, until FROM auction_holds WHERE aid = ? AND until > ? AND phone = ? ORDER BY until DESC LIMIT 1').bind(a.id, now, c.phone).first();
  const price = mine ? mine.price : auctionPrice(a, now);
  const until = mine ? mine.until : now + HOLD_MIN * 6e4;
  const p = (await getCatalogue(env)).find(x => x.id === a.pid);
  if (!p) return json({ error: 'This piece is no longer available.' }, 410);
  const ref = newRef();
  const line = `${p.code} x1 @${price} (Price Drop Live)`;
  const { order, error } = await razorpayOrder(env, { amount: price, ref, c, lines: [line] });
  if (error) return json({ error }, 502);
  await d.prepare('INSERT INTO auction_holds (aid, ref, phone, price, until) VALUES (?,?,?,?,?)').bind(a.id, ref, c.phone, price, until).run();
  const createdAt = new Date().toISOString();
  await putOrder(env, { ref, mode: 'pay', auctionId: a.id, rzpOrderId: order.id, status: 'created', createdAt, amount: price, customer: c,
    items: [{ id: p.id, code: p.code, name: p.name, img: p.img, size: b.size || p.sizes?.[0] || '', colour: b.colour || p.colours?.[0] || '', qty: 1, price, listPrice: p.price, auction: true,
      cost: p.cost ?? null, ship: p.ship ?? null, sellerName: p.sellerName || '', sellerPhone: p.sellerPhone || '', sellerUpi: p.sellerUpi || '' }],
    history: [{ at: createdAt, status: 'created', note: `Price Drop Live: locked at ₹${price} for ${HOLD_MIN} min` }] });
  await env.STORE.put('rzp:' + order.id, ref);
  await addToIndex(env, ref);
  // Razorpay checkout itself times out with the hold, so a late payment can't sneak in.
  return json({ orderId: order.id, keyId: env.RAZORPAY_KEY_ID, amount: order.amount, ref, until, timeout: Math.max(60, Math.floor((until - now) / 1000)) });
}
