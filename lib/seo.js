// Server-side SEO: puts a real <title>, description, link preview (Open Graph) and Google structured data
// into the app page, so product and festival links rank on Google and look great when shared on WhatsApp.
import { SITE } from './util.js';
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const imgUrl = img => SITE + '/img/' + img;

export async function renderApp(env, request, { title, desc, image, path, jsonld, boot, noindex, status = 200 }) {
  const res = await env.ASSETS.fetch(new URL('/', request.url));
  let html = await res.text();
  const url = SITE + path;
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(desc)}">`)
    .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${esc(image)}">`)
    .replace('</head>', [
      `<link rel="canonical" href="${esc(url)}">`,
      `<meta property="og:url" content="${esc(url)}"><meta property="og:type" content="${jsonld && jsonld['@type'] === 'Product' ? 'product' : 'website'}"><meta property="og:site_name" content="Snazzify">`,
      `<meta name="twitter:card" content="summary_large_image">`,
      noindex ? '<meta name="robots" content="noindex">' : '',
      jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : '',
      boot ? `<script>window.BOOT=${JSON.stringify(boot).replace(/</g, '\\u003c')}</script>` : '',
      '</head>'].join('\n'));
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}
