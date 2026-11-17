// GET /api/products — the public catalogue (seller names, costs and margins are removed).
import { json, publicCatalogue, publicProduct, productSlug } from '../../lib/util.js';

export async function onRequestGet({ env }) {
  const list = await publicCatalogue(env);
  return json(list.map(p => ({ ...publicProduct(p), slug: productSlug(p) })));
}
