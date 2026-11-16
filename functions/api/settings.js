// GET /api/settings — public shop switches (e.g. whether "See it before you pay" is on).
import { json, getSettings } from '../../lib/util.js';
export const onRequestGet = async ({ env }) => json(await getSettings(env));
