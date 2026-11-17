// GET /api/settings — public shop switches.
import { json, getSettings, guessState } from '../../lib/util.js';
export const onRequestGet = async ({ env }) => {
  const s = await getSettings(env);
  return json({ seeBeforePay: s.seeBeforePay, look: s.look, tryon: { on: !!s.tryon.on, perDevice: s.tryon.perDevice },
    squad: s.squad.on ? { on: true, size: s.squad.size, cashback: s.squad.cashback, hours: s.squad.hours } : { on: false },
    guess: { on: guessState(s.guess).on }, codes: s.coupons.some(c => c.on !== false) || s.squad.on });
};
