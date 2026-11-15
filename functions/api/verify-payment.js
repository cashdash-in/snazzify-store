// POST /api/verify-payment
// Checks Razorpay's signature so a payment can't be faked from the browser, then marks the order paid.
// signature = HMAC_SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)
import { json, hmacHex, safeEqual, markPaid } from '../../lib/util.js';

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false }, 400); }
  const { razorpay_order_id: oid, razorpay_payment_id: pid, razorpay_signature: sig } = b || {};
  if (!oid || !pid || !sig || !env.RAZORPAY_KEY_SECRET) return json({ ok: false }, 400);
  const ok = safeEqual(await hmacHex(env.RAZORPAY_KEY_SECRET, `${oid}|${pid}`), String(sig));
  if (ok) await markPaid(env, oid, pid, 'checkout');
  return json({ ok });
}
