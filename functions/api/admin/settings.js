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
  const n2 = (v, lo, hi, d) => { v = Math.round(Number(v)); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
  if (b.squad && typeof b.squad === 'object') {
    const q = { ...s.squad };
    if (typeof b.squad.on === 'boolean') q.on = b.squad.on;
    if ('size' in b.squad) q.size = n2(b.squad.size, 2, 10, q.size);
    if ('cashback' in b.squad) q.cashback = n2(b.squad.cashback, 10, 2000, q.cashback);
    if ('hours' in b.squad) q.hours = n2(b.squad.hours, 1, 168, q.hours);
    s.squad = q;
  }
  if (b.guess && typeof b.guess === 'object') {
    const g = { ...s.guess };
    if (typeof b.guess.on === 'boolean') g.on = b.guess.on;
    if ('pid' in b.guess) g.pid = String(b.guess.pid || '').slice(0, 40);
    if ('day' in b.guess) { if (b.guess.day && !/^\d{4}-\d{2}-\d{2}$/.test(b.guess.day)) return json({ error: 'Invalid date' }, 400); g.day = b.guess.day; }
    if ('revealHour' in b.guess) g.revealHour = n2(b.guess.revealHour, 1, 23, g.revealHour);
    if ('prize' in b.guess) g.prize = String(b.guess.prize || '').slice(0, 60);
    if (g.on && (!g.pid || !g.day)) return json({ error: 'Pick a product and a day first.' }, 400);
    s.guess = g;
  }
  if (Array.isArray(b.coupons)) {
    const seen = new Set(), out = [];
    for (const c of b.coupons.slice(0, 50)) {
      const code = String(c.code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20);
      if (!code || seen.has(code)) continue;
      if (/^SQ/.test(code)) return json({ error: 'Coupon codes can\'t start with SQ (used for Drop Squads).' }, 400);
      seen.add(code);
      const pct = n2(c.pct, 0, 50, 0), amt = n2(c.amt, 0, 5000, 0);
      if (!pct && !amt) return json({ error: `Coupon ${code} needs a % or ₹ discount.` }, 400);
      out.push({ code, pct, amt: pct ? 0 : amt, min: n2(c.min, 0, 100000, 0), until: c.until ? String(c.until).slice(0, 10) + 'T23:59:59+05:30' : '', on: c.on !== false });
    }
    s.coupons = out;
  }
  await env.STORE.put('settings', JSON.stringify(s));
  return json({ ok: true, settings: s });
}
