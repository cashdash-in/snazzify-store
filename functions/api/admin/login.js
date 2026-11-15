// POST /api/admin/login {password}  ·  DELETE /api/admin/login (log out)
import { json, safeEqual, makeSession, clearSession } from '../../../lib/util.js';

export async function onRequestPost({ request, env }) {
  let b = {}; try { b = await request.json(); } catch {}
  if (!safeEqual(String(b.password || ''), env.ADMIN_PASSWORD)) {
    await new Promise(r => setTimeout(r, 800)); // slow down guessing
    return json({ error: 'Wrong password' }, 401);
  }
  return json({ ok: true }, 200, { 'set-cookie': await makeSession(env) });
}
export const onRequestDelete = () => json({ ok: true }, 200, { 'set-cookie': clearSession() });
