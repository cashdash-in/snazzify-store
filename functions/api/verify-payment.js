// POST /api/verify-payment
// Checks Razorpay's signature so a payment can't be faked from the browser.
// signature = HMAC_SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false }, 400); }
  const { razorpay_order_id: oid, razorpay_payment_id: pid, razorpay_signature: sig } = b || {};
  if (!oid || !pid || !sig || !env.RAZORPAY_KEY_SECRET) return json({ ok: false }, 400);

  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.RAZORPAY_KEY_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${oid}|${pid}`));
  const hex = [...new Uint8Array(mac)].map(x => x.toString(16).padStart(2, '0')).join('');

  // constant-time compare
  let diff = hex.length ^ sig.length;
  for (let i = 0; i < Math.min(hex.length, sig.length); i++) diff |= hex.charCodeAt(i) ^ sig.charCodeAt(i);
  return json({ ok: diff === 0 });
}
