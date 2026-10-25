# -*- coding: utf-8 -*-
"""
extract_i18n.py — ОДНОРАЗОВЫЙ перенос текстов старого сайта (тег v1-seo) в Astro.

Зачем: в Astro-версии тексты трёх языков живут в src/i18n/ru.ts, ro.ts, en.ts.
Чтобы при переносе не потерять и не исказить ни одной фразы, цифры или ссылки,
тексты не перепечатаны руками, а вынуты скриптом прямо из готовых страниц v1-seo.

После переноса источник текстов — файлы src/i18n/*.ts (правьте их).
Этот скрипт оставлен как документация «откуда взялись тексты»; запускать повторно не нужно
(он перезапишет ts-файлы текстами старой версии).

Запуск (из папки проекта):
    git archive v1-seo | tar -x -C .cache/v1      ← распаковать старую версию
    python tools/extract_i18n.py .cache/v1
Нужен пакет beautifulsoup4 (pip install beautifulsoup4) — разбор HTML.
"""
import json
import re
import sys
import urllib.parse as u
from pathlib import Path

from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')
SRC = Path(sys.argv[1] if len(sys.argv) > 1 else '.cache/v1')
OUT = Path(__file__).resolve().parent.parent / 'src' / 'i18n'


def clean(s):
    """Схлопываем переносы строк и лишние пробелы (неразрывные пробелы сохраняем)."""
    return re.sub(r'[ \t\r\n]+', ' ', s).strip()


def inner(el):
    """Внутренний HTML элемента (с <em>, <b>, <a>, <br>) одной строкой."""
    return clean(el.decode_contents())


def text(el):
    return clean(el.get_text())


def one(root, sel):
    el = root.select_one(sel)
    assert el is not None, sel
    return el


