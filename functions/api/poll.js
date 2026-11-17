// "Buy or Bye?" — ask friends on WhatsApp. Stored in D1 (high write volume); older KV polls still readable.
// POST /api/poll {productId}        → creates a poll, returns {id}
// GET  /api/poll?id=…               → product + live votes
// PUT  /api/poll {id, vote:'buy'|'bye'} → one vote per device
import { json, getCatalogue, publicProduct, hmacHex } from '../../lib/util.js';
import { db } from '../../lib/db.js';
const TTL_MS = 7 * 864e5;

export async function onRequestPost({ request, env }) {
  const d = await db(env);
  if (!d) return json({ error: 'Not available' }, 503);
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const p = (await getCatalogue(env)).find(x => x.id === b.productId);
  if (!p) return json({ error: 'Product not found' }, 404);
  const id = [...crypto.getRandomValues(new Uint8Array(6))].map(x => x.toString(36).padStart(2, '0')).join('').slice(0, 9);
  await d.prepare('INSERT INTO polls (id, pid, colour, name, buy, bye, at) VALUES (?,?,?,?,0,0,?)')
    .bind(id, p.id, String(b.colour || '').slice(0, 30), String(b.name || '').slice(0, 30), Date.now()).run();
  return json({ id });
}

async function load(env, id) {
  if (!/^[a-z0-9]{6,12}$/.test(id || '')) return null;
  const d = await db(env);
  const row = d && await d.prepare('SELECT * FROM polls WHERE id = ?').bind(id).first();
  if (row) return Date.now() - row.at < TTL_MS ? { ...row, src: 'd1' } : null;
  const kv = env.STORE && await env.STORE.get('poll:' + id, 'json');
  return kv ? { ...kv, src: 'kv' } : null;
}

export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get('id');
  const poll = await load(env, id);
  if (!poll) return json({ error: 'This poll has ended.' }, 404);
  const p = (await getCatalogue(env)).find(x => x.id === poll.pid);
  return json({ id, buy: poll.buy, bye: poll.bye, name: poll.name, colour: poll.colour, product: p ? publicProduct(p) : null });
}

export async function onRequestPut({ request, env }) {
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const poll = await load(env, b.id);
  if (!poll) return json({ error: 'This poll has ended.' }, 404);
  if (!['buy', 'bye'].includes(b.vote)) return json({ error: 'Invalid vote' }, 400);
  if (poll.src === 'kv') return json({ buy: poll.buy, bye: poll.bye }); // old polls are read-only
  const who = (await hmacHex(env.ADMIN_PASSWORD || 'snz', b.id + '|' + (request.headers.get('cf-connecting-ip') || '') + '|' + (request.headers.get('user-agent') || ''))).slice(0, 20);
  const d = await db(env);
  const ins = await d.prepare('INSERT OR IGNORE INTO poll_votes (poll, who, vote) VALUES (?,?,?)').bind(b.id, who, b.vote).run();
  if (ins.meta.changes) await d.prepare(`UPDATE polls SET ${b.vote} = ${b.vote} + 1 WHERE id = ?`).bind(b.id).run();
  const r = await d.prepare('SELECT buy, bye FROM polls WHERE id = ?').bind(b.id).first();
  return json({ buy: r.buy, bye: r.bye });
}
