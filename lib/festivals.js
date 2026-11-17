// Festival landing pages (/festival/<slug>) — written for Google searches like "teej outfits online".
export const FESTIVALS = {
  teej: { name: 'Teej', title: 'Teej Outfits & Lehariya Suits Online', emoji: '🌿',
    desc: 'Shop Teej outfits online: lehariya and bandhej suits, sarees, bangles and festive jewellery. Fresh drops daily, free shipping across India.',
    intro: 'Greens, lehariya prints, mehendi-ready jewellery and everything you need for the swing. Every piece is live for 7 days only.',
    cats: ['Suits & Sets', 'Sarees', 'Jewellery', 'Accessories'], words: ['lehariya', 'leheriya', 'bandhej', 'green', 'teej', 'bangle', 'chunri'] },
  gangaur: { name: 'Gangaur', title: 'Gangaur Poshak, Rajputi Suits & Jewellery Online', emoji: '🪷',
    desc: 'Shop for Gangaur: Rajputi poshak, odhnas, sarees and traditional jewellery from makers in Rajasthan. New drops daily, free shipping across India.',
    intro: 'Rajputi suits, gota-patti odhnas and temple jewellery for Gangaur puja and the procession.',
    cats: ['Suits & Sets', 'Sarees', 'Jewellery', 'Home & Festive'], words: ['rajputi', 'poshak', 'odhna', 'gota', 'magji', 'upada', 'pooja', 'puja'] },
  'karva-chauth': { name: 'Karva Chauth', title: 'Karva Chauth Sarees, Suits & Jewellery Online', emoji: '🌙',
    desc: 'Karva Chauth shopping: red and festive sarees, suits, jewellery and pooja essentials. Prepaid, free shipping across India.',
    intro: 'Reds, rani pinks and gold for the moonrise, plus pooja thali essentials. Grab them before they leave in 7 days.',
    cats: ['Sarees', 'Suits & Sets', 'Jewellery', 'Home & Festive'], words: ['red', 'rani', 'maroon', 'gold', 'karva', 'thali', 'pooja', 'bridal'] },
  'wedding-season': { name: 'Wedding Season', title: 'Wedding Guest Outfits: Sarees, Sets & Potli Bags', emoji: '💍',
    desc: 'Wedding guest outfits online: festive sarees, suits, statement jewellery and potli bags for haldi, mehendi and sangeet. Free shipping across India.',
    intro: 'Haldi yellows, mehendi greens and sangeet sparkle: outfits, potlis and jewellery for every function on the card.',
    cats: ['Sarees', 'Suits & Sets', 'Jewellery', 'Bags', 'Accessories'], words: ['wedding', 'bridal', 'potli', 'haldi', 'mehendi', 'sangeet', 'silk', 'zari', 'heavy'] },
};
export function festivalPicks(f, products) {
  const score = p => { const t = (p.name + ' ' + (p.details || []).join(' ') + ' ' + (p.colours || []).join(' ')).toLowerCase(); return f.words.reduce((a, w) => a + (t.includes(w) ? 1 : 0), 0); };
  return products.filter(p => f.cats.includes(p.cat)).map(p => [score(p), p]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
}
