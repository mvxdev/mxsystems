# -*- coding: utf-8 -*-
"""
seo_check.py — автоматическая SEO-проверка готового сайта (папки, которая уходит на хостинг).

Зачем: SEO легко сломать незаметно — забыли title на новой странице, опечатались в hreflang,
переименовали картинку. Скрипт проходит ВСЕ страницы и падает (код выхода 1), если нашёл
хоть одну ошибку. Тогда сайт выкладывать нельзя.

Запуск:
    python tools/seo_check.py .        ← старая версия (папка проекта, где лежит index.html)
    python tools/seo_check.py dist     ← новая версия на Astro (папка сборки)

Что проверяется на каждой странице:
  • ровно один <h1>, уровни заголовков без пропусков (после h2 сразу h4 — ошибка);
  • <title> и meta description есть, уникальны и не длиннее нормы (60 и 155 символов);
  • <html lang> совпадает с языком по адресу (/ — ru, /ro/ — ro, /en/ — en);
  • canonical — абсолютный https-адрес этой же страницы со слэшем на конце, без www;
  • hreflang ru / ro / en / x-default — взаимные (если A ссылается на B, то и B на A);
  • Open Graph и Twitter Card на месте, og:url = canonical, og:image существует и 1200×630;
  • JSON-LD (структурированные данные) разбирается без ошибок, язык совпадает со страницей,
    вопросы FAQPage дословно есть в тексте страницы;
  • у всех <img> есть alt, width и height; нет битых внутренних ссылок, якорей и картинок;
  • нет ссылок http:// и www. на свой домен, нет следов ClinicAI;
  • нет встроенных скриптов и стилей (кроме JSON-LD) — этого требует строгая CSP;
  • 404 и служебные страницы закрыты noindex и не попали в sitemap.
Плюс robots.txt и sitemap.xml.

Только стандартная библиотека Python — ничего ставить не нужно.
"""
import json
import re
import struct
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

sys.stdout.reconfigure(encoding='utf-8')   # русские сообщения в консоли Windows

DOMAIN = 'https://mxsystems.md'
LANGS = ('ru', 'ro', 'en')
# Папки, которые НЕ публикуются (черновики, инструменты, архив, исходники Astro и т. п.)
SKIP_DIRS = {'concepts', 'tools', 'archive', 'docs', 'node_modules', 'src', '.git', '.github',
             '_site', 'dist', 'public', '.astro', '.vscode'}
TITLE_MAX, DESC_MAX = 60, 155
TITLE_MIN, DESC_MIN = 15, 50

errors = []     # ошибки — сайт не готов к выкладке
warnings = []   # замечания — желательно поправить, но выкладку не блокируют


def err(page, msg):
    errors.append(f'[ОШИБКА] {page}: {msg}')


def warn(page, msg):
    warnings.append(f'[замечание] {page}: {msg}')


