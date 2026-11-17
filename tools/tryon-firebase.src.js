// Snazzify "Try Me On": Gemini image editing via Firebase AI Logic (Agent Platform / Vertex AI Gemini API backend).
// No API keys: requests are authorised by Firebase App Check (reCAPTCHA Enterprise), so only snazzify.co.in can call the AI.
// Customer photos go straight from the browser to Google and are never sent to or stored on Snazzify's servers.
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAI, getGenerativeModel, AgentPlatformBackend, ResponseModality } from 'firebase/ai';
import { firebaseConfig, RECAPTCHA_SITE_KEY, MODEL, LOCATION } from './firebase-config.js';

export const ready = () => !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId && RECAPTCHA_SITE_KEY);

let model = null;
function init() {
  if (model) return model;
  if (!ready()) throw Object.assign(new Error('Try Me On is not set up yet.'), { code: 'not-ready' });
  const app = initializeApp(firebaseConfig);
  // App Check must be initialised BEFORE any AI call.
  initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY), isTokenAutoRefreshEnabled: true });
  const ai = getAI(app, { backend: new AgentPlatformBackend(LOCATION || 'global') });
  model = getGenerativeModel(ai, {
    model: MODEL || 'gemini-3.1-flash-image',
    generationConfig: { responseModalities: [ResponseModality.TEXT, ResponseModality.IMAGE] },
  });
  return model;
}

/** Load any image (File, Blob or URL) and return base64 JPEG, max 1024 px, ~85% quality. */
export async function toJpegBase64(src, max = 1024) {
  const blob = typeof src === 'string' ? await fetch(src).then(r => { if (!r.ok) throw new Error('Could not load the product photo.'); return r.blob(); }) : src;
  const bmp = await createImageBitmap(blob);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.85).split(',')[1];
}

/** Returns a data: URL of the try-on image. Throws Error with .code = 'busy' | 'blocked' | 'no-image' | 'not-ready' | 'appcheck'. */
export async function tryOn({ personB64, garmentB64, productType }) {
  const m = init();
  const prompt = `Show the person in the first photo wearing the ${productType} from the second photo. ` +
    `Keep the person's face, body shape, skin tone, pose and background exactly the same. ` +
    `Make the fit, folds and lighting look natural. Return one photo.`;
  let res;
  try {
    res = await m.generateContent([
      { inlineData: { mimeType: 'image/jpeg', data: personB64 } },
      { inlineData: { mimeType: 'image/jpeg', data: garmentB64 } },
      { text: prompt },
    ]);
  } catch (e) {
    const msg = String(e && (e.message || e)), status = e?.customErrorData?.status;
    if (status === 429 || /429|RESOURCE_EXHAUSTED|quota|rate/i.test(msg)) throw Object.assign(new Error('busy'), { code: 'busy' });
    if (/app[- ]?check|appcheck|recaptcha|401|403|PERMISSION_DENIED|UNAUTHENTICATED/i.test(msg)) throw Object.assign(new Error('appcheck'), { code: 'appcheck' });
    if (/SAFETY|blocked|PROHIBITED/i.test(msg)) throw Object.assign(new Error('blocked'), { code: 'blocked' });
    throw e;
  }
  const parts = res?.response?.candidates?.[0]?.content?.parts || [];
  const img = parts.find(p => p.inlineData && /^image\//.test(p.inlineData.mimeType));
  if (!img) throw Object.assign(new Error('no-image'), { code: res?.response?.promptFeedback?.blockReason ? 'blocked' : 'no-image' });
  return `data:${img.inlineData.mimeType};base64,${img.inlineData.data}`;
}
