// POST /api/create-order — pay-now checkout.
// Prices the bag on the server (customers can't change prices), creates the Razorpay order,
// and saves the order (status "created") so the admin page can track it once paid.
import { json, checkCustomer, priceBag, newRef, razorpayOrder, putOrder, addToIndex } from '../../lib/util.js';

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET)
    return json({ error: 'Payments are not set up yet. Please try again shortly.' }, 503);
  let body; try { body = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }

  const c = checkCustomer(body.customer);
  if (!c) return json({ error: 'Please check your delivery details.' }, 400);
  const bag = await priceBag(env, body.items);
  if (bag.error) return json({ error: bag.error }, bag.status);

  const ref = newRef();
  const { order, error } = await razorpayOrder(env, { amount: bag.amount, ref, c, lines: bag.lines });
  if (error) return json({ error }, 502);

  if (env.STORE) {
    const createdAt = new Date().toISOString();
    await putOrder(env, { ref, mode: 'pay', rzpOrderId: order.id, status: 'created', createdAt, amount: bag.amount, customer: c,
      items: bag.orderItems, history: [{ at: createdAt, status: 'created', note: 'Checkout started' }] });
    await env.STORE.put('rzp:' + order.id, ref);
    await addToIndex(env, ref);
  }
  return json({ orderId: order.id, keyId: env.RAZORPAY_KEY_ID, amount: order.amount, ref });
}
