// POST /api/book — "See it before you pay": the customer books with no payment.
// Snazzify gets a video of the exact piece from the seller, sends it on WhatsApp with a pay link,
// and the customer pays only if they love it. Works only while the admin switch is ON.
import { json, checkCustomer, priceBag, newRef, putOrder, addToIndex, getSettings } from '../../lib/util.js';

export async function onRequestPost({ request, env }) {
  if (!env.STORE || !(await getSettings(env)).seeBeforePay)
    return json({ error: 'This option is not available right now. Please pay online.' }, 403);
  let body; try { body = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }

  const c = checkCustomer(body.customer);
  if (!c) return json({ error: 'Please check your delivery details.' }, 400);
  const bag = await priceBag(env, body.items);
  if (bag.error) return json({ error: bag.error }, bag.status);

  // simple abuse guard: max 3 open bookings per phone number
  const open = Number(await env.STORE.get('bookings:' + c.phone)) || 0;
  if (open >= 3) return json({ error: 'You already have bookings waiting. Please pay for those first, or message us on WhatsApp.' }, 429);

  const ref = newRef();
  const payToken = [...crypto.getRandomValues(new Uint8Array(9))].map(b => b.toString(36).padStart(2, '0')).join('').slice(0, 14);
  const createdAt = new Date().toISOString();
  await putOrder(env, { ref, mode: 'see', payToken, status: 'booked', createdAt, amount: bag.amount, customer: c, items: bag.orderItems,
    history: [{ at: createdAt, status: 'booked', note: 'Booked with "See it before you pay"' }] });
  await addToIndex(env, ref);
  await env.STORE.put('bookings:' + c.phone, String(open + 1), { expirationTtl: 3 * 86400 });
  return json({ ok: true, ref });
}