def extract(path, lang):
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    head, body = soup.head, soup.body
    meta = lambda k: (head.find('meta', attrs={'name': k}) or head.find('meta', attrs={'property': k}))['content']
    d = {}

    # ---------- <head> ----------
    d['meta'] = {
        'title': text(head.title),
        'description': meta('description'),
        'ogTitle': meta('og:title'),
        'ogDescription': meta('og:description'),
    }

    # ---------- Общие подписи интерфейса ----------
    hdr = one(body, 'header.header')
    tg = one(hdr, 'a.btn--primary')
    q = u.parse_qs(u.urlsplit(tg['href']).query)
    mail = one(body, 'a[href^="mailto:"]')['href']
    d['ui'] = {
        'logoAria': one(hdr, 'a.logo')['aria-label'],
        'navAria': one(hdr, 'nav')['aria-label'],
        'nav': [{'href': a['href'], 'label': text(a)} for a in hdr.select('nav a')],
        'langAria': one(hdr, '.lang')['aria-label'],
        'ctaAria': tg['aria-label'],
        'ctaLabel': text(one(tg, '.label')),
        'burgerAria': one(hdr, '#burger')['aria-label'],
        'tgText': q['text'][0],                                   # предзаполненное сообщение в Telegram/WhatsApp
        'mailSubject': u.parse_qs(u.urlsplit(mail).query)['subject'][0],
    }

    # ---------- Hero ----------
    mast = one(body, '.masthead')
    d['masthead'] = [text(s) for s in mast.find_all('span')]
    h1 = one(body, 'h1')
    no = h1.find('span', class_='no')
    no_text = text(no)
    no.extract()
    fig = one(body, 'figure.fig')
    svg_t = [text(t) for t in fig.select('text.s-t')]
    svg_s = [text(t) for t in fig.select('text.s-s')]
    btns = body.select('.hero .actions a')
    d['hero'] = {
        'h1Prefix': no_text,                                      # «MX Systems» — скрытая для глаз строка над H1
        'h1': inner(h1),
        'figAria': fig['aria-label'],
        'inputs': [{'t': svg_t[i], 's': svg_s[i]} for i in range(3)],
        'coreSub': text(one(fig, 'text.s-sub')),
        'outputs': [{'t': svg_t[i], 's': svg_s[i]} for i in range(3, 6)],
        'figcaption': text(one(fig, 'figcaption')),
        'lead': inner(one(body, '.hero .lead')),
        'cta': text(btns[0].find('span')).replace(text(btns[0].find('small')), '').strip(),
        'ctaSub': text(btns[0].find('small')),
        'cta2': text(btns[1]).replace('↓', '').strip(),
        'notesAria': one(body, '.notes')['aria-label'],
        'notes': [{'href': a['href'], 'k': text(a.find('span', class_='k')),
                   'text': clean(a.find('br').next_sibling)} for a in body.select('.notes a')],
    }

    # ---------- Проекты: шапка секции ----------
    sec = one(body, '#cases')
    d['cases'] = {
        'eyebrow': clean(one(sec, '.eyebrow').get_text().split('/', 1)[1]),
        'title': inner(one(sec, '#cases-title')),
        'intro': inner(one(sec, '.section-head p:not(.eyebrow)')),
        'groupImpl': text(one(sec, 'p.group-label')),
        'order': [a['id'].replace('case-', '') for a in sec.select('article.case')],
    }

    def case(art):
        blocks = art.select('.case-block')
        res = one(art, '.case-result')
        stack = one(art, '.stack')
        stack_label = text(stack.find('span'))
        stack.find('span').extract()
        return {
            'no': text(one(art, '.case-no')),
            'badge': text(one(art, '.badge')),
            'title': inner(one(art, '.case-title')),
            'meta': [{'dt': text(x.dt), 'dd': inner(x.dd)} for x in art.select('.case-meta > div')],
            'taskH': text(blocks[0].h4),
            'task': inner(blocks[0].p),
            'doneH': text(blocks[1].h4),
            'done': [inner(li) for li in blocks[1].select('li')],
            'uiSr': text(one(art, '.case-ui .sr-only')),
            'resultH': text(res.h4),
            'kpis': [{'value': inner(k.b), 'label': text(k.find('span', recursive=False)),
                      'acc': 'kpi--acc' in k['class']} for k in res.select('.kpi')],
            'results': [inner(li) for li in res.select('.results li')],
            'stackLabel': stack_label,
            'stack': [clean(s) for s in text(stack).split(' · ')],
        }

    a4 = one(body, '#case-4power')
    c4 = case(a4)
    board = one(a4, '#board-4p')
    c4['ui'] = {
        'bar': text(one(board, '.ui-bar span')),
        'demo': text(one(board, '.ui-bar .r')),
        'sub': [text(s) for s in board.select('.ui-sub span')],
        'cols': [{'key': c['data-col'], 'title': clean(c.select_one('.col-h').contents[0]),
                  'cars': [{'name': text(x.b), 'status': text(x.select_one('.car-status')),
                            'cls': ' '.join(k for k in x.get('class', []) if k != 'car'),
                            'moving': x.has_attr('data-moving')} for x in c.select('.car')]}
                 for c in board.select('.col')],
        'labels': json.loads(one(board, '[data-moving]')['data-labels']),
        'toast': text(one(board, '.toast')),
    }
    d['case4power'] = c4

    af = one(body, '#case-fastload')
    cf = case(af)
    ui = one(af, '.ui')
    cf['ui'] = {
        'bar': text(one(ui, '.ui-bar span')),
        'demo': text(one(ui, '.ui-bar .r')),
        'sub': [text(s) for s in ui.select('.ui-sub span')],
        'loads': [{'broker': text(one(l, '.broker')), 'tag': text(one(l, '.tag')),
                   'from': text(l.select('.route b')[0]), 'to': text(l.select('.route b')[1]),
                   'meta': [text(s) for s in l.select('.load-meta span')],
                   'rate': text(one(l, '.rate')), 'send': text(one(l, '.send')),
                   'sent': 'is-sent' in one(l, '.bid')['class']} for l in ui.select('.load')],
    }
    # Строки, которые создаёт скрипт анимации (были в main.js старой версии)
    js = (SRC / 'assets' / 'js' / 'main.js').read_text(encoding='utf-8')
    fl_t = re.search(lang + r": \['([^']+)', '([^']+)'\]", js)
    cf['ui']['deadhead'], cf['ui']['newTag'] = fl_t.group(1), fl_t.group(2)
    d['caseFastload'] = cf

    # ---------- Платформы ----------
    pr = one(body, '#products')
    d['products'] = {
        'label': text(one(pr, '.group-label')),
        'title': inner(one(pr, '.products-title')),
        'items': [],
    }
    for p in pr.select('article.prod'):
        img = one(p, 'img')
        top = one(p, '.prod-top')
        badge = top.select_one('.badge')
        offer = top.select_one('.tag-offer')
        link = one(top, '.prod-link')
        cta = p.select_one('.prod-cta')
        d['products']['items'].append({
            'img': Path(img['src'].split('?')[0]).stem,
            'alt': img['alt'],
            'badge': text(badge) if badge else None,
            'offer': text(offer) if offer else None,
            'link': {'href': link['href'], 'label': text(link)},
            'name': text(one(p, '.prod-name')),
            'what': text(one(p, '.prod-what')),
            'desc': inner(one(p, '.prod-desc')),
            'kpis': [{'dt': text(x.dt), 'dd': text(x.dd)} for x in p.select('.prod-kpis > div')],
            'cta': {'href': cta['href'], 'label': text(cta).replace('→', '').strip()} if cta else None,
        })

    # ---------- Кто делает ----------
    ab = one(body, '#about')
    abtn = one(ab, 'a.btn')
    d['about'] = {
        'eyebrow': clean(one(ab, '.eyebrow').get_text().split('/', 1)[1]),
        'alt': one(ab, 'img')['alt'],
        'caption': text(one(ab, 'figcaption')),
        'name': text(one(ab, '.author-name')),
        'role': text(one(ab, '.author-role')),
        'lead': inner(one(ab, '.author-lead')),
        'cta': text(abtn.find('span')).replace(text(abtn.find('small')), '').strip(),
        'ctaSub': text(abtn.find('small')),
    }

    # ---------- Услуги ----------
    sv = one(body, '#services')
    d['services'] = {
        'eyebrow': clean(one(sv, '.eyebrow').get_text().split('/', 1)[1]),
        'title': inner(one(sv, '#services-title')),
        'intro': inner(one(sv, '.section-head p:not(.eyebrow)')),
        'head': [text(s) for s in sv.select('.svc-head span')][:5],
        'items': [],
    }
    for a in sv.select('a.svc'):
        term, price = one(a, '.svc-term'), one(a, '.svc-price')
        tl, pl = text(term.small), text(price.small)
        term.small.extract(); price.small.extract()
        d['services']['items'].append({
            'n': text(one(a, '.svc-n')), 'name': text(one(a, '.svc-name')),
            'desc': inner(one(a, '.svc-desc')),
            'termLabel': tl, 'term': inner(term),
            'priceLabel': pl, 'price': [clean(x) for x in re.split(r'<br\s*/?>', inner(price))],
        })

    # ---------- Калькулятор ----------
    ca = one(body, '#calc')
    lab = [clean(s.contents[0]) if s.contents else '' for s in ca.select('.field > span:first-child')]
    d['calc'] = {
        'eyebrow': clean(one(ca, '.eyebrow').get_text().split('/', 1)[1]),
        'title': inner(one(ca, '#calc-title')),
        'intro': inner(one(ca, '.calc-intro p:not(.eyebrow)')),
        'leads': lab[0], 'check': lab[1], 'pct': lab[2],
        'scale': [text(i) for i in ca.select('.range-scale i')],
        'resultLabel': text(ca.select('.calc-label')[0]),
        'perMonth': text(ca.select('.calc-label')[1]),
        'defaultSum': text(one(ca, '#calc-out')),
        'note': inner(one(ca, '.calc-note')),
        'cta': text(one(ca, '#calc-cta span')),
        # Сообщение в Telegram с посчитанной суммой ({sum}) — было в main.js старой версии
        'msg': re.search(r'(?<![a-z])' + lang + r": '([^']+\{sum\}[^']*)'",
                         (SRC / 'assets' / 'js' / 'main.js').read_text(encoding='utf-8')).group(1),
    }

    # ---------- Как работаем ----------
    pc = one(body, '#process')
    d['process'] = {
        'eyebrow': clean(one(pc, '.eyebrow').get_text().split('/', 1)[1]),
        'title': inner(one(pc, '#process-title')),
        'intro': inner(one(pc, '.section-head p:not(.eyebrow)')),
        'steps': [{'n': text(one(s, '.step-n')), 'title': text(s.h3), 'text': inner(s.p)} for s in pc.select('.step')],
        'ownTitle': inner(one(pc, '.own-title')),
        'own': [{'title': text(li.b), 'text': inner(li.span)} for li in pc.select('.own-list li')],
    }

    # ---------- FAQ ----------
    fq = one(body, '#faq')
    d['faq'] = {
        'eyebrow': clean(one(fq, '.eyebrow').get_text().split('/', 1)[1]),
        'title': inner(one(fq, '#faq-title')),
        'items': [{'q': text(one(x, '.qa-q')), 'a': inner(x.p)} for x in fq.select('details.qa')],
    }

    # ---------- Контакт ----------
    ct = one(body, '#contact')
    items = []
    for a in ct.select('a.ct'):
        lab_el = one(a, '.ct-label')
        hint = lab_el.find('i')
        items.append({
            'kind': ('telegram' if 't.me' in a['href'] else 'whatsapp' if 'wa.me' in a['href']
                     else 'phone' if a['href'].startswith('tel:') else 'email'),
            'label': clean(lab_el.contents[0]),
            'hint': text(hint).lstrip('· ').strip() if hint else None,
            'value': text(one(a, '.ct-value')),
        })
    d['contact'] = {
        'eyebrow': clean(one(ct, '.eyebrow').get_text().split('/', 1)[1]),
        'title': inner(one(ct, '#contact-title')),
        'sub': inner(one(ct, '.contact-sub')),
        'items': items,
    }

    # ---------- Футер и cookie ----------
    ft = one(body, 'footer.footer')
    fl = ft.select('.footer-links')[1]
    bottom = ft.select_one('.footer-bottom')
    d['footer'] = {
        'tag': text(one(ft, '.footer-tag')),
        'links': [{'href': a['href'], 'label': text(a)} for a in fl.select('a')],
        'cookieBtn': text(one(ft, '#cookie-open')),
        'bottom': text(bottom.find_all('span')[-1]),        # «MX Systems · Кишинёв, Молдова · © 2019–2026»
    }
    ck = one(body, '#cookie')
    tg_ = ck.select('.tgl')
    d['cookie'] = {
        'title': text(one(ck, '.cookie-title')),
        'text': inner(one(ck, '.cookie-text')),
        'necessary': {'t': clean(tg_[0].span.contents[0]), 's': text(tg_[0].small)},
        'analytics': {'t': clean(tg_[1].span.contents[0]), 's': text(tg_[1].small)},
        'marketing': {'t': clean(tg_[2].span.contents[0]), 's': text(tg_[2].small)},
        'yes': text(one(ck, '#cookie-yes')), 'no': text(one(ck, '#cookie-no')),
        'cfg': text(one(ck, '#cookie-cfg')), 'save': text(one(ck, '#cookie-save')),
    }
    return d


