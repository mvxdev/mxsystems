/* =====================================================================
   sitemap.xml — карта сайта для поисковиков, собирается при сборке (npm run build).
   Все индексируемые страницы с абсолютными https-адресами, у каждой — xhtml:link
   с hreflang на версии на других языках (те же, что в <head>), и lastmod — дата сборки.
   Служебные /ru/ и 404 сюда не входят (они закрыты noindex).
   ===================================================================== */
import { LANGS, url } from '../i18n';

const PAGES = ['/', '/privacy/'];

export function GET() {
  const lastmod = new Date().toISOString().slice(0, 10);   // ГГГГ-ММ-ДД
  const alt = (p: string) =>
    LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, p)}"/>`).join('\n') +
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${url('ru', p)}"/>`;
  const urls = PAGES.flatMap((p) => LANGS.map((l) =>
    `  <url>\n    <loc>${url(l, p)}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alt(p)}\n  </url>`));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
