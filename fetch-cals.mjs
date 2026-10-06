// Downloads the calendars listed in .env into cal/, for the page to read.
//
//   ICAL_<NAME>=<secret address in iCal format>    one line per calendar
//   ICAL_<NAME>_COLOR=#rrggbb                      optional colour for that calendar
//   ICAL_<NAME>_KIND=context                       optional: draw its events as background washes
//   SUN_LAT=37.77  SUN_LON=-122.42                 optional: where sunrise and sunset are for
//
// Writes cal/<name>.ics per calendar and cal/index.json listing them. A calendar that fails to
// download keeps its last good copy. Run directly (npm run fetch) or through serve.mjs.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'cal');

async function readEnv() {
  const text = await readFile(join(ROOT, '.env'), 'utf8').catch(() => '');
  const env = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*(?:export\s+)?((?:ICAL|SUN)_[A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1].toUpperCase()] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return env;
}

async function download(cal) {
  const file = cal.name + '.ics';
  try {
    const res = await fetch(cal.url.replace(/^webcal:/i, 'https:'), { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!/^\uFEFF?\s*BEGIN:VCALENDAR/.test(text)) throw new Error('not an iCal file');
    await writeFile(join(OUT, file), text);
    return { name: cal.name, file, color: cal.color, kind: cal.kind, ok: true };
  } catch (e) {
    // error messages only, never the URL: it is the calendar's password
    const kept = await access(join(OUT, file)).then(() => file, () => null);
    return { name: cal.name, file: kept, color: cal.color, kind: cal.kind, ok: false, error: e.name === 'TimeoutError' ? 'timed out' : e.message };
  }
}

export async function fetchCalendars() {
  const env = await readEnv();
  const cals = Object.entries(env)
    .filter(([key, url]) => key.startsWith('ICAL_') && !/_(COLOR|KIND)$/.test(key) && url)
    .map(([key, url]) => ({ name: key.slice(5).toLowerCase(), url, color: env[key + '_COLOR'] || null,
      kind: env[key + '_KIND']?.toLowerCase() === 'context' ? 'context' : 'event' }));
  await mkdir(OUT, { recursive: true });
  const index = { fetched: new Date().toISOString(), calendars: await Promise.all(cals.map(download)) };
  const lat = parseFloat(env.SUN_LAT), lon = parseFloat(env.SUN_LON);
  if (Number.isFinite(lat) && Number.isFinite(lon)) index.sun = { lat, lon };
  await writeFile(join(OUT, 'index.json'), JSON.stringify(index, null, 2));
  return index;
}

export function report(index) {
  if (!index.calendars.length) return console.log('no ICAL_* entries in .env: the page will show the sample calendar');
  for (const c of index.calendars) {
    console.log(`  ${c.ok ? 'ok  ' : 'FAIL'} ${c.name}${c.ok ? '' : ` (${c.error}${c.file ? ', keeping the last copy' : ''})`}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('fetching calendars');
  report(await fetchCalendars());
}
