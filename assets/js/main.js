/* =====================================================================
   MX Systems — общий скрипт сайта (один на все языковые версии)
   Каждый блок ниже независим: если нужного элемента на странице нет,
   блок просто ничего не делает. Порядок:
     1. Настройки            2. Шапка и меню         3. Появление при прокрутке
     4. Счётчики цифр        5. Калькулятор потерь   6. Макет FastLoad
     7. Макет 4Power         8. Язык                 9. Cookie, GA4 и Meta Pixel
   ===================================================================== */

/* ===== 1. НАСТРОЙКИ ===== */

// [ЗАПОЛНИТЬ] ID Google Analytics 4 — вида G-XXXXXXXXXX (analytics.google.com → Администратор → Потоки данных).
// [ЗАПОЛНИТЬ] ID Meta Pixel — число из 15–16 цифр (business.facebook.com → Events Manager).
// Пока стоят заглушки — ни GA, ни пиксель не загружаются, даже если посетитель согласился.
const GA_ID = 'G-XXXXXXXXXX';
const PIXEL_ID = '000000000000000';


// prefers-reduced-motion — системная настройка «уменьшить движение». Если включена — без анимаций.
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Язык текущей страницы берём из <html lang="…"> — нужен для текстов, которые создаёт скрипт
const LANG = document.documentElement.lang || 'ru';

// Короткий помощник: найти элемент по селектору (как $ в jQuery, но без библиотеки)
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];


/* ===== 2. ШАПКА И МЕНЮ ===== */
(() => {
  const header = $('#header');
  if (!header) return;

  // После прокрутки на 8px шапка становится полупрозрачной с размытием (класс .is-scrolled).
  // passive: true — обещаем браузеру не отменять прокрутку, он прокручивает плавнее.
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Мобильное меню: кнопка-бургер открывает и закрывает панель со ссылками
  const burger = $('#burger');
  if (!burger) return;
  const setOpen = open => {
    header.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', String(open));   // для скринридеров
  };
  burger.addEventListener('click', () => setOpen(!header.classList.contains('nav-open')));
  // Нажали на пункт меню — закрываем панель (переход к разделу произойдёт сам)
  $$('#nav a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  // Клавиша Escape закрывает меню
  addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
})();


/* ===== 3. ПОЯВЛЕНИЕ ПРИ ПРОКРУТКЕ =====
   IntersectionObserver — API браузера, который сообщает, когда элемент попал в зону видимости.
   Это экономнее, чем проверять положение элементов на каждое событие прокрутки. */
(() => {
  const items = $$('.reveal');
  if (!items.length) return;
  if (REDUCE || !('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('is-in')); return; }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);          // анимация один раз — дальше элемент не отслеживаем
    });
  }, { rootMargin: '0px 0px -10% 0px' });  // срабатывает, когда элемент поднялся на 10% выше нижнего края экрана
  items.forEach(el => io.observe(el));
})();

// При «уменьшить движение» ставим на паузу и SVG-анимации (импульсы на схеме)
if (REDUCE) $$('svg').forEach(svg => svg.pauseAnimations && svg.pauseAnimations());


/* ===== 4. СЧЁТЧИКИ ЦИФР =====
   Цифры в «приборной панели» результатов досчитываются от 0 до значения,
   когда блок впервые появляется на экране. Разметка: <span class="count" data-to="40">40</span>
   (в HTML уже стоит итоговое число — без JS посетитель видит правильные цифры). */
(() => {
  const nums = $$('.count');
  if (!nums.length || REDUCE || !('IntersectionObserver' in window)) return;

  const run = el => {
    const to = Number(el.dataset.to);
    const dur = 1400;                                // длительность, мс
    const t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / dur, 1);       // прогресс 0…1
      const eased = 1 - Math.pow(1 - p, 3);          // «easeOutCubic»: быстро в начале, плавно в конце
      el.textContent = Math.round(to * eased);
      if (p < 1) requestAnimationFrame(step);        // requestAnimationFrame — следующий кадр отрисовки
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    run(e.target);
    io.unobserve(e.target);
  }), { threshold: .6 });                            // старт, когда видно 60% числа
  nums.forEach(el => { el.textContent = '0'; io.observe(el); });
})();


