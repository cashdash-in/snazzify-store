// Cloudflare D1 (binding "DB"): the free SQL database for busy data (votes, guesses, reviews, squads, auction holds).
// Tables are created automatically the first time they're needed, so there's nothing to set up by hand.
let ready = null;
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS polls (id TEXT PRIMARY KEY, pid TEXT, colour TEXT, name TEXT, buy INTEGER DEFAULT 0, bye INTEGER DEFAULT 0, at INTEGER)`,
  `CREATE TABLE IF NOT EXISTS poll_votes (poll TEXT, who TEXT, vote TEXT, PRIMARY KEY (poll, who))`,
  `CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, ref TEXT, pid TEXT, pname TEXT, pimg TEXT, name TEXT, city TEXT, stars INTEGER, text TEXT, img TEXT, status TEXT DEFAULT 'pending', at INTEGER)`,
  `CREATE INDEX IF NOT EXISTS reviews_status ON reviews (status, at)`,
  `CREATE TABLE IF NOT EXISTS guesses (day TEXT, who TEXT, name TEXT, phone TEXT, guess INTEGER, at INTEGER, PRIMARY KEY (day, who))`,
  `CREATE TABLE IF NOT EXISTS squads (code TEXT PRIMARY KEY, ref TEXT, name TEXT, phone TEXT, at INTEGER)`,
  `CREATE TABLE IF NOT EXISTS squad_members (code TEXT, ref TEXT, name TEXT, phone TEXT, amount INTEGER, at INTEGER, PRIMARY KEY (code, ref))`,
  `CREATE TABLE IF NOT EXISTS squad_paid (code TEXT PRIMARY KEY, at INTEGER, note TEXT)`,
  `CREATE TABLE IF NOT EXISTS auction_holds (aid TEXT, ref TEXT, phone TEXT, price INTEGER, until INTEGER, PRIMARY KEY (aid, ref))`,
];
export async function db(env) {
  if (!env.DB) return null;
  if (!ready) ready = env.DB.batch(SCHEMA.map(s => env.DB.prepare(s))).catch(e => { ready = null; throw e; });
  await ready;
  return env.DB;
}