class Page(HTMLParser):
    """Разбирает одну HTML-страницу и собирает всё, что нужно для проверок."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.lang = None
        self.title = None
        self.meta = {}          # name/property → список значений (og:locale:alternate бывает дважды)
        self.links = []         # (rel, hreflang, href)
        self.headings = []      # (уровень, текст)
        self.imgs = []          # словари атрибутов
        self.hrefs = []         # все href у <a>
        self.srcs = []          # src у img/script/source, href у link
        self.ids = set()
        self.jsonld = []        # тексты JSON-LD
        self.inline_scripts = 0
        self.inline_styles = 0
        self.style_attrs = 0
        self.inline_handlers = 0
        self.text = []          # видимый текст (для сверки FAQ)
        self._in = None         # внутри какого тега собираем текст: title / h1..h6 / script
        self._buf = []
        self._script_type = None
        self._skip_text = 0     # внутри script/style/noscript текст не считаем видимым

    def handle_starttag(self, tag, attrs):
        a = {k: (v if v is not None else '') for k, v in attrs}
        if 'id' in a:
            self.ids.add(a['id'])
        if 'style' in a:
            self.style_attrs += 1
        # Обработчики событий в разметке (onclick="…") — тоже встроенный код, CSP их блокирует
        self.inline_handlers += sum(1 for k in a if k.startswith('on'))
        if tag == 'html':
            self.lang = a.get('lang')
        elif tag == 'title':
            self._in, self._buf = 'title', []
        elif tag == 'meta':
            key = a.get('name') or a.get('property')
            if key:
                self.meta.setdefault(key, []).append(a.get('content', ''))
        elif tag == 'link':
            self.links.append((a.get('rel', ''), a.get('hreflang'), a.get('href', '')))
            if a.get('href'):
                self.srcs.append(a['href'])
        elif re.fullmatch(r'h[1-6]', tag):
            self._in, self._buf = tag, []
        elif tag == 'img':
            self.imgs.append(a)
            if a.get('src'):
                self.srcs.append(a['src'])
        elif tag == 'source' and a.get('srcset'):
            self.srcs.extend(s.strip().split(' ')[0] for s in a['srcset'].split(','))
        elif tag == 'a' and 'href' in a:
            self.hrefs.append(a['href'])
        elif tag == 'script':
            self._skip_text += 1
            self._script_type = a.get('type', '')
            if a.get('src'):
                self.srcs.append(a['src'])
            elif self._script_type == 'application/ld+json':
                self._in, self._buf = 'ldjson', []
            else:
                self.inline_scripts += 1
        elif tag == 'style':
            self._skip_text += 1
            self.inline_styles += 1
        elif tag == 'noscript':
            self._skip_text += 1

    def handle_endtag(self, tag):
        if tag == 'title' and self._in == 'title':
            self.title = ''.join(self._buf).strip()
            self._in = None
        elif re.fullmatch(r'h[1-6]', tag) and self._in == tag:
            self.headings.append((int(tag[1]), ' '.join(''.join(self._buf).split())))
            self._in = None
        elif tag == 'script':
            self._skip_text -= 1
            if self._in == 'ldjson':
                self.jsonld.append(''.join(self._buf))
                self._in = None
        elif tag in ('style', 'noscript'):
            self._skip_text -= 1

    def handle_data(self, data):
        if self._in:
            self._buf.append(data)
        if not self._skip_text:
            self.text.append(data)


def norm(s):
    """Сравнение текстов без учёта лишних пробелов и неразрывных пробелов."""
    return ' '.join(s.replace(' ', ' ').split())


def url_of(rel_path):
    """Файл → адрес страницы: ro/index.html → https://mxsystems.md/ro/"""
    p = rel_path.as_posix()
    if p.endswith('index.html'):
        p = p[:-len('index.html')]
    return DOMAIN + '/' + p


def lang_of(url):
    path = urlsplit(url).path
    for l in ('ro', 'en'):
        if path.startswith(f'/{l}/'):
            return l
    return 'ru'


def png_size(path):
    """Ширина и высота PNG из заголовка файла (без сторонних библиотек)."""
    with open(path, 'rb') as f:
        head = f.read(24)
    if head[:8] != b'\x89PNG\r\n\x1a\n':
        return None
    return struct.unpack('>II', head[16:24])


def resolve(site, page_file, ref):
    """Внутренняя ссылка → путь к файлу в папке сайта (или None, если ссылка внешняя)."""
    if not ref or ref.startswith(('mailto:', 'tel:', 'data:', 'javascript:', '#')):
        return None
    parts = urlsplit(ref)
    if parts.scheme in ('http', 'https'):
        if parts.netloc not in ('mxsystems.md',):
            return None              # внешний сайт — не проверяем
        path = parts.path
        target = site / unquote(path.lstrip('/'))
    elif ref.startswith('//'):
        return None
    elif parts.path.startswith('/'):
        target = site / unquote(parts.path.lstrip('/'))
    else:
        target = (page_file.parent / unquote(parts.path))
    if parts.path.endswith('/') or target.is_dir():
        target = target / 'index.html'
    return target


