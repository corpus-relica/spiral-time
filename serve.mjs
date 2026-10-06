// Local server: downloads the calendars on launch, serves the page, and re-downloads them on
// POST /api/refresh (the Refresh button). No dependencies. Listens on localhost only, since cal/
// holds your calendar: HOST=0.0.0.0 to reach it from another device on your network.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fetchCalendars, report, ROOT } from './fetch-cals.mjs';

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '127.0.0.1';
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.ics': 'text/calendar; charset=utf-8', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.md': 'text/plain; charset=utf-8',
};

// one download at a time: a second refresh while one runs waits for the same result
let pending = null;
const refresh = () => pending ??= fetchCalendars().finally(() => { pending = null; });

const send = (res, status, body, type = 'text/plain; charset=utf-8') =>
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' }).end(body);

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/refresh') {
    if (req.method !== 'POST') return send(res, 405, 'POST only');
    try {
      const index = await refresh();
      console.log('refreshed'); report(index);
      return send(res, 200, JSON.stringify(index), TYPES['.json']);
    } catch (e) {
      return send(res, 500, JSON.stringify({ error: e.message }), TYPES['.json']);
    }
  }
  let path;
  try { path = decodeURIComponent(url.pathname); } catch { return send(res, 400, 'bad path'); }
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(ROOT, path));
  // nothing outside the project, and no dotfiles: .env holds the calendar addresses
  if (!file.startsWith(ROOT + sep) || file.slice(ROOT.length).split(sep).some(p => p.startsWith('.'))) return send(res, 404, 'not found');
  try {
    send(res, 200, await readFile(file), TYPES[extname(file)] || 'application/octet-stream');
  } catch {
    send(res, 404, 'not found');
  }
});

console.log('fetching calendars');
report(await refresh().catch(e => (console.error('fetch failed:', e.message), { calendars: [] })));
server.listen(PORT, HOST, () => console.log(`spiral-time on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/`));
