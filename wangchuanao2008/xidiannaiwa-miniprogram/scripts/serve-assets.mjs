import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, realpath } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = await realpath(resolve(import.meta.dirname, '../assets'));
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 5174);
const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!/^\/museum\/(artworks|thumbnails)\/[a-zA-Z0-9._-]+$/.test(pathname)) throw new Error('invalid path');
    const file = await realpath(resolve(root, '.' + pathname));
    if (!file.startsWith(root + sep) || !types[extname(file)]) throw new Error('invalid file');
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not a file');
    res.writeHead(200, { 'Content-Type': types[extname(file)], 'Content-Length': info.size, 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') { res.end(); return; }
    const stream = createReadStream(file);
    res.on('close', () => stream.destroy()); stream.on('error', () => res.destroy()); stream.pipe(res);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found'); }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, host, () => console.log(`Museum assets: http://${host}:${server.address().port}/museum/thumbnails/work-103.jpg`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
