// POST /api/quote {items, code} — checks a coupon / Drop Squad code and returns the new total.
import { json, priceBag } from '../../lib/util.js';
export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const bag = await priceBag(env, b.items, b.code);
  if (bag.error) return json({ error: bag.error }, bag.status);
  return json({ amount: bag.amount, coupon: bag.coupon || null, squad: bag.squad || null });
}
