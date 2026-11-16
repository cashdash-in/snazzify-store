// GET    /api/admin/products          → full catalogue incl. costs, sellers, expired items
// POST   /api/admin/products {product} → create or update (price auto = (cost+ship)×1.3 → ends in 9, unless given)
// DELETE /api/admin/products?id=…      → remove
import { json, clean, getCatalogue, saveCatalogue, sellPrice } from '../../../lib/util.js';

const CATS = ['Sarees', 'Suits & Sets', 'Jewellery', 'Bags', 'Accessories', 'Home & Festive'];
const list = (v, n = 12) => (Array.isArray(v) ? v : String(v || '').split(','))
  .map(s => clean(s, 40)).filter(Boolean).slice(0, n);

export async function onRequestGet({ env }) {
  return json(await getCatalogue(env));
}

export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const p = b.product || {};
  const cat = await getCatalogue(env);
  const existing = p.id ? cat.find(x => x.id === p.id) : null;

  const cost = p.cost === '' || p.cost == null ? null : Math.max(0, Number(p.cost));
  const ship = Math.max(0, Number(p.ship || 0));
  let price = Number(p.price);
  if (!(price > 0)) price = cost != null ? sellPrice(cost, ship) : 0;
  const name = clean(p.name, 90);
  if (!name) return json({ error: 'Please add a product name.' }, 400);
  if (!(price > 0)) return json({ error: 'Please add the seller price or a selling price.' }, 400);
  if (!p.img) return json({ error: 'Please add a photo.' }, 400);

  const id = existing?.id || 'p' + Date.now().toString(36);
  const prefix = { Sarees: 'SZ', 'Suits & Sets': 'ST', Jewellery: 'JW', Bags: 'BG', Accessories: 'AC', 'Home & Festive': 'HF' }[p.cat] || 'SN';
  const item = {
    ...(existing || {}),
    id, name,
    code: clean(p.code, 20) || existing?.code || `${prefix}-${String(cat.length + 1).padStart(3, '0')}${Math.floor(Math.random() * 9)}`,
    cat: CATS.includes(p.cat) ? p.cat : 'Home & Festive',
    price: Math.round(price), cost, ship,
    img: clean(p.img, 120),
    addedAt: p.addedAt && !isNaN(Date.parse(p.addedAt)) ? new Date(p.addedAt).toISOString() : (existing?.addedAt || new Date().toISOString()),
    sizes: list(p.sizes), colours: list(p.colours),
    details: String(Array.isArray(p.details) ? p.details.join('\n') : p.details || '').split('\n').map(s => clean(s, 160)).filter(Boolean).slice(0, 10),
    sellerName: clean(p.sellerName, 60), sellerPhone: clean(p.sellerPhone, 15).replace(/\D/g, ''), sellerUpi: clean(p.sellerUpi, 60),
    hidden: !!p.hidden, lead: clean(p.lead, 140) || undefined,
  };
  if (!item.sizes.length) delete item.sizes;
  if (!item.colours.length) delete item.colours;

  const next = existing ? cat.map(x => (x.id === id ? item : x)) : [item, ...cat];
  await saveCatalogue(env, next);
  return json({ ok: true, product: item });
}

export async function onRequestDelete({ request, env }) {
  const id = new URL(request.url).searchParams.get('id');
  const cat = await getCatalogue(env);
  await saveCatalogue(env, cat.filter(x => x.id !== id));
  const del = (await env.STORE.get('products:deleted', 'json')) || [];
  if (id && !del.includes(id)) { del.push(id); await env.STORE.put('products:deleted', JSON.stringify(del.slice(-2000))); }
  return json({ ok: true });
}