/* ===== 5. КАЛЬКУЛЯТОР ПОТЕРЬ =====
   Потери в месяц ≈ заявок × средний чек × доля потерянных.
   Сумма сразу подставляется и в текст сообщения для Telegram — человеку не нужно
   пересказывать цифры, он просто отправляет готовое сообщение. */
(() => {
  const form = $('#calc-form');
  if (!form) return;
  const leads = $('#calc-leads'), check = $('#calc-check'), pct = $('#calc-pct');
  const pctOut = $('#calc-pct-out'), out = $('#calc-out'), cta = $('#calc-cta');

  // Intl.NumberFormat — форматирует число по правилам языка: «4 500» (ru), «4.500» (ro), «4,500» (en)
  const nf = new Intl.NumberFormat({ ru: 'ru-RU', ro: 'ro-RO', en: 'en-US' }[LANG] || 'ru-RU', { maximumFractionDigits: 0 });
  // Текст сообщения в Telegram на языке страницы; {sum} заменится на посчитанную сумму
  const MSG = {
    ru: 'Здравствуйте! Посчитал на сайте MX Systems: на потерянных заявках теряю примерно €{sum} в месяц. Хочу бесплатный разбор.',
    ro: 'Bună ziua! Am calculat pe site-ul MX Systems: pierd aproximativ €{sum} pe lună din cereri pierdute. Aș vrea o analiză gratuită.',
    en: 'Hi! I used the calculator on the MX Systems site: I lose about €{sum} a month on lost leads. I would like a free review.',
  }[LANG];

  // Число из поля: пустое или отрицательное — считаем нулём
  const num = el => Math.max(0, Number(el.value) || 0);

  const update = () => {
    const p = num(pct);
    const sum = Math.round(num(leads) * num(check) * p / 100);
    pctOut.textContent = p + '%';
    out.textContent = '≈ €' + nf.format(sum);
    // Заливка дорожки ползунка: насколько он сдвинут от минимума к максимуму (в процентах)
    pct.style.setProperty('--p', ((p - pct.min) / (pct.max - pct.min) * 100) + '%');
    // encodeURIComponent — переводит текст в формат, допустимый внутри ссылки (пробелы → %20 и т.д.)
    cta.href = 'https://t.me/mvxev?text=' + encodeURIComponent(MSG.replace('{sum}', nf.format(sum)));
  };
  form.addEventListener('input', update);     // одно событие на всю форму — срабатывает от любого поля
  update();
})();


/* ===== ОБЩИЙ ПОМОЩНИК: FLIP-анимация =====
   FLIP (First, Last, Invert, Play) — приём плавного перемещения элементов при изменении DOM:
   1) запоминаем, где элементы были; 2) меняем DOM (элементы «прыгают» на новые места);
   3) мгновенно сдвигаем их transform'ом обратно на старые места; 4) плавно убираем сдвиг.
   Анимируется только transform — без дёрганья. */
function flip(elements, mutate) {
  const first = new Map(elements.map(el => [el, el.getBoundingClientRect()]));
  mutate();
  first.forEach((r, el) => {
    if (!el.isConnected) return;                   // элемент удалили — анимировать нечего
    const r2 = el.getBoundingClientRect();
    const dx = r.left - r2.left, dy = r.top - r2.top;
    if (!dx && !dy) return;
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
               { duration: 700, easing: 'cubic-bezier(.22,.8,.24,1)' });
  });
}

// Запускать демо-анимации только пока блок виден на экране — не тратим батарею зря
function whileVisible(el, start, stop) {
  if (!('IntersectionObserver' in window)) { start(); return; }
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(el);
}


/* ===== 6. МАКЕТ FASTLOAD: новые грузы появляются сверху =====
   Все данные — демонстрационные. */
