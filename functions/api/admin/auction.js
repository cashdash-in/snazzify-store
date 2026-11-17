// GET  /api/admin/auction  → current auction (with costs)
// POST /api/admin/auction {pid, start, floor, drop, every, startAt}  → start a new Price Drop
// POST /api/admin/auction {action:'end'}                              → end it now
import { json, getCatalogue, sellPrice } from '../../../lib/util.js';
import { auctionView } from '../../../lib/auction.js';
export async function onRequestGet({ env }) {
  const a = await env.STORE.get('auction', 'json');
  return json({ raw: a, view: await auctionView(env) });
}
export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  if (b.action === 'end') {
    const a = await env.STORE.get('auction', 'json');
    if (a && a.status === 'live') { a.status = 'ended'; await env.STORE.put('auction', JSON.stringify(a)); }
    return json({ ok: true });
  }
  const p = (await getCatalogue(env)).find(x => x.id === b.pid);
  if (!p) return json({ error: 'Pick a product.' }, 400);
  const n = v => Math.round(Number(v));
  const start = n(b.start), drop = n(b.drop), every = Math.max(1, n(b.every) || 1);
  let floor = n(b.floor);
  const minFloor = p.cost != null ? p.cost + (p.ship || 0) : 1;
  if (floor < minFloor) return json({ error: `Lowest price must be at least ₹${minFloor} (seller price + shipping) so you never lose money.` }, 400);
  if (!(start > floor)) return json({ error: 'Starting price must be higher than the lowest price.' }, 400);
  if (!(drop >= 1)) return json({ error: 'Drop amount must be at least ₹1.' }, 400);
  const startAt = b.startAt ? Date.parse(b.startAt) : Date.now();
  if (!Number.isFinite(startAt)) return json({ error: 'Invalid start time.' }, 400);
  const a = { id: 'a' + Date.now().toString(36), pid: p.id, start, floor, drop, every, startAt, status: 'live', createdAt: Date.now() };
  await env.STORE.put('auction', JSON.stringify(a));
  return json({ ok: true, auction: a, suggested: sellPrice(p.cost ?? 0, p.ship) });
}
