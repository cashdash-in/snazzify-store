// /sitemap.xml — every live product + festival pages, for Google.
import { publicCatalogue as getCatalogue, productSlug, isLive, SITE } from '../lib/util.js';
import { FESTIVALS } from '../lib/festivals.js';
export async function onRequestGet({ env }) {
  const list = (await getCatalogue(env)).filter(p => !p.hidden && isLive(p));
  const u = (loc, mod, freq, pri) => `<url><loc>${loc}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}<changefreq>${freq}</changefreq><priority>${pri}</priority></url>`;
  const today = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` + [
    u(SITE + '/', today, 'hourly', '1.0'),
    ...Object.keys(FESTIVALS).map(k => u(SITE + '/festival/' + k, today, 'daily', '0.8')),
    ...list.map(p => u(SITE + '/p/' + productSlug(p), p.addedAt.slice(0, 10), 'daily', '0.7')),
  ].join('\n') + '\n</urlset>';
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=900' } });
}
