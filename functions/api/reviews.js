// GET /api/reviews  — approved reviews (newest first) + overall rating.
import { json } from '../../lib/util.js';
import { db } from '../../lib/db.js';
export async function onRequestGet({ env }) {
  const d = await db(env);
  if (!d) return json({ reviews: [], count: 0, avg: 0 });
  const [list, st] = await Promise.all([
    d.prepare("SELECT id, pid, pname, pimg, name, city, stars, text, img, at FROM reviews WHERE status = 'approved' ORDER BY at DESC LIMIT 40").all(),
    d.prepare("SELECT COUNT(*) AS n, AVG(stars) AS a FROM reviews WHERE status = 'approved'").first(),
  ]);
  return json({ reviews: list.results, count: st.n || 0, avg: st.a ? Math.round(st.a * 10) / 10 : 0 }, 200, { 'cache-control': 'public, max-age=60' });
}