(() => {
  const list = $('#fl-list');
  if (!list || REDUCE) return;

  // [брокер, откуда, куда, мили, порожний пробег, ставка]
  const LOADS = [
    ['Demo Brokerage Inc', 'Atlanta, GA', 'Columbus, OH', '572', '24', '1 380'],
    ['Get Freight LLC', 'Dallas, TX', 'Memphis, TN', '452', '41', '1 150'],
    ['Sample Logistics Co', 'Chicago, IL', 'Nashville, TN', '474', '18', '1 290'],
    ['Demo Freight LLC', 'Phoenix, AZ', 'Denver, CO', '821', '33', '2 100'],
    ['Get Freight LLC', 'Miami, FL', 'Dayton, NJ', '1 214', '38', '2 450'],
  ];
  const T = { ru: ['порожний', 'новый · 4 сек'], ro: ['gol', 'nou · 4 sec'], en: ['deadhead', 'new · 4 sec'] }[LANG] || ['deadhead', 'new'];
  let i = 0;

  // Карточку груза собираем через createElement/textContent — безопасно (никакого HTML из строк)
  const make = ([broker, from, to, mi, dh, rate]) => {
    const card = document.createElement('div');
    card.className = 'load is-new';
    const mk = (cls, text, parent = card, tag = 'div') => { const e = document.createElement(tag); e.className = cls; if (text) e.textContent = text; parent.appendChild(e); return e; };
    const top = mk('load-top');
    mk('broker', broker, top, 'span');
    mk('tag', T[1], top, 'span');
    const route = mk('route');
    mk('', from, route, 'b'); mk('arr', '→', route, 'span'); mk('', to, route, 'b');
    const meta = mk('load-meta');
    mk('', mi + ' mi', meta, 'span'); mk('', T[0] + ' ' + dh + ' mi', meta, 'span'); mk('', 'Dry Van', meta, 'span');
    const bid = mk('bid');
    mk('rate', '$ ' + rate, bid, 'span'); mk('send', 'Send bid', bid, 'span');
    return card;
  };

  const tick = () => {
    const old = $$('.load', list);
    flip(old, () => {
      old.forEach(c => c.classList.remove('is-new'));
      list.prepend(make(LOADS[i++ % LOADS.length]));   // новый груз — сверху
      list.lastElementChild.remove();                    // самый старый — убираем
    });
  };
  let timer = null;
  whileVisible(list, () => { if (!timer) timer = setInterval(tick, 5200); }, () => { clearInterval(timer); timer = null; });
})();


/* ===== 7. МАКЕТ 4POWER: машина переезжает в «Готова» =====
   Цикл: деталь пришла → машина плавно переезжает в колонку «Готова» →
   всплывает «клиенту ушло сообщение» → через несколько секунд всё возвращается. */
(() => {
  const board = $('#board-4p');
  if (!board || REDUCE) return;
  const car = $('[data-moving]', board);
  const parts = $('[data-col="parts"] .col-cards', board);
  const ready = $('[data-col="ready"] .col-cards', board);
  const toast = $('.toast', board);
  const status = $('.car-status', car);
  const labels = JSON.parse(car.dataset.labels);      // тексты статусов на языке страницы — лежат в HTML
  const updateCounts = () => $$('.col', board).forEach(c => { $('.cnt', c).textContent = $$('.car', c).length; });
  let timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));   // «через ms миллисекунд сделать fn»

  // Исходное состояние: машина в «Ждёт запчасти», статус «заказано»
  const reset = () => {
    car.classList.remove('is-hot', 'is-fading');
    toast.classList.remove('is-on');
    if (car.parentElement !== parts) parts.prepend(car);
    status.textContent = labels[0];
    updateCounts();
  };

  const cycle = () => {
    at(1200, () => { status.textContent = labels[1]; car.classList.add('is-hot'); });          // деталь пришла на склад
    at(2600, () => {
      flip($$('.car', board), () => { ready.prepend(car); updateCounts(); });                  // переезд в «Готова»
      status.textContent = labels[2];
      toast.classList.add('is-on');
    });
    at(5200, () => toast.classList.remove('is-on'));
    at(7600, () => car.classList.add('is-fading'));                                             // машина гаснет (CSS-переход)
    at(8000, () => {                                                                            // …и возвращается в начало цикла
      flip($$('.car', board).filter(c => c !== car), reset);
    });
  };
  let loop = null;
  const start = () => { if (!loop) { cycle(); loop = setInterval(cycle, 9000); } };
  // Остановка (блок ушёл с экрана): чистим таймеры и возвращаем исходное состояние
  const stop = () => { clearInterval(loop); loop = null; timers.forEach(clearTimeout); timers = []; reset(); };
  whileVisible(board, start, stop);
})();


/* ===== 8. ЯЗЫК =====
   Выбор в переключателе запоминаем в localStorage (хранилище браузера), чтобы
   автоопределение языка (скрипт в <head> index.html) больше не перебивало решение посетителя. */
