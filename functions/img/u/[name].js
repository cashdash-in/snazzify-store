// GET /img/u/<name> — product photos uploaded from the admin page (stored in Cloudflare KV).
export async function onRequestGet({ params, env }) {
  if (!env.STORE || !/^[\w.-]+$/.test(params.name)) return new Response('Not found', { status: 404 });
  const { value, metadata } = await env.STORE.getWithMetadata('img:' + params.name, 'arrayBuffer');
  if (!value) return new Response('Not found', { status: 404 });
  return new Response(value, { headers: { 'content-type': metadata?.type || 'image/jpeg', 'cache-control': 'public, max-age=31536000, immutable' } });
}
