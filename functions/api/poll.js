// "Buy or Bye?" — ask friends on WhatsApp.
// POST /api/poll {productId}        → creates a poll, returns {id}
// GET  /api/poll?id=…               → product + live votes
// PUT  /api/poll {id, vote:'buy'|'bye'} → one vote per device
import { json, getCatalogue, publicProduct, hmacHex } from '../../lib/util.js';
const TTL = 7 * 86400;

export async function onRequestPost({ request, env }) {
  if (!env.STORE) return json({ error: 'Not available' }, 503);
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const p = (await getCatalogue(env)).find(x => x.id === b.productId);
  if (!p) return json({ error: 'Product not found' }, 404);
  const id = [...crypto.getRandomValues(new Uint8Array(6))].map(x => x.toString(36).padStart(2, '0')).join('').slice(0, 9);
  await env.STORE.put('poll:' + id, JSON.stringify({ pid: p.id, colour: String(b.colour || '').slice(0, 30), name: String(b.name || '').slice(0, 30), buy: 0, bye: 0, at: Date.now() }), { expirationTtl: TTL });
  return json({ id });
}

async function load(env, id) {
  if (!env.STORE || !/^[a-z0-9]{6,12}$/.test(id || '')) return null;
  return env.STORE.get('poll:' + id, 'json');
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
  const who = (await hmacHex(env.ADMIN_PASSWORD || 'snz', b.id + '|' + (request.headers.get('cf-connecting-ip') || '') + '|' + (request.headers.get('user-agent') || ''))).slice(0, 20);
  const k = 'pollv:' + b.id + ':' + who;
  if (!(await env.STORE.get(k))) {
    poll[b.vote]++;
    await Promise.all([env.STORE.put('poll:' + b.id, JSON.stringify(poll), { expirationTtl: TTL }), env.STORE.put(k, b.vote, { expirationTtl: TTL })]);
  }
  return json({ buy: poll.buy, bye: poll.bye });
}
