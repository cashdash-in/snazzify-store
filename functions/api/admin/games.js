// GET  /api/admin/games  → Drop Squads (with cashback due) and Guess-the-Price results (with winner's phone)
// POST /api/admin/games {squadPaid: code, note}  → mark a squad's cashback as paid
import { json, clean, getSettings, getCatalogue, guessState } from '../../../lib/util.js';
import { db } from '../../../lib/db.js';
export async function onRequestGet({ env }) {
  const d = await db(env), s = await getSettings(env);
  if (!d) return json({ noDb: true, squads: [], guess: null });
  const sq = (await d.prepare(`SELECT s.code, s.ref, s.name, s.phone, s.at, p.at AS paidAt, p.note,
      (SELECT json_group_array(json_object('ref', ref, 'name', name, 'phone', phone, 'amount', amount, 'at', at)) FROM squad_members m WHERE m.code = s.code) AS members
    FROM squads s LEFT JOIN squad_paid p ON p.code = s.code ORDER BY s.at DESC LIMIT 100`).all()).results
    .map(r => { const seen = new Set([r.phone]); const members = JSON.parse(r.members || '[]').filter(m => !seen.has(m.phone) && seen.add(m.phone));
      return { ...r, members, complete: 1 + members.length >= s.squad.size }; });
  let guess = null;
  if (s.guess.pid && s.guess.day) {
    const p = (await getCatalogue(env)).find(x => x.id === s.guess.pid);
    const cnt = await d.prepare('SELECT COUNT(*) AS n FROM guesses WHERE day = ?').bind(s.guess.day).first();
    const st = guessState(s.guess);
    const w = p && await d.prepare('SELECT name, phone, guess, at FROM guesses WHERE day = ? ORDER BY ABS(guess - ?) ASC, at ASC LIMIT 1').bind(s.guess.day, p.price).first();
    guess = { ...s.guess, product: p ? { name: p.name, img: p.img, price: p.price } : null, players: cnt.n, state: st, winner: st.revealed || !st.on ? w : null };
  }
  return json({ squads: sq, guess });
}
export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const d = await db(env);
  if (b.squadPaid) await d.prepare('INSERT OR REPLACE INTO squad_paid (code, at, note) VALUES (?,?,?)').bind(clean(b.squadPaid, 12), Date.now(), clean(b.note, 100)).run();
  return json({ ok: true });
}
