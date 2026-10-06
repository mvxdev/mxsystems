/* =====================================================================
   MX Systems — общий скрипт сайта (один на все языковые версии)
   Каждый блок ниже независим: если нужного элемента на странице нет,
   блок просто ничего не делает. Порядок:
     1. Настройки            2. Шапка и меню         3. Появление при прокрутке
     4. Счётчики цифр        5. Услуги (раскрытие)   6. Макет FastLoad
     7. Макет 4Power         8. Язык                 9. Cookie и Google Analytics
   ===================================================================== */

/* ===== 1. НАСТРОЙКИ ===== */

// ID Google Analytics 4 (вида G-XXXXXXXXXX). Пока это заглушка — аналитика не загружается вообще.
// Когда появится настоящий ID, впишите его сюда.
const GA_ID = 'G-XXXXXXXXXX';

// Автоопределение языка браузера. Включим, когда будут готовы версии /ro/ и /en/,
// иначе посетителя с румынским браузером отправит на несуществующую страницу.
const AUTO_LANG = false;

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


/* ===== 5. УСЛУГИ: раскрытие строк =====
   Каждая строка — кнопка. Нажатие раскрывает описание (на десктопе оно раскрывается и при наведении —
   это делает CSS). aria-expanded сообщает скринридеру, раскрыта ли строка. */
$$('.svc-row').forEach(btn => btn.addEventListener('click', () => {
  const open = btn.getAttribute('aria-expanded') !== 'true';
  btn.setAttribute('aria-expanded', String(open));
  btn.closest('.svc').classList.toggle('is-open', open);
}));


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

  const cycle = () => {
    timers.push(setTimeout(() => { status.textContent = labels[1]; car.classList.add('is-hot'); }, 1200));     // деталь пришла
    timers.push(setTimeout(() => {
      flip($$('.car', board), () => { ready.prepend(car); updateCounts(); });                                  // переезд в «Готова»
      status.textContent = labels[2];
      toast.classList.add('is-on');
    }, 2600));
    timers.push(setTimeout(() => toast.classList.remove('is-on'), 5200));
    timers.push(setTimeout(() => {
      // Возврат: машина гаснет, возвращается в «Ждёт запчасти» и снова проявляется
      car.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).onfinish = () => {
        flip($$('.car', board).filter(c => c !== car), () => { parts.prepend(car); updateCounts(); });
        status.textContent = labels[0];
        car.classList.remove('is-hot');
        car.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'forwards' });
      };
    }, 7600));
  };
  let loop = null;
  const start = () => { if (!loop) { cycle(); loop = setInterval(cycle, 9000); } };
  const stop = () => { clearInterval(loop); loop = null; timers.forEach(clearTimeout); timers = []; };
  whileVisible(board, start, stop);
})();


/* ===== 8. ЯЗЫК =====
   а) Выбор в переключателе запоминаем в localStorage (хранилище браузера), чтобы
      автоопределение больше не перебивало решение посетителя.
   б) Автоопределение: при первом заходе на русскую главную смотрим язык браузера
      и, если он румынский или английский, отправляем на /ro/ или /en/. */
(() => {
  const KEY = 'mx-lang';
  // localStorage может быть недоступен (приватный режим) — поэтому всё в try/catch
  const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const set = v => { try { localStorage.setItem(KEY, v); } catch { /* не страшно */ } };

  $$('.lang a[data-lang]').forEach(a => a.addEventListener('click', () => set(a.dataset.lang)));

  if (!AUTO_LANG || LANG !== 'ru' || get()) return;
  // Поисковых роботов не перенаправляем: у робота Google язык браузера английский,
  // и иначе он не увидел бы русскую главную
  if (/bot|crawl|spider|slurp|facebookexternalhit|telegrambot|whatsapp/i.test(navigator.userAgent)) return;
  const langs = (navigator.languages || [navigator.language || '']).map(l => l.toLowerCase());
  const first = langs[0] || '';
  if (first.startsWith('ru')) return;                         // русский браузер — остаёмся
  if (first.startsWith('ro') || first.startsWith('mo')) location.replace('ro/');
  else if (first.startsWith('en')) location.replace('en/');
})();


/* ===== 9. COOKIE И GOOGLE ANALYTICS =====
   Аналитика загружается ТОЛЬКО после согласия посетителя (так требует GDPR — европейский закон
   о персональных данных). До нажатия «Принять» на сайт не грузится ни один скрипт Google. */
(() => {
  const KEY = 'mx-consent';                      // 'yes' или 'no'
  const banner = $('#cookie');
  const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const set = v => { try { localStorage.setItem(KEY, v); } catch { /* приватный режим */ } };

  function loadGA() {
    if (!/^G-[A-Z0-9]+$/.test(GA_ID) || GA_ID === 'G-XXXXXXXXXX' || window.gtag) return;   // нет ID или уже загружено
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });   // анонимизация IP-адреса посетителя
  }

  const show = () => banner && (banner.hidden = false);
  const hide = () => banner && (banner.hidden = true);

  const choice = get();
  if (choice === 'yes') loadGA();
  else if (!choice) show();                         // ещё не выбирал — показываем баннер

  $('#cookie-yes')?.addEventListener('click', () => { set('yes'); hide(); loadGA(); });
  $('#cookie-no')?.addEventListener('click', () => { set('no'); hide(); });
  // Ссылка «Настройки cookie» в футере снова открывает баннер
  $('#cookie-open')?.addEventListener('click', show);
})();
