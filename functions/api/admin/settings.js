// POST /api/admin/settings {seeBeforePay: true|false} — admin switches.
import { json, getSettings } from '../../../lib/util.js';
export async function onRequestGet({ env }) { return json(await getSettings(env)); }
export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const s = await getSettings(env);
  if (typeof b.seeBeforePay === 'boolean') s.seeBeforePay = b.seeBeforePay;
  await env.STORE.put('settings', JSON.stringify(s));
  return json({ ok: true, settings: s });
}
