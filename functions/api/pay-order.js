// GET  /api/pay-order?ref=…&t=…  → what the customer is paying for (pay page)
// POST /api/pay-order {ref, t}    → creates the Razorpay order for a "See it before you pay" booking
import { json, getOrder, putOrder, razorpayOrder, safeEqual } from '../../lib/util.js';

const PAY_WINDOW_MS = 3 * 86400e3; // pay link works for 3 days after booking

async function load(env, ref, t) {
  if (!env.STORE || !ref || !t) return { error: 'This payment link is not valid.', status: 404 };
  const o = await getOrder(env, String(ref).slice(0, 30));
  if (!o || !o.payToken || !safeEqual(String(t), o.payToken)) return { error: 'This payment link is not valid.', status: 404 };
  if (!['created', 'booked', 'video_sent', 'paid', 'sent', 'seller_paid', 'shipped', 'delivered'].includes(o.status))
    return { error: 'This booking was cancelled. Message us on WhatsApp if you still want it.', status: 410 };
  return { o };
}

export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  const { o, error, status } = await load(env, u.searchParams.get('ref'), u.searchParams.get('t'));
  if (error) return json({ error }, status);
  const expired = Date.now() - Date.parse(o.createdAt) > PAY_WINDOW_MS && !['paid', 'sent', 'seller_paid', 'shipped', 'delivered'].includes(o.status);
  return json({ ref: o.ref, mode: o.mode, status: o.status, expired, amount: o.amount, firstName: o.customer.name.split(' ')[0],
    items: o.items.map(i => ({ name: i.name, img: i.img, size: i.size, colour: i.colour, qty: i.qty, price: i.price })) });
}

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return json({ error: 'Payments are not set up yet.' }, 503);
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const { o, error, status } = await load(env, b.ref, b.t);
  if (error) return json({ error }, status);
  if (!['created', 'booked', 'video_sent'].includes(o.status)) return json({ error: 'This order is already paid. Thank you!' }, 409);
  if (o.auctionId) return json({ error: 'Price Drop Live holds can\'t be paid later. Catch the next one!' }, 410);
  if (Date.now() - Date.parse(o.createdAt) > PAY_WINDOW_MS) return json({ error: 'This payment link has expired. Message us on WhatsApp and we\'ll check availability.' }, 410);

  const lines = o.items.map(i => `${i.code}${i.size ? ' / ' + i.size : ''}${i.colour ? ' / ' + i.colour : ''} x${i.qty} @${i.price}`);
  const r = await razorpayOrder(env, { amount: o.amount, ref: o.ref, c: o.customer, lines });
  if (r.error) return json({ error: r.error }, 502);
  o.rzpOrderId = r.order.id;
  await putOrder(env, o);
  await env.STORE.put('rzp:' + r.order.id, o.ref);
  return json({ orderId: r.order.id, keyId: env.RAZORPAY_KEY_ID, amount: r.order.amount, ref: o.ref,
    prefill: { name: o.customer.name, contact: '+91' + o.customer.phone, email: o.customer.email || '' } });
}
