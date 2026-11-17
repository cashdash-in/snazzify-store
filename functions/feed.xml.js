// /feed.xml — Google Merchant Center product feed (free listings on Google Shopping).
import { publicCatalogue as getCatalogue, productSlug, isLive, SITE } from '../lib/util.js';
import { esc, imgUrl } from '../lib/seo.js';
const GCAT = { Sarees: 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing > Saris & Lehengas', 'Suits & Sets': 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing',
  Jewellery: 'Apparel & Accessories > Jewelry', Bags: 'Apparel & Accessories > Handbags, Wallets & Cases > Handbags', Accessories: 'Apparel & Accessories > Clothing Accessories', 'Home & Festive': 'Home & Garden > Decor' };
export async function onRequestGet({ env }) {
  const list = (await getCatalogue(env)).filter(p => !p.hidden && isLive(p) && p.price > 9);
  const items = list.map(p => {
    const imgs = (p.imgs && p.imgs.length ? p.imgs : [p.img]);
    return `<item><g:id>${esc(p.id)}</g:id><g:title>${esc(p.name)}</g:title><g:description>${esc((p.details || []).join('. ') || p.name)}</g:description>
<g:link>${SITE}/p/${productSlug(p)}</g:link><g:image_link>${esc(imgUrl(imgs[0]))}</g:image_link>${imgs.slice(1, 10).map(i => `<g:additional_image_link>${esc(imgUrl(i))}</g:additional_image_link>`).join('')}
<g:availability>in_stock</g:availability><g:price>${p.price}.00 INR</g:price><g:condition>new</g:condition><g:brand>Snazzify</g:brand><g:identifier_exists>no</g:identifier_exists>
<g:google_product_category>${esc(GCAT[p.cat] || 'Apparel & Accessories')}</g:google_product_category><g:product_type>${esc(p.cat)}</g:product_type>
${['Sarees', 'Suits & Sets'].includes(p.cat) ? '<g:gender>female</g:gender><g:age_group>adult</g:age_group>' : ''}${p.colours?.length ? `<g:color>${esc(p.colours.slice(0, 3).join('/'))}</g:color>` : ''}${p.sizes?.length ? `<g:size>${esc(p.sizes[0])}</g:size>` : ''}
<g:shipping><g:country>IN</g:country><g:price>0.00 INR</g:price></g:shipping><g:expiration_date>${new Date(Date.parse(p.addedAt) + 7 * 864e5).toISOString().slice(0, 10)}</g:expiration_date></item>`;
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>Snazzify</title><link>${SITE}</link><description>Fresh drops every day</description>\n${items}\n</channel></rss>`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=900' } });
}
