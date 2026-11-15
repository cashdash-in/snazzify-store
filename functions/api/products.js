// GET /api/products — the public catalogue (seller names, costs and margins are removed).
import { json, getCatalogue, publicProduct } from '../../lib/util.js';

export async function onRequestGet({ env }) {
  const list = await getCatalogue(env);
  return json(list.map(publicProduct));
}
