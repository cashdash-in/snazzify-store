// POST /api/tryon {productId, colour?, image: "data:image/jpeg;base64,..."}
// "Try Me On": sends the customer's photo + the product photo to the FASHN try-on model (via fal.ai)
// and returns the result straight back. Nothing is stored by Snazzify, and sync_mode keeps the
// result out of the AI provider's request history. Limited per device and per day to control cost.
// Needs Cloudflare secret FAL_KEY and the admin switch "Try Me On" ON.
import { json, getSettings, getCatalogue, hmacHex, OUTFIT_CATS } from '../../lib/util.js';

export async function onRequestPost({ request, env }) {
  const s = await getSettings(env);
  if (!env.STORE || !s.tryon.on || !env.FAL_KEY) return json({ error: 'Try Me On is not available right now.' }, 503);
  let b; try { b = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const img = String(b.image || '');
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(img) || img.length > 3_000_000) return json({ error: 'Please use a clear photo (JPG or PNG).' }, 400);

  const p = (await getCatalogue(env)).find(x => x.id === b.productId);
  if (!p || !OUTFIT_CATS.includes(p.cat)) return json({ error: 'Try Me On works on suits and sarees.' }, 400);
  const garment = (b.colour && p.colourImg && p.colourImg[b.colour]) || p.img;

  // limits: per device (IP + browser) and for the whole shop, per IST day
  const day = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
  const who = (await hmacHex(env.ADMIN_PASSWORD || 'snz', (request.headers.get('cf-connecting-ip') || '') + '|' + (request.headers.get('user-agent') || ''))).slice(0, 24);
  const kDev = `tryon:${day}:${who}`, kAll = `tryon:${day}:all`;
  const [usedDev, usedAll] = await Promise.all([env.STORE.get(kDev), env.STORE.get(kAll)]).then(v => v.map(x => Number(x) || 0));
  if (usedDev >= s.tryon.perDevice) return json({ error: `You've used today's ${s.tryon.perDevice} free try-ons. Come back tomorrow!` }, 429);
  if (usedAll >= s.tryon.dailyCap) return json({ error: 'Try Me On is very busy today. Please try again tomorrow!' }, 429);

  const origin = new URL(request.url).origin;
  let out;
  try {
    const r = await fetch(env.FAL_API || 'https://fal.run/fal-ai/fashn/tryon/v1.6', {
      method: 'POST',
      headers: { authorization: 'Key ' + env.FAL_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ model_image: img, garment_image: `${origin}/img/${garment}`, category: 'one-pieces',
        garment_photo_type: 'model', mode: 'balanced', output_format: 'jpeg', sync_mode: true, num_samples: 1 }),
    });
    out = await r.json();
    if (!r.ok || !out?.images?.[0]?.url) return json({ error: 'Could not create your try-on. Try a brighter, front-facing, full-length photo.' }, 502);
  } catch { return json({ error: 'Try Me On is busy. Please try again in a minute.' }, 502); }

  await Promise.all([env.STORE.put(kDev, String(usedDev + 1), { expirationTtl: 2 * 86400 }), env.STORE.put(kAll, String(usedAll + 1), { expirationTtl: 2 * 86400 })]);
  return json({ image: out.images[0].url, left: s.tryon.perDevice - usedDev - 1 });
}