HEADER = '''/* =====================================================================
   Тексты сайта — {name} версия ({path}).
   ЭТО ИСТОЧНИК ТЕКСТОВ: правьте фразы, цифры и цены здесь, затем пересоберите сайт (npm run build).
   Структура одинаковая у ru.ts, ro.ts и en.ts: тип Dict выводится из ru.ts (src/i18n/index.ts),
   и если в ro/en пропущено поле — сборка сообщит об ошибке.
   Строки могут содержать простой HTML: <em> — курсивный оранжевый акцент в заголовках,
   <b> — жирное начало пункта, <a class="link"> — ссылка. Неразрывные пробелы и типографику
   расставляет функция typo() из src/i18n/typo.ts при сборке — здесь их писать не нужно.
   Первоначально перенесено скриптом tools/extract_i18n.py из версии v1-seo (без правок текста).
   ===================================================================== */
{imp}const dict{ann} = {body};

export default dict;
'''

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    files = {'ru': SRC / 'index.html', 'ro': SRC / 'ro' / 'index.html', 'en': SRC / 'en' / 'index.html'}
    names = {'ru': 'русская', 'ro': 'румынская', 'en': 'английская'}
    paths = {'ru': '/', 'ro': '/ro/', 'en': '/en/'}
    for lang, f in files.items():
        data = extract(f, lang)
        body = json.dumps(data, ensure_ascii=False, indent=2).replace(' ', '\\u00a0')
        # ru.ts — образец: его тип (Dict) выводится из него самого; ro и en обязаны совпадать по структуре
        imp = '' if lang == 'ru' else "import type { Dict } from './index';\n\n"
        ann = '' if lang == 'ru' else ': Dict'
        (OUT / f'{lang}.ts').write_text(HEADER.format(name=names[lang], path=paths[lang], body=body, imp=imp, ann=ann), encoding='utf-8')
        print('ok', lang, len(body))
