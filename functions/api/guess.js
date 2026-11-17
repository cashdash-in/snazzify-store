// 🎯 Guess the Price — daily game. One guess per device per day; closest guess wins (earliest wins a tie).
// GET  /api/guess?who=<deviceId>  → today's game (price hidden until reveal) or the reveal
// POST /api/guess {who, name, phone, guess}
import { json, clean, getSettings, guessState, getCatalogue, publicProduct, productSlug } from '../../lib/util.js';
import { db } from '../../lib/db.js';

export async function winner(d, day, price) {
  return d.prepare('SELECT name, phone, guess, at FROM guesses WHERE day = ? ORDER BY ABS(guess - ?) ASC, at ASC LIMIT 1').bind(day, price).first();
}
export async function onRequestGet({ request, env }) {
  const s = await getSettings(env), g = s.guess, st = guessState(g);
  if (!st.on) return json({ on: false });
  const p = (await getCatalogue(env)).find(x => x.id === g.pid);
  const d = await db(env);
  if (!p || !d) return json({ on: false });
  const who = clean(new URL(request.url).searchParams.get('who'), 40);
  const [mine, cnt] = await Promise.all([
    who ? d.prepare('SELECT guess FROM guesses WHERE day = ? AND who = ?').bind(g.day, who).first() : null,
    d.prepare('SELECT COUNT(*) AS n FROM guesses WHERE day = ?').bind(g.day).first(),
  ]);
  const { price, ...pub } = publicProduct(p);
  const out = { on: true, day: g.day, open: st.open, revealed: st.revealed, closesAt: st.closesAt, prize: g.prize, players: cnt.n,
    myGuess: mine ? mine.guess : null, product: { id: pub.id, name: pub.name, img: pub.img, imgs: pub.imgs, cat: pub.cat, details: pub.details } };
  if (st.revealed) {
    const w = await winner(d, g.day, p.price);
    out.price = p.price; out.slug = productSlug(p);
    out.winner = w ? { name: w.name.split(' ')[0], phone: '••••••' + w.phone.slice(-4), guess: w.guess } : null;
  }
  return json(out);
}
export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const s = await getSettings(env), st = guessState(s.guess);
  if (!st.on || !st.open) return json({ error: 'Guessing is closed for today. See you tomorrow!' }, 409);
  const who = clean(b.who, 40), name = clean(b.name, 40), phone = clean(b.phone, 10), guess = Math.round(Number(b.guess));
  if (!who || !name) return json({ error: 'Please add your name.' }, 400);
  if (!/^[6-9]\d{9}$/.test(phone)) return json({ error: 'Enter your 10-digit WhatsApp number so we can reach you if you win.' }, 400);
  if (!(guess >= 1 && guess <= 200000)) return json({ error: 'Enter a price in rupees.' }, 400);
  const d = await db(env);
  const dup = await d.prepare('SELECT 1 FROM guesses WHERE day = ? AND (who = ? OR phone = ?)').bind(s.guess.day, who, phone).first();
  if (dup) return json({ error: 'You have already guessed today. One guess per person!' }, 409);
  await d.prepare('INSERT INTO guesses (day, who, name, phone, guess, at) VALUES (?,?,?,?,?,?)').bind(s.guess.day, who, name, phone, guess, Date.now()).run();
  return json({ ok: true, guess });
}
