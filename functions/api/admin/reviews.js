// GET  /api/admin/reviews           → all reviews (pending first)
// POST /api/admin/reviews {id, status: 'approved'|'rejected'}
import { json } from '../../../lib/util.js';
import { db } from '../../../lib/db.js';
export async function onRequestGet({ env }) {
  const d = await db(env);
  if (!d) return json({ reviews: [], noDb: true });
  const r = await d.prepare("SELECT * FROM reviews ORDER BY (status = 'pending') DESC, at DESC LIMIT 200").all();
  return json({ reviews: r.results });
}
export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  if (!['approved', 'rejected'].includes(b.status)) return json({ error: 'Invalid status' }, 400);
  const d = await db(env);
  await d.prepare('UPDATE reviews SET status = ? WHERE id = ?').bind(b.status, Number(b.id)).run();
  return json({ ok: true });
}
