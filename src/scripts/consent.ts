/* =====================================================================
   Cookie, Google Analytics и Meta Pixel.
   Закон РМ № 195/2024 о защите персональных данных и европейский GDPR требуют согласия
   на аналитику и рекламные cookie. Поэтому (поведение 1-в-1 как в старой версии):
   — до согласия не загружается ни один скрипт Google или Meta;
   — посетитель выбирает категории отдельно: «Аналитика» (GA4) и «Реклама» (Meta Pixel);
   — выбор хранится в localStorage и меняется в любой момент кнопкой «Настройки cookie»;
   — клик по Telegram / WhatsApp / телефону / почте — событие «заявка» (только при согласии).
   ===================================================================== */
import { $ } from './util';

// ID счётчиков — в src/lib/tracking.ts. Пока там заглушки, баннера на странице нет
// (его не выводит сборка) — и этот скрипт сразу выходит, ничего не загружая.
import { GA_ID, PIXEL_ID, HAS_GA, HAS_PIXEL } from '../lib/tracking';

type Consent = { a: boolean; m: boolean; t?: string } | null;
// Глобальные функции, которые создают скрипты Google и Meta
declare global { interface Window { dataLayer: unknown[]; gtag?: (...a: unknown[]) => void; fbq?: any; _fbq?: any } }

(() => {
  const KEY = 'mx-consent';                       // здесь хранится {a: аналитика, m: реклама, t: дата}
  const banner = $('#cookie');
  if (!banner) return;
  const opts = $('#cookie-opts')!, chkA = $<HTMLInputElement>('#c-analytics')!, chkM = $<HTMLInputElement>('#c-marketing')!;
  const btnCfg = $('#cookie-cfg')!, btnSave = $('#cookie-save')!;

  const read = (): Consent => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } };
  const write = (v: Consent) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* приватный режим */ } };

  // --- Google Analytics 4: скрипт gtag.js загружается только после согласия ---
  function loadGA() {
    if (!HAS_GA || window.gtag) return;
    const s = document.createElement('script');
    s.async = true;                                // async — не блокирует отрисовку
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];     // очередь событий, которую читает gtag.js
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });   // анонимизация IP-адреса
  }

  // --- Meta Pixel: официальный код Meta, переписанный читаемо ---
  function loadPixel() {
    if (!HAS_PIXEL || window.fbq) return;
    // fbq — функция-очередь: команды копятся, пока не загрузится fbevents.js
    const fbq: any = (window.fbq = function (...args: unknown[]) { fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args); });
    window._fbq = fbq; fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');                      // событие «просмотр страницы»
  }

  const apply = (c: Consent) => { if (c?.a) loadGA(); if (c?.m) loadPixel(); };
  const show = () => {
    const c = read();
    chkA.checked = !!c?.a; chkM.checked = !!c?.m;  // в настройках — текущий выбор
    banner.hidden = false;
  };
  const save = (c: { a: boolean; m: boolean }) => {
    const before = read();
    write({ a: c.a, m: c.m, t: new Date().toISOString() });
    banner.hidden = true;
    opts.hidden = true; btnSave.hidden = true; btnCfg.hidden = false;
    // Согласие отозвали, а скрипты уже загружены — выгрузить их можно только перезагрузкой
    if ((before?.a && !c.a) || (before?.m && !c.m)) location.reload();
    else apply(c);
  };

  const saved = read();
  // Первый визит — показываем баннер, но не поверх вводного текста первого экрана:
  // на главной ждём, пока текст hero уйдёт вверх за край экрана (скрипты до согласия
  // всё равно не грузятся, так что спросить чуть позже — законно). На других страницах — сразу.
  const showLater = () => {
    const lead = $('.hero .lead');
    if (!lead || !('IntersectionObserver' in window)) { show(); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting || e.boundingClientRect.top > 0) return;   // текст ещё виден или ниже экрана
      io.disconnect();
      if (!read()) show();
    });
    io.observe(lead);
  };
  if (saved) apply(saved); else showLater();

  $('#cookie-yes')!.addEventListener('click', () => save({ a: true, m: true }));
  $('#cookie-no')!.addEventListener('click', () => save({ a: false, m: false }));
  btnCfg.addEventListener('click', () => { opts.hidden = false; btnSave.hidden = false; btnCfg.hidden = true; });
  btnSave.addEventListener('click', () => save({ a: chkA.checked, m: chkM.checked }));
  $('#cookie-open')?.addEventListener('click', show);

  // --- Конверсии: клик по Telegram, WhatsApp, телефону или почте — это «заявка».
  //     Событие уходит в GA и пиксель, только если они загружены (было согласие) ---
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!a) return;
    const ch = /t\.me\//.test(a.href) ? 'telegram' : /wa\.me\//.test(a.href) ? 'whatsapp'
             : a.href.startsWith('tel:') ? 'phone' : a.href.startsWith('mailto:') ? 'email' : null;
    if (!ch) return;
    window.gtag?.('event', 'generate_lead', { method: ch });
    window.fbq?.('track', 'Contact', { method: ch });
  });
})();

export {};
