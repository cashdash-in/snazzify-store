// POST /api/admin/upload  (body = the image file, already resized by the admin page)
// Stores the photo in Cloudflare KV and returns the path to use as the product's img.
import { json } from '../../../lib/util.js';

export async function onRequestPost({ request, env }) {
  const type = request.headers.get('content-type') || '';
  if (!/^image\/(jpeg|png|webp)$/.test(type)) return json({ error: 'Please upload a JPG, PNG or WebP photo.' }, 400);
  const buf = await request.arrayBuffer();
  if (buf.byteLength > 5 * 1024 * 1024) return json({ error: 'Photo is too large (max 5 MB).' }, 400);
  const ext = type.split('/')[1].replace('jpeg', 'jpg');
  const name = Date.now().toString(36) + Math.random().toString(36).slice(2, 7) + '.' + ext;
  await env.STORE.put('img:' + name, buf, { metadata: { type } });
  return json({ ok: true, img: 'u/' + name });
}
