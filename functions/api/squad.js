// 👯 Drop Squad — after paying, a customer starts a squad and shares the code. When `size` people
// (including them) have paid orders with it within `hours`, everyone gets `cashback` back.
// POST /api/squad {ref, phone}  → creates (or returns) the squad code for a paid order
// GET  /api/squad?code=SQ…      → squad progress
import { json, clean, getOrder, getSettings, hmacHex, PAID_LIKE } from '../../lib/util.js';
import { db } from '../../lib/db.js';

export async function squadInfo(d, s, code) {
  const sq = await d.prepare('SELECT * FROM squads WHERE code = ?').bind(code).first();
  if (!sq) return null;
  const m = await d.prepare('SELECT name, phone, at FROM squad_members WHERE code = ? ORDER BY at').bind(code).all();
  const seen = new Set([sq.phone]);   // each person counts once, and the starter can't join their own squad
  const members = [{ name: sq.name.split(' ')[0], at: sq.at }, ...m.results.filter(x => !seen.has(x.phone) && seen.add(x.phone)).map(x => ({ name: x.name.split(' ')[0], at: x.at }))];
  return { code, owner: sq.name.split(' ')[0], members, size: s.squad.size, cashback: s.squad.cashback, closesAt: sq.at + s.squad.hours * 3600e3, done: members.length >= s.squad.size };
}
export async function onRequestPost({ request, env }) {
  const s = await getSettings(env);
  if (!s.squad.on) return json({ error: 'Drop Squads are not running right now.' }, 403);
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const o = await getOrder(env, clean(b.ref, 30));
  if (!o || o.customer.phone !== clean(b.phone, 10) || !PAID_LIKE.has(o.status)) return json({ error: 'Only paid orders can start a squad.' }, 403);
  if (o.squad) return json({ error: 'This order already joined a squad.' }, 409);
  const d = await db(env);
  const code = 'SQ' + parseInt((await hmacHex(env.ADMIN_PASSWORD || 'snz', 'squad:' + o.ref)).slice(0, 10), 16).toString(36).toUpperCase().slice(0, 5).padStart(5, 'X');
  await d.prepare('INSERT OR IGNORE INTO squads (code, ref, name, phone, at) VALUES (?,?,?,?,?)').bind(code, o.ref, o.customer.name, o.customer.phone, Date.now()).run();
  return json(await squadInfo(d, s, code));
}
export async function onRequestGet({ request, env }) {
  const s = await getSettings(env);
  const code = clean(new URL(request.url).searchParams.get('code'), 12).toUpperCase();
  const d = await db(env);
  const info = d && /^SQ[A-Z0-9]{4,8}$/.test(code) && await squadInfo(d, s, code);
  return info ? json(info) : json({ error: 'Squad not found' }, 404);
}
