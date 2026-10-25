/* =====================================================================
   Живые макеты интерфейсов в кейсах. Все данные ДЕМОНСТРАЦИОННЫЕ.
   Анимации работают, только пока макет на экране, и только через transform/opacity.
   При «уменьшить движение» макеты стоят неподвижно (как картинка).
   ===================================================================== */
import { $, $$, REDUCE, flip, whileVisible } from './util';

/* ---------- FastLoad: новые грузы появляются сверху ---------- */
(() => {
  const list = $('#fl-list');
  if (!list || REDUCE) return;
  // [брокер, откуда, куда, мили, порожний пробег, ставка] — вымышленные
  const LOADS = [
    ['Demo Brokerage Inc', 'Atlanta, GA', 'Columbus, OH', '572', '24', '1 380'],
    ['Get Freight LLC', 'Dallas, TX', 'Memphis, TN', '452', '41', '1 150'],
    ['Sample Logistics Co', 'Chicago, IL', 'Nashville, TN', '474', '18', '1 290'],
    ['Demo Freight LLC', 'Phoenix, AZ', 'Denver, CO', '821', '33', '2 100'],
    ['Get Freight LLC', 'Miami, FL', 'Dayton, NJ', '1 214', '38', '2 450'],
  ];
  const DEADHEAD = list.dataset.deadhead || 'deadhead';   // «порожний» на языке страницы
  const NEW = list.dataset.new || 'new';                  // «новый · 4 сек»
  let i = 0;

  // Карточку груза собираем через createElement/textContent — безопасно (никакого HTML из строк)
  const make = ([broker, from, to, mi, dh, rate]: string[]) => {
    const card = document.createElement('div');
    card.className = 'load is-new';
    const mk = (cls: string, text: string, parent: HTMLElement = card, tag = 'div') => {
      const e = document.createElement(tag); e.className = cls; if (text) e.textContent = text; parent.appendChild(e); return e;
    };
    const top = mk('load-top', '');
    mk('broker', broker, top, 'span'); mk('tag', NEW, top, 'span');
    const route = mk('route', '');
    mk('', from, route, 'b'); mk('arr', '→', route, 'span'); mk('', to, route, 'b');
    const meta = mk('load-meta', '');
    mk('', mi + ' mi', meta, 'span'); mk('', DEADHEAD + ' ' + dh + ' mi', meta, 'span'); mk('', 'Dry Van', meta, 'span');
    const bid = mk('bid', '');
    mk('rate', '$ ' + rate, bid, 'span'); mk('send', 'Send bid', bid, 'span');
    return card;
  };

  const tick = () => {
    const old = $$('.load', list);
    flip(old, () => {
      old.forEach((c) => c.classList.remove('is-new', 'is-first'));
      list.prepend(make(LOADS[i++ % LOADS.length]));     // новый груз — сверху
      list.lastElementChild?.remove();                    // самый старый — убираем
    });
  };
  let timer = 0;
  whileVisible(list, () => { if (!timer) timer = window.setInterval(tick, 5200); }, () => { clearInterval(timer); timer = 0; });
})();

/* ---------- 4Power: машина получает деталь и переезжает в «Готова» ----------
   Цикл: деталь пришла → машина плавно переезжает в колонку «Готова» →
   всплывает «клиенту ушло сообщение» → через несколько секунд всё возвращается. */
(() => {
  const board = $('#board-4p');
  if (!board || REDUCE) return;
  const car = $('[data-moving]', board)!;
  const parts = $('[data-col="parts"] .col-cards', board)!;
  const ready = $('[data-col="ready"] .col-cards', board)!;
  const toast = $('.toast', board)!;
  const status = $('.car-status', car)!;
  const labels: string[] = JSON.parse(car.dataset.labels || '[]');   // статусы на языке страницы
  const updateCounts = () => $$('.col', board).forEach((c) => { $('.cnt', c)!.textContent = String($$('.car', c).length); });
  let timers: number[] = [];
  const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

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
    at(7600, () => car.classList.add('is-fading'));                                             // машина гаснет
    at(8000, () => flip($$('.car', board).filter((c) => c !== car), reset));                    // и возвращается
  };
  let loop = 0;
  const start = () => { if (!loop) { cycle(); loop = window.setInterval(cycle, 9000); } };
  // Блок ушёл с экрана: чистим таймеры и возвращаем исходное состояние
  const stop = () => { clearInterval(loop); loop = 0; timers.forEach(clearTimeout); timers = []; reset(); };
  whileVisible(board, start, stop);
})();