def main():
    if len(sys.argv) != 2:
        print('Использование: python tools/seo_check.py <папка сайта>')
        sys.exit(2)
    site = Path(sys.argv[1]).resolve()
    if not (site / 'index.html').exists():
        print(f'В папке {site} нет index.html — это не папка сайта')
        sys.exit(2)

    # ---------- 1. Собираем все публикуемые HTML-страницы ----------
    files = [p for p in site.rglob('*.html')
             if not (set(p.relative_to(site).parts[:-1]) & SKIP_DIRS)
             and not p.name.endswith('.report.html')]
    pages = {}   # адрес → (файл, разбор)
    for f in sorted(files):
        pg = Page()
        pg.feed(f.read_text(encoding='utf-8'))
        rel = f.relative_to(site)
        pages[url_of(rel) if rel.name == 'index.html' else DOMAIN + '/' + rel.as_posix()] = (f, pg)

    def noindex(pg):
        return any('noindex' in v for v in pg.meta.get('robots', []))

    indexable = {u: v for u, v in pages.items() if not noindex(v[1])}
    print(f'Страниц найдено: {len(pages)}, индексируемых: {len(indexable)}')

    # 404 обязательно существует и закрыта от индексации
    if DOMAIN + '/404.html' not in pages:
        err('404.html', 'нет страницы 404')
    elif DOMAIN + '/404.html' in indexable:
        err('404.html', 'нет <meta name="robots" content="noindex">')

    # ---------- 2. Проверки каждой страницы ----------
    titles, descs = {}, {}
    for url, (f, pg) in pages.items():
        name = f.relative_to(site).as_posix()

        # Общие для всех страниц: CSP-чистота, alt у картинок, битые ссылки
        if pg.inline_scripts:
            err(name, f'встроенных <script> без src: {pg.inline_scripts} (CSP их заблокирует)')
        if pg.inline_styles:
            err(name, f'встроенных <style>: {pg.inline_styles} (CSP их заблокирует)')
        if pg.style_attrs:
            err(name, f'атрибутов style="…": {pg.style_attrs} (CSP их заблокирует)')
        if pg.inline_handlers:
            err(name, f'обработчиков вида onclick="…": {pg.inline_handlers} (CSP их заблокирует)')
        for img in pg.imgs:
            src = img.get('src', '?')
            if 'alt' not in img:
                err(name, f'<img> без alt: {src}')
            elif not img['alt'].strip() and img.get('aria-hidden') != 'true' and img.get('role') != 'presentation':
                warn(name, f'пустой alt у {src} — если картинка не декоративная, нужно описание')
            if not img.get('width') or not img.get('height'):
                err(name, f'<img> без width/height (страница «прыгает» при загрузке): {src}')
        for ref in pg.hrefs + pg.srcs:
            low = ref.lower()
            if low.startswith('http://'):
                err(name, f'небезопасная ссылка http://: {ref}')
            if '://www.mxsystems' in low:
                err(name, f'ссылка на www-адрес: {ref}')
            target = resolve(site, f, ref)
            if target is not None and not target.exists():
                err(name, f'битая ссылка: {ref}')
            # якорь #id на этой же или другой своей странице
            if '#' in ref and not ref.startswith(('http', 'mailto', 'tel')):
                path, frag = ref.split('#', 1)
                if frag:
                    tgt = f if not path else resolve(site, f, path)
                    if tgt is not None and tgt.exists():
                        tp = pg if tgt == f else None
                        if tp is None:
                            tp = Page(); tp.feed(tgt.read_text(encoding='utf-8'))
                        if frag not in tp.ids:
                            err(name, f'якорь не найден: {ref}')
        html_raw = f.read_text(encoding='utf-8').lower()
        if 'clinicai' in html_raw or 'clinic ai' in html_raw:
            err(name, 'найдены следы ClinicAI')

        if url not in indexable:
            continue   # дальше — только для индексируемых страниц

        lang = lang_of(url)
        # --- язык ---
        if pg.lang != lang:
            err(name, f'<html lang="{pg.lang}">, а по адресу ожидается «{lang}»')
        # --- title и description ---
        t = pg.title or ''
        d = (pg.meta.get('description') or [''])[0]
        if not t:
            err(name, 'нет <title>')
        elif not TITLE_MIN <= len(t) <= TITLE_MAX:
            err(name, f'длина title {len(t)} (норма {TITLE_MIN}–{TITLE_MAX}): «{t}»')
        if not d:
            err(name, 'нет meta description')
        elif not DESC_MIN <= len(d) <= DESC_MAX:
            err(name, f'длина description {len(d)} (норма {DESC_MIN}–{DESC_MAX})')
        titles.setdefault(t, []).append(name)
        descs.setdefault(d, []).append(name)
        # --- заголовки ---
        h1 = [h for h in pg.headings if h[0] == 1]
        if len(h1) != 1:
            err(name, f'<h1> на странице: {len(h1)} (нужен ровно один)')
        prev = 0
        for lvl, text in pg.headings:
            if lvl > prev + 1:
                err(name, f'пропуск уровня заголовка: h{prev} → h{lvl} («{text[:40]}»)')
            prev = lvl
        # --- canonical ---
        canon = [h for r, _, h in pg.links if r == 'canonical']
        if len(canon) != 1:
            err(name, f'canonical: {len(canon)} шт. (нужен один)')
        elif canon[0] != url:
            err(name, f'canonical {canon[0]} не совпадает с адресом страницы {url}')
        # --- hreflang ---
        alts = {hl: h for r, hl, h in pg.links if r == 'alternate' and hl}
        for need in LANGS + ('x-default',):
            if need not in alts:
                err(name, f'нет hreflang="{need}"')
        if alts.get(lang) != url:
            err(name, f'hreflang="{lang}" должен указывать на саму страницу ({url})')
        if 'x-default' in alts and 'ru' in alts and alts['x-default'] != alts['ru']:
            err(name, 'x-default должен указывать на русскую (корневую) версию')
        for hl, h in alts.items():
            if not h.startswith(DOMAIN + '/') or not h.endswith('/'):
                err(name, f'hreflang {hl}: адрес должен быть абсолютным https и со слэшем: {h}')
            elif h not in indexable:
                err(name, f'hreflang {hl} ведёт на несуществующую/закрытую страницу {h}')
            elif hl in LANGS:
                # взаимность: страница-перевод должна ссылаться обратно на нас
                back = {x: y for r, x, y in indexable[h][1].links if r == 'alternate' and x}
                if back.get(lang) != url:
                    err(name, f'hreflang не взаимный: {h} не ссылается обратно на {url}')
        # --- Open Graph и Twitter ---
        m = {k: v[0] for k, v in pg.meta.items()}
        for k in ('og:type', 'og:site_name', 'og:title', 'og:description', 'og:url', 'og:image',
                  'og:locale', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'):
            if not m.get(k):
                err(name, f'нет <meta {k}>')
        if m.get('og:url') and m['og:url'] != url:
            err(name, f'og:url {m["og:url"]} ≠ адрес страницы')
        loc = {'ru': 'ru_RU', 'ro': 'ro_RO', 'en': 'en_US'}
        if m.get('og:locale') and m['og:locale'] != loc[lang]:
            err(name, f'og:locale {m["og:locale"]}, ожидается {loc[lang]}')
        if len(pg.meta.get('og:locale:alternate', [])) != 2:
            err(name, 'og:locale:alternate — нужно два (два других языка)')
        img = m.get('og:image', '')
        if img:
            if not img.startswith(DOMAIN + '/'):
                err(name, f'og:image должен быть абсолютным адресом на {DOMAIN}: {img}')
            else:
                p = site / unquote(urlsplit(img).path.lstrip('/'))
                if not p.exists():
                    err(name, f'og:image не найден: {img}')
                elif p.suffix == '.png' and png_size(p) != (1200, 630):
                    err(name, f'og:image {img} — размер {png_size(p)}, нужен 1200×630')
        # --- favicon и theme-color ---
        rels = [r for r, _, _ in pg.links]
        if 'icon' not in rels:
            err(name, 'нет favicon (<link rel="icon">)')
        if 'apple-touch-icon' not in rels:
            err(name, 'нет apple-touch-icon')
        if not m.get('theme-color'):
            err(name, 'нет theme-color')
        if not any(k == 'viewport' for k in pg.meta):
            err(name, 'нет meta viewport')
        # --- JSON-LD ---
        visible = norm(' '.join(pg.text))
        types = set()
        for raw in pg.jsonld:
            try:
                data = json.loads(raw)
            except json.JSONDecodeError as e:
                err(name, f'JSON-LD не разбирается: {e}')
                continue
            nodes = data.get('@graph', [data]) if isinstance(data, dict) else data
            for n in nodes:
                tp = n.get('@type')
                types.update(tp if isinstance(tp, list) else [tp])
                if n.get('inLanguage') and n['inLanguage'] != lang:
                    err(name, f'JSON-LD {tp}: inLanguage={n["inLanguage"]}, ожидается {lang}')
                if tp == 'FAQPage':
                    for q in n.get('mainEntity', []):
                        qa = norm(q.get('name', ''))
                        an = norm(q.get('acceptedAnswer', {}).get('text', ''))
                        if qa not in visible:
                            err(name, f'вопрос FAQ из JSON-LD не найден на странице: «{qa[:50]}»')
                        if an not in visible:
                            err(name, f'ответ FAQ из JSON-LD не совпадает с текстом на странице: «{an[:50]}»')
        # Главные страницы обязаны иметь разметку организации и сайта
        if urlsplit(url).path in ('/', '/ro/', '/en/'):
            for need in ('ProfessionalService', 'WebSite'):
                if need not in types:
                    err(name, f'нет JSON-LD {need}')

    # --- уникальность title и description ---
    for t, where in titles.items():
        if len(where) > 1:
            err(', '.join(where), f'одинаковый title: «{t}»')
    for d, where in descs.items():
        if len(where) > 1:
            err(', '.join(where), 'одинаковый description')

    # ---------- 3. robots.txt ----------
    rob = site / 'robots.txt'
    if not rob.exists():
        err('robots.txt', 'файла нет')
    else:
        r = rob.read_text(encoding='utf-8')
        lines = [l.split('#')[0].strip() for l in r.splitlines()]
        dis = [l.split(':', 1)[1].strip() for l in lines if l.lower().startswith('disallow:')]
        if '/' in dis:
            err('robots.txt', 'Disallow: / — закрыт весь сайт!')
        for need in ('/concepts/', '/tools/', '/archive/'):
            if need not in dis:
                err('robots.txt', f'не закрыта служебная папка {need}')
        for d_ in dis:
            if d_.startswith(('/assets', '/_astro')) or d_.endswith(('.css', '.js')):
                err('robots.txt', f'закрыты стили/скрипты/картинки ({d_}) — Google не сможет отрисовать страницу')
        if f'Sitemap: {DOMAIN}/sitemap.xml' not in r:
            err('robots.txt', f'нет строки «Sitemap: {DOMAIN}/sitemap.xml»')

    # ---------- 4. sitemap.xml ----------
    sm = site / 'sitemap.xml'
    if not sm.exists():
        err('sitemap.xml', 'файла нет')
    else:
        ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9', 'x': 'http://www.w3.org/1999/xhtml'}
        try:
            root = ET.parse(sm).getroot()
        except ET.ParseError as e:
            err('sitemap.xml', f'XML не разбирается: {e}')
            root = None
        if root is not None:
            locs = set()
            for u in root.findall('s:url', ns):
                loc = (u.findtext('s:loc', '', ns) or '').strip()
                locs.add(loc)
                if loc not in indexable:
                    err('sitemap.xml', f'адрес не является индексируемой страницей: {loc}')
                    continue
                lm = (u.findtext('s:lastmod', '', ns) or '').strip()
                if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', lm):
                    err('sitemap.xml', f'нет или неверный lastmod у {loc}')
                sm_alts = {x.get('hreflang'): x.get('href') for x in u.findall('x:link', ns)}
                pg_alts = {hl: h for r, hl, h in indexable[loc][1].links if r == 'alternate' and hl}
                if sm_alts != pg_alts:
                    err('sitemap.xml', f'hreflang у {loc} не совпадают со страницей')
            for u in indexable:
                if u not in locs:
                    err('sitemap.xml', f'страница не попала в карту сайта: {u}')

    # ---------- Итог ----------
    for w in warnings:
        print(w)
    for e in errors:
        print(e)
    print()
    if errors:
        print(f'ИТОГ: ошибок {len(errors)}, замечаний {len(warnings)} — НЕ ГОТОВО к выкладке')
        sys.exit(1)
    print(f'ИТОГ: ошибок нет, замечаний {len(warnings)} — SEO-проверка пройдена ✓')


if __name__ == '__main__':
    main()
