// GET /api/settings — public shop switches.
import { json, getSettings } from '../../lib/util.js';
export const onRequestGet = async ({ env }) => {
  const s = await getSettings(env);
  return json({ seeBeforePay: s.seeBeforePay, look: s.look, tryon: { on: !!(s.tryon.on && env.FAL_KEY), perDevice: s.tryon.perDevice } });
};
