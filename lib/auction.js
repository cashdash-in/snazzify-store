// 🔥 Price Drop Live — one piece, the price falls every minute until someone grabs it.
// KV "auction": { id, pid, start, floor, drop, every, startAt, status: 'live'|'sold'|'ended', soldPrice, soldTo }
// A buyer who taps "Grab it" gets the current price locked for HOLD_MIN minutes while they pay.
import { getCatalogue, publicProduct } from './util.js';
import { db } from './db.js';

export const HOLD_MIN = 10;

export function auctionPrice(a, now = Date.now()) {
  const steps = Math.max(0, Math.floor((now - a.startAt) / (a.every * 6e4)));
  return Math.max(a.floor, a.start - steps * a.drop);
}

/** Public view of the auction (no costs). */
export async function auctionView(env, now = Date.now()) {
  const a = env.STORE ? await env.STORE.get('auction', 'json') : null;
  if (!a || a.status === 'ended' || (a.status === 'sold' && now - a.soldAt > 12 * 3600e3)) return { on: false };
  const p = (await getCatalogue(env)).find(x => x.id === a.pid);
  if (!p) return { on: false };
  const out = { on: true, id: a.id, status: a.status, startAt: a.startAt, start: a.start, floor: a.floor, drop: a.drop, every: a.every,
    product: publicProduct({ ...p, price: a.start }) };
  if (a.status === 'sold') return { ...out, soldPrice: a.soldPrice, soldTo: a.soldTo };
  if (now < a.startAt) return { ...out, status: 'soon', price: a.start };
  const price = auctionPrice(a, now);
  const d = await db(env);
  const hold = d && await d.prepare('SELECT until FROM auction_holds WHERE aid = ? AND until > ? ORDER BY until DESC LIMIT 1').bind(a.id, now).first();
  return { ...out, price, held: hold ? hold.until : null, atFloor: price === a.floor };
}
