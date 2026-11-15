// Protects every /api/admin/* route except login.
import { json, isAdmin } from '../../../lib/util.js';

export async function onRequest(ctx) {
  const path = new URL(ctx.request.url).pathname;
  if (!ctx.env.STORE) return json({ error: 'Storage is not set up yet (KV binding STORE missing).' }, 503);
  if (!ctx.env.ADMIN_PASSWORD) return json({ error: 'ADMIN_PASSWORD is not set up yet.' }, 503);
  if (path.endsWith('/login')) return ctx.next();
  if (!(await isAdmin(ctx.request, ctx.env))) return json({ error: 'Please log in' }, 401);
  return ctx.next();
}