(() => {
  const KEY = 'mx-lang';
  // localStorage может быть недоступен (приватный режим) — поэтому всё в try/catch
  const set = v => { try { localStorage.setItem(KEY, v); } catch { /* не страшно */ } };

  $$('.lang a[data-lang]').forEach(a => a.addEventListener('click', () => set(a.dataset.lang)));

  // Само перенаправление по языку браузера — во встроенном скрипте в <head> index.html:
  // там оно срабатывает раньше, чем грузятся шрифты и стили.
})();


/* ===== 9. COOKIE, GOOGLE ANALYTICS И META PIXEL =====
   Закон РМ № 195/2024 о защите персональных данных и европейский GDPR требуют согласия
   на аналитику и рекламные cookie. Поэтому:
   — до согласия не загружается ни один скрипт Google или Meta;
   — посетитель выбирает категории отдельно: «Аналитика» (GA4) и «Реклама» (Meta Pixel);
   — выбор хранится в localStorage (хранилище браузера) и его можно изменить
     в любой момент кнопкой «Настройки cookie» в футере. */
(() => {
  const KEY = 'mx-consent';                       // здесь хранится {a: аналитика, m: реклама, t: дата}
  const banner = $('#cookie');
  if (!banner) return;
  const opts = $('#cookie-opts'), chkA = $('#c-analytics'), chkM = $('#c-marketing');
  const btnCfg = $('#cookie-cfg'), btnSave = $('#cookie-save');

  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
  const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* приватный режим */ } };
  const isReal = (id, fake) => id && id !== fake;  // заглушки не загружаем

  // --- Google Analytics 4: загружаем скрипт gtag.js только после согласия ---
  function loadGA() {
    if (!isReal(GA_ID, 'G-XXXXXXXXXX') || window.gtag) return;
    const s = document.createElement('script');
    s.async = true;                                // async — не блокирует отрисовку страницы
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];     // очередь событий, которую читает gtag.js
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true }); // анонимизация IP-адреса
  }

  // --- Meta Pixel: официальный код Meta, переписанный читаемо ---
  function loadPixel() {
    if (!isReal(PIXEL_ID, '000000000000000') || window.fbq) return;
    // fbq — функция-очередь: команды копятся, пока не загрузится fbevents.js, потом выполняются
    const fbq = window.fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
    window._fbq = fbq; fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');                      // событие «просмотр страницы»
  }

  const apply = c => { if (c?.a) loadGA(); if (c?.m) loadPixel(); };

  const show = () => {
    const c = read();
    chkA.checked = !!c?.a; chkM.checked = !!c?.m;  // в настройках показываем текущий выбор
    banner.hidden = false;
  };
  const save = c => {
    const before = read();
    write({ a: c.a, m: c.m, t: new Date().toISOString() });
    banner.hidden = true;
    opts.hidden = true; btnSave.hidden = true; btnCfg.hidden = false;
    // Если согласие отозвали, а скрипты уже загружены — выгрузить их можно только перезагрузкой
    if ((before?.a && !c.a) || (before?.m && !c.m)) location.reload();
    else apply(c);
  };

  const saved = read();
  if (saved) apply(saved); else show();            // первый визит — показываем баннер

  $('#cookie-yes').addEventListener('click', () => save({ a: true, m: true }));
  $('#cookie-no').addEventListener('click', () => save({ a: false, m: false }));
  btnCfg.addEventListener('click', () => { opts.hidden = false; btnSave.hidden = false; btnCfg.hidden = true; });
  btnSave.addEventListener('click', () => save({ a: chkA.checked, m: chkM.checked }));
  $('#cookie-open')?.addEventListener('click', show);

  // --- Конверсии: клик по Telegram, WhatsApp, телефону или почте — это «заявка».
  //     Событие уходит в GA и пиксель, только если они загружены (то есть было согласие) ---
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const ch = /t\.me\//.test(a.href) ? 'telegram' : /wa\.me\//.test(a.href) ? 'whatsapp'
             : a.href.startsWith('tel:') ? 'phone' : a.href.startsWith('mailto:') ? 'email' : null;
    if (!ch) return;
    window.gtag?.('event', 'generate_lead', { method: ch });   // ?.() — вызвать, только если функция есть
    window.fbq?.('track', 'Contact', { method: ch });
  });
})();
