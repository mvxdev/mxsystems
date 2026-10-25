// =====================================================================
// serve.mjs — крошечный статический сервер для проверок (скриншоты, Lighthouse, сверка).
// Отдаёт файлы папки как обычный хостинг: /ro/ → ro/index.html, несуществующее → 404.html.
// Запуск:  node tools/serve.mjs dist 4321
// Без зависимостей — только встроенные модули Node.js.
// =====================================================================
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ico': 'image/x-icon',
};

export function serve(dir, port) {
  const root = resolve(dir);
  const server = createServer(async (req, res) => {
    try {
      let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = normalize(join(root, path));
      if (!file.startsWith(root)) { res.writeHead(403).end(); return; }   // защита от «../» за пределы папки
      let st = await stat(file).catch(() => null);
      if (st?.isDirectory()) {
        if (!path.endsWith('/')) { res.writeHead(301, { Location: path + '/' }).end(); return; }
        file = join(file, 'index.html');
        st = await stat(file).catch(() => null);
      }
      if (!st) {
        const body = await readFile(join(root, '404.html')).catch(() => 'Not found');
        res.writeHead(404, { 'Content-Type': TYPES['.html'] }).end(body);
        return;
      }
      res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(await readFile(file));
    } catch (e) {
      res.writeHead(500).end(String(e));
    }
  });
  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)));
}

// Запуск из командной строки
if (process.argv[1] && process.argv[1].endsWith('serve.mjs')) {
  const [dir = 'dist', port = '4321'] = process.argv.slice(2);
  serve(dir, Number(port)).then(() => console.log(`http://localhost:${port}/  ←  ${resolve(dir)}`));
}
