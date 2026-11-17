// GET /api/track?ref=SNZ-…&phone=98…  — order status for the customer (needs the order ID and the phone used).
import { json, clean, getOrder } from '../../lib/util.js';
const LABEL = { created: 'Payment pending', booked: 'Booked — video coming', video_sent: 'Video sent — awaiting payment', paid: 'Order confirmed',
  sent: 'Being packed', seller_paid: 'Being packed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled', refunded: 'Refunded' };
const STEP = { paid: 1, sent: 2, seller_paid: 2, shipped: 3, delivered: 4 };
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  const ref = clean(u.searchParams.get('ref'), 30).toUpperCase(), phone = clean(u.searchParams.get('phone'), 13).replace(/\D/g, '').slice(-10);
  if (!env.STORE || !/^SNZ-[A-Z0-9]{4,12}$/.test(ref) || phone.length !== 10) return json({ error: 'Please enter your order ID and the mobile number you used.' }, 400);
  const o = await getOrder(env, ref);
  if (!o || o.customer.phone !== phone) return json({ error: 'We couldn\'t find that order. Check the order ID and phone number.' }, 404);
  const seen = new Set();
  return json({ ref: o.ref, status: o.status, label: LABEL[o.status] || o.status, step: STEP[o.status] || 0, amount: o.amount,
    placedAt: o.createdAt, paidAt: o.paidAt || null, shippedAt: o.shippedAt || null, deliveredAt: o.deliveredAt || null,
    courier: o.courier || '', tracking: o.tracking || '', firstName: o.customer.name.split(' ')[0], city: o.customer.city,
    items: o.items.map(i => ({ name: i.name, img: i.img, size: i.size, colour: i.colour, qty: i.qty, price: i.price })),
    history: (o.history || []).filter(h => LABEL[h.status] && !seen.has(LABEL[h.status]) && seen.add(LABEL[h.status])).map(h => ({ at: h.at, label: LABEL[h.status] })) });
}
