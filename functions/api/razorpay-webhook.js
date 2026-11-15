// POST /api/razorpay-webhook
// Razorpay calls this when a payment is captured, so orders are marked paid even if the
// customer closes the browser before the confirmation screen.
// Razorpay Dashboard → Settings → Webhooks: URL https://www.snazzify.co.in/api/razorpay-webhook,
// events payment.captured + order.paid, and a secret saved in Cloudflare as RAZORPAY_WEBHOOK_SECRET.
import { json, hmacHex, safeEqual, markPaid } from '../../lib/util.js';

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return json({ ok: false, error: 'not configured' }, 503);
  const raw = await request.text();
  const sig = request.headers.get('x-razorpay-signature') || '';
  if (!safeEqual(await hmacHex(env.RAZORPAY_WEBHOOK_SECRET, raw), sig)) return json({ ok: false }, 401);

  let ev; try { ev = JSON.parse(raw); } catch { return json({ ok: false }, 400); }
  const pay = ev?.payload?.payment?.entity;
  if ((ev.event === 'payment.captured' || ev.event === 'order.paid') && pay?.order_id) {
    await markPaid(env, pay.order_id, pay.id, 'webhook');
  }
  return json({ ok: true });
}
