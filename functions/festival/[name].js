// /festival/<teej|gangaur|karva-chauth|wedding-season> — festival shopping pages for Google.
import { publicCatalogue as getCatalogue, isLive, SITE } from '../../lib/util.js';
import { FESTIVALS, festivalPicks } from '../../lib/festivals.js';
import { renderApp, imgUrl } from '../../lib/seo.js';
export async function onRequestGet({ params, request, env }) {
  const key = String(params.name || '').toLowerCase(), f = FESTIVALS[key];
  if (!f) return Response.redirect(SITE + '/', 302);
  const picks = festivalPicks(f, (await getCatalogue(env)).filter(p => !p.hidden && isLive(p)));
  const jsonld = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: f.title, description: f.desc, url: SITE + '/festival/' + key };
  return renderApp(env, request, { title: `${f.title} | Snazzify`, desc: f.desc, image: picks[0] ? imgUrl(picks[0].img) : SITE + '/snazzify-og.png',
    path: '/festival/' + key, jsonld, boot: { festival: key } });
}
