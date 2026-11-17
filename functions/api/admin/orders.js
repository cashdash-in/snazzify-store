// GET  /api/admin/orders            → all orders (newest first) + summary numbers
// POST /api/admin/orders {ref, status?, tracking?, courier?, note?} → update one order
import { json, clean, STATUSES, PAID_LIKE, listOrders, getOrder, putOrder, linkToken } from '../../../lib/util.js';

const IST = 5.5 * 3600e3;
const istDay = t => new Date(new Date(t).getTime() + IST).toISOString().slice(0, 10);

function summarise(orders) {
  const today = istDay(Date.now());
  const since = d => Date.now() - d * 864e5;
  const bucket = () => ({ orders: 0, sales: 0, profit: 0, profitKnown: true });
  const s = { today: bucket(), d7: bucket(), d30: bucket(), all: bucket(), byStatus: {} };
  for (const o of orders) {
    s.byStatus[o.status] = (s.byStatus[o.status] || 0) + 1;
    if (!PAID_LIKE.has(o.status)) continue;
    const t = Date.parse(o.paidAt || o.createdAt);
    let profit = 0, known = true;
    for (const i of o.items) {
      if (i.cost == null) { known = false; continue; }
      profit += (i.price - i.cost - (i.ship || 0)) * i.qty;
    }
    const add = b => { b.orders++; b.sales += o.amount; b.profit += profit; if (!known) b.profitKnown = false; };
    add(s.all);
    if (t >= since(30)) add(s.d30);
    if (t >= since(7)) add(s.d7);
    if (istDay(t) === today) add(s.today);
  }
  return s;
}

export async function onRequestGet({ env }) {
  const orders = await listOrders(env);
  // private links the admin sends on WhatsApp: review page for shipped/delivered orders
  await Promise.all(orders.filter(o => ['shipped', 'delivered'].includes(o.status)).map(async o => { o.reviewToken = await linkToken(env, 'review', o.ref); }));
  return json({ orders, summary: summarise(orders) });
}

export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const o = await getOrder(env, clean(b.ref, 30));
  if (!o) return json({ error: 'Order not found' }, 404);
  const at = new Date().toISOString();
  if (b.tracking !== undefined) o.tracking = clean(b.tracking, 80);
  if (b.courier !== undefined) o.courier = clean(b.courier, 40);
  if (b.status) {
    if (!STATUSES.includes(b.status)) return json({ error: 'Unknown status' }, 400);
    if (b.status !== o.status) {
      o.status = b.status; o[b.status + 'At'] = at;
      o.history = [...(o.history || []), { at, status: b.status, note: clean(b.note, 200) }];
    }
  } else if (b.note) {
    if (b.reminded) o.reminded = at;
    o.history = [...(o.history || []), { at, status: o.status, note: clean(b.note, 200) }];
  }
  await putOrder(env, o);
  return json({ ok: true, order: o });
}
