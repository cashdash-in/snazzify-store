// GET /api/flash — "Pick it up in 30 mins": is a drop live, which products, prices, and when the next one starts.
import { json, getFlash } from '../../lib/util.js';
export const onRequestGet = async ({ env }) => json({ ...(await getFlash(env)), now: Date.now() });
