// POST /api/admin/settings {seeBeforePay: true|false} — admin switches.
import { json, getSettings } from '../../../lib/util.js';
export async function onRequestGet({ env }) { return json(await getSettings(env)); }
export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const s = await getSettings(env);
  if (typeof b.seeBeforePay === 'boolean') s.seeBeforePay = b.seeBeforePay;
  if (b.tryon && typeof b.tryon === 'object') {
    const n = (v, lo, hi, d) => { v = Math.round(Number(v)); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
    s.tryon = { ...s.tryon, ...(typeof b.tryon.on === 'boolean' ? { on: b.tryon.on } : {}),
      ...('perDevice' in b.tryon ? { perDevice: n(b.tryon.perDevice, 1, 20, s.tryon.perDevice) } : {}) };
  }
  if (b.look && typeof b.look === 'object') {
    s.look = { ...s.look, ...(typeof b.look.on === 'boolean' ? { on: b.look.on } : {}),
      ...('pct' in b.look ? { pct: Math.min(30, Math.max(1, Math.round(Number(b.look.pct)) || s.look.pct)) } : {}) };
  }
  if (b.flash && typeof b.flash === 'object') {
    const f = { ...s.flash }, n = (v, lo, hi, d) => { v = Math.round(Number(v)); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
    if (typeof b.flash.on === 'boolean') f.on = b.flash.on;
    if ('startHour' in b.flash) f.startHour = n(b.flash.startHour, 0, 23, f.startHour);
    if ('endHour' in b.flash) f.endHour = n(b.flash.endHour, 1, 24, f.endHour);
    if ('every' in b.flash) f.every = n(b.flash.every, 30, 720, f.every);
    if ('minutes' in b.flash) f.minutes = n(b.flash.minutes, 5, 120, f.minutes);
    if ('minPct' in b.flash) f.minPct = n(b.flash.minPct, 1, 60, f.minPct);
    if ('maxPct' in b.flash) f.maxPct = n(b.flash.maxPct, 1, 60, f.maxPct);
    if ('count' in b.flash) f.count = n(b.flash.count, 1, 20, f.count);
    if (f.endHour <= f.startHour) return json({ error: 'End hour must be after start hour.' }, 400);
    if (f.maxPct < f.minPct) return json({ error: 'Max discount must be at least the min discount.' }, 400);
    if (f.minutes > f.every) return json({ error: 'Sale length can\'t be longer than the gap between drops.' }, 400);
    s.flash = f;
  }
  await env.STORE.put('settings', JSON.stringify(s));
  return json({ ok: true, settings: s });
}
