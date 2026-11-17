// /p/<product-name>-<id> — a real, Google-ready page for each product (opens the product in the app).
import { publicCatalogue as getCatalogue, productSlug, isLive, LIFE_MS, SITE } from '../../lib/util.js';
import { renderApp, imgUrl } from '../../lib/seo.js';

export async function onRequestGet({ params, request, env }) {
  const slug = String(params.slug || '').toLowerCase();
  const list = await getCatalogue(env);
  const p = list.find(x => productSlug(x) === slug) || list.find(x => slug.endsWith('-' + x.id.toLowerCase()) || slug === x.id.toLowerCase());
  if (!p || p.hidden) return Response.redirect(SITE + '/', 302);
  if (productSlug(p) !== slug) return Response.redirect(SITE + '/p/' + productSlug(p), 301);
  const live = isLive(p);
  const imgs = (p.imgs && p.imgs.length ? p.imgs : [p.img]).map(imgUrl);
  const desc = `${p.name} — ₹${p.price.toLocaleString('en-IN')}. ${(p.details || []).slice(0, 2).join('. ')}. Live for 7 days only on Snazzify. Prepaid, free shipping across India.`.slice(0, 300);
  const jsonld = { '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.code, image: imgs, description: (p.details || []).join('. ') || p.name,
    category: p.cat, brand: { '@type': 'Brand', name: 'Snazzify' },
    offers: { '@type': 'Offer', url: SITE + '/p/' + productSlug(p), priceCurrency: 'INR', price: p.price, itemCondition: 'https://schema.org/NewCondition',
      availability: live ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      priceValidUntil: new Date(Date.parse(p.addedAt) + LIFE_MS).toISOString().slice(0, 10),
      shippingDetails: { '@type': 'OfferShippingDetails', shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'INR' }, shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' } } } };
  return renderApp(env, request, { title: `${p.name} | Snazzify`, desc, image: imgs[0], path: '/p/' + productSlug(p), jsonld,
    boot: { product: p.id, gone: !live }, noindex: !live });
}
