# -*- coding: utf-8 -*-
"""
compare_content.py — сверка содержимого: всё, что было в старой версии (тег v1-seo),
должно быть и в новой (dist/) — на всех трёх языках.

Проверяет для каждой страницы (главные ru/ro/en, privacy ru/ro/en, 404):
  • каждый кусок видимого текста старой версии есть в тексте новой (цены и цифры — тоже текст);
  • каждая ссылка старой версии (Telegram с готовым сообщением, WhatsApp, телефон, почта,
    4power.club, carbids.info, fastload.app, якоря #cases… и адреса страниц) есть в новой;
  • подписи картинок (alt) и подписи для скринридеров (aria-label) — совпадают.
Сравнение без учёта лишних пробелов и неразрывных пробелов (их расставляет типограф).

Запуск:
    git archive v1-seo | tar -x -C .cache/v1      ← распаковать старую версию (один раз)
    npm run build                                 ← собрать новую в dist/
    python tools/compare_content.py .cache/v1 dist
Код выхода 1 — есть расхождения (список печатается и пишется в docs/content-diff.md).
Нужен beautifulsoup4.
"""
import re
import sys
import urllib.parse as u
from pathlib import Path

from bs4 import BeautifulSoup, Comment

sys.stdout.reconfigure(encoding='utf-8')
OLD, NEW = Path(sys.argv[1] if len(sys.argv) > 1 else '.cache/v1'), Path(sys.argv[2] if len(sys.argv) > 2 else 'dist')
PAGES = ['index.html', 'ro/index.html', 'en/index.html', 'privacy/index.html',
         'ro/privacy/index.html', 'en/privacy/index.html', '404.html']
DOMAIN = 'https://mxsystems.md'


def norm(s):
    return ' '.join(s.replace(' ', ' ').replace(' ', ' ').split())


def soup(path):
    s = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    for t in s(['script', 'style', 'noscript', 'template']):
        t.decompose()
    return s


def page_url(rel):
    p = rel[:-len('index.html')] if rel.endswith('index.html') else rel
    return DOMAIN + '/' + p


def links(s, base):
    """Все ссылки страницы → абсолютные и раскодированные (чтобы %D0%97… и «З» совпадали)."""
    out = set()
    for a in s.find_all('a', href=True):
        h = a['href']
        if h.startswith('#'):
            out.add(h)
            continue
        full = u.urljoin(base, h)
        out.add(u.unquote(full))
    return out


def texts(s):
    """Кусочки видимого текста (каждый текстовый узел)."""
    body = s.body or s
    return [norm(t) for t in body.find_all(string=True) if norm(t) and not isinstance(t, Comment)]


def loose(s):
    """«Грубое» сравнение: без пробелов и разделителей «·» — для строк, которые в новой версии
    разбиты на отдельные элементы (например, «Стек» стал набором меток)."""
    return re.sub(r'[\s·]+', '', s)


def attrs(s, name):
    return {norm(el[name]) for el in s.find_all(attrs={name: True})}


problems = []
for rel in PAGES:
    o, n = OLD / rel, NEW / rel
    if not n.exists():
        problems.append(f'{rel}: страницы нет в новой версии')
        continue
    so, sn = soup(o), soup(n)
    base = page_url(rel)
    # Намеренные изменения (DECISIONS.md, п. 33–34) — эти куски старой версии не сравниваем:
    #   • cookie-баннер и кнопка «Настройки cookie» не выводятся, пока не вписаны ID GA4/Pixel;
    #   • сноски первого экрана переписаны: вместо двух одинаковых — три с цифрами из кейсов.
    if not sn.select_one('#cookie'):
        for el in so.select('#cookie, #cookie-open'):
            el.decompose()
    for el in so.select('.notes'):
        el.decompose()
    # get_text('') — без добавочных пробелов между тегами: типограф оборачивает слова в <span>,
    # и текст «тест-драйва:» не должен превратиться в «тест-драйва :»
    full_new = norm((sn.body or sn).get_text(''))
    full_loose = loose(full_new)
    miss_t = [t for t in dict.fromkeys(texts(so)) if t not in full_new and loose(t) not in full_loose]
    lo, ln = links(so, base), links(sn, base)
    miss_l = sorted(lo - ln)
    miss_alt = sorted(attrs(so, 'alt') - attrs(sn, 'alt'))
    miss_aria = sorted(attrs(so, 'aria-label') - attrs(sn, 'aria-label'))
    for t in miss_t:
        problems.append(f'{rel}: текст не найден: «{t[:120]}»')
    for l in miss_l:
        problems.append(f'{rel}: ссылка не найдена: {l[:160]}')
    for a in miss_alt:
        problems.append(f'{rel}: alt не найден: «{a}»')
    for a in miss_aria:
        problems.append(f'{rel}: aria-label не найден: «{a}»')
    print(f'{rel:26} текстов {len(texts(so)):4}  ссылок {len(lo):3}  → не найдено: текстов {len(miss_t)}, ссылок {len(miss_l)}, alt {len(miss_alt)}, aria {len(miss_aria)}')

report = ['# Сверка содержимого v1-seo → новая версия', '',
          'Скрипт: `python tools/compare_content.py .cache/v1 dist`.', '',
          'Намеренно не сравниваются: cookie-баннер и кнопка «Настройки cookie» (не выводятся без ID GA4/Pixel)',
          'и сноски первого экрана (переписаны) — см. DECISIONS.md, п. 33–34.', '']
report += ['Расхождений нет.'] if not problems else ['## Расхождения', ''] + [f'- {p}' for p in problems]
Path('docs/content-diff.md').write_text('\n'.join(report) + '\n', encoding='utf-8')
print()
for p in problems:
    print(p)
print('\nИТОГ:', 'расхождений нет ✓' if not problems else f'расхождений {len(problems)} (docs/content-diff.md)')
sys.exit(1 if problems else 0)
